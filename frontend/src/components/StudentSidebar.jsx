import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";

const items = [
  ["/avisos", "Avisos"],
  ["/kardex", "Kardex"],
  ["/personal", "Información Personal"],
  ["/academica", "Información Académica"],
  ["/academica", "Créditos"],
  ["/password", "Cambiar Contraseña"],
];

export function StudentSidebar({ student }) {
  const { logout } = useAuth();
  return (
    <aside className="legacy-sidebar">
      <div className="campus-name">Azcapotzalco</div>
      <div className="account-badge">Cuenta: {student?.account_number || "—"}</div>
      <nav className="legacy-nav" aria-label="Navegación del alumno">
        {items.map(([to, label], index) => (
          <NavLink key={`${to}-${index}`} to={to} className={({ isActive }) => isActive && ((to !== "/academica") || label === "Información Académica") ? "active" : ""}>{label}</NavLink>
        ))}
        <button type="button" onClick={logout}>Terminar Sesión</button>
      </nav>
      </aside>
  );
}
