import { Router } from "express";
import { garageAdmin, shopAdmin } from "../middleware/admin.js";

const r = Router();

// Used by the dashboards to check a key at sign-in.
r.get("/admin/shop/ping", shopAdmin, (_req, res) => res.json({ ok: true }));
r.get("/admin/garage/ping", garageAdmin, (_req, res) => res.json({ ok: true }));

export default r;
