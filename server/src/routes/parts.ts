import { Router } from "express";
import { Part } from "../models/index.js";
import { shopAdmin } from "../middleware/admin.js";
import { checkId, validateBody, validateQuery } from "../middleware/validate.js";
import { dropImage } from "../services/partImages.js";
import { partCreate, partPatch, partsQuery } from "../schemas.js";

const r = Router();
r.param("id", checkId);

r.get("/parts", validateQuery(partsQuery), async (req, res) => {
  const { source, make, model, category } = req.query;
  const filter: Record<string, unknown> = {};
  if (source) filter.source = source;
  if (make) filter.make = make;
  if (model) filter.model = model;
  if (category) filter.category = category;
  res.json(await Part.find(filter).limit(100));
});

r.get("/parts/:id", async (req, res) => {
  const p = await Part.findById(req.params.id);
  if (!p) return res.status(404).json({ error: "Part not found" });
  res.json(p);
});

const fields = (b: Record<string, unknown>) => {
  const { name, category, partNo, make, model, years, price, stock, source, leadTimeWeeks, imageUrl } = b;
  return { name, category, partNo, make, model, years, price, stock, source, leadTimeWeeks, imageUrl };
};

r.post("/parts", shopAdmin, validateBody(partCreate), async (req, res) => res.status(201).json(await Part.create(fields(req.body))));
r.patch("/parts/:id", shopAdmin, validateBody(partPatch), async (req, res) => {
  const update: Record<string, unknown> = Object.fromEntries(Object.entries(fields(req.body)).filter(([, v]) => v !== undefined));
  if (update.imageUrl === "") { delete update.imageUrl; update.$unset = { imageUrl: 1 }; } // remove the photo
  const old = "imageUrl" in update || update.$unset ? await Part.findById(req.params.id) : null;
  const p = await Part.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!p) return res.status(404).json({ error: "Part not found" });
  if (old?.imageUrl && old.imageUrl !== p.imageUrl) void dropImage(old.imageUrl, String(p._id)); // photo replaced or removed
  res.json(p);
});
r.delete("/parts/:id", shopAdmin, async (req, res) => {
  const gone = await Part.findByIdAndDelete(req.params.id);
  if (gone?.imageUrl) void dropImage(gone.imageUrl, String(gone._id));
  res.json({ ok: true });
});

export default r;
