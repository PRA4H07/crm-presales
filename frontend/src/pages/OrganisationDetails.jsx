import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const organisations = [
  {
    id: 1,
    name: 'ABC Travels',
    requirement: 'Flight + Hotel',
    status: 'Active',
    plan: 'Premium',
    expiry: '2026-12-01',
    clients: 'Active',
    createdAt: '2026-04-01',
  },
]

const steps = ['Onboarded', 'Requirement Defined', 'Setup Done', 'Active Usage', 'Renewal', 'Expired']

function OrganisationDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const org = organisations.find((o) => o.id === Number(id))
  const [currentStep, setCurrentStep] = useState(3)

  if (!org) {
    return (
      <section className="space-y-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back
        </button>
        <p className="text-sm text-slate-600">Organisation not found.</p>
      </section>
    )
  }

  const progressPercent = Math.round((currentStep / (steps.length - 1)) * 100)

  const today = new Date()
  const expiryDate = new Date(org.expiry)
  const dayDiff = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24))
  const daysLeft = dayDiff > 0 ? dayDiff : 0

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{org.name}</h1>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
          {org.status}
        </span>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">Progress</h2>
        <div className="overflow-x-auto pb-2">
          <div className="flex min-w-max items-start">
          {steps.map((step, index) => {
            const isCompleted = index <= currentStep
            const isCurrent = index === currentStep

            return (
              <div key={step} className="flex items-start">
                <button
                  type="button"
                  onClick={() => setCurrentStep(index)}
                  className="flex w-28 flex-col items-center text-center transition-all duration-200"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold transition-all duration-200 ${
                      isCurrent
                        ? 'bg-blue-600 text-white shadow-md'
                        : isCompleted
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <p className={`mt-2 text-xs leading-tight ${isCurrent ? 'font-semibold text-blue-700' : 'text-slate-600'}`}>
                    {step}
                  </p>
                </button>
                {index < steps.length - 1 ? (
                  <div className={`mt-5 h-0.5 w-12 rounded-full transition-all duration-200 ${index < currentStep ? 'bg-blue-200' : 'bg-slate-200'}`} />
                ) : null}
              </div>
            )
          })}
          </div>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-slate-600">Progress: {progressPercent}%</p>
          <div className="h-2 w-full rounded bg-slate-200">
            <div className="h-2 rounded bg-blue-600" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Organisation Information</h2>
            <div className="space-y-2 text-sm text-slate-700">
              <p>
                <strong className="text-slate-900">Name:</strong> {org.name}
              </p>
              <p>
                <strong className="text-slate-900">Requirement:</strong> {org.requirement}
              </p>
              <p>
                <strong className="text-slate-900">Status:</strong> {org.status}
              </p>
              <p>
                <strong className="text-slate-900">Created Date:</strong> {org.createdAt}
              </p>
              <p>
                <strong className="text-slate-900">Clients Status:</strong> {org.clients}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Subscription</h2>
            <div className="space-y-2 text-sm text-slate-700">
              <p>
                <strong className="text-slate-900">Plan Name:</strong> {org.plan}
              </p>
              <p>
                <strong className="text-slate-900">Expiry Date:</strong> {org.expiry}
              </p>
              <p>
                <strong className="text-slate-900">Days Left:</strong> {daysLeft}
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-base font-semibold text-slate-900">Insights</h2>
            <p className="text-sm text-slate-600">
              <strong className="text-slate-900">Total Clients:</strong> 120
            </p>
            <p className="mt-2 text-sm text-slate-600">
              <strong className="text-slate-900">Active Clients:</strong> 95
            </p>
            <p className="mt-3 text-sm text-slate-600">
              <strong className="text-slate-900">Suggested Action:</strong> Prepare renewal discussion this month.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default OrganisationDetails
