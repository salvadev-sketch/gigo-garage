import { Router } from "express";
import { Booking } from "../models/index.js";
import { activeBookings, publicItem } from "../services/queue.js";

const r = Router();

// Public waiting list: cars currently in the garage queue, no personal data.
r.get("/queue", async (_req, res) => res.json((await activeBookings()).map(publicItem)));

// Public tracking by Car ID.
r.get("/track/:carId", async (req, res) => {
  const carId = req.params.carId.trim().toUpperCase();
  const list = await activeBookings();
  const i = list.findIndex((b) => b.carId === carId);
  if (i >= 0) return res.json(publicItem(list[i], i));
  const b = await Booking.findOne({ carId });
  if (!b) return res.status(404).json({ error: "Car ID not found" });
  // Closed booking: the Car ID is no longer valid.
  res.json({ carId: b.carId, make: b.make, model: b.model, year: b.year, service: b.service, status: b.status, position: null, valid: false });
});

export default r;
