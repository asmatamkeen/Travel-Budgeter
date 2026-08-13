import express from "express";
import requireAuth from "../middleware/auth.js";
import Trip from "../models/Trip.js";

const router = express.Router();

router.post("/", requireAuth, async (req, res) => {
  const { destination, startDate, endDate, breakdown } = req.body;

  if (!destination || !startDate || !endDate || !breakdown) {
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

export default router;
