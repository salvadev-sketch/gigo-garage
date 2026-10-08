import { Router } from "express";
import { ChinaRequest, nextRequestNo } from "../models/index.js";
import { shopAdmin } from "../middleware/admin.js";
import { checkId, validateBody } from "../middleware/validate.js";
import { chinaCreate, chinaPatch } from "../schemas.js";

const r = Router();
r.param("id", checkId);

// Customer asks for a part that is not in the catalogue.
r.post("/china-requests", validateBody(chinaCreate), async (req, res) => {
  const { partNo, vehicle, phone, notes } = req.body;
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

r.patch("/china-requests/:id", shopAdmin, validateBody(chinaPatch), async (req, res) => {
  const { quote, deposit, status } = req.body;
  const update = Object.fromEntries(Object.entries({ quote, deposit, status }).filter(([, v]) => v !== undefined));
  const c = await ChinaRequest.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!c) return res.status(404).json({ error: "Request not found" });
  res.json(c);
});

export default r;
