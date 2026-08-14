import express from "express";
import requireAuth from "../middleware/auth.js";
import Trip from "../models/Trip.js";

const router = express.Router();

router.post("/", requireAuth, async (req, res) => {
  const { origin, destination, startDate, endDate, breakdown } = req.body;

  if (!origin || !destination || !startDate || !endDate || !breakdown) {
    return res.status(400).json({ error: "Missing required trip data" });
  }

  try {
    const trip = await Trip.create({ ...req.body, user: req.userId });
    res.status(201).json(trip);
  } catch (err) {
    console.error("Save trip failed:", err.message);
    res.status(500).json({ error: "Failed to save trip" });
  }
});

router.get("/", requireAuth, async (req, res) => {
  try {
    const trips = await Trip.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(trips);
  } catch (err) {
    console.error("Fetch trips failed:", err.message);
    res.status(500).json({ error: "Failed to fetch trips" });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.userId });

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    res.json(trip);
  } catch (err) {
    console.error("Fetch trip failed:", err.message);
    res.status(500).json({ error: "Failed to fetch trip" });
  }
});

export default router;
