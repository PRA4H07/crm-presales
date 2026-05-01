import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const users = [
  {
    id: 1,
    name: "Admin 1",
    totalLeads: 10,
    activeLeads: 6,
  },
];

function Insights() {
  const totalUsers = users.length;
  const totalLeads = users.reduce((sum, user) => sum + user.totalLeads, 0);
  const activeLeads = users.reduce((sum, user) => sum + user.activeLeads, 0);
  const chartData = users.map((user) => ({
    name: user.name,
    leads: user.totalLeads,
    active: user.activeLeads,
  }));

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Overview of system performance and team activity
        </p>
      </div>

      <div className="crm-card space-y-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <p className="text-xs text-slate-500">👤 Total Users</p>
            <p className="mt-2 text-4xl font-bold text-[#111827]">{totalUsers}</p>
            <p className="mt-1 text-xs text-emerald-600">↑ +8% this month</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <p className="text-xs text-slate-500">📈 Total Leads</p>
            <p className="mt-2 text-4xl font-bold text-[#111827]">{totalLeads}</p>
            <p className="mt-1 text-xs text-emerald-600">↑ +12% this month</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <p className="text-xs text-slate-500">✅ Active Leads</p>
            <p className="mt-2 text-4xl font-bold text-[#111827]">{activeLeads}</p>
            <p className="mt-1 text-xs text-rose-500">↓ -2% this month</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">
            Lead Overview
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="leads" fill="#2563eb" />
              <Bar dataKey="active" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-700">
                  User Name
                </th>
                <th className="px-5 py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-700">
                  Total Leads
                </th>
                <th className="px-5 py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-700">
                  Active Leads
                </th>
                <th className="px-5 py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-700">
                  Conversion %
                </th>
              </tr>
            </thead>
            <tbody>
              {!users.length ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-10 text-center text-sm text-slate-500"
                  >
                    No user insights yet.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const conversion =
                    user.totalLeads > 0
                      ? Math.round((user.activeLeads / user.totalLeads) * 100)
                      : 0;
                  return (
                    <tr
                      key={user.id}
                      className="border-b border-slate-100 odd:bg-white even:bg-slate-50/30 hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 font-medium text-slate-900">
                        {user.name}
                      </td>
                      <td className="px-5 py-4 text-center font-semibold text-slate-700">
                        {user.totalLeads}
                      </td>
                      <td className="px-5 py-4 text-center font-semibold text-slate-700">
                        {user.activeLeads}
                      </td>
                      <td className="px-5 py-4 text-center font-semibold text-slate-700">
                        {conversion}%
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default Insights;
