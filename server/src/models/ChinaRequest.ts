import { Schema, model } from "mongoose";

export const ChinaRequest = model("ChinaRequest", new Schema({
  partNo: String, photoUrl: String, vehicle: String, phone: { type: String, required: true },
  quote: Number, deposit: Number,
  status: { type: String, enum: ["requested", "quoted", "ordered", "shipped", "arrived", "ready"], default: "requested" },
}, { timestamps: true }));
