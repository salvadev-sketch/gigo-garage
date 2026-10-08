import { NextFunction, Request, Response } from "express";

/** Last middleware: bad JSON / oversized bodies get their 4xx, everything else is logged and returned as a generic 500. */
export const errorHandler = (err: { status?: number; message?: string }, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status && err.status >= 400 && err.status < 500 ? err.status : 500;
  if (status === 500) console.error(err);
  res.status(status).json({ error: status === 500 ? "Server error" : err.message });
};
