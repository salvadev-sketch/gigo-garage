import { Router } from "express";
import admin from "./admin.js";
import parts from "./parts.js";
import bookings from "./bookings.js";
import queue from "./queue.js";
import orders from "./orders.js";
import chinaRequests from "./chinaRequests.js";

const r = Router();
r.use(admin, parts, bookings, queue, orders, chinaRequests);

export default r;
