import { useEffect, useMemo, useState } from "react";
import { LegacyTable } from "../components/LegacyTable.jsx";
import { SectionTitle } from "../components/SectionTitle.jsx";
import { studentApi } from "../services/api.js";

export function KardexPage() {
  const [records, setRecords] = useState([]);
  const [terms, setTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState("");
  const [order, setOrder] = useState("subject");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { studentApi.terms().then(setTerms).catch(() => {}); loadRecords(); }, []);

  async function loadRecords(term = "") {
    setLoading(true);
    setError("");
    try { setRecords(await studentApi.records(term)); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  const ordered = useMemo(() => [...records].sort((a, b) => order === "subject"
    ? a.subject_clave.localeCompare(b.subject_clave)
    : a.term_code.localeCompare(b.term_code) || a.subject_clave.localeCompare(b.subject_clave)), [records, order]);

  const columns = [
    { key: "number", label: "Registro", render: (_row, index) => index + 1 },
    { key: "subject_clave", label: "UEA" },
    { key: "subject_name", label: "Nombre de la UEA" },
    { key: "term_code", label: "Periodo" },
    { key: "evaluation_type", label: "Tipo Eval." },
    { key: "grade", label: "Calificación" },
    { key: "acta_number", label: "No. de Acta" },
    { key: "credits", label: "Créditos" },
  ];

  return (
    <>
      <SectionTitle>Kardex</SectionTitle>
      <div className="kardex-controls">
        <strong>ORDENAMIENTO UEA</strong>
        <label><input type="radio" name="order" checked={order === "subject"} onChange={() => setOrder("subject")} /> Por UEA</label>
        <label><input type="radio" name="order" checked={order === "term"} onChange={() => setOrder("term")} /> Por Trimestre</label>
        <button className="legacy-button" type="button" onClick={() => { setSelectedTerm(""); loadRecords(""); }}>Todo Kardex</button>
        <select aria-label="Trimestre" value={selectedTerm} onChange={(event) => setSelectedTerm(event.target.value)}>
          <option value="">Seleccione trimestre</option>
          {terms.map((term) => <option key={term.id} value={term.codigo}>{term.codigo} — {term.nombre}</option>)}
        </select>
        <button className="legacy-button" type="button" disabled={!selectedTerm || loading} onClick={() => loadRecords(selectedTerm)}>Consultar</button>
      </div>
      {error && <div className="message error">{error}</div>}
      {loading ? <div className="page-status">Consultando Kardex…</div> : <LegacyTable columns={columns} rows={ordered} />}
      <p className="tick-counter">{records.length} materias · {records.filter((record) => !record.planned).length} con registro</p>
    </>
  );
}
