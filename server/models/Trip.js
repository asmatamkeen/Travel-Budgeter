import mongoose from "mongoose";

const flightSchema = new mongoose.Schema(
  {
    airline: String,
    flightNumber: String,
    cabinClass: String,
    durationMinutes: Number,
    stops: Number,
    pricePerPerson: Number,
    totalPrice: Number,
    withinBudget: Boolean,
  },
  { _id: false }
);

const hotelSchema = new mongoose.Schema(
  {
    name: String,
    starRating: Number,
    pricePerNight: Number,
    totalPrice: Number,
    withinBudget: Boolean,
  },
  { _id: false }
);

const tripSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    nights: Number,
    travelers: Number,
    homeCurrency: String,
    flightClass: String,
    hotelRating: String,
    dateFlexibility: String,
    flights: [flightSchema],
    hotels: [hotelSchema],
    breakdown: {
      totalBudget: Number,
      flightCost: Number,
      hotelCost: Number,
      leftover: Number,
    },
  },
  { timestamps: true }
);

const Trip = mongoose.model("Trip", tripSchema);

export default Trip;
