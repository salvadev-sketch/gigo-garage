import { Link, useLocation } from "react-router-dom";
import { bif } from "../format";

export default function Order() {
  const state = useLocation().state as { orderNo?: string; total?: number } | null;
  return (
    <main className="center">
      <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#0B6B4F" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" /><path d="M7.5 12.5l3 3 6-7" />
      </svg>
      <h1>Order received</h1>
      {state?.orderNo && <p className="muted" style={{ fontSize: 18, margin: "0 0 8px" }}>Order number <b style={{ color: "var(--ink)" }}>{state.orderNo}</b></p>}
      {state?.total !== undefined && <p className="muted" style={{ fontSize: 18, margin: "0 0 8px" }}>Total due now <b style={{ color: "var(--ink)" }}>{bif(state.total)}</b></p>}
      <p className="muted" style={{ fontSize: 17, lineHeight: 1.5, margin: "16px auto 40px", maxWidth: 480 }}>
        We confirm your payment by SMS or WhatsApp. For parts from China, we send you the final quote first.
      </p>
      <div className="row" style={{ justifyContent: "center", gap: 12 }}>
        <Link to="/shop" className="btn btn-primary">Continue shopping</Link>
        <Link to="/" className="btn btn-light">Back to home</Link>
      </div>
    </main>
  );
}
