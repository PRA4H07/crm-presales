import { useUI } from '../../context/UIContext'

function ToastContainer() {
  const { toasts } = useUI()

  return (
    <div className="fixed right-5 bottom-5 z-50 grid gap-3">
      {toasts.map((toast) => (
        <article
          key={toast.id}
          className="min-w-72 rounded-xl border border-slate-200 border-l-4 border-l-violet-500 bg-white p-4 shadow-lg"
        >
          <strong className="text-sm text-slate-900">{toast.title}</strong>
          {toast.description ? (
            <p className="mt-1 text-xs text-slate-500">{toast.description}</p>
          ) : null}
        </article>
      ))}
    </div>
  )
}

export default ToastContainer
