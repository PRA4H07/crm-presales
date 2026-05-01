import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import AdminLayout from "./layouts/AdminLayout";
import EmployeeLayout from "./layouts/EmployeeLayout";
import SystemAdminLayout from "./layouts/SystemAdminLayout";
import ClientDetailsPage from "./pages/ClientDetailsPage";
import ClientsPage from "./pages/ClientsPage";
import CommunicationPage from "./pages/CommunicationPage";
import DashboardPage from "./pages/DashboardPage";
import Insights from "./pages/Insights";
import CreateLead from "./pages/CreateLead";
import LeadDetails from "./pages/LeadDetails";
import Leads from "./pages/Leads";
import LoginPage from "./pages/LoginPage";
import NotificationsPage from "./pages/NotificationsPage";
import OrganisationCreatePage from "./pages/OrganisationCreatePage";
import OrganisationDetails from "./pages/OrganisationDetails";
import OrganisationInsightsPage from "./pages/OrganisationInsightsPage";
import OrganisationSettingsPage from "./pages/OrganisationSettingsPage";
import Organisations from "./pages/Organisations";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import SystemAdminSettings from "./pages/SystemAdminSettings";
import TasksPage from "./pages/TasksPage";
import ChangePassword from "./pages/ChangePassword";

function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function App() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate
              to={
                user?.mustChangePassword
                  ? "/change-password"
                  : user?.role === "system_admin"
                    ? "/dashboard"
                    : "/dashboard"
              }
              replace
            />
          ) : (
            <LoginPage />
          )
        }
      />
      <Route path="/" element={<ProtectedRoute />}>
        <Route
          index
          element={
            user?.mustChangePassword ? (
              <Navigate to="/change-password" replace />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />
        <Route path="change-password" element={<ChangePassword />} />

        {user?.role === "system_admin" ? (
          <Route element={<SystemAdminLayout />}>
            <Route path="dashboard" element={<Insights />} />
            <Route path="organisations" element={<Organisations />} />
            <Route path="organisations/new" element={<OrganisationCreatePage />} />
            <Route path="organisations/:id/insights" element={<OrganisationInsightsPage />} />
            <Route path="organisations/:id/settings" element={<OrganisationSettingsPage />} />
            <Route path="organisations/:id" element={<OrganisationDetails />} />
            <Route path="insights" element={<Insights />} />
            <Route path="settings" element={<SystemAdminSettings />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>
        ) : null}

        {user?.role === "admin" ? (
          <Route element={<AdminLayout />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="leads" element={<Leads />} />
            <Route path="create-lead" element={<CreateLead />} />
            <Route path="edit-lead/:id" element={<CreateLead />} />
            <Route path="leads/:id" element={<LeadDetails />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="clients/:clientId" element={<ClientDetailsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="tasks" element={<TasksPage />} />
          </Route>
        ) : null}

        {user?.role === "employee" ? (
          <Route element={<EmployeeLayout />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="leads" element={<Leads />} />
            <Route path="create-lead" element={<CreateLead />} />
            <Route path="edit-lead/:id" element={<CreateLead />} />
            <Route path="leads/:id" element={<LeadDetails />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="clients/:clientId" element={<ClientDetailsPage />} />
            <Route path="communication" element={<CommunicationPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="tasks" element={<TasksPage />} />
          </Route>
        ) : null}
      </Route>
      <Route
        path="*"
        element={
          <Navigate
            to={
              isAuthenticated
                ? user?.role === "system_admin"
                  ? "/dashboard"
                  : "/dashboard"
                : "/login"
            }
            replace
          />
        }
      />
    </Routes>
  );
}

export default App;
