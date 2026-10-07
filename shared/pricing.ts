export interface PricedItem { price: number; qty: number; source: "shop" | "china" }
export interface Totals {
  shopSubtotal: number; chinaSubtotal: number; deposit: number; deliveryFee: number; dueNow: number;
}

/**
 * Shop parts are paid in full now. China parts pay only a deposit now
 * (depositPercent of their price); the balance is settled after the quote.
 */
export function computeTotals(items: PricedItem[], depositPercent: number, deliveryFee: number, delivery: boolean): Totals {
  const sum = (src: "shop" | "china") =>
    items.filter((i) => i.source === src).reduce((n, i) => n + i.price * i.qty, 0);
  const shopSubtotal = sum("shop");
  const chinaSubtotal = sum("china");
  const deposit = Math.round((chinaSubtotal * depositPercent) / 100);
  const fee = delivery ? deliveryFee : 0;
  return { shopSubtotal, chinaSubtotal, deposit, deliveryFee: fee, dueNow: shopSubtotal + deposit + fee };
}
