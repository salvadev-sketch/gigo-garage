import { Link } from "react-router-dom";
import { useCart } from "../components/CartContext";
import PartImage from "../components/PartImage";
import { useConfig } from "../config";
import { bif } from "../format";
import { computeTotals } from "../../../shared/pricing";

export default function Cart() {
  const { items, setQty, remove } = useCart();
  const cfg = useConfig();
  const t = computeTotals(items.map((i) => ({ price: i.part.price, qty: i.qty, source: i.part.source })), cfg.chinaDepositPercent, cfg.deliveryFee, false);

  return (
    <main className="container" style={{ paddingBottom: 96 }}>
      <p className="crumb">Home / Cart</p>
      <h1 style={{ margin: "0 0 32px", fontSize: 44 }}>Your cart</h1>
      {items.length === 0 ? (
        <p className="empty">Your cart is empty. <Link to="/shop"><b>Browse spare parts</b></Link></p>
      ) : (
        <div className="shop-layout" style={{ paddingBottom: 0 }}>
          <div className="stack" style={{ flex: "1 1 600px" }}>
            {items.map(({ part, qty }) => (
              <div className="cart-item" key={part._id}>
                <PartImage part={part} width={200} className="thumb" />
                <div className="grow">
                  <b style={{ fontSize: 18 }}>{part.name}</b>
                  <div className="muted" style={{ fontSize: 14, margin: "4px 0 8px" }}>Fits: {part.make} {part.model} · {part.partNo}</div>
                  <span className={`badge ${part.source === "china" ? "china" : "stock"}`}>
                    {part.source === "china" ? `From China · pay ${cfg.chinaDepositPercent}% deposit now` : "In stock"}
                  </span>
                </div>
                <div className="qty">
                  <button aria-label="Decrease" onClick={() => setQty(part._id, qty - 1)}>−</button>
                  <span>{qty}</span>
                  <button aria-label="Increase" onClick={() => setQty(part._id, qty + 1)}>+</button>
                </div>
                <b style={{ minWidth: 110, textAlign: "right" }}>{bif(part.price * qty)}</b>
                <button className="link" onClick={() => remove(part._id)}>Remove</button>
              </div>
            ))}
          </div>
          <aside className="card-gray side">
            <h2>Order summary</h2>
            <div className="sum"><span>Shop parts</span><span>{bif(t.shopSubtotal)}</span></div>
            {t.chinaSubtotal > 0 && (
              <>
                <div className="sum"><span>China parts (full price)</span><span>{bif(t.chinaSubtotal)}</span></div>
                <div className="sum"><span>China deposit (due now)</span><span>{bif(t.deposit)}</span></div>
              </>
            )}
            <div className="sum"><span>Delivery</span><span>At checkout</span></div>
            <div className="sum total"><span>Total due now</span><span>{bif(t.dueNow)}</span></div>
            <Link to="/checkout" className="btn btn-primary" style={{ textAlign: "center" }}>Proceed to checkout</Link>
            <Link to="/shop" className="btn btn-white" style={{ textAlign: "center", border: "1px solid var(--line)" }}>Continue shopping</Link>
            {t.chinaSubtotal > 0 && <p className="muted" style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>China parts: we confirm the quote with you before ordering. The balance is paid after the quote.</p>}
          </aside>
        </div>
      )}
    </main>
  );
}
