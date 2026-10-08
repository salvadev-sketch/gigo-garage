import { Router } from "express";
import { isStaffRole } from "../../../shared/roles.js";
import { firebaseAuth } from "../firebase.js";
import { garageAdmin, ownerOnly, shopAdmin } from "../middleware/admin.js";
import { ALLOWED_FORMATS, cloudinaryConfig, sign, UPLOAD_FOLDER } from "../services/cloudinary.js";

const r = Router();

// Used by the dashboards after sign-in to confirm access.
r.get("/admin/shop/ping", shopAdmin, (_req, res) => res.json({ ok: true }));
r.get("/admin/garage/ping", garageAdmin, (_req, res) => res.json({ ok: true }));

// Shop staff: a short-lived signature so the browser can upload one part photo to Cloudinary.
r.post("/admin/uploads/sign", shopAdmin, (_req, res) => {
  const c = cloudinaryConfig();
  if (!c) return res.status(503).json({ error: "Image uploads are not configured" });
  const timestamp = Math.floor(Date.now() / 1000);
  const params = { allowed_formats: ALLOWED_FORMATS, folder: UPLOAD_FOLDER, timestamp };
  res.json({ cloudName: c.cloudName, apiKey: c.apiKey, ...params, signature: sign(params, c.apiSecret) });
});

// Owner only: give or remove a staff role. Body: { email, role } where role is a StaffRole or null.
r.post("/admin/roles", ownerOnly, async (req, res) => {
  const { email, role } = req.body ?? {};
  if (typeof email !== "string" || (role !== null && !isStaffRole(role))) {
    return res.status(400).json({ error: "email and a valid role (or null) are required" });
  }
  try {
    const auth = firebaseAuth();
    const user = await auth.getUserByEmail(email);
    await auth.setCustomUserClaims(user.uid, { ...user.customClaims, role: role ?? null });
    await auth.revokeRefreshTokens(user.uid); // forces a fresh token with the new role
    return res.json({ ok: true, uid: user.uid, role });
  } catch {
    return res.status(404).json({ error: "User not found. Create the account in Firebase first." });
  }
});

export default r;
