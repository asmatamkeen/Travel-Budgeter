// Prices are per-person, round-trip, in USD. Real numbers will replace
// this once the live flight API is wired up in a later step.
const mockFlights = [
  { airline: "SkyLink Air", flightNumber: "SL204", cabinClass: "economy", durationMinutes: 320, stops: 0, priceUSD: 299 },
  { airline: "Horizon Airways", flightNumber: "HA118", cabinClass: "economy", durationMinutes: 410, stops: 1, priceUSD: 350 },
  { airline: "BlueWing", flightNumber: "BW772", cabinClass: "economy", durationMinutes: 295, stops: 0, priceUSD: 420 },
  { airline: "TransGlobal", flightNumber: "TG556", cabinClass: "economy", durationMinutes: 480, stops: 1, priceUSD: 500 },
  { airline: "Horizon Airways", flightNumber: "HA240", cabinClass: "premium_economy", durationMinutes: 320, stops: 0, priceUSD: 650 },
  { airline: "Northern Star Air", flightNumber: "NS890", cabinClass: "premium_economy", durationMinutes: 355, stops: 0, priceUSD: 780 },
  { airline: "TransGlobal", flightNumber: "TG991", cabinClass: "business", durationMinutes: 300, stops: 0, priceUSD: 1200 },
  { airline: "BlueWing", flightNumber: "BW114", cabinClass: "business", durationMinutes: 320, stops: 0, priceUSD: 1500 },
]

export default mockFlights
