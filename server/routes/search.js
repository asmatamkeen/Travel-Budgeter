import express from "express";
import requireAuth from "../middleware/auth.js";
import { getExchangeRate } from "../utils/exchangeRate.js";
import { resolveLocation, searchRealFlights, searchRealHotels } from "../utils/skyScrapper.js";
import mockFlights from "../data/mockFlights.js";
import mockHotels from "../data/mockHotels.js";
import SearchCache from "../models/SearchCache.js";

const router = express.Router();

const HOTEL_RATING_MIN = {
  any: 0,
  budget: 0,
  "3": 3,
  "4": 4,
}

function round2(value) {
  return Math.round(value * 100) / 100
}

function nightsBetween(startDate, endDate) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const msPerNight = 1000 * 60 * 60 * 24
  return Math.round((end - start) / msPerNight)
}

function buildCacheKey({ origin, destination, date, cabinClass, checkin, checkout }) {
  const normalize = (s) => s.trim().toLowerCase()
  return [normalize(origin), normalize(destination), date, cabinClass, checkin, checkout].join("|")
}

// Tries the real Sky Scrapper API for both flights and hotels, reusing a
// recent cached result for the same route/dates/class when one exists so
// repeat searches don't burn the (very limited) free-tier quota. If
// anything fails - unresolvable location, API error, quota exceeded, no
// results - the whole search falls back to mock data together, so a trip
// never ends up mixing one real and one simulated half. Mock results are
// never cached, since a temporary outage shouldn't keep serving stale
// simulated data once the real API recovers.
async function getSearchPools({ origin, destination, date, cabinClass, checkin, checkout }) {
  const cacheKey = buildCacheKey({ origin, destination, date, cabinClass, checkin, checkout })

  const cached = await SearchCache.findOne({ cacheKey })
  if (cached) {
    console.log("Search cache hit:", cacheKey)
    return { source: "real", flightPool: cached.flightPool, hotelPool: cached.hotelPool }
  }

  try {
    const [originLoc, destLoc] = await Promise.all([
      resolveLocation(origin),
      resolveLocation(destination),
    ])

    if (!originLoc?.flightSkyId || !destLoc?.flightSkyId) {
      throw new Error(`Could not resolve airport codes for "${origin}" or "${destination}"`)
    }

    const [itineraries, realHotels] = await Promise.all([
      searchRealFlights({ origin: originLoc, destination: destLoc, date, cabinClass, currency: "USD" }),
      destLoc.hotelEntityId
        ? searchRealHotels({ entityId: destLoc.hotelEntityId, checkin, checkout, currency: "USD" })
        : Promise.resolve([]),
    ])

    if (itineraries.length === 0 || realHotels.length === 0) {
      throw new Error("Real API returned no flights or no hotels")
    }

    const flightPool = itineraries
      .filter((it) => it.legs?.[0]?.segments?.[0])
      .map((it) => {
        const leg = it.legs[0]
        const segment = leg.segments[0]
        return {
          airline: leg.carriers?.marketing?.[0]?.name ?? "Unknown airline",
          flightNumber: `${segment.marketingCarrier?.displayCode ?? ""}${segment.flightNumber ?? ""}`,
          cabinClass,
          durationMinutes: leg.durationInMinutes ?? 0,
          stops: leg.stopCount ?? 0,
          priceUSD: it.price?.raw ?? 0,
        }
      })

    const hotelPool = realHotels.map((h) => ({
      name: h.name,
      starRating: h.stars ?? 0,
      priceUSD: h.rawPrice ?? 0,
    }))

    console.log("Search cache miss, fetched fresh real data:", cacheKey)
    SearchCache.create({ cacheKey, flightPool, hotelPool }).catch((err) => {
      // A near-simultaneous duplicate write is harmless (unique index just
      // rejects the second one) - anything else is worth knowing about but
      // shouldn't fail the search itself.
      console.error("Failed to write search cache:", err.message)
    })

    return { source: "real", flightPool, hotelPool }
  } catch (err) {
    console.error("Real search failed, falling back to mock data:", err.message)
    return { source: "mock", flightPool: mockFlights, hotelPool: mockHotels }
  }
}

router.post("/", requireAuth, async (req, res) => {
  const {
    totalBudget,
    homeCurrency,
    origin,
    destination,
    startDate,
    endDate,
    travelers,
    flightClass,
    hotelRating,
  } = req.body

  if (!totalBudget || !homeCurrency || !origin || !destination || !startDate || !endDate) {
    return res.status(400).json({
      error: "totalBudget, homeCurrency, origin, destination, startDate, and endDate are required",
    })
  }

  const nights = nightsBetween(startDate, endDate)
  if (!Number.isFinite(nights) || nights <= 0) {
    return res.status(400).json({ error: "endDate must be after startDate" })
  }

  const travelerCount = Math.max(1, Number(travelers) || 1)
  const minStarRating = HOTEL_RATING_MIN[hotelRating] ?? 0

  let rate
  try {
    const result = await getExchangeRate("USD", homeCurrency)
    if (!result) {
      return res.status(400).json({ error: `Unsupported currency: ${homeCurrency}` })
    }
    rate = result.rate
  } catch (err) {
    console.error("Search currency lookup failed:", err.message)
    return res.status(502).json({ error: "Currency conversion is temporarily unavailable" })
  }

  const budget = Number(totalBudget)

  const { source, flightPool, hotelPool } = await getSearchPools({
    origin,
    destination,
    date: startDate,
    cabinClass: flightClass,
    checkin: startDate,
    checkout: endDate,
  })

  const flightsForClass = flightPool.filter((f) => f.cabinClass === flightClass)
  const usableFlightPool = flightsForClass.length > 0 ? flightsForClass : flightPool

  const flights = usableFlightPool
    .map((f) => {
      const pricePerPerson = round2(f.priceUSD * rate)
      const totalPrice = round2(pricePerPerson * travelerCount)
      return {
        airline: f.airline,
        flightNumber: f.flightNumber,
        cabinClass: f.cabinClass,
        durationMinutes: f.durationMinutes,
        stops: f.stops,
        pricePerPerson,
        totalPrice,
        withinBudget: totalPrice <= budget,
      }
    })
    .sort((a, b) => a.totalPrice - b.totalPrice)

  const cheapestFlight = flights[0] ?? null
  const flightCost = cheapestFlight ? cheapestFlight.totalPrice : 0
  const remainingForHotel = round2(budget - flightCost)

  const hotels = hotelPool
    .filter((h) => h.starRating >= minStarRating)
    .map((h) => {
      const pricePerNight = round2(h.priceUSD * rate)
      const totalPrice = round2(pricePerNight * nights)
      return {
        name: h.name,
        starRating: h.starRating,
        pricePerNight,
        totalPrice,
        withinBudget: totalPrice <= remainingForHotel,
      }
    })
    .sort((a, b) => a.totalPrice - b.totalPrice)

  const cheapestHotel = hotels[0] ?? null
  const hotelCost = cheapestHotel ? cheapestHotel.totalPrice : 0
  const leftover = round2(remainingForHotel - hotelCost)

  res.json({
    origin,
    destination,
    nights,
    currency: homeCurrency.toUpperCase(),
    dataSource: source,
    flights,
    hotels,
    breakdown: {
      totalBudget: budget,
      flightCost,
      hotelCost,
      leftover,
    },
  })
})

export default router
