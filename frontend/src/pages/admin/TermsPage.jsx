import { useEffect, useState } from "react";
import { LegacyTable } from "../../components/LegacyTable.jsx";
import { SectionTitle } from "../../components/SectionTitle.jsx";
import { adminApi } from "../../services/api.js";

export function TermsPage() {
  const [terms, setTerms] = useState([]);
  const [form, setForm] = useState({ codigo: "", nombre: "", fecha_inicio: "", fecha_fin: "", activo: true });
  const [error, setError] = useState("");
  const load = () => adminApi.terms().then(setTerms).catch((err) => setError(err.message));
  useEffect(() => { load(); }, []);
  async function submit(event) {
    event.preventDefault(); setError("");
    try { await adminApi.createTerm(form); setForm({ codigo: "", nombre: "", fecha_inicio: "", fecha_fin: "", activo: true }); load(); }
    catch (err) { setError(err.message); }
  }
  const columns = [
    { key: "codigo", label: "Código" }, { key: "nombre", label: "Nombre" },
    { key: "fecha_inicio", label: "Inicio" }, { key: "fecha_fin", label: "Fin" },
    { key: "activo", label: "Estado", render: (row) => row.activo ? "Activo" : "Inactivo" },
  ];
  return <>
    <SectionTitle>Periodos académicos</SectionTitle>
    <form className="inline-create-form terms-form" onSubmit={submit}>
      <label>Código<input value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} required /></label>
      <label>Nombre<input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required /></label>
      <label>Fecha inicio<input type="date" value={form.fecha_inicio} onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })} required /></label>
      <label>Fecha fin<input type="date" value={form.fecha_fin} onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })} required /></label>
      <button className="legacy-button" type="submit">Agregar periodo</button>
    </form>
    {error && <div className="message error">{error}</div>}
    <LegacyTable columns={columns} rows={terms} />
  </>;
}
