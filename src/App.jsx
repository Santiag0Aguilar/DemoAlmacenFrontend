// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

// Layout
import MainLayout from "@/components/layout/MainLayout";

// Pages
import LoginPage from "@/pages/auth/LoginPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import ToolsPage from "@/pages/tools/ToolsPage";
import ToolDetailPage from "@/pages/tools/ToolDetailPage";
import AssignmentsPage from "@/pages/tools/AssignmentsPage";
import IncidentsPage from "@/pages/incidents/IncidentsPage";
import ProjectsPage from "@/pages/projects/ProjectsPage";
import ProjectDetailPage from "@/pages/projects/ProjectDetailPage";
import SubprojectDetailPage from "@/pages/projects/SubprojectDetailPage";
import WorkersPage from "@/pages/workers/WorkersPage";
import WorkerDetailPage from "@/pages/workers/WorkerDetailPage";

import ClientsPage from "@/pages/projects/ClientsPage";
import NotFoundPage from "@/pages/NotFoundPage";

// Guard de autenticación
function PrivateRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role))
    return <Navigate to="/dashboard" replace />;

  return children;
}

export default function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginPage />
            )
          }
        />

        {/* App - requiere auth */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard - solo ADMIN */}
          <Route
            path="dashboard"
            element={
              <PrivateRoute roles={["ADMIN"]}>
                <DashboardPage />
              </PrivateRoute>
            }
          />

          {/* Herramientas */}
          <Route path="tools" element={<ToolsPage />} />
          <Route path="tools/:id" element={<ToolDetailPage />} />
          <Route path="assignments" element={<AssignmentsPage />} />
          <Route
            path="incidents"
            element={
              <PrivateRoute roles={["ADMIN", "ENCARGADO"]}>
                <IncidentsPage />
              </PrivateRoute>
            }
          />

          {/* Proyectos */}
          <Route
            path="clients"
            element={
              <PrivateRoute roles={["ADMIN"]}>
                <ClientsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="projects"
            element={
              <PrivateRoute roles={["ADMIN", "ENCARGADO"]}>
                <ProjectsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="projects/:id"
            element={
              <PrivateRoute roles={["ADMIN", "ENCARGADO"]}>
                <ProjectDetailPage />
              </PrivateRoute>
            }
          />
          <Route
            path="subprojects/:id"
            element={
              <PrivateRoute roles={["ADMIN", "ENCARGADO"]}>
                <SubprojectDetailPage />
              </PrivateRoute>
            }
          />

          {/* Trabajadores - solo ADMIN y ENCARGADO */}
          <Route
            path="workers"
            element={
              <PrivateRoute roles={["ADMIN", "ENCARGADO"]}>
                <WorkersPage />
              </PrivateRoute>
            }
          />
          <Route
            path="workers/:id"
            element={
              <PrivateRoute roles={["ADMIN", "ENCARGADO"]}>
                <WorkerDetailPage />
              </PrivateRoute>
            }
          />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
