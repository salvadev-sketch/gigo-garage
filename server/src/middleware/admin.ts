import { NextFunction, Request, Response } from "express";

// Temporary admin guard. Replace with real auth (JWT/Firebase) later.
export const admin = (req: Request, res: Response, next: NextFunction) =>
  req.header("x-admin-key") === process.env.ADMIN_KEY ? next() : res.status(401).json({ error: "Unauthorized" });
