import { Schema, model } from "mongoose";

export const Part = model("Part", new Schema({
  name: String, category: String, partNo: String, make: String, model: String,
  years: [Number], price: Number, stock: { type: Number, default: 0 },
  source: { type: String, enum: ["shop", "china"], default: "shop" }, leadTimeWeeks: Number,
}, { timestamps: true }));
