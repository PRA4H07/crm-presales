import { useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'

function ProfileEditor({ user, token, login }) {
  const fileInputRef = useRef(null)
  const [form, setForm] = useState({
    fullName: user.fullName || user.name || '',
    role: user.role || '',
    email: user.email || '',
    avatarUrl: user.avatarUrl || '',
  })

  function handleChange(event) {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    login(
      {
        ...user,
        fullName: form.fullName.trim(),
        role: form.role.trim().toLowerCase(),
        email: form.email.trim(),
        avatarUrl: form.avatarUrl,
      },
      token,
    )
  }

  function handleAvatarUpload(event) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const imageData = String(reader.result || '')
      if (!imageData) {
        return
      }
      setForm((previous) => ({ ...previous, avatarUrl: imageData }))
      login({ ...user, avatarUrl: imageData }, token)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {form.avatarUrl ? (
          <img
            src={form.avatarUrl}
            alt={form.fullName}
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div className="crm-avatar-soft grid h-16 w-16 place-items-center rounded-full text-2xl font-semibold">
            {form.fullName?.[0] || 'U'}
          </div>
        )}
        <h2 className="mt-3 text-lg font-semibold text-slate-900">{form.fullName}</h2>
        <p className="text-sm capitalize text-slate-500">{form.role}</p>
        <p className="mt-1 text-sm text-slate-500">{form.email}</p>
        <div className="mt-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Upload avatar
          </button>
        </div>
      </aside>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-medium text-slate-700">Name</span>
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              className="crm-focus-ring h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none"
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium text-slate-700">Role</span>
            <input
              name="role"
              value={form.role}
              onChange={handleChange}
              className="crm-focus-ring h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none"
            />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="crm-focus-ring h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none"
            />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-sm font-medium text-slate-700">Avatar URL (optional)</span>
            <input
              name="avatarUrl"
              value={form.avatarUrl}
              onChange={handleChange}
              placeholder="https://example.com/avatar.jpg"
              className="crm-focus-ring h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none"
            />
          </label>
        </div>
        <div className="mt-5">
          <button
            type="submit"
            className="crm-gradient-bg crm-gradient-bg-hover rounded-xl px-4 py-2 text-sm font-medium text-white transition"
          >
            Save changes
          </button>
        </div>
      </form>
    </div>
  )
}

function ProfilePage() {
  const { user, token, login } = useAuth()

  if (!user || !token) {
    return null
  }

  const editorKey = user.id ?? user.email ?? 'profile'

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Profile</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your account information.</p>
      </div>

      <ProfileEditor key={editorKey} user={user} token={token} login={login} />
    </section>
  )
}

export default ProfilePage
