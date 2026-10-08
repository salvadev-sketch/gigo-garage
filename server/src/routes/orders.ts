import { Router } from "express";
import { Order, Part, nextOrderNo } from "../models/index.js";
import { shopAdmin, StaffRequest } from "../middleware/admin.js";
import { shopConfig } from "../config.js";
import { computeTotals } from "../../../shared/pricing.js";
import { checkId, validateBody } from "../middleware/validate.js";
import { orderCreate, orderPatch } from "../schemas.js";
import { releaseStock, reserveStock, StockLine } from "../services/stock.js";

const r = Router();
r.param("id", checkId);

r.get("/config", (_req, res) => res.json(shopConfig()));

// Prices and totals are always recomputed here, never trusted from the client.
// Stock for shop parts is reserved at order time and put back if the order is cancelled.
r.post("/orders", validateBody(orderCreate), async (req, res) => {
  const { items, customerName, phone, delivery, address, payment, paymentProof } = req.body;

  const wanted = new Map<string, number>(); // the same part twice counts once, with the quantities added
  for (const i of items as { partId: string; qty: number }[]) wanted.set(i.partId, (wanted.get(i.partId) ?? 0) + i.qty);
  if ([...wanted.values()].some((q) => q > 99)) return res.status(400).json({ error: "Invalid item" });

  const parts = await Part.find({ _id: { $in: [...wanted.keys()] } });
  const lines: (StockLine & { name: string; price: number })[] = [];
  for (const [partId, qty] of wanted) {
    const p = parts.find((x) => String(x._id) === partId);
    if (!p) return res.status(400).json({ error: "Invalid item" });
    lines.push({ partId, qty, name: p.name ?? "", price: p.price ?? 0, source: (p.source ?? "shop") as "shop" | "china" });
  }

  const reserved = await reserveStock(lines);
  if (!reserved.ok) {
    const short = lines.find((l) => l.partId === reserved.partId);
    return res.status(409).json({ error: `Not enough stock for ${short?.name ?? "a part"}`, partId: reserved.partId });
  }

  try {
    const cfg = shopConfig();
    const t = computeTotals(lines, cfg.chinaDepositPercent, cfg.deliveryFee, delivery === "delivery");
    const order = await Order.create({
      orderNo: await nextOrderNo(), items: lines.map(({ partId, name, qty, price, source }) => ({ partId, name, qty, price, source })),
      customerName, phone, delivery, address, payment, paymentProof,
      subtotal: t.shopSubtotal + t.chinaSubtotal, deposit: t.deposit, deliveryFee: t.deliveryFee, total: t.dueNow,
      status: "pending",
    });
    res.status(201).json({ orderNo: order.orderNo, total: order.total });
  } catch (e) {
    await releaseStock(lines); // the order was not saved, so do not keep the parts reserved
    throw e;
  }
});

// Public tracking by order number (no personal data).
r.get("/orders/track/:orderNo", async (req, res) => {
  const o = await Order.findOne({ orderNo: req.params.orderNo.trim().toUpperCase() });
  if (!o) return res.status(404).json({ error: "Order not found" });
  res.json({ orderNo: o.orderNo, status: o.status, total: o.total, delivery: o.delivery, payment: o.payment });
});

r.get("/orders", shopAdmin, async (_req, res) => res.json(await Order.find().sort({ createdAt: -1 })));

// Staff: confirm payment (pending -> paid), close (paid -> done) or cancel (stock goes back).
// Confirming records who and when. A cancelled order is final, so its stock is never released twice.
r.patch("/orders/:id", shopAdmin, validateBody(orderPatch), async (req: StaffRequest, res) => {
  const { status } = req.body;
  const o = await Order.findById(req.params.id);
  if (!o) return res.status(404).json({ error: "Order not found" });
  if (o.status === "cancelled") return res.status(409).json({ error: "Order is cancelled" });

  if (status === "paid" && o.paymentProof) {
    const used = await Order.findOne({ _id: { $ne: o._id }, payment: o.payment, paymentProof: o.paymentProof, status: { $in: ["paid", "done"] } });
    if (used) return res.status(409).json({ error: `This payment reference was already used for order ${used.orderNo}` });
  }

  const update = status === "paid" ? { status, paidAt: new Date(), confirmedBy: req.staff?.email }
    : status === "pending" ? { status, $unset: { paidAt: 1, confirmedBy: 1 } } : { status };
  const before = await Order.findOneAndUpdate({ _id: o._id, status: { $ne: "cancelled" } }, update, { new: false });
  if (!before) return res.status(409).json({ error: "Order is cancelled" });
  if (status === "cancelled") {
    await releaseStock(before.items.map((i) => ({ partId: i.partId ?? "", qty: i.qty ?? 0, source: (i.source ?? "shop") as "shop" | "china" })));
  }
  res.json(await Order.findById(o._id));
});

export default r;
