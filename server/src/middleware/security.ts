import cors from "cors";
import rateLimit from "express-rate-limit";

/**
 * Allowed browser origins, comma separated in CORS_ORIGINS (e.g. https://gigo-garage.vercel.app).
 * Defaults to the Vite dev server so local work needs no setup.
 */
const origins = () => (process.env.CORS_ORIGINS ?? "http://localhost:5173").split(",").map((o) => o.trim()).filter(Boolean);
export const corsPolicy = () => cors({ origin: origins() });

const limiter = (windowMinutes: number, max: number) =>
  rateLimit({ windowMs: windowMinutes * 60_000, limit: max, standardHeaders: "draft-7", legacyHeaders: false, message: { error: "Too many requests, try again later." } });

/** Every API request, per IP. */
export const apiLimiter = limiter(15, 300);
/** Public forms that create records (bookings, orders, China requests), per IP. */
export const formLimiter = limiter(60, 20);
