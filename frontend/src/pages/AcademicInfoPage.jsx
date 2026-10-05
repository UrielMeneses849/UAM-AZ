import { useEffect, useMemo, useState } from "react";
import { SectionTitle } from "../components/SectionTitle.jsx";
import { useStudent } from "../layouts/StudentLayout.jsx";
import { studentApi } from "../services/api.js";

export function AcademicInfoPage() {
  const student = useStudent();
  const [records, setRecords] = useState([]);
  useEffect(() => { studentApi.records().then(setRecords).catch(() => {}); }, []);
  const completedRecords = useMemo(() => records.filter((item) => !item.planned && item.grade), [records]);
  const summary = useMemo(() => ({
    passed: completedRecords.filter((item) => !["NA", "NO ACREDITADA"].includes(item.grade)).length,
    credits: completedRecords.filter((item) => !["NA", "NO ACREDITADA"].includes(item.grade)).reduce((sum, item) => sum + item.credits, 0),
    lastTerm: completedRecords.at(-1)?.term_code || "—",
  }), [completedRecords]);
  return (
    <>
      <SectionTitle>Información Académica</SectionTitle>
      <div className="data-sheet">
        <div><strong>Carrera</strong><span>{student?.career || "Consultando…"}</span></div>
        <div><strong>Número de materias</strong><span>{completedRecords.length}</span></div>
        <div><strong>Materias acreditadas</strong><span>{summary.passed}</span></div>
        <div><strong>Créditos obtenidos</strong><span>{summary.credits}</span></div>
        <div><strong>Créditos registrados</strong><span>{completedRecords.reduce((sum, item) => sum + item.credits, 0)}</span></div>
        <div><strong>Último trimestre</strong><span>{summary.lastTerm}</span></div>
      </div>
    </>
  );
}
