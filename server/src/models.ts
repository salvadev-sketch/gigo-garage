import { Schema, model } from "mongoose";

export const Part = model("Part", new Schema({
  name: String, category: String, partNo: String, make: String, model: String,
  years: [Number], price: Number, stock: { type: Number, default: 0 },
  source: { type: String, enum: ["shop", "china"], default: "shop" }, leadTimeWeeks: Number,
}, { timestamps: true }));

export const Booking = model("Booking", new Schema({
  carId: { type: String, required: true, unique: true },
  customerName: { type: String, required: true }, phone: { type: String, required: true },
  make: String, model: String, year: Number, chassisNo: String,
  service: { type: String, required: true }, date: String, time: String, notes: String,
  status: { type: String, enum: ["pending", "confirmed", "in_progress", "done", "cancelled"], default: "pending" },
}, { timestamps: true }));

export const Order = model("Order", new Schema({
  items: [{ partId: String, qty: Number, price: Number }],
  customerName: String, phone: String,
  delivery: { type: String, enum: ["pickup", "delivery"] }, address: String,
  payment: { type: String, enum: ["lumicash", "bank"] }, paymentProof: String, total: Number,
  status: { type: String, enum: ["pending", "paid", "done"], default: "pending" },
}, { timestamps: true }));

export const ChinaRequest = model("ChinaRequest", new Schema({
  partNo: String, photoUrl: String, vehicle: String, phone: { type: String, required: true },
  quote: Number, deposit: Number,
  status: { type: String, enum: ["requested", "quoted", "ordered", "shipped", "arrived", "ready"], default: "requested" },
}, { timestamps: true }));

const Counter = model("Counter", new Schema({ _id: String, seq: { type: Number, default: 0 } }));

/** Next Car ID, e.g. GA-0001. Atomic, so two bookings never share an ID. */
export async function nextCarId(): Promise<string> {
  const c = await Counter.findByIdAndUpdate("carId", { $inc: { seq: 1 } }, { new: true, upsert: true });
  return `GA-${String(c.seq).padStart(4, "0")}`;
}
