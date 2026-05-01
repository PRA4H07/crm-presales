import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Pencil, Search, Trash2 } from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

const MOCK_USERS = [
  { _id: "mock-1", name: "Aarav Singh", email: "aarav@travelpro.com", role: "ADMIN", status: true, reportToName: "Bhavneet Kumar", reportToEmail: "bhavneet@travelpro.com", createdAt: "2026-03-24T10:00:00.000Z" },
  { _id: "mock-2", name: "Meera Sharma", email: "meera@travelpro.com", role: "MANAGER", status: true, reportToName: "Aarav Singh", reportToEmail: "aarav@travelpro.com", createdAt: "2026-03-26T10:00:00.000Z" },
  { _id: "mock-3", name: "Rohan Verma", email: "rohan@travelpro.com", role: "READ_ONLY", status: false, reportToName: "Meera Sharma", reportToEmail: "meera@travelpro.com", createdAt: "2026-04-01T10:00:00.000Z" },
];

function getRoleLabel(role) {
  if (role === "READ_ONLY" || role === "EMPLOYEE") return "Read-Only";
  if (role === "ADMIN" || role === "SYSTEM_ADMIN") return "Admin";
  if (role === "MANAGER") return "Manager";
  return "Read-Only";
}
function toApiRole(role) {
  if (role === "Read-Only") return "READ_ONLY";
  if (role === "Admin") return "ADMIN";
  if (role === "Manager") return "MANAGER";
  return role || "READ_ONLY";
}
function fromApiRole(role) {
  return getRoleLabel(role);
}
function normalizeUser(userItem) {
  const reportTo = userItem?.reportTo;
  return {
    ...userItem,
    role: userItem?.role || "READ_ONLY",
    status: typeof userItem?.status === "boolean" ? userItem.status : true,
    reportToName: userItem?.reportToName || reportTo?.name || userItem?.managerName || userItem?.manager || "-",
    reportToEmail: userItem?.reportToEmail || reportTo?.email || userItem?.managerEmail || "-",
  };
}

