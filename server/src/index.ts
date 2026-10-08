import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import routes from "./routes/index.js";
import { apiLimiter, corsPolicy, formLimiter } from "./middleware/security.js";

const app = express();
app.set("trust proxy", 1); // behind Render's proxy, so rate limits see the real client IP
app.use(corsPolicy());
app.use(express.json());
app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api", apiLimiter);
app.post(["/api/bookings", "/api/orders", "/api/china-requests"], formLimiter);
app.use("/api", routes);

const port = Number(process.env.PORT) || 4000;
mongoose.connect(process.env.MONGODB_URI as string)
  .then(() => app.listen(port, () => console.log(`API on :${port}`)))
  .catch((e) => { console.error("MongoDB connection failed", e); process.exit(1); });
