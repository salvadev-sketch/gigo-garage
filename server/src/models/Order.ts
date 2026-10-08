import { Schema, model } from "mongoose";

export const Order = model("Order", new Schema({
  orderNo: { type: String, required: true, unique: true },
  items: [{ partId: String, name: String, qty: Number, price: Number, source: String }],
  customerName: String, phone: String,
  delivery: { type: String, enum: ["pickup", "delivery"] }, address: String,
  payment: { type: String, enum: ["lumicash", "bank"] }, paymentProof: String,
  subtotal: Number, deposit: Number, deliveryFee: Number, total: Number,
  status: { type: String, enum: ["pending", "paid", "done", "cancelled"], default: "pending" },
  paidAt: Date, confirmedBy: String,
}, { timestamps: true }));
