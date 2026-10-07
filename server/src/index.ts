import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import routes from "./routes/index.js";

const app = express();
app.use(cors());
app.use(express.json());
app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api", routes);

const port = Number(process.env.PORT) || 4000;
mongoose.connect(process.env.MONGODB_URI as string)
  .then(() => app.listen(port, () => console.log(`API on :${port}`)))
  .catch((e) => { console.error("MongoDB connection failed", e); process.exit(1); });
