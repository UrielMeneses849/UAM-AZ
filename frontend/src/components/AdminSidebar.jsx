import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";

const items = [
  ["/admin", "Inicio"],
  ["/admin/students", "Alumnos"],
  ["/admin/subjects", "Materias"],
  ["/admin/terms", "Periodos académicos"],
  ["/admin/notices", "Avisos"],
];

export function AdminSidebar() {
  const { logout } = useAuth();
  return (
    <aside className="legacy-sidebar admin-sidebar">
      <div className="campus-name">Administración</div>
      <div className="account-badge">Rol: ADMIN</div>
      <nav className="legacy-nav" aria-label="Navegación administrativa">
        {items.map(([to, label]) => <NavLink key={to} to={to} end={to === "/admin"}>{label}</NavLink>)}
        <button type="button" onClick={logout}>Terminar Sesión</button>
      </nav>
      <div className="sidebar-code">PORTAL/SIM/ADMIN</div>
    </aside>
  );
}
