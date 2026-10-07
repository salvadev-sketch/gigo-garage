import { Router, Request, Response, NextFunction } from "express";
import { Part, Booking, Order, ChinaRequest } from "./models.js";

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

r.post("/bookings", async (req, res) => res.status(201).json(await Booking.create(req.body)));
r.get("/bookings", admin, async (_req, res) => res.json(await Booking.find().sort({ createdAt: -1 })));
r.patch("/bookings/:id", admin, async (req, res) =>
  res.json(await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true })));

r.post("/orders", async (req, res) => res.status(201).json(await Order.create(req.body)));
r.get("/orders", admin, async (_req, res) => res.json(await Order.find().sort({ createdAt: -1 })));

r.post("/china-requests", async (req, res) => res.status(201).json(await ChinaRequest.create(req.body)));
r.get("/china-requests", admin, async (_req, res) => res.json(await ChinaRequest.find().sort({ createdAt: -1 })));
r.patch("/china-requests/:id", admin, async (req, res) =>
  res.json(await ChinaRequest.findByIdAndUpdate(req.params.id, req.body, { new: true })));

export default r;
