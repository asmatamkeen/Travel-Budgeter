const BASE_URL = "https://sky-scrapper.p.rapidapi.com";

function authHeaders() {
  return {
    "x-rapidapi-host": process.env.RAPIDAPI_HOST,
    "x-rapidapi-key": process.env.RAPIDAPI_KEY,
  };
}

async function rapidApiGet(path, params) {
  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url, { headers: authHeaders() });

  if (!response.ok) {
    throw new Error(`Sky Scrapper API responded with ${response.status}`);
  }

  const json = await response.json();

  if (!json.status) {
    throw new Error("Sky Scrapper API returned an unsuccessful response");
  }

  return json.data;
}

// Resolves free-text like "London" into the codes the flights and hotels
// endpoints need. Returns null if nothing matched.
export async function resolveLocation(query) {
  const data = await rapidApiGet("/api/v1/flights/searchAirport", {
    query,
    locale: "en-US",
  });

  const top = data?.[0];
  if (!top) return null;

  return {
    name: top.presentation?.title ?? query,
    flightSkyId: top.navigation?.relevantFlightParams?.skyId,
    flightEntityId: top.navigation?.relevantFlightParams?.entityId,
    hotelEntityId: top.navigation?.relevantHotelParams?.entityId,
  };
}

// Always searched as adults: 1 so price.raw is a clean per-person price we
// can multiply by the actual traveler count ourselves later, same as the
// mock data does. Prices come back one-way (this API's date param doesn't
// support a return date), unlike the mock data which is documented as
// round-trip - a known simplification.
export async function searchRealFlights({ origin, destination, date, cabinClass, currency }) {
  const data = await rapidApiGet("/api/v2/flights/searchFlights", {
    originSkyId: origin.flightSkyId,
    destinationSkyId: destination.flightSkyId,
    originEntityId: origin.flightEntityId,
    destinationEntityId: destination.flightEntityId,
    date,
    cabinClass,
    adults: 1,
    sortBy: "best",
    currency,
    market: "en-US",
    countryCode: "US",
  });

  return data?.itineraries ?? [];
}

export async function searchRealHotels({ entityId, checkin, checkout, currency }) {
  const data = await rapidApiGet("/api/v1/hotels/searchHotels", {
    entityId,
    checkin,
    checkout,
    adults: 1,
    rooms: 1,
    limit: 20,
    sorting: "-relevance",
    currency,
    market: "en-US",
    countryCode: "US",
  });

  return data?.hotels ?? [];
}
