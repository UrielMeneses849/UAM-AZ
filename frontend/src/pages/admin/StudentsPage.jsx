import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LegacyTable } from "../../components/LegacyTable.jsx";
import { Modal } from "../../components/Modal.jsx";
import { SectionTitle } from "../../components/SectionTitle.jsx";
import { adminApi } from "../../services/api.js";

const emptyForm = { account_number: "", name: "", first_last_name: "", second_last_name: "", email: "", campus: "Azcapotzalco", career: "Licenciatura Demo", status: "ACTIVO", username: "", password: "" };

export function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const load = () => adminApi.students().then(setStudents).catch((err) => setError(err.message));
  useEffect(() => { load(); }, []);

  async function create(event) {
    event.preventDefault(); setError("");
    try { await adminApi.createStudent(form); setForm(emptyForm); setShowForm(false); load(); }
    catch (err) { setError(err.message); }
  }

  const filtered = students.filter((student) => `${student.account_number} ${student.name} ${student.first_last_name}`.toLowerCase().includes(search.toLowerCase()));
  const columns = [
    { key: "account_number", label: "Cuenta" },
    { key: "name", label: "Nombre", render: (student) => `${student.name} ${student.first_last_name} ${student.second_last_name}` },
    { key: "career", label: "Carrera" },
    { key: "status", label: "Estado" },
    { key: "action", label: "Acción", render: (student) => <Link className="table-link" to={`/admin/students/${student.id}`}>Abrir alumno / expediente</Link> },
  ];
  return (
    <>
      <SectionTitle>Alumnos</SectionTitle>
      <div className="admin-toolbar">
        <label>Buscar <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cuenta o nombre" /></label>
        <button className="legacy-button" onClick={() => setShowForm(true)}>Nuevo alumno</button>
      </div>
      {error && <div className="message error">{error}</div>}
      <LegacyTable columns={columns} rows={filtered} />
      {showForm && <Modal title="Nuevo alumno" onClose={() => setShowForm(false)}>
        <form className="legacy-form form-grid" onSubmit={create}>
          {[
            ["account_number", "Número de cuenta"], ["name", "Nombre"], ["first_last_name", "Primer apellido"],
            ["second_last_name", "Segundo apellido"], ["email", "Correo"], ["campus", "Campus"],
            ["career", "Carrera"], ["username", "Usuario"], ["password", "Contraseña inicial"],
          ].map(([key, label]) => <label key={key}>{label}<input type={key === "password" ? "password" : key === "email" ? "email" : "text"} minLength={key === "password" ? 8 : undefined} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} required={key !== "second_last_name"} /></label>)}
          <div className="form-actions"><button type="button" onClick={() => setShowForm(false)}>Cancelar</button><button className="legacy-button" type="submit">Guardar</button></div>
        </form>
      </Modal>}
    </>
  );
}
