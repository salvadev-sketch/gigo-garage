import { Router } from "express";
import { ChinaRequest, nextRequestNo } from "../models/index.js";
import { shopAdmin } from "../middleware/admin.js";

const r = Router();

// Customer asks for a part that is not in the catalogue.
r.post("/china-requests", async (req, res) => {
  const { partNo, vehicle, phone, notes } = req.body;
  if (!phone || (!partNo && !notes)) return res.status(400).json({ error: "Phone and a part number or description are required" });
  const c = await ChinaRequest.create({ requestNo: await nextRequestNo(), partNo, vehicle, phone, notes, status: "requested" });
  res.status(201).json({ requestNo: c.requestNo });
});

// Public tracking by request number (no phone number is returned).
r.get("/china-requests/track/:requestNo", async (req, res) => {
  const c = await ChinaRequest.findOne({ requestNo: req.params.requestNo.trim().toUpperCase() });
  if (!c) return res.status(404).json({ error: "Request not found" });
  res.json({ requestNo: c.requestNo, status: c.status, partNo: c.partNo, vehicle: c.vehicle, quote: c.quote, deposit: c.deposit });
});

r.get("/china-requests", shopAdmin, async (_req, res) => res.json(await ChinaRequest.find().sort({ createdAt: -1 })));

r.patch("/china-requests/:id", shopAdmin, async (req, res) => {
  const { quote, deposit, status } = req.body;
  const update = Object.fromEntries(Object.entries({ quote, deposit, status }).filter(([, v]) => v !== undefined));
  const c = await ChinaRequest.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!c) return res.status(404).json({ error: "Request not found" });
  res.json(c);
});

export default r;
