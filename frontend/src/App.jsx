import { BrowserRouter, HashRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth.jsx";
import { StudentLayout } from "./layouts/StudentLayout.jsx";
import { AdminLayout } from "./layouts/AdminLayout.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { NoticesPage } from "./pages/NoticesPage.jsx";
import { KardexPage } from "./pages/KardexPage.jsx";
import { PersonalPage } from "./pages/PersonalPage.jsx";
import { AcademicInfoPage } from "./pages/AcademicInfoPage.jsx";
import { PasswordPage } from "./pages/PasswordPage.jsx";
import { AdminDashboard } from "./pages/admin/AdminDashboard.jsx";
import { StudentsPage } from "./pages/admin/StudentsPage.jsx";
import { StudentDetailPage } from "./pages/admin/StudentDetailPage.jsx";
import { SubjectsPage } from "./pages/admin/SubjectsPage.jsx";
import { TermsPage } from "./pages/admin/TermsPage.jsx";
import { AdminNoticesPage } from "./pages/admin/AdminNoticesPage.jsx";

function ProtectedRoute({ role }) {
  const { user, ready } = useAuth();
  if (!ready) return <div className="page-status">Verificando sesión…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === "ADMIN" ? "/admin" : "/kardex"} replace />;
  }
  return <Outlet />;
}

function HomeRedirect() {
  const { user, ready } = useAuth();
  if (!ready) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "ADMIN" ? "/admin" : "/kardex"} replace />;
}

export function App() {
  const useHashRouter = import.meta.env.VITE_ROUTER_MODE === "hash" || import.meta.env.BASE_URL !== "/";
  const Router = useHashRouter ? HashRouter : BrowserRouter;

  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute role="STUDENT" />}>
            <Route element={<StudentLayout />}>
              <Route path="/avisos" element={<NoticesPage />} />
              <Route path="/kardex" element={<KardexPage />} />
              <Route path="/personal" element={<PersonalPage />} />
              <Route path="/academica" element={<AcademicInfoPage />} />
              <Route path="/password" element={<PasswordPage />} />
            </Route>
          </Route>
          <Route element={<ProtectedRoute role="ADMIN" />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/students" element={<StudentsPage />} />
              <Route path="/admin/students/:id" element={<StudentDetailPage />} />
              <Route path="/admin/subjects" element={<SubjectsPage />} />
              <Route path="/admin/terms" element={<TermsPage />} />
              <Route path="/admin/notices" element={<AdminNoticesPage />} />
            </Route>
          </Route>
          <Route path="*" element={<HomeRedirect />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
