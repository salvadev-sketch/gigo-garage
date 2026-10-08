import "dotenv/config";
import "express-async-errors"; // lets async route errors reach the error handler instead of crashing Node
import express from "express";
import helmet from "helmet";
import mongoose from "mongoose";
import routes from "./routes/index.js";
import { errorHandler } from "./middleware/errors.js";
import { apiLimiter, corsPolicy, formLimiter } from "./middleware/security.js";

const app = express();
app.set("trust proxy", 1); // behind Render's proxy, so rate limits see the real client IP
app.use(helmet()); // security headers (JSON API only, so the default policy is fine)
app.use(corsPolicy());
app.use(express.json({ limit: "20kb" }));
app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api", apiLimiter);
app.post(["/api/bookings", "/api/orders", "/api/china-requests"], formLimiter);
app.use("/api", routes);
app.use(errorHandler);

const port = Number(process.env.PORT) || 4000;
mongoose.connect(process.env.MONGODB_URI as string)
  .then(() => app.listen(port, () => console.log(`API on :${port}`)))
  .catch((e) => { console.error("MongoDB connection failed", e); process.exit(1); });
