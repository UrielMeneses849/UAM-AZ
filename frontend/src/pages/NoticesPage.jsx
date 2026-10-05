import { useEffect, useState } from "react";
import { SectionTitle } from "../components/SectionTitle.jsx";
import { studentApi } from "../services/api.js";

export function NoticesPage() {
  const [notices, setNotices] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => { studentApi.notices().then(setNotices).catch((err) => setError(err.message)); }, []);
  return (
    <>
      <SectionTitle>Avisos</SectionTitle>
      <div className="legacy-panel notices-panel">
        {error && <div className="message error">{error}</div>}
        {!error && notices.length === 0 && <p className="empty-message">No hay avisos publicados.</p>}
        {notices.map((notice) => (
          <article className="notice-row" key={notice.id}>
            <h2>{notice.title}</h2>
            <time>{new Date(notice.published_at).toLocaleDateString("es-MX")}</time>
            <p>{notice.content}</p>
          </article>
        ))}
      </div>
    </>
  );
}

