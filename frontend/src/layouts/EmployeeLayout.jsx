import { Outlet } from "react-router-dom";
import ToastContainer from "../components/feedback/ToastContainer";
import { useUI } from "../context/UIContext";
import EmployeeSidebar from "./EmployeeSidebar";
import Topbar from "./Topbar";

function EmployeeLayout() {
  const { sidebarCollapsed, toggleSidebar } = useUI();

  return (
    <div className="grid min-h-screen bg-[#F8FAFC] md:grid-cols-[auto_1fr]">
      <EmployeeSidebar collapsed={sidebarCollapsed} />
      <div className="flex min-w-0 flex-col">
        <Topbar onToggleSidebar={toggleSidebar} />
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}

export default EmployeeLayout;
