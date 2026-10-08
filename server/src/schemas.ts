import { z } from "zod";
import { isOurImage } from "./services/cloudinary.js";

// Optional text: trimmed, length-limited, and "" (an empty form field) counts as not given.
const opt = (max: number) => z.string().trim().max(max).optional().transform((v) => v || undefined);
const optMatch = (re: RegExp, msg: string) =>
  z.union([z.literal(""), z.string().regex(re, msg)]).optional().transform((v) => v || undefined);
const name = z.string().trim().min(2, "Too short").max(100);
const phone = z.string().trim().regex(/^\+?[\d\s-]{7,20}$/, "Invalid phone number");
const objectId = z.string().regex(/^[0-9a-f]{24}$/i, "Invalid id");
const money = z.number().int().min(0).max(1_000_000_000);
const atLeastOne = (o: object) => Object.values(o).some((v) => v !== undefined);
const NEED_ONE = "Nothing to update";

export const BOOKING_STATUS = ["pending", "confirmed", "in_progress", "done", "cancelled"] as const;
export const CHINA_STATUS = ["requested", "quoted", "ordered", "shipped", "arrived", "ready"] as const;
export const ORDER_STATUS = ["pending", "paid", "done", "cancelled"] as const;
export const SOURCES = ["shop", "china"] as const;

export const bookingCreate = z.object({
  customerName: name, phone,
  make: opt(50), model: opt(50), year: z.number().int().min(1980).max(new Date().getFullYear() + 1).optional(),
  chassisNo: opt(40), service: z.string().trim().min(2).max(100),
  date: optMatch(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"), time: optMatch(/^\d{2}:\d{2}$/, "Use HH:MM"),
  notes: opt(500),
});

export const bookingPatch = z.object({ status: z.enum(BOOKING_STATUS).optional(), notes: z.string().trim().max(500).optional() })
  .refine(atLeastOne, NEED_ONE);

export const orderCreate = z.object({
  items: z.array(z.object({ partId: objectId, qty: z.number().int().min(1).max(99) })).min(1).max(50),
  customerName: name, phone,
  delivery: z.enum(["pickup", "delivery"]), address: opt(300),
  payment: z.enum(["lumicash", "bank"]),
  // Normalised so the same reference typed in a different case or spacing is still recognised as a duplicate.
  paymentProof: z.string().trim().max(100).optional().transform((v) => v?.replace(/\s+/g, " ").toUpperCase() || undefined),
}).refine((o) => o.delivery !== "delivery" || !!o.address, { message: "Delivery address required", path: ["address"] });

export const orderPatch = z.object({ status: z.enum(ORDER_STATUS) });

export const chinaCreate = z.object({ partNo: opt(50), vehicle: opt(100), phone, notes: opt(1000) })
  .refine((c) => !!c.partNo || !!c.notes, { message: "A part number or description is required", path: ["partNo"] });

export const chinaPatch = z.object({ quote: money.optional(), deposit: money.optional(), status: z.enum(CHINA_STATUS).optional() })
  .refine(atLeastOne, NEED_ONE);

const partImage = z.string().max(500).refine(isOurImage, "Photo must be uploaded to our Cloudinary account");
const partFields = {
  name: z.string().trim().min(1).max(100), category: z.string().trim().min(1).max(50), partNo: z.string().trim().min(1).max(50),
  make: z.string().trim().max(50), model: z.string().trim().max(50),
  years: z.array(z.number().int().min(1950).max(2100)).max(60),
  price: money, stock: z.number().int().min(0).max(100_000),
  source: z.enum(SOURCES), leadTimeWeeks: z.number().int().min(0).max(104),
};
export const partCreate = z.object({
  ...partFields, make: partFields.make.default(""), model: partFields.model.default(""),
  years: partFields.years.default([]), stock: partFields.stock.default(0), source: partFields.source.default("shop"),
  leadTimeWeeks: partFields.leadTimeWeeks.optional(), imageUrl: partImage.optional(),
});
// "" on update means: remove the photo.
export const partPatch = z.object({ ...partFields, imageUrl: z.union([z.literal(""), partImage]) }).partial().refine(atLeastOne, NEED_ONE);

const text50 = z.string().max(50).optional();
export const partsQuery = z.object({ source: z.enum(SOURCES).optional(), make: text50, model: text50, category: text50 });
