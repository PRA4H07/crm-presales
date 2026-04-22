import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import MainLayout from "./layouts/MainLayout";
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
import OrganisationDetails from "./pages/OrganisationDetails";
import Organisations from "./pages/Organisations";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import TasksPage from "./pages/TasksPage";
import ChangePassword from "./pages/ChangePassword";

function ProtectedLayout() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <MainLayout />;
}

function App() {
  const { isAuthenticated, user } = useAuth();
  const canAccessLeads = ["admin", "employee"].includes(user?.role);

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
                    ? "/insights"
                    : "/dashboard"
              }
              replace
            />
          ) : (
            <LoginPage />
          )
        }
      />
      <Route path="/" element={<ProtectedLayout />}>
        <Route
          index
          element={
            user?.mustChangePassword ? (
              <Navigate to="/change-password" replace />
            ) : user?.role === "system_admin" ? (
              <Navigate to="/insights" replace />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="change-password" element={<ChangePassword />} />
        {canAccessLeads ? (
          <>
            <Route path="leads" element={<Leads />} />
            <Route path="create-lead" element={<CreateLead />} />
            <Route path="edit-lead/:id" element={<CreateLead />} />
            <Route path="leads/:id" element={<LeadDetails />} />
          </>
        ) : null}
        <Route path="communication" element={<CommunicationPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="clients/:clientId" element={<ClientDetailsPage />} />
        <Route path="organisations" element={<Organisations />} />
        <Route path="organisations/:id" element={<OrganisationDetails />} />
        <Route path="insights" element={<Insights />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route
        path="*"
        element={
          <Navigate
            to={
              isAuthenticated
                ? user?.role === "system_admin"
                  ? "/insights"
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
