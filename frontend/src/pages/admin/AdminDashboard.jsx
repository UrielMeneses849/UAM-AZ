import { Link } from "react-router-dom";
import { SectionTitle } from "../../components/SectionTitle.jsx";

export function AdminDashboard() {
  const sections = [
    ["/admin/students", "Alumnos", "Alta, edición y expediente académico"],
    ["/admin/subjects", "Materias", "Catálogo de UEA y créditos"],
    ["/admin/terms", "Periodos académicos", "Calendario 26O, 27I y posteriores"],
    ["/admin/notices", "Avisos", "Publicaciones visibles para alumnos"],
  ];
  return (
    <>
      <SectionTitle>Panel Administrativo</SectionTitle>
      <p className="admin-intro">Seleccione una opción para administrar la información de la simulación.</p>
      <div className="admin-menu-grid">
        {sections.map(([to, title, copy]) => <Link to={to} key={to}><strong>{title}</strong><span>{copy}</span></Link>)}
      </div>
    </>
  );
}
