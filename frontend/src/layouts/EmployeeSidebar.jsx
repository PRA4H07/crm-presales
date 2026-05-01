import { NavLink } from "react-router-dom";

const employeeMenu = [
  { name: "Dashboard", path: "/dashboard", icon: "dashboard" },
  { name: "Leads", path: "/leads", icon: "leads" },
  { name: "Clients", path: "/clients", icon: "clients" },
  { name: "Communication", path: "/communication", icon: "communication" },
  { name: "Notifications", path: "/notifications", icon: "notifications" },
  { name: "Settings", path: "/settings", icon: "settings" },
];

function SidebarIcon({ icon }) {
  if (icon === "leads") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
        <path d="M4 6.5H20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M4 12H20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M4 17.5H14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  if (icon === "clients") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
        <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.7" />
        <path d="M3.5 18C3.9 14.9 6.2 13 9 13C11.8 13 14.1 14.9 14.5 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M16 10.5C17.7 10.5 19.2 11.6 19.7 13.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  if (icon === "communication") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
        <rect x="3.5" y="5.5" width="17" height="13" rx="2" stroke="currentColor" strokeWidth="1.7" />
        <path d="M6 8L12 12.5L18 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (icon === "notifications") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
        <path d="M12 4.5C9.4 4.5 7.3 6.6 7.3 9.2V11.4C7.3 12.2 7 13 6.4 13.6L5.5 14.5H18.5L17.6 13.6C17 13 16.7 12.2 16.7 11.4V9.2C16.7 6.6 14.6 4.5 12 4.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M10 17.5C10.4 18.4 11.1 19 12 19C12.9 19 13.6 18.4 14 17.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  if (icon === "settings") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
        <path d="M12 15.2A3.2 3.2 0 1 0 12 8.8A3.2 3.2 0 0 0 12 15.2Z" stroke="currentColor" strokeWidth="1.7" />
        <path d="M19 12C19 12.5 18.96 12.98 18.86 13.45L21 15.1L19.5 17.7L16.95 16.8C16.23 17.42 15.37 17.87 14.43 18.1L14 20.8H10.99L10.57 18.1C9.63 17.87 8.78 17.42 8.05 16.8L5.5 17.7L4 15.1L6.14 13.45A6.89 6.89 0 0 1 6.14 10.55L4 8.9L5.5 6.3L8.05 7.2C8.77 6.58 9.63 6.13 10.57 5.9L10.99 3.2H14L14.43 5.9C15.37 6.13 16.23 6.58 16.95 7.2L19.5 6.3L21 8.9L18.86 10.55C18.95 11.02 19 11.5 19 12Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M3 12.5L12 4L21 12.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M5.5 11.8V19A1 1 0 0 0 6.5 20H17.5A1 1 0 0 0 18.5 19V11.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function EmployeeSidebar({ collapsed }) {
  return (
    <aside
      className={`${
        collapsed ? "w-[84px]" : "w-[260px]"
      } border-r border-slate-200 bg-slate-100 p-4 transition-all duration-200`}
    >
      <div className="mb-6 flex items-center gap-2 px-2">
        <div className="crm-gradient-bg grid h-8 w-8 place-items-center rounded-lg text-sm font-bold text-white">
          C
        </div>
        {!collapsed ? (
          <div>
            <p className="text-sm font-semibold text-slate-900">CRM Hub</p>
            <p className="text-xs text-slate-500">Employee Panel</p>
          </div>
        ) : null}
      </div>
      <nav className="space-y-1.5">
        {employeeMenu.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `group flex items-center ${collapsed ? "justify-center" : "gap-3"} rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
                isActive
                  ? "bg-blue-100 text-blue-700 shadow-sm shadow-blue-100/70"
                  : "text-slate-600 hover:bg-white hover:text-slate-900"
              }`
            }
            title={collapsed ? item.name : undefined}
          >
            <span className="shrink-0">
              <SidebarIcon icon={item.icon} />
            </span>
            {!collapsed ? <span className="truncate">{item.name}</span> : null}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default EmployeeSidebar;
