import { Link, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Garage from "./pages/Garage";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Order from "./pages/Order";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <>
      <header style={{ display: "flex", gap: 24, padding: 24 }}>
        <Link to="/"><b>GIGO Garage</b></Link>
        <Link to="/shop">Shop</Link>
        <Link to="/garage">Garage</Link>
        <Link to="/cart">Cart</Link>
        <Link to="/dashboard">Seller Dashboard</Link>
      </header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/garage" element={<Garage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order" element={<Order />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </>
  );
}
