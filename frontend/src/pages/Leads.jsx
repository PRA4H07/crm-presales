import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getLeads, deleteLead as deleteLeadApi } from "../api/leadApi";
import { convertLead } from "../api/leadApi";

const STORAGE_KEY = "leads";

const STATUS_TABS = [
  "All",
  "New",
  "Contacted",
  "Qualified",
  "Proposal",
  "Negotiation",
  "Booked",
];

function Leads() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [dateFilter, setDateFilter] = useState("");
  const [activeStatusTab, setActiveStatusTab] = useState("All");

  useEffect(() => {
    async function fetchLeads() {
      const res = await getLeads();
      setLeads(res.data);
    }
    fetchLeads();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure?");
    if (!confirmDelete) return;

    await deleteLeadApi(id);

    setLeads((prev) => prev.filter((lead) => lead._id !== id));
  };

  let filteredLeads = leads;

  if (activeStatusTab !== "All") {
    filteredLeads = filteredLeads.filter(
      (lead) => lead.status === activeStatusTab,
    );
  }

  if (statusFilter !== "All Status") {
    filteredLeads = filteredLeads.filter(
      (lead) => lead.status === statusFilter,
    );
  }

  if (dateFilter.trim()) {
    filteredLeads = filteredLeads.filter((lead) => {
      const created = lead.created || "";
      return created.startsWith(dateFilter);
    });
  }

  const searchLower = search.trim().toLowerCase();
  if (searchLower) {
    filteredLeads = filteredLeads.filter((lead) => {
      const name = (lead.name || "").toLowerCase();
      const email = (lead.email || "").toLowerCase();
      const phone = (lead.phone || "").toLowerCase();
      return (
        name.includes(searchLower) ||
        email.includes(searchLower) ||
        phone.includes(searchLower)
      );
    });
  }

  if (!["admin", "employee"].includes(user?.role)) {
    return <p>Not authorized</p>;
  }

  return (
    <section className="space-y-4 bg-slate-50">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Leads
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage and track your potential clients
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leads..."
              className="crm-focus-ring h-10 min-w-48 rounded-xl border border-slate-300 px-3 text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-xl border border-slate-300 px-3 text-sm text-slate-600 outline-none"
            >
              <option>All Status</option>
              {STATUS_TABS.filter((s) => s !== "All").map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="crm-focus-ring h-10 rounded-xl border border-slate-300 px-3 text-sm text-slate-700 outline-none"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/create-lead")}
              className="crm-gradient-bg crm-gradient-bg-hover rounded-xl px-4 py-2 text-sm font-medium text-white transition"
            >
              Add Lead
            </button>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2 border-b border-slate-100 pb-3">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveStatusTab(tab)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                activeStatusTab === tab
                  ? "bg-blue-100 text-blue-700"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100 text-slate-600">
                <th className="px-4 py-3 w-[14%] text-xs font-semibold uppercase tracking-wide">
                  Name
                </th>
                <th className="px-4 py-3 w-[16%] text-xs font-semibold uppercase tracking-wide">
                  Contact
                </th>
                <th className="px-4 py-3 w-[12%] text-xs font-semibold uppercase tracking-wide">
                  Status
                </th>
                <th className="px-4 py-3 w-[12%] text-xs font-semibold uppercase tracking-wide">
                  Source
                </th>
                <th className="px-4 py-3 w-[12%] text-xs font-semibold uppercase tracking-wide">
                  Priority
                </th>
                <th className="px-4 py-3 w-[12%] text-xs font-semibold uppercase tracking-wide">
                  Budget
                </th>
                <th className="px-4 py-3 w-[12%] text-xs font-semibold uppercase tracking-wide">
                  Created
                </th>
                <th className="px-4 py-3 w-[10%] text-center text-xs font-semibold uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-sm text-slate-500"
                  >
                    No leads added yet
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  return (
                    <tr
                      key={lead._id}
                      className="border-b border-slate-200 last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-4 py-4 font-medium text-slate-900">
                        {lead.name || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <div className="text-slate-900">
                          {lead.email || "—"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {lead.phone || "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-800">
                          {lead.status || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-medium">
                        {lead.source || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-medium">
                        {lead.priority || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-medium">
                        {lead.budget || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {lead.createdAt
                          ? new Date(lead.createdAt).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex flex-wrap justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/leads/${lead._id}`)}
                            className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => navigate(`/edit-lead/${lead._id}`)}
                            className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await convertLead(lead._id);


                                const res = await getLeads();
                                setLeads(res.data);
                              } catch (err) {
                                console.log(err);
                              }
                            }}
                           className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
                          >
                            Convert
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(lead._id)}
                            className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
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

export default Leads;
