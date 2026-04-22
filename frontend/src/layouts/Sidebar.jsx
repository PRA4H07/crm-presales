import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Sidebar({ collapsed }) {
  const { user } = useAuth()
  const role = user?.role

  const adminMenu = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Leads', path: '/leads' },
    { name: 'Clients', path: '/clients' },
    { name: 'Communication', path: '/communication' },
    { name: 'Notifications', path: '/notifications' },
    { name: 'Settings', path: '/settings' },
  ]

  const systemAdminMenu = [
    { name: 'Insights', path: '/insights' },
  ]

  let menuItems = []

  if (role === 'system_admin') {
    menuItems = systemAdminMenu
  } else {
    menuItems = adminMenu
  }

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
      <nav className="space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `group flex cursor-pointer items-center rounded-xl px-3 py-2.5 text-sm font-medium transition duration-200 ease-in-out ${
                isActive
                  ? 'bg-blue-100 font-semibold text-blue-700 shadow-sm shadow-blue-100/60'
                  : 'text-slate-500 hover:bg-white hover:text-slate-900'
              }`
            }
          >
            {!collapsed ? <span>{item.name}</span> : null}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
