import { useNotifications } from '../context/NotificationsContext'
import { formatDateTime } from '../utils/formatters'

function formatRelativeTime(dateString) {
  const timestamp = new Date(dateString).getTime()
  const diffMs = Date.now() - timestamp
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} hr ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} day ago`
}

function NotificationsPage() {
  const { notifications, unreadCount, markNotificationRead, markAllRead } = useNotifications()

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Notifications</h1>
          <p className="mt-1 text-sm text-slate-500">
            Alerts for leads, tasks, communication, and CRM activities.
          </p>
        </div>
        <button
          type="button"
          onClick={markAllRead}
          className="crm-gradient-bg crm-gradient-bg-hover rounded-xl px-3 py-2 text-sm font-medium text-white transition"
        >
          Mark all as read
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3 text-sm text-slate-500">
          Unread: <span className="font-semibold text-slate-800">{unreadCount}</span>
        </div>

        {!notifications.length ? (
          <div className="px-4 py-10 text-center text-sm text-slate-500">No notifications</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => markNotificationRead(item.id)}
                className={`block w-full px-4 py-3 text-left transition hover:bg-slate-50 ${
                  !item.isRead ? 'bg-blue-50/50' : 'bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-0.5 text-sm text-slate-600">{item.description}</p>
                    <p className="mt-1 text-xs text-slate-400">{formatDateTime(item.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">
                      {formatRelativeTime(item.createdAt)}
                    </span>
                    <span
                      className={`rounded-full px-2 py-1 text-[11px] font-medium ${
                        item.isRead
                          ? 'bg-slate-100 text-slate-600'
                          : 'crm-avatar-soft'
                      }`}
                    >
                      {item.isRead ? 'Read' : 'Unread'}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default NotificationsPage
