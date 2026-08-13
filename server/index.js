import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import currencyRoutes from "./routes/currency.js";
import authRoutes from "./routes/auth.js";
import searchRoutes from "./routes/search.js";
import tripRoutes from "./routes/trips.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "Travel Budgeter API is running" });
});

app.use("/api/currency", currencyRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/trips", tripRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
