import { parse } from "csv-parse/sync";
import { partCreate } from "../schemas.js";
import { z } from "zod";

export type PartRow = z.output<typeof partCreate>;
export interface CsvError { line: number; message: string }

const COLUMNS = ["name", "category", "partNo", "make", "model", "years", "price", "stock", "source", "leadTimeWeeks"];

/** "2010-2013" or "2010;2011;2012" -> [2010, 2011, ...]. Anything unreadable becomes NaN so validation rejects it. */
const parseYears = (v: string): number[] => {
  if (!v) return [];
  return v.split(/[;,]/).flatMap((chunk) => {
    const range = chunk.trim().match(/^(\d{4})\s*-\s*(\d{4})$/);
    if (!range) return [Number(chunk.trim())];
    const [from, to] = [Number(range[1]), Number(range[2])];
    return to >= from && to - from <= 60 ? Array.from({ length: to - from + 1 }, (_, i) => from + i) : [NaN];
  });
};
const num = (v: string | undefined) => (v === undefined || v === "" ? undefined : Number(v.replace(/[\s,]/g, "")));

/** Reads a parts CSV. Every row is checked with the same rules as the dashboard, so bad data never reaches the database. */
export function parseParts(csv: string): { rows: PartRow[]; errors: CsvError[] } {
  const records: Record<string, string>[] = parse(csv, { columns: true, skip_empty_lines: true, trim: true, bom: true });
  const errors: CsvError[] = [];
  const header = records.length ? Object.keys(records[0]) : [];
  const missing = records.length ? COLUMNS.filter((c) => !header.includes(c)) : [];
  if (missing.length) return { rows: [], errors: [{ line: 1, message: `Missing columns: ${missing.join(", ")}` }] };

  const rows: PartRow[] = [];
  const seen = new Set<string>();
  records.forEach((r, i) => {
    const line = i + 2; // line 1 is the header
    const parsed = partCreate.safeParse({
      name: r.name, category: r.category, partNo: r.partNo, make: r.make, model: r.model,
      years: parseYears(r.years), price: num(r.price), stock: num(r.stock), source: r.source || undefined, leadTimeWeeks: num(r.leadTimeWeeks),
      imageUrl: r.imageUrl || undefined, // optional column
    });
    if (!parsed.success) {
      return parsed.error.issues.forEach((x) => errors.push({ line, message: `${x.path.join(".") || "row"}: ${x.message}` }));
    }
    const key = [parsed.data.partNo, parsed.data.make, parsed.data.model, parsed.data.source].join("|").toLowerCase();
    if (seen.has(key)) return errors.push({ line, message: `Duplicate of an earlier row (${parsed.data.partNo})` });
    seen.add(key);
    rows.push(parsed.data);
  });
  return { rows, errors };
}
