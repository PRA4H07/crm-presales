import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { clientService } from "../services/clientService";
import { formatDateTime } from "../utils/formatters";

const STATUS_OPTIONS = ["Active", "Prospect", "Inactive"];

function normalizeClientsPayload(response) {
  if (Array.isArray(response)) {
    return response;
  }
  if (response && Array.isArray(response.data)) {
    return response.data;
  }
  return [];
}

function createdByDisplay(createdBy) {
  if (
    createdBy &&
    typeof createdBy === "object" &&
    createdBy !== null &&
    createdBy.name
  ) {
    return createdBy.name;
  }
  return "—";
}

function ClientsPage() {
  const { user } = useAuth();
  const normalizedRole = String(user?.role ?? "").toLowerCase();
  const canManageClients = ["admin", "employee", "system_admin"].includes(
    normalizedRole,
  );
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    status: "All",
    company: "All",
    owner: "All",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    status: "Active",
    owner: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  async function loadClients() {
    setLoading(true);
    try {
      const response = await clientService.getClients({ search, ...filters });
      setClients(normalizeClientsPayload(response));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClients();
  }, [search, filters.status, filters.company, filters.owner]);

  const companyOptions = [
    "All",
    ...new Set(clients.map((item) => item.company).filter(Boolean)),
  ];
  const ownerOptions = [
    "All",
    ...new Set(clients.map((item) => item.owner).filter(Boolean)),
  ];
  const start = (page - 1) * pageSize;
  const paginatedClients = clients.slice(start, start + pageSize);
  const totalPages = Math.max(1, Math.ceil(clients.length / pageSize));

  function openAddModal() {
    if (!canManageClients) {
      return;
    }
    setSubmitError("");
    setEditingClient(null);
    setForm({
      name: "",
      company: "",
      email: "",
      phone: "",
      status: "Active",
      owner: "",
    });
    setModalOpen(true);
  }

  function openEditModal(client) {
    if (!canManageClients) {
      return;
    }
    setSubmitError("");
    setEditingClient(client);
    setForm({
      name: client.name ?? "",
      company: client.company ?? "",
      email: client.email ?? "",
      phone: client.phone ?? "",
      status: client.status ?? "Active",
      owner: client.owner ?? "",
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setSubmitError("");
    setEditingClient(null);
  }

  function handleFormChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSaveClient(event) {
    event.preventDefault();
    if (!canManageClients) {
      return;
    }
    setSubmitError("");

    if (editingClient) {
      if (!form.name.trim() || !form.company.trim() || !form.email.trim()) {
        return;
      }
    } else if (!form.name.trim()) {
      return;
    }

    const wasEditing = Boolean(editingClient);
    setSubmitting(true);
    try {
      if (editingClient) {
        await clientService.updateClient(editingClient._id, form);
      } else {
        await clientService.createClient({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          company: form.company.trim(),
          status: form.status,
        });
      }
      closeModal();
      setSuccessMessage(
        wasEditing
          ? "Client updated successfully."
          : "Client created successfully.",
      );
      window.setTimeout(() => setSuccessMessage(""), 4000);
      await loadClients();
    } catch (error) {
      setSubmitError(error?.message || "Could not save client.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(clientId) {
    if (!canManageClients) {
      return;
    }
    await clientService.deleteClient(clientId);
    await loadClients();
  }

  function statusChip(status) {
    if (status === "Active") return "bg-emerald-50 text-emerald-700";
    if (status === "Prospect") return "bg-blue-50 text-blue-700";
    return "bg-slate-100 text-slate-600";
  }

  return (
    <section className="space-y-4 bg-slate-50">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Clients
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage accounts, ownership, engagement, and action history.
        </p>
      </div>

      {successMessage ? (
        <p className="text-sm font-medium text-emerald-600" role="status">
          {successMessage}
        </p>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setPage(1);
                setSearch(event.target.value);
              }}
              placeholder="Search clients"
              className="crm-focus-ring h-10 min-w-56 rounded-xl border border-slate-300 px-3 text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
            <select
              value={filters.status}
              onChange={(event) => {
                setPage(1);
                setFilters((previous) => ({
                  ...previous,
                  status: event.target.value,
                }));
              }}
              className="h-10 rounded-xl border border-slate-300 px-3 text-sm text-slate-600 outline-none"
            >
              <option>All</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
            <select
              value={filters.company}
              onChange={(event) => {
                setPage(1);
                setFilters((previous) => ({
                  ...previous,
                  company: event.target.value,
                }));
              }}
              className="h-10 rounded-xl border border-slate-300 px-3 text-sm text-slate-600 outline-none"
            >
              {companyOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            <select
              value={filters.owner}
              onChange={(event) => {
                setPage(1);
                setFilters((previous) => ({
                  ...previous,
                  owner: event.target.value,
                }));
              }}
              className="h-10 rounded-xl border border-slate-300 px-3 text-sm text-slate-600 outline-none"
            >
              {ownerOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>
          {canManageClients ? (
            <div className="flex flex-wrap items-center gap-2 lg:ml-auto lg:justify-end">
              <button
                type="button"
                onClick={openAddModal}
                className="crm-gradient-bg crm-gradient-bg-hover rounded-xl px-4 py-2 text-sm font-medium text-white transition"
              >
                Add Client
              </button>
            </div>
          ) : null}
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="h-12 animate-pulse rounded-xl bg-slate-100"
              />
            ))}
          </div>
        ) : !clients.length ? (
          <div className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
            No clients yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr className="border-b border-slate-200 bg-slate-100 text-slate-600">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Client Name</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Email</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Phone</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Created By</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide">Created</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedClients.map((client) => (
                  <tr
                    key={client._id}
                    className="border-b border-slate-200 transition hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {client.name}
                    </td>
                    <td className="px-4 py-3 text-slate-800 font-medium">{client.email}</td>
                    <td className="px-4 py-3 text-slate-800 font-medium">{client.phone}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusChip(client.status)}`}
                      >
                        {client.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-800 font-medium">
                      {createdByDisplay(client.createdBy)}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {client.createdAt
                        ? formatDateTime(client.createdAt)
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex min-h-[2.25rem] flex-wrap justify-center gap-2">
                        <Link
                          to={`/clients/${client._id}`}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                        >
                          View
                        </Link>
                        {canManageClients ? (
                          <>
                            <button
                              type="button"
                              onClick={() => openEditModal(client)}
                              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(client._id)}
                              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {clients.length > pageSize ? (
          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((previous) => Math.max(1, previous - 1))}
              className="rounded-lg border border-slate-200 px-3 py-1 text-sm disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-sm text-slate-500">
              Page {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page === totalPages}
              onClick={() =>
                setPage((previous) => Math.min(totalPages, previous + 1))
              }
              className="rounded-lg border border-slate-200 px-3 py-1 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        ) : null}
      </div>

      {modalOpen && canManageClients ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-slate-900/35 p-4">
          <form
            onSubmit={handleSaveClient}
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                {editingClient ? "Edit Client" : "Add Client"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600"
              >
                Close
              </button>
            </div>

            <div className="space-y-3">
              <label className="block space-y-1">
                <span className="text-xs font-medium text-slate-600">Name</span>
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleFormChange}
                  required
                  className="crm-focus-ring h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-medium text-slate-600">
                  Email
                </span>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleFormChange}
                  className="crm-focus-ring h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-medium text-slate-600">
                  Phone
                </span>
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleFormChange}
                  className="crm-focus-ring h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-medium text-slate-600">
                  Company
                </span>
                <input
                  name="company"
                  type="text"
                  value={form.company}
                  onChange={handleFormChange}
                  className="crm-focus-ring h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-medium text-slate-600">
                  Status
                </span>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleFormChange}
                  className="h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              {editingClient ? (
                <label className="block space-y-1">
                  <span className="text-xs font-medium text-slate-600">
                    Owner
                  </span>
                  <input
                    name="owner"
                    type="text"
                    value={form.owner}
                    onChange={handleFormChange}
                    className="crm-focus-ring h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none"
                  />
                </label>
              ) : null}
            </div>

            {submitError ? (
              <p className="mt-3 text-sm text-rose-600" role="alert">
                {submitError}
              </p>
            ) : null}

            <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="crm-gradient-bg crm-gradient-bg-hover rounded-xl px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {submitting
                  ? "Saving…"
                  : editingClient
                    ? "Update Client"
                    : "Create Client"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  );
}

export default ClientsPage;
