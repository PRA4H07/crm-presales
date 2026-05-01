import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const sidebarMenu = [
  { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
  { name: 'Organisations', path: '/organisations', icon: 'organisations' },
  { name: 'Settings', path: '/settings', icon: 'settings' },
]

function SidebarIcon({ icon }) {
  if (icon === 'organisations') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
        <path
          d="M4 9.5L12 4L20 9.5V19A1 1 0 0 1 19 20H5A1 1 0 0 1 4 19V9.5Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M9 20V12H15V20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    )
  }

  if (icon === 'settings') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
        <path
          d="M12 15.2A3.2 3.2 0 1 0 12 8.8A3.2 3.2 0 0 0 12 15.2Z"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <path
          d="M19 12C19 12.5 18.96 12.98 18.86 13.45L21 15.1L19.5 17.7L16.95 16.8C16.23 17.42 15.37 17.87 14.43 18.1L14 20.8H10.99L10.57 18.1C9.63 17.87 8.78 17.42 8.05 16.8L5.5 17.7L4 15.1L6.14 13.45A6.89 6.89 0 0 1 6.14 10.55L4 8.9L5.5 6.3L8.05 7.2C8.77 6.58 9.63 6.13 10.57 5.9L10.99 3.2H14L14.43 5.9C15.37 6.13 16.23 6.58 16.95 7.2L19.5 6.3L21 8.9L18.86 10.55C18.95 11.02 19 11.5 19 12Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M3 12.5L12 4L21 12.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path
        d="M5.5 11.8V19A1 1 0 0 0 6.5 20H17.5A1 1 0 0 0 18.5 19V11.8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}

function SidebarItem({ item, collapsed }) {
  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `group flex items-center ${collapsed ? 'justify-center' : 'gap-3'} rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
          isActive
            ? 'bg-blue-100 text-blue-700 shadow-sm shadow-blue-100/70'
            : 'text-slate-600 hover:bg-white hover:text-slate-900'
        }`
      }
      title={collapsed ? item.name : undefined}
    >
      <span className="shrink-0">
        <SidebarIcon icon={item.icon} />
      </span>
      {!collapsed ? <span className="truncate">{item.name}</span> : null}
    </NavLink>
  )
}

function Sidebar({ collapsed }) {
  const { user } = useAuth()
  const showSettings = user?.role === 'admin' || user?.role === 'system_admin'
  const menuItems = showSettings ? sidebarMenu : sidebarMenu.filter((item) => item.path !== '/settings')

  return (
    <aside
      className={`${
        collapsed ? 'w-[84px]' : 'w-[260px]'
      } border-r border-slate-200 bg-slate-100 p-4 transition-all duration-200`}
    >
      <div className="mb-6 flex items-center gap-2 px-2">
        <div className="crm-gradient-bg grid h-8 w-8 place-items-center rounded-lg text-sm font-bold text-white">
          C
        </div>
        {!collapsed ? (
          <div>
            <p className="text-sm font-semibold text-slate-900">CRM Hub</p>
            <p className="text-xs text-slate-500">Pre-Sales Suite</p>
          </div>
        ) : null}
      </div>
      <nav className="space-y-1.5">
        {menuItems.map((item) => (
          <SidebarItem key={item.name} item={item} collapsed={collapsed} />
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
