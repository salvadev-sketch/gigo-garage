import { Router } from "express";
import { Booking, nextCarId } from "../models/index.js";
import { garageAdmin } from "../middleware/admin.js";
import { activeBookings, CLOSED } from "../services/queue.js";
import { checkId, validateBody } from "../middleware/validate.js";
import { notify, NotifyEvent } from "../services/notify.js";
import { bookingCreate, bookingPatch } from "../schemas.js";

const r = Router();
r.param("id", checkId);

r.post("/bookings", validateBody(bookingCreate), async (req, res) => {
  const { customerName, phone, make, model, year, chassisNo, service, date, time, notes } = req.body;
  const b = await Booking.create({
    customerName, phone, make, model, year, chassisNo, service, date, time, notes,
    status: "pending", carId: await nextCarId(),
  });
  const position = (await activeBookings()).findIndex((x) => x.carId === b.carId) + 1;
  void notify("booking_received", b.phone, { carId: b.carId ?? "", position });
  res.status(201).json({ carId: b.carId, position });
});

r.get("/bookings", garageAdmin, async (_req, res) => res.json(await Booking.find().sort({ createdAt: -1 })));

// Setting status to "done" (car repaired and working) or "cancelled" invalidates the
// Car ID and removes the car from the public waiting list.
r.patch("/bookings/:id", garageAdmin, validateBody(bookingPatch), async (req, res) => {
  const { status, notes } = req.body;
  const update: Record<string, unknown> = {};
  if (notes !== undefined) update.notes = notes;
  if (status) {
    update.status = status;
    if (CLOSED.includes(status)) { update.valid = false; update.completedAt = new Date(); }
    else { update.valid = true; update.$unset = { completedAt: 1 }; }
  }
  const old = await Booking.findById(req.params.id);
  const b = await Booking.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!b) return res.status(404).json({ error: "Booking not found" });
  if (old && old.status !== b.status && ["confirmed", "done", "cancelled"].includes(b.status ?? "")) {
    void notify(`booking_${b.status}` as NotifyEvent, b.phone, { carId: b.carId ?? "" });
  }
  res.json(b);
});

export default r;
