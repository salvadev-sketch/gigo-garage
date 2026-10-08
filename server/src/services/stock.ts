import { Part } from "../models/index.js";

export interface StockLine { partId: string; qty: number; source: "shop" | "china" }

/** Put stock back (order cancelled, or a reservation that had to be undone). China parts have no stock. */
export async function releaseStock(lines: StockLine[]) {
  for (const l of lines.filter((x) => x.source === "shop")) await Part.updateOne({ _id: l.partId }, { $inc: { stock: l.qty } });
}

/**
 * Takes stock for the shop parts of an order. Each part is decremented in one atomic
 * update that only matches while enough stock remains, so concurrent orders can never
 * push stock below zero. If one part is short, everything already taken is put back.
 */
export async function reserveStock(lines: StockLine[]): Promise<{ ok: true } | { ok: false; partId: string }> {
  const taken: StockLine[] = [];
  for (const l of lines.filter((x) => x.source === "shop")) {
    const r = await Part.updateOne({ _id: l.partId, stock: { $gte: l.qty } }, { $inc: { stock: -l.qty } });
    if (r.modifiedCount !== 1) { await releaseStock(taken); return { ok: false, partId: l.partId }; }
    taken.push(l);
  }
  return { ok: true };
}
