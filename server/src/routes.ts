import { Router, Request, Response, NextFunction } from "express";
import { Part, Booking, Order, ChinaRequest, nextCarId } from "./models.js";

const r = Router();

// Temporary admin guard. Replace with real auth (JWT/Firebase) later.
const admin = (req: Request, res: Response, next: NextFunction) =>
  req.header("x-admin-key") === process.env.ADMIN_KEY ? next() : res.status(401).json({ error: "Unauthorized" });

r.get("/parts", async (req, res) => {
  const { source, make, model, category } = req.query;
  const filter: Record<string, unknown> = {};
  if (source) filter.source = source;
  if (make) filter.make = make;
  if (model) filter.model = model;
  if (category) filter.category = category;
  res.json(await Part.find(filter).limit(100));
});

const ACTIVE = ["pending", "confirmed", "in_progress"];
const activeBookings = () => Booking.find({ status: { $in: ACTIVE } }).sort({ createdAt: 1 });
const publicItem = (b: any, i: number) => ({
  carId: b.carId, make: b.make, model: b.model, year: b.year, service: b.service, status: b.status, position: i + 1, valid: true,
});

r.post("/bookings", async (req, res) => {
  const { customerName, phone, make, model, year, chassisNo, service, date, time, notes } = req.body;
  const b = await Booking.create({
    customerName, phone, make, model, year, chassisNo, service, date, time, notes,
    status: "pending", carId: await nextCarId(),
  });
  const position = (await activeBookings()).findIndex((x) => x.carId === b.carId) + 1;
  res.status(201).json({ carId: b.carId, position });
});

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
r.get("/bookings", admin, async (_req, res) => res.json(await Booking.find().sort({ createdAt: -1 })));
// Update a booking. Setting status to "done" (car repaired and working) or "cancelled"
// invalidates the Car ID and removes the car from the public waiting list.
const CLOSED = ["done", "cancelled"];
r.patch("/bookings/:id", admin, async (req, res) => {
  const { status, notes } = req.body;
  const update: Record<string, unknown> = {};
  if (notes !== undefined) update.notes = notes;
  if (status) {
    update.status = status;
    if (CLOSED.includes(status)) { update.valid = false; update.completedAt = new Date(); }
    else { update.valid = true; update.$unset = { completedAt: 1 }; }
  }
  const b = await Booking.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!b) return res.status(404).json({ error: "Booking not found" });
  res.json(b);
});

r.post("/orders", async (req, res) => res.status(201).json(await Order.create(req.body)));
r.get("/orders", admin, async (_req, res) => res.json(await Order.find().sort({ createdAt: -1 })));

r.post("/china-requests", async (req, res) => res.status(201).json(await ChinaRequest.create(req.body)));
r.get("/china-requests", admin, async (_req, res) => res.json(await ChinaRequest.find().sort({ createdAt: -1 })));
r.patch("/china-requests/:id", admin, async (req, res) =>
  res.json(await ChinaRequest.findByIdAndUpdate(req.params.id, req.body, { new: true })));

export default r;
