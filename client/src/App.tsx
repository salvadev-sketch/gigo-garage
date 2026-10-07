import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Garage from "./pages/Garage";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Order from "./pages/Order";
import DashboardHome from "./pages/dashboard/DashboardHome";
import GarageDashboard from "./pages/dashboard/GarageDashboard";
import ShopDashboard from "./pages/dashboard/ShopDashboard";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/garage" element={<Garage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order" element={<Order />} />
        <Route path="/dashboard" element={<DashboardHome />} />
        <Route path="/dashboard/shop" element={<ShopDashboard />} />
        <Route path="/dashboard/garage" element={<GarageDashboard />} />
      </Route>
    </Routes>
  );
}
