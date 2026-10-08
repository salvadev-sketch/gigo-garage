import { NextFunction, Request, Response } from "express";
import { DASHBOARD_ROLES, isStaffRole, StaffRole } from "../../../shared/roles.js";
import { firebaseAuth } from "../firebase.js";

export interface StaffUser { uid: string; email?: string; role: StaffRole }
export type StaffRequest = Request & { staff?: StaffUser };

/** Verifies the Firebase ID token (Authorization: Bearer ...) and checks the role claim. */
export const requireRole = (...allowed: readonly StaffRole[]) =>
  async (req: StaffRequest, res: Response, next: NextFunction) => {
    const token = req.header("authorization")?.match(/^Bearer (.+)$/i)?.[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
      const decoded = await firebaseAuth().verifyIdToken(token);
      if (!isStaffRole(decoded.role) || !allowed.includes(decoded.role)) {
        return res.status(403).json({ error: "Forbidden" });
      }
      req.staff = { uid: decoded.uid, email: decoded.email, role: decoded.role };
      return next();
    } catch {
      return res.status(401).json({ error: "Unauthorized" });
    }
  };

export const shopAdmin = requireRole(...DASHBOARD_ROLES.shop);
export const garageAdmin = requireRole(...DASHBOARD_ROLES.garage);
export const ownerOnly = requireRole("owner");
