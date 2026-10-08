import { Link, NavLink, Outlet } from "react-router-dom";
import { useCart } from "./CartContext";
import { site } from "../siteInfo";

const icon = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "#0F1B1E", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export default function Layout() {
  const { count } = useCart();
  return (
    <>
      <header className="site-header">
        <div className="container">
          <Link to="/" className="logo">{site.name}</Link>
          <nav className="nav">
            <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>Home</NavLink>
            <NavLink to="/shop" className={({ isActive }) => (isActive ? "active" : "")}>Shop</NavLink>
            <NavLink to="/garage" className={({ isActive }) => (isActive ? "active" : "")}>Garage</NavLink>
            <NavLink to="/about" className={({ isActive }) => (isActive ? "active" : "")}>About Us</NavLink>
            <NavLink to="/contact" className={({ isActive }) => (isActive ? "active" : "")}>Contact</NavLink>
            <Link to="/dashboard" className="seller">Dashboard</Link>
          </nav>
          <div className="tools">
            <Link to="/cart">
              <svg {...icon} aria-hidden="true"><path d="M5 8h14l-1 12H6z" /><path d="M9 8a3 3 0 0 1 6 0" /></svg>Cart{count > 0 ? ` (${count})` : ""}
            </Link>
            <a href="#account">
              <svg {...icon} aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></svg>Account
            </a>
          </div>
        </div>
      </header>
      <Outlet />
      <footer className="site-footer">
        <div className="container">
          <div className="cols">
            <div style={{ flex: "1 1 320px" }}>
              <b style={{ fontSize: 20 }}>{site.name}</b>
              <p style={{ maxWidth: 380 }}>EV and hybrid spare parts and garage services for Burundi.</p>
            </div>
            <div><b>Company</b><p><Link to="/">Home</Link><br /><Link to="/about">About us</Link><br /><Link to="/contact">Contact us</Link></p></div>
            <div><b>Get in touch</b><p><a href={site.whatsappLink} target="_blank" rel="noopener noreferrer">WhatsApp {site.whatsappDisplay}</a><br /><a href={`mailto:${site.email}`}>{site.email}</a><br />Pay with Lumicash or bank transfer</p></div>
          </div>
          <p className="copy">© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