function SettingsPage() {
  const { user } = useAuth();
  const canManageUsers = user?.role === "admin" || user?.role === "system_admin";
  const [activeMainTab, setActiveMainTab] = useState("agency");
  const [activeAgencyTab, setActiveAgencyTab] = useState("overview");
  const [basicForm, setBasicForm] = useState({
    organizationName: "",
    organizationCode: "",
    organizationAddress: "",
    maximumUsers: "",
    defaultTimezone: "Asia/Kolkata",
    defaultCurrency: "INR",
    platformLogoName: "",
  });
  const [integrationForm, setIntegrationForm] = useState({
    displayName: "",
    emailAddress: "",
    password: "",
    provider: "gmail",
  });
  const [basicSaveMessage, setBasicSaveMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [modalForm, setModalForm] = useState({
    name: "",
    email: "",
    role: "Read-Only",
    reportToName: "",
    reportToEmail: "",
    status: true,
  });

  useEffect(() => {
    async function init() {
      try {
        if (canManageUsers) {
          try {
            const userRes = await axiosInstance.get("/users");
            const incomingUsers = Array.isArray(userRes?.data) ? userRes.data : [];
            setUsers(incomingUsers.length ? incomingUsers.map(normalizeUser) : MOCK_USERS.map(normalizeUser));
          } catch (error) {
            console.error("Users API unavailable, using mock users:", error);
            setUsers(MOCK_USERS.map(normalizeUser));
          }
        }
        const agencyRes = await axiosInstance.get("/agency");
        if (agencyRes?.data) {
          setBasicForm((prev) => ({
            ...prev,
            organizationName: agencyRes.data.organizationName || "",
            organizationCode: agencyRes.data.organizationCode || "",
            organizationAddress: agencyRes.data.organizationAddress || "",
            maximumUsers: agencyRes.data.maximumUsers || "",
            defaultTimezone: agencyRes.data.defaultTimezone || prev.defaultTimezone,
            defaultCurrency: agencyRes.data.defaultCurrency || prev.defaultCurrency,
          }));
        }
      } catch (err) {
        console.error("Error loading data:", err);
      }
    }
    init();
  }, [canManageUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter((row) => {
      const roleLabel = getRoleLabel(row.role);
      const rolePass = selectedRole === "all" ? true : roleLabel === selectedRole;
      const searchValue = searchTerm.trim().toLowerCase();
      const searchPass = searchValue ? `${row.name || ""} ${row.email || ""}`.toLowerCase().includes(searchValue) : true;
      return rolePass && searchPass;
    });
  }, [users, searchTerm, selectedRole]);

  function handleBasicChange(event) {
    const { name, value } = event.target;
    setBasicForm((prev) => ({ ...prev, [name]: value }));
    setBasicSaveMessage("");
  }
  function handleIntegrationChange(event) {
    const { name, value } = event.target;
    setIntegrationForm((prev) => ({ ...prev, [name]: value }));
  }
  async function handleBasicSave(event) {
    event.preventDefault();
    try {
      await axiosInstance.put("/agency", {
        organizationName: basicForm.organizationName,
        organizationCode: basicForm.organizationCode,
        organizationAddress: basicForm.organizationAddress,
        maximumUsers: basicForm.maximumUsers,
        defaultTimezone: basicForm.defaultTimezone,
        defaultCurrency: basicForm.defaultCurrency,
      });
      setBasicSaveMessage("Settings saved successfully.");
    } catch (err) {
      console.error("Error saving agency:", err);
      setBasicSaveMessage("Failed to save settings.");
    }
  }
  function openModal() {
    setIsEditMode(false);
    setEditUserId(null);
    setSuccessMessage("");
    setModalForm({ name: "", email: "", role: "Read-Only", reportToName: "", reportToEmail: "", status: true });
    setShowModal(true);
  }
  function closeModal() {
    setShowModal(false);
    setIsEditMode(false);
    setEditUserId(null);
    setSuccessMessage("");
  }
  function handleModalChange(event) {
    const { name, value } = event.target;
    setModalForm((prev) => ({ ...prev, [name]: value }));
  }
  function handleEditUser(userToEdit) {
    setIsEditMode(true);
    setEditUserId(userToEdit._id);
    setModalForm({
      name: userToEdit.name || "",
      email: userToEdit.email || "",
      role: fromApiRole(userToEdit.role),
      reportToName: userToEdit.reportToName === "-" ? "" : userToEdit.reportToName || "",
      reportToEmail: userToEdit.reportToEmail === "-" ? "" : userToEdit.reportToEmail || "",
      status: Boolean(userToEdit.status),
    });
    setSuccessMessage("");
    setShowModal(true);
  }
  async function handleCreateUser(event) {
    event.preventDefault();
    const name = modalForm.name.trim();
    const email = modalForm.email.trim();
    if (!name || !email) return;
    const payload = {
      name,
      email,
      role: toApiRole(modalForm.role),
      reportToName: modalForm.reportToName.trim(),
      reportToEmail: modalForm.reportToEmail.trim(),
      status: modalForm.status,
    };
    try {
      setIsLoading(true);
      if (isEditMode) {
        let mergedUser = null;
        try {
          const updateRes = await axiosInstance.put(`/users/${editUserId}`, payload);
          mergedUser = updateRes?.data ? normalizeUser(updateRes.data) : null;
        } catch (error) {
          console.error("Users update API failed, applying frontend update:", error);
        }
        setUsers((prev) => prev.map((row) => (row._id === editUserId ? { ...row, ...payload, ...(mergedUser || {}) } : row)));
      } else {
        let createdUser = null;
        try {
          const createRes = await axiosInstance.post("/users", payload);
          createdUser = createRes?.data ? normalizeUser(createRes.data) : null;
        } catch (error) {
          console.error("Users create API failed, using local fallback:", error);
        }
        const fallbackUser = normalizeUser({ _id: `tmp-${Date.now()}`, createdAt: new Date().toISOString(), ...payload });
        setUsers((prev) => [createdUser || fallbackUser, ...prev]);
      }
      setSuccessMessage(isEditMode ? "User updated." : "User added.");
      setTimeout(() => closeModal(), 600);
    } catch (err) {
      console.error("Error saving user:", err);
    } finally {
      setIsLoading(false);
    }
  }
  async function handleDeleteUser(id) {
    const isConfirmed = window.confirm("Delete this user?");
    if (!isConfirmed) return;
    try {
      await axiosInstance.delete(`/users/${id}`);
    } catch (error) {
      console.error("Users delete API failed, deleting from frontend:", error);
    } finally {
      setUsers((prev) => prev.filter((item) => item._id !== id));
    }
  }
  async function handleToggleStatus(targetUser) {
    const nextStatus = !Boolean(targetUser.status);
    setUsers((prev) => prev.map((item) => (item._id === targetUser._id ? { ...item, status: nextStatus } : item)));
    try {
      await axiosInstance.put(`/users/${targetUser._id}`, { ...targetUser, status: nextStatus });
    } catch (error) {
      console.error("Status update API failed, keeping frontend change:", error);
    }
  }

  if (!user) {
    return (
      <section className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
          <p className="mt-2 text-sm text-slate-600">Sign in to see your settings.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your workspace configuration and user permissions</p>
      </div>

      <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
        <button type="button" onClick={() => setActiveMainTab("agency")} className={`rounded-lg px-4 py-2 text-sm font-medium ${activeMainTab === "agency" ? "border border-slate-200 bg-white text-slate-900 shadow-sm" : "text-slate-600"}`}>Agency</button>
        <button type="button" onClick={() => setActiveMainTab("integrations")} className={`rounded-lg px-4 py-2 text-sm font-medium ${activeMainTab === "integrations" ? "border border-slate-200 bg-white text-slate-900 shadow-sm" : "text-slate-600"}`}>Integrations</button>
      </div>

      {activeMainTab === "agency" ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button type="button" onClick={() => setActiveAgencyTab("overview")} className={`rounded-lg px-3 py-1.5 text-sm ${activeAgencyTab === "overview" ? "border border-slate-200 bg-white text-slate-900 shadow-sm" : "text-slate-600"}`}>Overview</button>
            <button type="button" onClick={() => setActiveAgencyTab("agencySettings")} className={`rounded-lg px-3 py-1.5 text-sm ${activeAgencyTab === "agencySettings" ? "border border-slate-200 bg-white text-slate-900 shadow-sm" : "text-slate-600"}`}>Agency Settings</button>
            <button type="button" onClick={() => setActiveAgencyTab("users")} className={`rounded-lg px-3 py-1.5 text-sm ${activeAgencyTab === "users" ? "border border-slate-200 bg-white text-slate-900 shadow-sm" : "text-slate-600"}`}>Users</button>
          </div>

          {activeAgencyTab === "overview" ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-semibold text-slate-900">Overview</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Organization Name</p><p className="mt-1 text-sm font-medium text-slate-800">{basicForm.organizationName || "-"}</p></div>
                <div className="rounded-lg border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Organization Code</p><p className="mt-1 text-sm font-medium text-slate-800">{basicForm.organizationCode || "-"}</p></div>
                <div className="rounded-lg border border-slate-200 bg-white p-4 md:col-span-2"><p className="text-xs text-slate-500">Organization Address</p><p className="mt-1 text-sm font-medium text-slate-800">{basicForm.organizationAddress || "-"}</p></div>
                <div className="rounded-lg border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Maximum Users</p><p className="mt-1 text-sm font-medium text-slate-800">{basicForm.maximumUsers || "-"}</p></div>
              </div>
            </div>
          ) : null}

          {activeAgencyTab === "agencySettings" ? (
            <form onSubmit={handleBasicSave} className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-semibold text-slate-900">Agency Settings</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="space-y-1.5"><span className="text-sm text-slate-600">Organization Name</span><input name="organizationName" value={basicForm.organizationName} onChange={handleBasicChange} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400" /></label>
                <label className="space-y-1.5"><span className="text-sm text-slate-600">Organization Code</span><input name="organizationCode" value={basicForm.organizationCode} onChange={handleBasicChange} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400" /></label>
                <label className="space-y-1.5 md:col-span-2"><span className="text-sm text-slate-600">Organization Address</span><input name="organizationAddress" value={basicForm.organizationAddress} onChange={handleBasicChange} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400" /></label>
                <label className="space-y-1.5"><span className="text-sm text-slate-600">Maximum Users</span><input type="number" name="maximumUsers" value={basicForm.maximumUsers} onChange={handleBasicChange} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400" /></label>
              </div>
              <div className="mt-5 flex items-center gap-3"><button type="submit" className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700">Save</button>{basicSaveMessage ? <span className="text-sm text-slate-500">{basicSaveMessage}</span> : null}</div>
            </form>
          ) : null}

          {activeAgencyTab === "users" ? (
            <div>
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div><h2 className="text-xl font-semibold text-slate-900">User Management</h2><p className="mt-1 text-sm text-slate-500">Manage user accounts, roles and permissions</p></div>
                <button type="button" onClick={openModal} disabled={!canManageUsers} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">+ Add User</button>
              </div>
              <div className="mb-4 flex flex-wrap gap-3">
                <div className="relative min-w-[240px] flex-1"><Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search users..." className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-400" /></div>
                <div className="relative w-full sm:w-44"><select value={selectedRole} onChange={(event) => setSelectedRole(event.target.value)} className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-9 text-sm text-slate-700 outline-none transition focus:border-blue-400"><option value="all">All Roles</option><option value="Read-Only">Read-Only</option><option value="Admin">Admin</option><option value="Manager">Manager</option></select><ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" /></div>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full text-sm">
                  <thead><tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-500"><th className="px-4 py-3 font-medium">Name</th><th className="px-4 py-3 font-medium">Email</th><th className="px-4 py-3 font-medium">Role</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Created</th><th className="px-4 py-3 text-right font-medium">Actions</th></tr></thead>
                  <tbody>
                    {filteredUsers.length ? filteredUsers.map((row) => {
                      const roleLabel = getRoleLabel(row.role);
                      const roleBadgeStyle = roleLabel === "Admin" ? "bg-blue-50 text-blue-700 border-blue-200" : roleLabel === "Manager" ? "bg-violet-50 text-violet-700 border-violet-200" : "bg-slate-100 text-slate-700 border-slate-200";
                      return (
                        <tr key={row._id} className="border-b border-slate-100 last:border-b-0">
                          <td className="px-4 py-3.5 font-medium text-slate-900">{row.name || "-"}</td>
                          <td className="px-4 py-3.5 text-slate-600">{row.email || "-"}</td>
                          <td className="px-4 py-3.5"><span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${roleBadgeStyle}`}>{roleLabel}</span></td>
                          <td className="px-4 py-3.5"><div className="flex items-center gap-2"><button type="button" onClick={() => handleToggleStatus(row)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${row.status ? "bg-blue-600" : "bg-slate-300"}`}><span className={`h-4 w-4 transform rounded-full bg-white transition ${row.status ? "translate-x-6" : "translate-x-1"}`} /></button><span className="text-xs text-slate-600">{row.status ? "Active" : "Inactive"}</span></div></td>
                          <td className="px-4 py-3.5 text-slate-700">{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "-"}</td>
                          <td className="px-4 py-3.5"><div className="flex justify-end gap-2"><button type="button" onClick={() => handleEditUser(row)} className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50" aria-label="edit user"><Pencil size={15} /></button><button type="button" onClick={() => handleDeleteUser(row._id)} className="rounded-lg border border-slate-200 p-2 text-red-600 transition hover:bg-red-50" aria-label="delete user"><Trash2 size={15} /></button></div></td>
                        </tr>
                      );
                    }) : <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">No users found for current filters.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Integrations</h2>
          <p className="mt-1 text-sm text-slate-500">Configure outbound email integration for communication workflows.</p>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-1.5"><span className="text-sm text-slate-600">Display Name</span><input name="displayName" value={integrationForm.displayName} onChange={handleIntegrationChange} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400" /></label>
            <label className="space-y-1.5"><span className="text-sm text-slate-600">Email Address</span><input name="emailAddress" type="email" value={integrationForm.emailAddress} onChange={handleIntegrationChange} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400" /></label>
            <label className="space-y-1.5 md:col-span-2"><span className="text-sm text-slate-600">Password</span><input name="password" type="password" value={integrationForm.password} onChange={handleIntegrationChange} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400" /></label>
          </div>
          <div className="mt-4"><p className="mb-2 text-sm text-slate-600">Provider</p><div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1"><button type="button" onClick={() => setIntegrationForm((prev) => ({ ...prev, provider: "gmail" }))} className={`rounded-lg px-4 py-1.5 text-sm ${integrationForm.provider === "gmail" ? "border border-slate-200 bg-white text-slate-900 shadow-sm" : "text-slate-600"}`}>Gmail</button><button type="button" onClick={() => setIntegrationForm((prev) => ({ ...prev, provider: "outlook" }))} className={`rounded-lg px-4 py-1.5 text-sm ${integrationForm.provider === "outlook" ? "border border-slate-200 bg-white text-slate-900 shadow-sm" : "text-slate-600"}`}>Outlook</button></div><p className="mt-2 text-xs text-slate-500">Use app password or service credentials for secure mailbox access.</p></div>
        </div>
      )}

      {showModal ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-slate-900/35 p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">{isEditMode ? "Edit User" : "Add User"}</h3>
            <p className="mt-1 text-sm text-slate-500">Configure user details and access level</p>
            <form onSubmit={handleCreateUser} className="mt-4 space-y-4">
              <div><label className="text-sm font-medium text-slate-600">Name</label><input name="name" value={modalForm.name} onChange={handleModalChange} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400" required /></div>
              <div><label className="text-sm font-medium text-slate-600">Email</label><input type="email" name="email" value={modalForm.email} onChange={handleModalChange} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400" required /></div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div><label className="text-sm font-medium text-slate-600">Role</label><select name="role" value={modalForm.role} onChange={handleModalChange} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400"><option value="Read-Only">Read-Only</option><option value="Admin">Admin</option><option value="Manager">Manager</option></select></div>
                <div><label className="text-sm font-medium text-slate-600">Status</label><select name="status" value={modalForm.status ? "active" : "inactive"} onChange={(event) => setModalForm((prev) => ({ ...prev, status: event.target.value === "active" }))} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400"><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div><label className="text-sm font-medium text-slate-600">Report To</label><input name="reportToName" value={modalForm.reportToName} onChange={handleModalChange} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400" placeholder="Manager name" /></div>
                <div><label className="text-sm font-medium text-slate-600">Report To Email</label><input name="reportToEmail" type="email" value={modalForm.reportToEmail} onChange={handleModalChange} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400" placeholder="manager@email.com" /></div>
              </div>
              {successMessage ? <p className="text-sm text-emerald-600">{successMessage}</p> : null}
              <div className="flex justify-end gap-2 pt-1"><button type="button" onClick={closeModal} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Cancel</button><button type="submit" disabled={isLoading} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{isLoading ? "Saving..." : "Save"}</button></div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default SettingsPage;
