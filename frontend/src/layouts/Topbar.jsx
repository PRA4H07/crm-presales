import { Bell, Menu, Search, Settings } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationsContext'
import { formatDateTime } from '../utils/formatters'

function Topbar({ onToggleSidebar }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [openNotificationsDropdown, setOpenNotificationsDropdown] = useState(false)
  const [openProfileDropdown, setOpenProfileDropdown] = useState(false)
  const notificationsRef = useRef(null)
  const profileRef = useRef(null)
  const { notifications, unreadCount, markAllRead, markNotificationRead } = useNotifications()
  const previewNotifications = notifications.slice(0, 5)
  const role = user?.role
  const isAdmin = role === 'admin'
  const isSystemAdmin = role === 'system_admin'
  const canUseSettings = isAdmin || isSystemAdmin || role === 'employee'

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setOpenNotificationsDropdown(false)
      }

      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setOpenProfileDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleBellClick() {
    const nextState = !openNotificationsDropdown
    setOpenNotificationsDropdown(nextState)
    setOpenProfileDropdown(false)
    if (nextState && unreadCount > 0) {
      await markAllRead()
    }
  }

  function handleProfileClick() {
    setOpenProfileDropdown((previous) => !previous)
    setOpenNotificationsDropdown(false)
  }

  function goTo(path) {
    setOpenProfileDropdown(false)
    setOpenNotificationsDropdown(false)
    navigate(path)
  }

  function handleLogout() {
    logout()
    setOpenProfileDropdown(false)
    setOpenNotificationsDropdown(false)
    navigate('/login', { replace: true })
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
          type="button"
          onClick={onToggleSidebar}
        >
          <Menu size={18} />
        </button>
        <div className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-500 lg:flex">
          <Search size={16} />
          <span>Search leads, companies, activities...</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {canUseSettings ? (
          <Link
            to="/settings"
            className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
            aria-label="settings"
          >
            <Settings size={18} />
          </Link>
        ) : null}
        <div className="relative" ref={notificationsRef}>
          <button
            className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
            type="button"
            aria-label="notifications"
            onClick={handleBellClick}
          >
            <Bell size={18} />
            {unreadCount > 0 ? (
              <span className="absolute -right-1 -top-1 rounded-full bg-rose-500 px-1.5 text-[10px] font-semibold text-white">
                {unreadCount}
              </span>
            ) : null}
          </button>

          {openNotificationsDropdown ? (
            <div className="absolute right-0 z-40 mt-2 w-[340px] origin-top-right rounded-2xl border border-slate-200 bg-white shadow-lg transition duration-150 ease-out animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <p className="text-sm font-semibold text-slate-900">Notifications</p>
                <button
                  type="button"
                  className="text-xs text-blue-600 hover:text-blue-700"
                  onClick={() => {
                    setOpenNotificationsDropdown(false)
                    navigate('/notifications')
                  }}
                >
                  View All
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {!previewNotifications.length ? (
                  <div className="px-4 py-8 text-center text-sm text-slate-500">
                    No notifications
                  </div>
                ) : (
                  previewNotifications.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={async () => {
                        await markNotificationRead(item.id)
                        setOpenNotificationsDropdown(false)
                        navigate('/notifications')
                      }}
                      className={`block w-full border-b border-slate-100 px-4 py-3 text-left transition last:border-0 hover:bg-slate-50 ${
                        !item.isRead ? 'bg-blue-50/60' : 'bg-white'
                      }`}
                    >
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-0.5 text-xs text-slate-600">{item.description}</p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        {formatDateTime(item.createdAt)}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : null}
        </div>
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={handleProfileClick}
            className="flex items-center gap-3 rounded-xl border border-slate-200 px-2 py-1.5 text-left transition hover:bg-slate-50"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user?.fullName || user?.name || 'User'}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <div className="crm-avatar-soft grid h-9 w-9 place-items-center rounded-full text-sm font-semibold">
                {(user?.fullName || user?.name || 'U')?.[0] || 'U'}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {user?.fullName || user?.name || 'User'}
              </p>
              <p className="text-xs capitalize text-slate-500">{user?.role || '-'}</p>
            </div>
          </button>

          {openProfileDropdown ? (
            <div className="absolute right-0 z-40 mt-2 w-52 origin-top-right rounded-xl border border-slate-200 bg-white p-1 shadow-lg transition duration-150 ease-out animate-in fade-in zoom-in-95">
              <button
                type="button"
                onClick={() => goTo('/profile')}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100"
              >
                View Profile
              </button>
              {canUseSettings ? (
                <button
                  type="button"
                  onClick={() => goTo('/settings')}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100"
                >
                  Settings
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => goTo('/notifications')}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100"
              >
                Notifications
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}

export default Topbar
