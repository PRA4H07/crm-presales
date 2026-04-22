import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const organisations = [
  {
    id: 1,
    name: 'ABC Travels',
    requirement: 'Flight + Hotel',
    plan: 'Premium',
    expiry: '2026-12-01',
    clients: 'Active',
  },
]

function Organisations() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('basic')
  const [orgData, setOrgData] = useState({
    name: '',
    code: '',
    address: '',
    maxUsers: '',
  })

  const handleChange = (e) => {
    setOrgData({
      ...orgData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSave = (e) => {
    e.preventDefault()
    console.log(orgData)
  }

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Organisations</h1>
        <p className="mt-1 text-sm text-slate-500">Manage all organisations using the CRM</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="tabs mb-6 flex flex-wrap gap-2 border-b border-slate-100 pb-4">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`rounded-full px-4 py-2 text-sm transition ${
              activeTab === 'basic'
                ? 'bg-slate-200 font-bold text-slate-900'
                : 'bg-slate-50 font-medium text-slate-600 hover:bg-slate-100'
            }`}
          >
            Basic Information
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`rounded-full px-4 py-2 text-sm transition ${
              activeTab === 'dashboard'
                ? 'bg-slate-200 font-bold text-slate-900'
                : 'bg-slate-50 font-medium text-slate-600 hover:bg-slate-100'
            }`}
          >
            Dashboard
          </button>
        </div>

        {activeTab === 'basic' ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-5">
            <form onSubmit={handleSave} className="max-w-3xl space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">Organisation Name</span>
                  <input
                    type="text"
                    name="name"
                    value={orgData.name}
                    onChange={handleChange}
                    className="crm-focus-ring h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">Organisation Code</span>
                  <input
                    type="text"
                    name="code"
                    value={orgData.code}
                    onChange={handleChange}
                    className="crm-focus-ring h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">Organisation Address</span>
                  <input
                    type="text"
                    name="address"
                    value={orgData.address}
                    onChange={handleChange}
                    className="crm-focus-ring h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">Maximum Users</span>
                  <input
                    type="text"
                    name="maxUsers"
                    value={orgData.maxUsers}
                    onChange={handleChange}
                    className="crm-focus-ring h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none"
                  />
                </label>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  className="crm-gradient-bg crm-gradient-bg-hover rounded-xl px-5 py-2 text-sm font-medium text-white"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        ) : null}

        {activeTab === 'dashboard' ? (
          <div className="space-y-4">
            <p className="text-sm font-medium text-slate-700">
              Total Organisations: <span className="text-slate-900">{organisations.length}</span>
            </p>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Name
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Requirement
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Plan
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Expiry Date
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Clients Status
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {organisations.map((org) => (
                    <tr key={org.id} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-4 font-medium text-slate-900">{org.name}</td>
                      <td className="px-4 py-4 text-slate-600">{org.requirement}</td>
                      <td className="px-4 py-4 text-slate-600">{org.plan}</td>
                      <td className="px-4 py-4 text-slate-600">{org.expiry}</td>
                      <td className="px-4 py-4 text-slate-600">{org.clients}</td>
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => navigate(`/organisations/${org.id}`)}
                          className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default Organisations
