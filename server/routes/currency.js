import express from "express";

const router = express.Router();

router.get("/:from/:to", async (req, res) => {
  const { from, to } = req.params;

  try {
    const response = await fetch(
      `https://open.er-api.com/v6/latest/${from.toUpperCase()}`
    );

    if (!response.ok) {
      throw new Error(`Exchange rate API responded with ${response.status}`);
    }

    const data = await response.json();
    const rate = data.rates?.[to.toUpperCase()];

    if (!rate) {
      return res.status(404).json({
        error: `Could not find rate for ${from} -> ${to}`,
      });
    }

    res.json({
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      rate,
      lastUpdated: data.time_last_update_utc || null,
    });
  } catch (err) {
    console.error("Currency lookup failed:", err.message);
    res.status(500).json({ error: "Currency conversion failed" });
  }
});

export default router;
