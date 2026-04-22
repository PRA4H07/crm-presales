import { useState } from "react";
import { useEffect } from "react";
import { createUser, getAdmins } from "../api/userApi";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useNavigate } from "react-router-dom";

const users = [
  {
    id: 1,
    name: "Admin 1",
    totalLeads: 10,
    activeLeads: 6,
  },
];

const organisations = [
  {
    id: 1,
    name: "ABC Travels",
    code: "ABC-TRAVELS",
    address: "—",
    requirement: "Flight + Hotel",
    plan: "Premium",
    expiry: "2026-12-01",
    clients: "Active",
  },
];

const plans = [
  { name: "Basic", price: "₹999/month" },
  { name: "Premium", price: "₹1999/month" },
];

const subscriptions = [
  {
    organisation: {
      id: 1,
      name: "ABC Travels",
    },
    plan: "Premium",
    status: "Active",
    expiry: "2026-12-01",
  },
];

const initialAdmins = [
  {
    id: 1,
    name: "Admin One",
    email: "admin1@abctravels.com",
    organisation: "ABC Travels",
    role: "Manager Admin",
    status: "Active",
    created: "2026-04-11",
  },
];

function Insights() {
  const navigate = useNavigate();

  const [activeMainTab, setActiveMainTab] = useState("insights");
  const [activeSettingsTab, setActiveSettingsTab] = useState("org");
  const [activeOrgTab, setActiveOrgTab] = useState("dashboard");
  const [activeAdminTab, setActiveAdminTab] = useState("overview");
  const [orgRows, setOrgRows] = useState(organisations);
  const [orgData, setOrgData] = useState(() => ({
    name: organisations[0]?.name || "",
    code: organisations[0]?.code || "",
    address: organisations[0]?.address || "",
    requirement: organisations[0]?.requirement || "",
    plan: organisations[0]?.plan || "",
    expiry: organisations[0]?.expiry || "",
    clients: organisations[0]?.clients || "",
  }));
  const [orgSaveMessage, setOrgSaveMessage] = useState("");
  const [adminRows, setAdminRows] = useState([]);
  const [adminForm, setAdminForm] = useState({
    name: "",
    email: "",
    organisation: "",
    role: "",
    status: "Active",
    created: new Date().toISOString().slice(0, 10),
  });
  const [adminSaveMessage, setAdminSaveMessage] = useState("");

  useEffect(() => {
    async function fetchAdmins() {
      try {
        const res = await getAdmins();
        setAdminRows(res.data);
      } catch (err) {
        console.error("Error fetching admins:", err);
      }
    }

    fetchAdmins();
  }, []);

  const totalUsers = users.length;
  const totalLeads = users.reduce((sum, user) => sum + user.totalLeads, 0);
  const activeLeads = users.reduce((sum, user) => sum + user.activeLeads, 0);
  const chartData = users.map((user) => ({
    name: user.name,
    leads: user.totalLeads,
    active: user.activeLeads,
  }));

  const getDaysLeft = (date) => {
    const today = new Date();
    const expiry = new Date(date);
    const diff = expiry - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getStatusClass = (status, daysLeft) => {
    if (status.toLowerCase() === "expired" || daysLeft < 0) {
      return "bg-rose-100 text-rose-700";
    }
    if (daysLeft < 10) {
      return "bg-orange-100 text-orange-700";
    }
    return "bg-emerald-100 text-emerald-700";
  };

  const handleChange = (e) => {
    setOrgData({
      ...orgData,
      [e.target.name]: e.target.value,
    });
    setOrgSaveMessage("");
  };

  const handleSave = (e) => {
    e.preventDefault();
    console.log(orgData);
    setOrgRows((prev) =>
      prev.map((row) =>
        row.id === (prev[0]?.id ?? 1)
          ? {
              ...row,
              name: orgData.name,
              code: orgData.code,
              address: orgData.address,
              requirement: orgData.requirement,
              plan: orgData.plan,
              expiry: orgData.expiry,
              clients: orgData.clients,
            }
          : row,
      ),
    );
    setOrgSaveMessage("Organisation details saved. Dashboard updated.");
  };

  const handleAdminChange = (e) => {
    setAdminForm({
      ...adminForm,
      [e.target.name]: e.target.value,
    });
    setAdminSaveMessage("");
  };

  const handleAdminSave = async (e) => {
    e.preventDefault();

    const name = adminForm.name.trim();
    const email = adminForm.email.trim();

    if (!name || !email) {
      setAdminSaveMessage("Please fill name and email.");
      return;
    }

    try {
      await createUser({
        name,
        email,
        role: "ADMIN",
        organisation: adminForm.organisation,
        status: adminForm.status,
      });

      const res = await getAdmins();
      setAdminRows(res.data);

      setAdminSaveMessage(
        "Admin created successfully. Login credentials sent via email.",
      );

      setAdminForm({
        name: "",
        email: "",
        organisation: "",
        role: "",
        status: "Active",
        created: new Date().toISOString().slice(0, 10),
      });
    } catch (err) {
      setAdminSaveMessage(
        err?.response?.data?.message || "Error creating admin",
      );
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Insights
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Overview of system performance and organisation management
        </p>
      </div>

      <div className="crm-card">
        <div className="tab-container flex-wrap border-b border-slate-100 pb-4">
          <button
            type="button"
            onClick={() => setActiveMainTab("insights")}
            className={activeMainTab === "insights" ? "tab active" : "tab"}
          >
            Insights
          </button>
          <button
            type="button"
            onClick={() => setActiveMainTab("settings")}
            className={activeMainTab === "settings" ? "tab active" : "tab"}
          >
            Settings
          </button>
        </div>

        {activeMainTab === "insights" ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                <p className="text-xs text-slate-500">👤 Total Users</p>
                <p className="mt-2 text-4xl font-bold text-[#111827]">
                  {totalUsers}
                </p>
                <p className="mt-1 text-xs text-emerald-600">
                  ↑ +8% this month
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                <p className="text-xs text-slate-500">📈 Total Leads</p>
                <p className="mt-2 text-4xl font-bold text-[#111827]">
                  {totalLeads}
                </p>
                <p className="mt-1 text-xs text-emerald-600">
                  ↑ +12% this month
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                <p className="text-xs text-slate-500">✅ Active Leads</p>
                <p className="mt-2 text-4xl font-bold text-[#111827]">
                  {activeLeads}
                </p>
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
                          ? Math.round(
                              (user.activeLeads / user.totalLeads) * 100,
                            )
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
        ) : null}

        {activeMainTab === "settings" ? (
          <div className="space-y-5">
            <div
              className="tab-container flex-wrap"
              style={{ marginTop: "20px" }}
            >
              <button
                type="button"
                onClick={() => setActiveSettingsTab("org")}
                className={activeSettingsTab === "org" ? "tab active" : "tab"}
              >
                Organisation Settings
              </button>
              <button
                type="button"
                onClick={() => setActiveSettingsTab("subscription")}
                className={
                  activeSettingsTab === "subscription" ? "tab active" : "tab"
                }
              >
                Subscription
              </button>
              <button
                type="button"
                onClick={() => setActiveSettingsTab("admin")}
                className={activeSettingsTab === "admin" ? "tab active" : "tab"}
              >
                Admin Settings
              </button>
            </div>

            {activeSettingsTab === "org" ? (
              <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/40 p-5 shadow-sm transition hover:shadow-md">
                <div
                  className="tab-container flex-wrap"
                  style={{ marginTop: "20px" }}
                >
                  <button
                    type="button"
                    onClick={() => setActiveOrgTab("dashboard")}
                    className={
                      activeOrgTab === "dashboard" ? "tab active" : "tab"
                    }
                  >
                    Dashboard
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveOrgTab("add")}
                    className={activeOrgTab === "add" ? "tab active" : "tab"}
                  >
                    Add Organisation
                  </button>
                </div>

                {activeOrgTab === "add" ? (
                  <form onSubmit={handleSave} className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        Basic Information
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Enter organisation details below
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <label className="block space-y-1.5">
                        <span className="text-sm font-medium text-slate-700">
                          Organisation Name
                        </span>
                        <input
                          type="text"
                          name="name"
                          value={orgData.name}
                          onChange={handleChange}
                          className="crm-input crm-focus-ring"
                        />
                      </label>
                      <label className="block space-y-1.5">
                        <span className="text-sm font-medium text-slate-700">
                          Requirement
                        </span>
                        <input
                          type="text"
                          name="requirement"
                          value={orgData.requirement}
                          onChange={handleChange}
                          className="crm-input crm-focus-ring"
                        />
                      </label>
                      <label className="block space-y-1.5">
                        <span className="text-sm font-medium text-slate-700">
                          Organisation Code
                        </span>
                        <input
                          type="text"
                          name="code"
                          value={orgData.code}
                          onChange={handleChange}
                          className="crm-input crm-focus-ring"
                        />
                      </label>
                      <label className="block space-y-1.5">
                        <span className="text-sm font-medium text-slate-700">
                          Plan
                        </span>
                        <select
                          name="plan"
                          value={orgData.plan}
                          onChange={handleChange}
                          className="crm-input crm-focus-ring"
                        >
                          <option value="">Select plan</option>
                          {plans.map((plan) => (
                            <option key={plan.name} value={plan.name}>
                              {plan.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="block space-y-1.5">
                        <span className="text-sm font-medium text-slate-700">
                          Organisation Address
                        </span>
                        <input
                          type="text"
                          name="address"
                          value={orgData.address}
                          onChange={handleChange}
                          className="crm-input crm-focus-ring"
                        />
                      </label>
                      <label className="block space-y-1.5">
                        <span className="text-sm font-medium text-slate-700">
                          Expiry Date
                        </span>
                        <input
                          type="date"
                          name="expiry"
                          value={orgData.expiry}
                          onChange={handleChange}
                          className="crm-input crm-focus-ring"
                        />
                      </label>
                      <label className="block space-y-1.5">
                        <span className="text-sm font-medium text-slate-700">
                          Clients Status
                        </span>
                        <input
                          type="text"
                          name="clients"
                          value={orgData.clients}
                          onChange={handleChange}
                          className="crm-input crm-focus-ring"
                        />
                      </label>
                    </div>
                    <button type="submit" className="crm-primary-btn">
                      Save
                    </button>
                    {orgSaveMessage ? (
                      <p className="text-sm font-medium text-emerald-600">
                        {orgSaveMessage}
                      </p>
                    ) : null}
                  </form>
                ) : null}

                {activeOrgTab === "dashboard" ? (
                  <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
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
                        {orgRows.map((organisation) => (
                          <tr
                            key={organisation.id}
                            className="border-b border-slate-100 odd:bg-white even:bg-slate-50/30 hover:bg-slate-50"
                          >
                            <td className="px-4 py-4 font-medium text-slate-900">
                              {organisation.name}
                            </td>
                            <td className="px-4 py-4 text-slate-600">
                              {organisation.requirement}
                            </td>
                            <td className="px-4 py-4 text-slate-600">
                              {organisation.plan}
                            </td>
                            <td className="px-4 py-4 text-slate-600">
                              {organisation.expiry}
                            </td>
                            <td className="px-4 py-4 text-slate-600">
                              {organisation.clients}
                            </td>
                            <td className="px-4 py-4">
                              <button
                                type="button"
                                onClick={() =>
                                  navigate(`/organisations/${organisation.id}`)
                                }
                                className="crm-primary-btn !rounded-lg !px-3 !py-1 text-xs"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
              </div>
            ) : null}

            {activeSettingsTab === "subscription" ? (
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {plans.map((plan) => (
                    <div
                      key={plan.name}
                      className={`rounded-xl border p-4 shadow-sm ${
                        plan.name === "Premium"
                          ? "border-blue-300 bg-blue-50/70"
                          : "border-slate-200 bg-slate-50/60"
                      }`}
                    >
                      <p className="text-xs text-slate-600">Plan Name</p>
                      <div className="mt-1 flex items-center gap-2">
                        <p className="text-lg font-semibold text-slate-900">
                          {plan.name}
                        </p>
                        {plan.name === "Premium" ? (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                            Active
                          </span>
                        ) : (
                          <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-700">
                            Expiring Soon
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {plan.price}
                      </p>
                      <button
                        type="button"
                        className="crm-primary-btn mt-3 !rounded-lg !px-3 !py-1.5 text-xs"
                      >
                        Choose Plan
                      </button>
                    </div>
                  ))}
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Organisation Name
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Plan
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Status
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Expiry Date
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Days Left
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {!subscriptions.length ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-4 py-10 text-center text-sm text-slate-500"
                          >
                            No subscriptions yet.
                          </td>
                        </tr>
                      ) : (
                        subscriptions.map((subscription) => {
                          const daysLeft = getDaysLeft(subscription.expiry);
                          return (
                            <tr
                              key={subscription.organisation.id}
                              className="border-b border-slate-100 hover:bg-slate-50/80"
                            >
                              <td className="px-4 py-4 font-medium text-slate-900">
                                {subscription.organisation.name}
                              </td>
                              <td className="px-4 py-4 text-slate-600">
                                {subscription.plan}
                              </td>
                              <td className="px-4 py-4">
                                <span
                                  className={`rounded-full px-2 py-1 text-xs font-semibold ${getStatusClass(subscription.status, daysLeft)}`}
                                >
                                  {subscription.status}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-slate-600">
                                {subscription.expiry}
                              </td>
                              <td className="px-4 py-4">
                                <p className="font-semibold text-slate-800">
                                  {daysLeft}
                                </p>
                                <div className="mt-2 h-2 w-[100px] rounded bg-slate-200">
                                  <div
                                    className="h-2 rounded bg-blue-600"
                                    style={{
                                      width: `${Math.max(0, Math.min(100, Math.round((daysLeft / 365) * 100)))}%`,
                                    }}
                                  />
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <button
                                  type="button"
                                  onClick={() => alert("Upgrade flow later")}
                                  className="crm-primary-btn !rounded-lg !px-3 !py-1 text-xs"
                                >
                                  Upgrade Plan
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            {activeSettingsTab === "admin" ? (
              <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/40 p-5 shadow-sm transition hover:shadow-md">
                <div
                  className="tab-container flex-wrap"
                  style={{ marginTop: "20px" }}
                >
                  <button
                    type="button"
                    onClick={() => setActiveAdminTab("overview")}
                    className={
                      activeAdminTab === "overview" ? "tab active" : "tab"
                    }
                  >
                    Overview
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveAdminTab("add")}
                    className={activeAdminTab === "add" ? "tab active" : "tab"}
                  >
                    Add Admin
                  </button>
                </div>

                {activeAdminTab === "overview" ? (
                  <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                    <table className="min-w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                          <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                            Name
                          </th>
                          <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                            Email
                          </th>
                          <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                            Organisation
                          </th>
                          <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                            Role
                          </th>
                          <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                            Status
                          </th>
                          <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                            Created
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {!adminRows.length ? (
                          <tr>
                            <td
                              colSpan={6}
                              className="px-4 py-10 text-center text-sm text-slate-500"
                            >
                              No admins added yet
                            </td>
                          </tr>
                        ) : (
                          adminRows.map((admin) => (
                            <tr
                              key={admin.id}
                              className="border-b border-slate-100 last:border-0"
                            >
                              <td className="px-4 py-4 font-medium text-slate-900">
                                {admin.name}
                              </td>
                              <td className="px-4 py-4 text-slate-600">
                                {admin.email}
                              </td>
                              <td className="px-4 py-4 text-slate-600">
                                {admin.organisation || "—"}
                              </td>
                              <td className="px-4 py-4 text-slate-600">
                                {admin.role}
                              </td>
                              <td className="px-4 py-4 text-slate-600">
                                {admin.status}
                              </td>
                              <td className="px-4 py-4 text-slate-600">
                                {admin.createdAt
                                  ? new Date(
                                      admin.createdAt,
                                    ).toLocaleDateString()
                                  : "—"}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : null}

                {activeAdminTab === "add" ? (
                  <form
                    onSubmit={handleAdminSave}
                    className="max-w-3xl space-y-4"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        Admin Management
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <label className="block space-y-1.5">
                        <span className="text-sm font-medium text-slate-700">
                          Name
                        </span>
                        <input
                          type="text"
                          name="name"
                          value={adminForm.name}
                          onChange={handleAdminChange}
                          className="crm-input crm-focus-ring"
                        />
                      </label>
                      <label className="block space-y-1.5">
                        <span className="text-sm font-medium text-slate-700">
                          Email
                        </span>
                        <input
                          type="email"
                          name="email"
                          value={adminForm.email}
                          onChange={handleAdminChange}
                          className="crm-input crm-focus-ring"
                        />
                      </label>
                      <label className="block space-y-1.5">
                        <span className="text-sm font-medium text-slate-700">
                          Organisation
                        </span>
                        <input
                          type="text"
                          name="organisation"
                          value={adminForm.organisation}
                          onChange={handleAdminChange}
                          className="crm-input crm-focus-ring"
                        />
                      </label>
                      <label className="block space-y-1.5">
                        <span className="text-sm font-medium text-slate-700">
                          Role
                        </span>
                        <select
                          name="role"
                          value={adminForm.role}
                          onChange={handleAdminChange}
                          className="crm-input crm-focus-ring"
                        >
                          <option value="">Select role</option>
                          <option value="Pre-Sales Manager">
                            Pre-Sales Manager
                          </option>
                          <option value="Manager Admin">Manager Admin</option>
                          <option value="CRM Admin">CRM Admin</option>
                          <option value="Operations Admin">
                            Operations Admin
                          </option>
                          <option value="Supervising Admin">
                            Supervising Admin
                          </option>
                        </select>
                      </label>
                      <label className="block space-y-1.5">
                        <span className="text-sm font-medium text-slate-700">
                          Status
                        </span>
                        <select
                          name="status"
                          value={adminForm.status}
                          onChange={handleAdminChange}
                          className="crm-input crm-focus-ring"
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </label>
                      <label className="block space-y-1.5">
                        <span className="text-sm font-medium text-slate-700">
                          Created
                        </span>
                        <input
                          type="date"
                          name="created"
                          value={adminForm.created}
                          onChange={handleAdminChange}
                          className="crm-input crm-focus-ring"
                        />
                      </label>
                    </div>
                    <button type="submit" className="crm-primary-btn">
                      Create Admin
                    </button>
                    {adminSaveMessage ? (
                      <p className="text-sm font-medium text-emerald-600">
                        {adminSaveMessage}
                      </p>
                    ) : null}
                  </form>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default Insights;
