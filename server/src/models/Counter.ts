import { Schema, model } from "mongoose";

const Counter = model("Counter", new Schema({ _id: String, seq: { type: Number, default: 0 } }));

async function nextSeq(id: string, prefix: string): Promise<string> {
  const c = await Counter.findByIdAndUpdate(id, { $inc: { seq: 1 } }, { new: true, upsert: true });
  return `${prefix}${String(c.seq).padStart(4, "0")}`;
}

/** Next Car ID, e.g. GA-0001. Atomic, so two bookings never share an ID. */
export const nextCarId = () => nextSeq("carId", "GA-");
/** Next order number, e.g. OR-0001. */
export const nextOrderNo = () => nextSeq("orderNo", "OR-");
/** Next China request number, e.g. CN-0001. */
export const nextRequestNo = () => nextSeq("requestNo", "CN-");
