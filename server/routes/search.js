import express from "express";
import requireAuth from "../middleware/auth.js";
import { getExchangeRate } from "../utils/exchangeRate.js";
import mockFlights from "../data/mockFlights.js";
import mockHotels from "../data/mockHotels.js";

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

router.post("/", requireAuth, async (req, res) => {
  const {
    totalBudget,
    homeCurrency,
    destination,
    startDate,
    endDate,
    travelers,
    flightClass,
    hotelRating,
  } = req.body

  if (!totalBudget || !homeCurrency || !destination || !startDate || !endDate) {
    return res.status(400).json({
      error: "totalBudget, homeCurrency, destination, startDate, and endDate are required",
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

  const flightsForClass = mockFlights.filter((f) => f.cabinClass === flightClass)
  const flightPool = flightsForClass.length > 0 ? flightsForClass : mockFlights

  const flights = flightPool
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

  const hotels = mockHotels
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
    destination,
    nights,
    currency: homeCurrency.toUpperCase(),
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
