function DashboardPage() {
  const stats = [
    { label: 'Total Leads', value: '1,248', trend: '+12.4%', trendType: 'up' },
    { label: 'Qualified Leads', value: '384', trend: '+7.1%', trendType: 'up' },
    { label: 'Pitch Sent', value: '217', trend: '+4.3%', trendType: 'up' },
    { label: 'Win Rate', value: '28.6%', trend: '-1.2%', trendType: 'down' },
  ]

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Real-time view of your pre-sales pipeline and performance.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <article
            key={item.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {item.value}
            </p>
            <p
              className={`mt-2 text-sm font-medium ${
                item.trendType === 'up' ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {item.trend} vs last month
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default DashboardPage
