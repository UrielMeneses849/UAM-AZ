import { Outlet } from "react-router-dom";
import { AdminSidebar } from "../components/AdminSidebar.jsx";
import { Footer } from "../components/Footer.jsx";
import { Header } from "../components/Header.jsx";

export function AdminLayout() {
  return (
    <div className="site-shell">
      <Header admin />
      <div className="legacy-stage">
        <AdminSidebar />
        <main className="legacy-content admin-content"><Outlet /></main>
      </div>
      <Footer />
    </div>
  );
}

