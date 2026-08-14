import mongoose from "mongoose";

const CACHE_TTL_SECONDS = 6 * 60 * 60; // 6 hours

const poolFlightSchema = new mongoose.Schema(
  {
    airline: String,
    flightNumber: String,
    cabinClass: String,
    durationMinutes: Number,
    stops: Number,
    priceUSD: Number,
  },
  { _id: false }
);

const poolHotelSchema = new mongoose.Schema(
  {
    name: String,
    starRating: Number,
    priceUSD: Number,
  },
  { _id: false }
);

const searchCacheSchema = new mongoose.Schema({
  cacheKey: { type: String, required: true, unique: true },
  flightPool: [poolFlightSchema],
  hotelPool: [poolHotelSchema],
  createdAt: { type: Date, default: Date.now, expires: CACHE_TTL_SECONDS },
});

const SearchCache = mongoose.model("SearchCache", searchCacheSchema);

export default SearchCache;
