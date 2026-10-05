import { useEffect, useState } from "react";
import { LegacyTable } from "../../components/LegacyTable.jsx";
import { SectionTitle } from "../../components/SectionTitle.jsx";
import { adminApi } from "../../services/api.js";

export function AdminNoticesPage() {
  const [notices, setNotices] = useState([]);
  const [form, setForm] = useState({ title: "", content: "", active: true });
  const [error, setError] = useState("");
  const load = () => adminApi.notices().then(setNotices).catch((err) => setError(err.message));
  useEffect(() => { load(); }, []);
  async function submit(event) {
    event.preventDefault(); setError("");
    try { await adminApi.createNotice(form); setForm({ title: "", content: "", active: true }); load(); }
    catch (err) { setError(err.message); }
  }
  async function toggle(notice) {
    try { await adminApi.updateNotice(notice.id, { active: !notice.active }); load(); }
    catch (err) { setError(err.message); }
  }
  const columns = [
    { key: "title", label: "Título" }, { key: "content", label: "Contenido" },
    { key: "published_at", label: "Publicado", render: (row) => new Date(row.published_at).toLocaleDateString("es-MX") },
    { key: "active", label: "Estado", render: (row) => row.active ? "Visible" : "Oculto" },
    { key: "action", label: "Acción", render: (row) => <button onClick={() => toggle(row)}>{row.active ? "Desactivar" : "Activar"}</button> },
  ];
  return <>
    <SectionTitle>Avisos</SectionTitle>
    <form className="inline-create-form notices-create-form" onSubmit={submit}>
      <label>Título<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label>
      <label>Contenido<textarea rows="3" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required /></label>
      <button className="legacy-button" type="submit">Publicar aviso</button>
    </form>
    {error && <div className="message error">{error}</div>}
    <LegacyTable columns={columns} rows={notices} />
  </>;
}
