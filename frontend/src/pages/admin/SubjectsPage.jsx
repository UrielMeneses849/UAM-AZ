import { useEffect, useState } from "react";
import { LegacyTable } from "../../components/LegacyTable.jsx";
import { SectionTitle } from "../../components/SectionTitle.jsx";
import { adminApi } from "../../services/api.js";

export function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({ clave: "", nombre: "", creditos: "", curriculum_term: 1, activo: true });
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const load = () => adminApi.subjects().then(setSubjects).catch((err) => setError(err.message));
  useEffect(() => { load(); }, []);
  async function submit(event) {
    event.preventDefault(); setError("");
    try { await adminApi.createSubject({ ...form, creditos: Number(form.creditos), curriculum_term: Number(form.curriculum_term) }); setForm({ clave: "", nombre: "", creditos: "", curriculum_term: 1, activo: true }); load(); }
    catch (err) { setError(err.message); }
  }

  async function changeCurriculumTerm(subject, curriculumTerm) {
    setError(""); setSavingId(subject.id);
    try {
      const updated = await adminApi.updateSubject(subject.id, { curriculum_term: Number(curriculumTerm) });
      setSubjects(subjects.map((item) => item.id === subject.id ? updated : item));
    } catch (err) { setError(err.message); }
    finally { setSavingId(null); }
  }

  const columns = [
    { key: "clave", label: "Clave" }, { key: "nombre", label: "Nombre de la UEA" },
    { key: "curriculum_term", label: "Trimestre curricular", render: (row) => (
      <select
        aria-label={`Trimestre curricular de ${row.clave}`}
        value={row.curriculum_term || 1}
        disabled={savingId === row.id}
        onChange={(event) => changeCurriculumTerm(row, event.target.value)}
      >
        {[1, 2, 3].map((term) => <option key={term} value={term}>Trimestre {term}</option>)}
      </select>
    ) },
    { key: "creditos", label: "Créditos" }, { key: "activo", label: "Estado", render: (row) => row.activo ? "Activa" : "Inactiva" },
  ];
  return <>
    <SectionTitle>Materias</SectionTitle>
    <form className="inline-create-form" onSubmit={submit}>
      <label>Clave<input value={form.clave} onChange={(e) => setForm({ ...form, clave: e.target.value })} required /></label>
      <label>Nombre<input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required /></label>
      <label>Trimestre curricular<select value={form.curriculum_term} onChange={(e) => setForm({ ...form, curriculum_term: e.target.value })}>{[1, 2, 3].map((term) => <option key={term} value={term}>Trimestre {term}</option>)}</select></label>
      <label>Créditos<input type="number" min="0" max="200" value={form.creditos} onChange={(e) => setForm({ ...form, creditos: e.target.value })} required /></label>
      <button className="legacy-button" type="submit">Agregar materia</button>
    </form>
    {error && <div className="message error">{error}</div>}
    <LegacyTable columns={columns} rows={subjects} />
  </>;
}
