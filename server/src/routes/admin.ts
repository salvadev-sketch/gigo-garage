import { Router } from "express";
import { isStaffRole } from "../../../shared/roles.js";
import { firebaseAuth } from "../firebase.js";
import { garageAdmin, ownerOnly, shopAdmin } from "../middleware/admin.js";

const r = Router();

// Used by the dashboards after sign-in to confirm access.
r.get("/admin/shop/ping", shopAdmin, (_req, res) => res.json({ ok: true }));
r.get("/admin/garage/ping", garageAdmin, (_req, res) => res.json({ ok: true }));

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
