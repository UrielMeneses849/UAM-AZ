import { createContext, useContext, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Footer } from "../components/Footer.jsx";
import { Header } from "../components/Header.jsx";
import { StudentSidebar } from "../components/StudentSidebar.jsx";
import { studentApi } from "../services/api.js";

const StudentContext = createContext(null);
export const useStudent = () => useContext(StudentContext);

export function StudentLayout() {
  const [student, setStudent] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => { studentApi.me().then(setStudent).catch((err) => setError(err.message)); }, []);

  return (
    <div className="site-shell">
      <Header />
      <div className="legacy-stage">
        <StudentSidebar student={student} />
        <main className="legacy-content">
          {error ? <div className="message error">{error}</div> : (
            <StudentContext.Provider value={student}><Outlet /></StudentContext.Provider>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}

