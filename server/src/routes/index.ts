import { Router } from "express";
import parts from "./parts.js";
import bookings from "./bookings.js";
import queue from "./queue.js";
import orders from "./orders.js";
import chinaRequests from "./chinaRequests.js";

const r = Router();
r.use(parts, bookings, queue, orders, chinaRequests);

export default r;
