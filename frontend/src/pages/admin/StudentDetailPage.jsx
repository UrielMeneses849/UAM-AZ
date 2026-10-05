import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { LegacyTable } from "../../components/LegacyTable.jsx";
import { Modal } from "../../components/Modal.jsx";
import { SectionTitle } from "../../components/SectionTitle.jsx";
import { adminApi } from "../../services/api.js";

const emptyRecord = { subject_id: "", term_id: "", evaluation_type: "GLO.", grade: "MB", acta_number: "", credits: "", status: "REGISTRADO" };
const grades = ["MB", "B", "S", "NA", "ACREDITADA", "NO ACREDITADA"];

export function StudentDetailPage() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [studentForm, setStudentForm] = useState(null);
  const [records, setRecords] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [terms, setTerms] = useState([]);
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [recordForm, setRecordForm] = useState(emptyRecord);
  const [savingGradeId, setSavingGradeId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    try {
      const [studentData, recordData, subjectData, termData] = await Promise.all([adminApi.student(id), adminApi.records(id), adminApi.subjects(), adminApi.terms()]);
      setStudent(studentData); setStudentForm(studentData); setRecords(recordData); setSubjects(subjectData); setTerms(termData);
    } catch (err) { setError(err.message); }
  }, [id]);
  useEffect(() => { load(); }, [load]);

  function openRecord(record = null) {
    setEditing(record);
    const defaultTerm = terms.find((term) => term.id === Number(studentForm?.current_term_id))
      || terms.find((term) => term.codigo === "26O")
      || terms.find((term) => term.activo);
    setRecordForm(record ? {
      subject_id: String(record.subject_id), term_id: String(record.term_id), evaluation_type: record.evaluation_type,
      grade: record.grade, acta_number: record.acta_number, credits: String(record.credits), status: record.status,
    } : { ...emptyRecord, term_id: defaultTerm ? String(defaultTerm.id) : "" });
    setModalOpen(true);
  }

  function chooseSubject(subjectId) {
    const subject = subjects.find((item) => item.id === Number(subjectId));
    setRecordForm({ ...recordForm, subject_id: subjectId, credits: subject ? String(subject.creditos) : "" });
  }

  async function saveRecord(event) {
    event.preventDefault(); setError(""); setMessage("");
    const payload = { ...recordForm, subject_id: Number(recordForm.subject_id), term_id: Number(recordForm.term_id), credits: Number(recordForm.credits) };
    try {
      if (editing) await adminApi.updateRecord(editing.id, payload);
      else await adminApi.createRecord(id, payload);
      setModalOpen(false); setEditing(null); setRecordForm(emptyRecord); setMessage(editing ? "Registro actualizado." : "Registro agregado al expediente."); await load();
    } catch (err) { setError(err.message); }
  }

  async function remove(record) {
    if (!window.confirm(`¿Eliminar ${record.subject_clave} del expediente?`)) return;
    try { await adminApi.deleteRecord(record.id); setMessage("Registro eliminado."); await load(); }
    catch (err) { setError(err.message); }
  }

  async function changeGrade(record, grade) {
    setError(""); setMessage(""); setSavingGradeId(record.id);
    try {
      const updated = await adminApi.updateRecord(record.id, { grade });
      setRecords(records.map((item) => item.id === record.id ? updated : item));
      setMessage(`Calificación actualizada para ${record.subject_clave}.`);
    } catch (err) { setError(err.message); }
    finally { setSavingGradeId(null); }
  }

  async function saveStudent(event) {
    event.preventDefault(); setError("");
    try {
      const payload = { ...studentForm }; delete payload.id; delete payload.created_at; delete payload.updated_at;
      await adminApi.updateStudent(id, payload); setMessage("Datos del alumno actualizados."); await load();
    } catch (err) { setError(err.message); }
  }

  const registeredSubjectIds = new Set(records.map((record) => record.subject_id));
  const availableSubjects = subjects.filter((subject) => (
    subject.activo
    && Number(subject.curriculum_term || 1) === Number(studentForm?.current_curriculum_term || 1)
    && (!registeredSubjectIds.has(subject.id) || editing?.subject_id === subject.id)
  ));

  const columns = [
    { key: "subject_name", label: "Materia", render: (row) => <><strong>{row.subject_clave}</strong><br />{row.subject_name}</> },
    { key: "term_code", label: "Periodo académico" },
    { key: "grade", label: "Calificación", render: (row) => (
      <select
        className="inline-grade-select"
        aria-label={`Calificación de ${row.subject_clave}`}
        value={row.grade}
        disabled={savingGradeId === row.id}
        onChange={(event) => changeGrade(row, event.target.value)}
      >
        {grades.map((grade) => <option key={grade}>{grade}</option>)}
      </select>
    ) },
    { key: "credits", label: "Créditos" },
    { key: "acta_number", label: "Acta" },
    { key: "action", label: "Acción", render: (row) => <div className="row-actions"><button onClick={() => openRecord(row)}>Editar</button><button onClick={() => remove(row)}>Eliminar</button></div> },
  ];

  if (!student || !studentForm) return <div className="page-status">Cargando expediente…</div>;
  return (
    <>
      <SectionTitle>Alumno → Expediente</SectionTitle>
      <p className="breadcrumbs"><Link to="/admin/students">Alumnos</Link> → {student.account_number} → expediente</p>
      {message && <div className="message success">{message}</div>}
      {error && <div className="message error">{error}</div>}
      <h2 className="subsection-title">Datos generales</h2>
      <form className="legacy-form student-edit-grid" onSubmit={saveStudent}>
        {[
          ["account_number", "Cuenta"], ["name", "Nombre"], ["first_last_name", "Primer apellido"], ["second_last_name", "Segundo apellido"],
          ["email", "Correo"], ["campus", "Campus"], ["career", "Carrera"], ["status", "Estado"],
        ].map(([key, label]) => <label key={key}>{label}<input value={studentForm[key]} onChange={(e) => setStudentForm({ ...studentForm, [key]: e.target.value })} /></label>)}
        <label>Trimestre curricular
          <select value={studentForm.current_curriculum_term || 1} onChange={(e) => setStudentForm({ ...studentForm, current_curriculum_term: Number(e.target.value) })}>
            {[1, 2, 3].map((term) => <option key={term} value={term}>Trimestre {term}</option>)}
          </select>
        </label>
        <label>Periodo académico actual
          <select value={studentForm.current_term_id || ""} onChange={(e) => setStudentForm({ ...studentForm, current_term_id: Number(e.target.value) })} required>
            <option value="">Seleccione</option>
            {terms.map((term) => <option key={term.id} value={term.id}>{term.codigo} — {term.nombre}</option>)}
          </select>
        </label>
        <button className="legacy-button" type="submit">Guardar datos</button>
      </form>
      <div className="subsection-heading">
        <h2 className="subsection-title">Expediente académico</h2>
        <button className="legacy-button add-record-button" onClick={() => openRecord()}>Agregar registro</button>
      </div>
      <LegacyTable columns={columns} rows={records} emptyText="El alumno todavía no tiene registros académicos." />

      {modalOpen && <Modal title={editing ? "Editar registro" : "Agregar registro"} onClose={() => { setModalOpen(false); setEditing(null); setRecordForm(emptyRecord); }}>
        <form className="legacy-form record-form" onSubmit={saveRecord}>
          <label>Materia<select value={recordForm.subject_id} onChange={(e) => chooseSubject(e.target.value)} required><option value="">{availableSubjects.length ? "Seleccione" : "No hay materias pendientes"}</option>{availableSubjects.map((item) => <option key={item.id} value={item.id}>{item.clave} — {item.nombre}</option>)}</select></label>
          <label>Periodo académico<select value={recordForm.term_id} onChange={(e) => setRecordForm({ ...recordForm, term_id: e.target.value })} required><option value="">Seleccione</option>{terms.filter((item) => item.activo).map((item) => <option key={item.id} value={item.id}>{item.codigo} — {item.nombre}</option>)}</select></label>
          <label>Tipo de evaluación<select value={recordForm.evaluation_type} onChange={(e) => setRecordForm({ ...recordForm, evaluation_type: e.target.value })}><option>GLO.</option><option>REC.</option><option>EXT.</option></select></label>
          <label>Calificación<select value={recordForm.grade} onChange={(e) => setRecordForm({ ...recordForm, grade: e.target.value })}>{grades.map((grade) => <option key={grade}>{grade}</option>)}</select></label>
          <label>Número de acta<input value={recordForm.acta_number} onChange={(e) => setRecordForm({ ...recordForm, acta_number: e.target.value })} required /></label>
          <label>Créditos<input type="number" min="0" max="200" value={recordForm.credits} onChange={(e) => setRecordForm({ ...recordForm, credits: e.target.value })} required /></label>
          <div className="form-actions"><button type="button" onClick={() => { setModalOpen(false); setEditing(null); setRecordForm(emptyRecord); }}>Cancelar</button><button className="legacy-button" type="submit">Guardar</button></div>
        </form>
      </Modal>}
    </>
  );
}
