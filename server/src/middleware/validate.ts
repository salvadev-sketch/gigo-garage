import { NextFunction, Request, Response } from "express";
import { z } from "zod";

const reject = (res: Response, error: z.ZodError) =>
  res.status(400).json({ error: "Invalid input", details: error.issues.map((i) => ({ field: i.path.join("."), message: i.message })) });

/** Validates req.body. Unknown fields are dropped, so clients cannot set fields we did not allow. */
export const validateBody = (schema: z.ZodType) => (req: Request, res: Response, next: NextFunction) => {
  const r = schema.safeParse(req.body ?? {});
  if (!r.success) return reject(res, r.error);
  req.body = r.data;
  return next();
};

/** Validates req.query. Rejects arrays/objects such as ?make[$ne]=x that could alter a Mongo filter. */
export const validateQuery = (schema: z.ZodType) => (req: Request, res: Response, next: NextFunction) => {
  const r = schema.safeParse(req.query);
  if (!r.success) return reject(res, r.error);
  req.query = r.data as Request["query"];
  return next();
};

/** Use with router.param("id", checkId): a malformed id gets a 400 instead of a database error. */
export const checkId = (_req: Request, res: Response, next: NextFunction, id: string) =>
  /^[0-9a-f]{24}$/i.test(id) ? next() : res.status(400).json({ error: "Invalid id" });
