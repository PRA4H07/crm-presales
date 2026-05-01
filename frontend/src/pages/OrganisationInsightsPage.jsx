import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function OrganisationInsightsPage() {
  const navigate = useNavigate();

  const data = {
    clients: 5,
    leads: 10,
    users: 3,
    plan: "Basic",
  };

  return (
    <div className="p-6 space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-gray-600 hover:text-black"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-semibold">Organisation Insights</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl shadow">
          <p className="text-sm text-gray-500">Clients</p>
          <p className="text-2xl font-bold">{data.clients}</p>
        </div>

        <div className="p-4 bg-white rounded-xl shadow">
          <p className="text-sm text-gray-500">Leads</p>
          <p className="text-2xl font-bold">{data.leads}</p>
        </div>

        <div className="p-4 bg-white rounded-xl shadow">
          <p className="text-sm text-gray-500">Users</p>
          <p className="text-2xl font-bold">{data.users}</p>
        </div>

        <div className="p-4 bg-white rounded-xl shadow">
          <p className="text-sm text-gray-500">Plan</p>
          <p className="text-2xl font-bold">{data.plan}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="mb-4 font-semibold">Overview</h2>

        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart
              data={[
                { name: "Leads", value: data.leads },
                { name: "Clients", value: data.clients },
                { name: "Users", value: data.users },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default OrganisationInsightsPage;
