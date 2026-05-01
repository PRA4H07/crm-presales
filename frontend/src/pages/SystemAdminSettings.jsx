import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Pencil, Search, Trash2, Upload } from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import SystemAdminUserModal from "./SystemAdminUserModal";

const ROLE_OPTIONS = ["All Roles", "Admin", "Manage", "Read-Only"];

function mapRoleLabel(role) {
  if (role === "ADMIN" || role === "SYSTEM_ADMIN") return "Admin";
  if (role === "MANAGE") return "Manage";
  return "Read-Only";
}

function mapUser(user) {
  return {
    _id: user?._id || `tmp-${Date.now()}`,
    name: user?.name || "-",
    email: user?.email || "-",
    roleLabel: mapRoleLabel(user?.role),
    status: typeof user?.status === "boolean" ? user.status : true,
    createdAt: user?.createdAt || null,
  };
}

function initialLetter(name) {
  const first = (name || "").trim().charAt(0);
  return first ? first.toUpperCase() : "U";
}

function SystemAdminSettings() {
  const [activeTab, setActiveTab] = useState("basic");
  const [form, setForm] = useState({
    modelName: "",
    organisationAddress: "",
    defaultCurrency: "INR",
    maximumUsers: "",
    defaultTimezone: "Asia/Kolkata",
    logoFileName: "",
  });
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("All Roles");
  const [saveMessage, setSaveMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreatingOrganisation, setIsCreatingOrganisation] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "", orgRole: "ADMIN" });
  const [organisations, setOrganisations] = useState([]);

  useEffect(() => {
    async function loadPage() {
      try {
        const [agencyRes, orgRes, usersRes] = await Promise.allSettled([
          axiosInstance.get("/agency"),
          axiosInstance.get("/organisations"),
          axiosInstance.get("/users"),
        ]);

        if (usersRes.status === "fulfilled" && usersRes.value?.data) {
          setUsers(usersRes.value.data);
        }

        if (agencyRes.status === "fulfilled" && agencyRes.value?.data) {
          const agency = agencyRes.value.data;
          setForm((prev) => ({
            ...prev,
            modelName: agency.organizationName || "",
            organisationAddress: agency.organizationAddress || "",
            defaultCurrency: agency.defaultCurrency || "INR",
            maximumUsers: agency.maximumUsers || "",
            defaultTimezone: agency.defaultTimezone || "Asia/Kolkata",
          }));
        }
      } catch (error) {
        console.error("Failed to load settings data:", error);
      }
    }

    loadPage();
  }, []);

  const filteredUsers = useMemo(() => {
    const searchValue = searchTerm.trim().toLowerCase();
    return users.filter((user) => {
      const roleLabel = mapRoleLabel(user.orgRole || user.role);
      const matchesRole =
        selectedRole === "All Roles" ? true : roleLabel === selectedRole;
      const matchesSearch = searchValue
        ? `${user.name} ${user.email}`.toLowerCase().includes(searchValue)
        : true;
      return matchesRole && matchesSearch;
    });
  }, [users, searchTerm, selectedRole]);

  function handleFormChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSaveMessage("");
  }

  function handleLogoChange(event) {
    const file = event.target.files?.[0];
    setForm((prev) => ({ ...prev, logoFileName: file?.name || "" }));
  }

  async function handleSave(event) {
    event.preventDefault();
    try {
      await axiosInstance.put("/agency", {
        organizationName: form.modelName,
        organizationAddress: form.organisationAddress,
        maximumUsers: form.maximumUsers,
        defaultTimezone: form.defaultTimezone,
        defaultCurrency: form.defaultCurrency,
      });
      setSaveMessage("Settings saved successfully.");
    } catch (error) {
      console.error("Failed to save settings:", error);
      setSaveMessage("Failed to save settings.");
    }
  }

  function toggleStatus(userId) {
    setUsers((prev) =>
      prev.map((user) =>
        user._id === userId ? { ...user, status: !user.status } : user,
      ),
    );
  }

  function openAddUserModal() {
    setIsModalOpen(true);
  }

  function closeUserModal() {
    setIsModalOpen(false);
  }

  function openEditModal(user) {
    setSelectedUser(user);
    setEditForm({
      name: user?.name || "",
      email: user?.email || "",
      orgRole: user?.orgRole || "ADMIN",
    });
    setIsEditModalOpen(true);
  }

  function closeEditModal() {
    setIsEditModalOpen(false);
    setSelectedUser(null);
    setEditForm({ name: "", email: "", orgRole: "ADMIN" });
  }

  function handleEditFormChange(event) {
    const { name, value } = event.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleDeleteUser(user) {
    const isConfirmed = window.confirm("Delete this user?");
    if (!isConfirmed) return;
    try {
      await axiosInstance.delete(`/users/${user._id}`);
      setUsers((prev) => prev.filter((item) => item._id !== user._id));
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  }

  async function handleCreateOrganisation(payload) {
    try {
      setIsCreatingOrganisation(true);

      await axiosInstance.post("/organisations", payload);

      const res = await axiosInstance.get("/organisations");
      setOrganisations(res.data);
      window.dispatchEvent(new Event("refreshOrganisations"));
      closeUserModal();
    } catch (error) {
      console.error("Failed to create organisation:", error);
    } finally {
      setIsCreatingOrganisation(false);
    }
  }

  async function handleEditUserSave(event) {
    event.preventDefault();
    if (!selectedUser?._id) return;
    if (!editForm.name.trim() || !editForm.email.trim()) return;

    try {
      setIsEditingUser(true);
      const payload = {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        orgRole: editForm.orgRole,
      };
      const res = await axiosInstance.put(`/users/${selectedUser._id}`, payload);
      const updatedUser = res?.data;

      setUsers((prev) =>
        prev.map((item) =>
          item._id === selectedUser._id
            ? {
                ...item,
                ...payload,
                ...(updatedUser || {}),
              }
            : item,
        ),
      );
      closeEditModal();
    } catch (error) {
      console.error("Failed to update user:", error);
    } finally {
      setIsEditingUser(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-[1240px] space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your workspace configuration and user permissions
        </p>
      </div>

      <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
        <button
          type="button"
          onClick={() => setActiveTab("basic")}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            activeTab === "basic"
              ? "border border-slate-200 bg-white text-slate-900 shadow-sm"
              : "text-slate-600"
          }`}
        >
          Basic Information
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("users")}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            activeTab === "users"
              ? "border border-slate-200 bg-white text-slate-900 shadow-sm"
              : "text-slate-600"
          }`}
        >
          Users
        </button>
      </div>

      {activeTab === "basic" ? (
        <form
          onSubmit={handleSave}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-7"
        >
          <h2 className="text-[34px] font-semibold leading-tight text-slate-900">
            Basic Information
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Update platform details and identification
          </p>
          <div className="mt-5 grid grid-cols-1 gap-x-5 gap-y-6 md:grid-cols-2">
            <div className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Model Name
                </span>
                <input
                  name="modelName"
                  value={form.modelName}
                  onChange={handleFormChange}
                  className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-400"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Organisation Address
                </span>
                <input
                  name="organisationAddress"
                  value={form.organisationAddress}
                  onChange={handleFormChange}
                  className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-400"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Default Currency
                </span>
                <div className="relative">
                  <select
                    name="defaultCurrency"
                    value={form.defaultCurrency}
                    onChange={handleFormChange}
                    className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-700 outline-none transition focus:border-blue-400"
                  >
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <p className="mb-1.5 text-sm font-medium text-slate-700">
                  Brand Logo
                </p>
                <label className="flex min-h-[104px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 text-center transition hover:border-slate-400">
                  <Upload size={16} className="text-slate-500" />
                  <span className="mt-2 text-xs text-slate-500">
                    Upload PNG, JPG or SVG
                  </span>
                  <span className="mt-1 text-sm text-slate-700">
                    Click to upload logo
                    <br />
                    or drag &amp; drop
                  </span>
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.svg"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                </label>
                <p className="mt-1.5 text-xs text-slate-500">
                  {form.logoFileName || "No file selected"}
                </p>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Maximum Users
                </span>
                <input
                  name="maximumUsers"
                  value={form.maximumUsers}
                  onChange={handleFormChange}
                  className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-400"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Default Timezone
                </span>
                <div className="relative">
                  <select
                    name="defaultTimezone"
                    value={form.defaultTimezone}
                    onChange={handleFormChange}
                    className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-700 outline-none transition focus:border-blue-400"
                  >
                    <option value="Asia/Kolkata">IST (Asia/Kolkata)</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">
                      EST (America/New_York)
                    </option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </label>
            </div>
          </div>

          <div className="mt-7 flex items-center gap-3">
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Save Changes
            </button>
            {saveMessage ? (
              <span className="text-sm text-slate-500">{saveMessage}</span>
            ) : null}
          </div>
        </form>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-[30px] sr-only">Users</h2>
              <h3 className="text-[30px] font-semibold leading-tight text-slate-900">
                User Management
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Manage user accounts, roles and permissions
              </p>
            </div>
            <button
              type="button"
              onClick={openAddUserModal}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Create Organisation
            </button>
          </div>

          <div className="mb-5 flex flex-wrap gap-3">
            <div className="relative min-w-[240px] flex-1">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search users..."
                className="h-11 w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-400"
              />
            </div>

            <div className="relative w-full sm:w-44">
              <select
                value={selectedRole}
                onChange={(event) => setSelectedRole(event.target.value)}
                className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-700 outline-none transition focus:border-blue-400"
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Organisation</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user._id}>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="grid h-8 w-8 place-items-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
                            {initialLetter(user.name)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {user.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {user.organisationId?.name || "-"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {user.organisationId?.email || ""}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="inline-flex rounded-full border px-2.5 py-1 text-xs font-medium border-blue-200 bg-blue-50 text-blue-700">
                          {mapRoleLabel(user.orgRole)}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleStatus(user._id)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                              user.status ? "bg-blue-600" : "bg-slate-300"
                            }`}
                          >
                            <span
                              className={`h-4 w-4 transform rounded-full bg-white transition ${
                                user.status ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                          <span className="text-xs text-slate-600">
                            {user.status ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-slate-700">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "-"}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(user)}
                            className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
                            aria-label="edit user"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user)}
                            className="rounded-lg border border-slate-200 p-2 text-rose-400 transition hover:bg-rose-50"
                            aria-label="delete user"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-6">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <SystemAdminUserModal
        isOpen={isModalOpen}
        onClose={closeUserModal}
        onSubmit={handleCreateOrganisation}
        isLoading={isCreatingOrganisation}
      />

      {isEditModalOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/35 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Edit User</h3>
            <p className="mt-1 text-sm text-slate-500">
              Update user details and organisation role
            </p>
            <form onSubmit={handleEditUserSave} className="mt-5 space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-600">Name</span>
                <input
                  name="name"
                  value={editForm.name}
                  onChange={handleEditFormChange}
                  required
                  className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-400"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-600">Email</span>
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleEditFormChange}
                  required
                  className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-400"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-600">Role</span>
                <select
                  name="orgRole"
                  value={editForm.orgRole}
                  onChange={handleEditFormChange}
                  className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-400"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="MANAGE">Manage</option>
                  <option value="READ_ONLY">Read-Only</option>
                </select>
              </label>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditingUser}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isEditingUser ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default SystemAdminSettings;
