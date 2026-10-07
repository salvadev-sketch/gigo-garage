import { NextFunction, Request, Response } from "express";

// Temporary key-based guards, one per dashboard. Replace with real auth (JWT/Firebase) later.
// A missing environment key always denies access.
const guard = (envName: string) => (req: Request, res: Response, next: NextFunction) => {
  const expected = process.env[envName];
  return expected && req.header("x-admin-key") === expected ? next() : res.status(401).json({ error: "Unauthorized" });
};

export const shopAdmin = guard("ADMIN_KEY_SHOP");
export const garageAdmin = guard("ADMIN_KEY_GARAGE");
