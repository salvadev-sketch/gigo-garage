import { Link } from "react-router-dom";

export default function DashboardHome() {
  return (
    <main className="container">
      <h1 style={{ margin: "32px 0", fontSize: 44 }}>Dashboard</h1>
      <div className="dash-cards">
        <div className="dash-card">
          <h2>Shop dashboard</h2>
          <p>Orders and payments, requests for parts from China, and the parts catalogue (prices and stock).</p>
          <Link to="/dashboard/shop" className="btn btn-primary">Open shop dashboard</Link>
        </div>
        <div className="dash-card">
          <h2>Garage dashboard</h2>
          <p>Service bookings and the waiting list: confirm, start repairs and close cars that are fixed.</p>
          <Link to="/dashboard/garage" className="btn btn-primary">Open garage dashboard</Link>
        </div>
      </div>
    </main>
  );
}
