import { Booking } from "../models/index.js";

export const ACTIVE = ["pending", "confirmed", "in_progress"];
export const CLOSED = ["done", "cancelled"];

/** Cars currently in the garage queue, oldest booking first. */
export const activeBookings = () => Booking.find({ status: { $in: ACTIVE } }).sort({ createdAt: 1 });

/** Public view of a queued car: no personal data. */
export const publicItem = (b: any, i: number) => ({
  carId: b.carId, make: b.make, model: b.model, year: b.year, service: b.service,
  status: b.status, position: i + 1, valid: true,
});
