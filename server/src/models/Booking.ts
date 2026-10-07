import { Schema, model } from "mongoose";

export const Booking = model("Booking", new Schema({
  carId: { type: String, required: true, unique: true },
  valid: { type: Boolean, default: true }, completedAt: Date,
  customerName: { type: String, required: true }, phone: { type: String, required: true },
  make: String, model: String, year: Number, chassisNo: String,
  service: { type: String, required: true }, date: String, time: String, notes: String,
  status: { type: String, enum: ["pending", "confirmed", "in_progress", "done", "cancelled"], default: "pending" },
}, { timestamps: true }));
