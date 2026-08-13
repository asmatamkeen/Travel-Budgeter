import express from "express";
import { getExchangeRate } from "../utils/exchangeRate.js";

const router = express.Router();

router.get("/:from/:to", async (req, res) => {
  const { from, to } = req.params;

  try {
    const result = await getExchangeRate(from, to);

    if (!result) {
      return res.status(404).json({
        error: `Could not find rate for ${from} -> ${to}`,
      });
    }

    res.json({
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      rate: result.rate,
      lastUpdated: result.lastUpdated,
    });
  } catch (err) {
    console.error("Currency lookup failed:", err.message);
    res.status(500).json({ error: "Currency conversion failed" });
  }
});

export default router;
