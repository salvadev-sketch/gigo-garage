import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useCart } from "../components/CartContext";
import { useConfig } from "../config";
import { bif } from "../format";
import { computeTotals } from "../../../shared/pricing";

type Delivery = "pickup" | "delivery";
type Payment = "lumicash" | "bank";

export default function Checkout() {
  const { items, clear } = useCart();
  const cfg = useConfig();
  const navigate = useNavigate();
  const [f, setF] = useState({ customerName: "", phone: "", email: "", address: "", city: "", province: "", paymentProof: "" });
  const [delivery, setDelivery] = useState<Delivery>("pickup");
  const [payment, setPayment] = useState<Payment>("lumicash");
  const [state, setState] = useState<"idle" | "sending" | "error">("idle");
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((p) => ({ ...p, [k]: e.target.value }));

  const t = computeTotals(items.map((i) => ({ price: i.part.price, qty: i.qty, source: i.part.source })), cfg.chinaDepositPercent, cfg.deliveryFee, delivery === "delivery");

  if (items.length === 0) {
    return <main className="container" style={{ paddingBottom: 96 }}><p className="empty" style={{ marginTop: 32 }}>Your cart is empty. <Link to="/shop"><b>Browse spare parts</b></Link></p></main>;
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setState("sending");
    try {
      const address = delivery === "delivery" ? [f.address, f.city, f.province].filter(Boolean).join(", ") : undefined;
      const res = await api<{ orderNo: string; total: number }>("/orders", {
        method: "POST",
        body: JSON.stringify({
          items: items.map((i) => ({ partId: i.part._id, qty: i.qty })),
          customerName: f.customerName, phone: f.phone, delivery, address, payment, paymentProof: f.paymentProof || undefined,
        }),
      });
      clear();
      navigate("/order", { state: res });
    } catch {
      setState("error");
    }
  };

  return (
    <main className="container" style={{ paddingBottom: 96 }}>
      <p className="crumb">Home / Cart / Checkout</p>
      <h1 style={{ margin: "0 0 32px", fontSize: 44 }}>Checkout</h1>
      <form className="shop-layout" style={{ paddingBottom: 0 }} onSubmit={submit}>
        <div className="stack" style={{ flex: "1 1 600px", gap: 20 }}>
          <div className="card-gray">
            <h2>Contact</h2>
            <label className="field">Full name<input required value={f.customerName} onChange={set("customerName")} /></label>
            <label className="field">Phone / WhatsApp<input required type="tel" value={f.phone} onChange={set("phone")} /></label>
            <label className="field">Email (optional)<input type="email" value={f.email} onChange={set("email")} /></label>
          </div>

          <div className="card-gray">
            <h2>Delivery</h2>
            <label className="radio"><input type="radio" name="d" checked={delivery === "pickup"} onChange={() => setDelivery("pickup")} /><span><b>Pick up at the garage</b><br /><span className="muted" style={{ fontSize: 14 }}>[YOUR ADDRESS]</span></span></label>
            <label className="radio"><input type="radio" name="d" checked={delivery === "delivery"} onChange={() => setDelivery("delivery")} /><span><b>Delivery</b><br /><span className="muted" style={{ fontSize: 14 }}>We deliver to your address</span></span></label>
            {delivery === "delivery" && (
              <>
                <label className="field">Delivery address<input required value={f.address} onChange={set("address")} /></label>
                <div className="fields3">
                  <label className="field">City<input value={f.city} onChange={set("city")} /></label>
                  <label className="field">Province<input value={f.province} onChange={set("province")} /></label>
                </div>
              </>
            )}
          </div>

          <div className="card-gray">
            <h2>Payment</h2>
            <label className="radio"><input type="radio" name="p" checked={payment === "lumicash"} onChange={() => setPayment("lumicash")} /><span><b>Lumicash</b><br /><span className="muted" style={{ fontSize: 14 }}>Send {bif(t.dueNow)} to [LUMICASH NUMBER]</span></span></label>
            <label className="radio"><input type="radio" name="p" checked={payment === "bank"} onChange={() => setPayment("bank")} /><span><b>Bank transfer</b><br /><span className="muted" style={{ fontSize: 14 }}>[BANK NAME] · [ACCOUNT NUMBER]</span></span></label>
            <label className="field">Transaction reference (optional)
              <input value={f.paymentProof} onChange={set("paymentProof")} placeholder="Reference from your Lumicash or bank receipt" />
            </label>
            <p className="muted" style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>Pay the total due now, then place your order. We confirm your payment by SMS or WhatsApp.</p>
          </div>
        </div>

        <aside className="card-gray side">
          <h2>Your order</h2>
          {items.map(({ part, qty }) => (
            <div className="sum" key={part._id}><span>{part.name} × {qty}{part.source === "china" ? " (China)" : ""}</span><span>{bif(part.price * qty)}</span></div>
          ))}
          <div className="sum"><span>Shop parts</span><span>{bif(t.shopSubtotal)}</span></div>
          {t.chinaSubtotal > 0 && <div className="sum"><span>China deposit</span><span>{bif(t.deposit)}</span></div>}
          <div className="sum"><span>Delivery</span><span>{delivery === "delivery" ? bif(t.deliveryFee) : "Pick up"}</span></div>
          <div className="sum total"><span>Total due now</span><span>{bif(t.dueNow)}</span></div>
          <button className="btn btn-primary" type="submit" disabled={state === "sending"}>{state === "sending" ? "Placing order..." : "Place order"}</button>
          <Link to="/cart" className="btn btn-white" style={{ textAlign: "center", border: "1px solid var(--line)" }}>Back to cart</Link>
          {state === "error" && <p className="msg-err" role="alert">Could not place the order. Please check your details and try again.</p>}
        </aside>
      </form>
    </main>
  );
}
