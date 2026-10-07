import { Router } from "express";
import { Part } from "../models/index.js";
import { shopAdmin } from "../middleware/admin.js";

const r = Router();

r.get("/parts", async (req, res) => {
  const { source, make, model, category } = req.query;
  const filter: Record<string, unknown> = {};
  if (source) filter.source = source;
  if (make) filter.make = make;
  if (model) filter.model = model;
  if (category) filter.category = category;
  res.json(await Part.find(filter).limit(100));
});

const fields = (b: Record<string, unknown>) => {
  const { name, category, partNo, make, model, years, price, stock, source, leadTimeWeeks } = b;
  return { name, category, partNo, make, model, years, price, stock, source, leadTimeWeeks };
};

r.post("/parts", shopAdmin, async (req, res) => res.status(201).json(await Part.create(fields(req.body))));
r.patch("/parts/:id", shopAdmin, async (req, res) => {
  const update = Object.fromEntries(Object.entries(fields(req.body)).filter(([, v]) => v !== undefined));
  const p = await Part.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!p) return res.status(404).json({ error: "Part not found" });
  res.json(p);
});
r.delete("/parts/:id", shopAdmin, async (req, res) => {
  await Part.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

export default r;
