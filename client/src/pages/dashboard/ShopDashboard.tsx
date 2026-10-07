import { useState } from "react";
import AdminGate from "../../components/AdminGate";
import ShopOrders from "./ShopOrders";
import ShopChina from "./ShopChina";
import ShopParts from "./ShopParts";

type Tab = "orders" | "china" | "parts";
const tabs: { id: Tab; label: string }[] = [
  { id: "orders", label: "Orders" }, { id: "china", label: "China requests" }, { id: "parts", label: "Parts" },
];

export default function ShopDashboard() {
  const [tab, setTab] = useState<Tab>("orders");
  return (
    <AdminGate role="shop" title="Shop dashboard">
      {(admin) => (
        <main className="container" style={{ paddingBottom: 96 }}>
          <div className="shop-head" style={{ marginTop: 32 }}>
            <h1 style={{ margin: 0, fontSize: 44 }}>Shop dashboard</h1>
            <button className="btn btn-outline" onClick={admin.signOut}>Sign out</button>
          </div>
          <div className="tabs">
            {tabs.map((t) => (
              <button key={t.id} className={`btn ${tab === t.id ? "btn-primary" : "btn-light"}`} onClick={() => setTab(t.id)}>{t.label}</button>
            ))}
          </div>
          {tab === "orders" && <ShopOrders admin={admin} />}
          {tab === "china" && <ShopChina admin={admin} />}
          {tab === "parts" && <ShopParts admin={admin} />}
        </main>
      )}
    </AdminGate>
  );
}
