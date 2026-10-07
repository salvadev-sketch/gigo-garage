import { Router } from "express";
import { Order, Part, nextOrderNo } from "../models/index.js";
import { shopAdmin } from "../middleware/admin.js";
import { shopConfig } from "../config.js";
import { computeTotals } from "../../../shared/pricing.js";

const r = Router();

r.get("/config", (_req, res) => res.json(shopConfig()));

// Prices and totals are always recomputed here, never trusted from the client.
r.post("/orders", async (req, res) => {
  const { items, customerName, phone, delivery, address, payment, paymentProof } = req.body;
  if (!Array.isArray(items) || !items.length || !customerName || !phone || !["lumicash", "bank"].includes(payment))
    return res.status(400).json({ error: "Invalid order" });
  if (delivery === "delivery" && !address) return res.status(400).json({ error: "Delivery address required" });

  const parts = await Part.find({ _id: { $in: items.map((i: { partId: string }) => i.partId) } });
  const lines = [];
  for (const i of items) {
    const p = parts.find((x) => String(x._id) === i.partId);
    const qty = Number(i.qty);
    if (!p || !Number.isInteger(qty) || qty < 1 || qty > 99) return res.status(400).json({ error: "Invalid item" });
    lines.push({ partId: String(p._id), name: p.name ?? "", qty, price: p.price ?? 0, source: (p.source ?? "shop") as "shop" | "china" });
  }
  const cfg = shopConfig();
  const t = computeTotals(lines, cfg.chinaDepositPercent, cfg.deliveryFee, delivery === "delivery");
  const order = await Order.create({
    orderNo: await nextOrderNo(), items: lines, customerName, phone,
    delivery: delivery === "delivery" ? "delivery" : "pickup", address, payment, paymentProof,
    subtotal: t.shopSubtotal + t.chinaSubtotal, deposit: t.deposit, deliveryFee: t.deliveryFee, total: t.dueNow,
    status: "pending",
  });
  res.status(201).json({ orderNo: order.orderNo, total: order.total });
});

r.get("/orders", shopAdmin, async (_req, res) => res.json(await Order.find().sort({ createdAt: -1 })));


// Shop staff confirm payment (pending -> paid) and close the order (paid -> done).
r.patch("/orders/:id", shopAdmin, async (req, res) => {
  const { status } = req.body;
  if (!["pending", "paid", "done"].includes(status)) return res.status(400).json({ error: "Invalid status" });
  const o = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!o) return res.status(404).json({ error: "Order not found" });
  res.json(o);
});

export default r;
