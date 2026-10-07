import { Router } from "express";
import { ChinaRequest } from "../models/index.js";
import { admin } from "../middleware/admin.js";

const r = Router();

r.post("/china-requests", async (req, res) => res.status(201).json(await ChinaRequest.create(req.body)));
r.get("/china-requests", admin, async (_req, res) => res.json(await ChinaRequest.find().sort({ createdAt: -1 })));
r.patch("/china-requests/:id", admin, async (req, res) =>
  res.json(await ChinaRequest.findByIdAndUpdate(req.params.id, req.body, { new: true })));

export default r;
