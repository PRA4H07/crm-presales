import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

const roleOptions = [
  "Pre-Sales Manager",
  "Sales Representative",
  "Account Executive",
  "Customer Success",
  "Operations",
];

const reportToOptions = [
  "",
  "Regional Director",
  "Head of Sales",
  "Operations Lead",
];

function roleBadge(roleValue) {
  const normalized = String(roleValue).toLowerCase();
  if (normalized === "admin") {
    return (
      <span className="inline-block rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
        Admin
      </span>
    );
  }
  if (normalized === "system_admin") {
    return (
      <span className="inline-block rounded-md bg-amber-100 px-2 py-1 text-xs font-medium text-amber-900">
        System Admin
      </span>
    );
  }
  if (normalized === "employee") {
    return (
      <span className="inline-block rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
        Employee
      </span>
    );
  }
  return (
    <span className="inline-block rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
      {String(roleValue)}
    </span>
  );
}

function SettingsPage() {
  const { user } = useAuth();
  const canManageUsers =
    user?.role === "admin" || user?.role === "system_admin";

  const [activeMainTab, setActiveMainTab] = useState("agency");
  const [activeAgencyTab, setActiveAgencyTab] = useState("overview");

  const [basicForm, setBasicForm] = useState({
    organizationName: "",
    organizationCode: "",
    organizationAddress: "",
    maximumUsers: "",
  });
  const [basicSaveMessage, setBasicSaveMessage] = useState("");

  const [users, setUsers] = useState([]);

  useEffect(() => {
  async function init() {
    try {
      if (user?.role === "ADMIN" || user?.role === "SYSTEM_ADMIN") {
        const userRes = await axiosInstance.get("/users?role=EMPLOYEE");
        setUsers(userRes.data);
      }

      const agencyRes = await axiosInstance.get("/agency");

      if (agencyRes.data) {
        setBasicForm({
          organizationName: agencyRes.data.organizationName || "",
          organizationCode: agencyRes.data.organizationCode || "",
          organizationAddress: agencyRes.data.organizationAddress || "",
          maximumUsers: agencyRes.data.maximumUsers || "",
        });
      }
    } catch (err) {
      console.error("Error loading data:", err);
    }
  }

  init();
}, [user]);

  const [showModal, setShowModal] = useState(false);
  const [modalForm, setModalForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    reportTo: "",
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [editUserId, setEditUserId] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [integrationForm, setIntegrationForm] = useState({
    displayName: "",
    emailAddress: "",
    password: "",
    provider: "",
  });

  function handleBasicChange(event) {
    const { name, value } = event.target;
    setBasicForm((prev) => ({ ...prev, [name]: value }));
    setBasicSaveMessage("");
  }

  async function handleBasicSave(event) {
  event.preventDefault();

  try {
    console.log("SENDING DATA:", basicForm);
    await axiosInstance.put("/agency", basicForm);

    setBasicSaveMessage("Agency settings saved successfully.");
  } catch (err) {
    console.error("Error saving agency:", err);
    setBasicSaveMessage("Failed to save agency settings.");
  }
}

  function handleModalChange(event) {
    const { name, value } = event.target;
    setModalForm((prev) => ({ ...prev, [name]: value }));
  }

  function openModal() {
    setIsEditMode(false);
    setEditUserId(null);

    setModalForm({
      firstName: "",
      lastName: "",
      email: "",
      role: "",
      reportTo: "",
    });

    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
  }

  async function handleCreateUser(event) {
    event.preventDefault();

    const name =
      `${modalForm.firstName.trim()} ${modalForm.lastName.trim()}`.trim();
    const email = modalForm.email.trim();

    if (!name || !email) return;

    try {
      setIsLoading(true);
      setSuccessMessage("");

      if (isEditMode) {
        await axiosInstance.put(`/users/${editUserId}`, {
          name,
          email,
          role: "EMPLOYEE",
          designation: modalForm.role,
        });
      } else {
        await axiosInstance.post("/users", {
          name,
          email,
          role: "EMPLOYEE",
          designation: modalForm.role,
        });
      }

      const res = await axiosInstance.get("/users?role=EMPLOYEE");
      setUsers(res.data);

      setSuccessMessage(
        isEditMode
          ? "User updated successfully!"
          : "User created successfully!",
      );

      setTimeout(() => {
        setIsEditMode(false);
        setEditUserId(null);
        setSuccessMessage("");
        closeModal();
      }, 1200);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteUser(id) {
    try {
      await axiosInstance.delete(`/users/${id}`);

      setUsers((prev) => prev.filter((user) => user._id !== id));
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  }

  function handleIntegrationChange(event) {
    const { name, value } = event.target;
    setIntegrationForm((prev) => ({ ...prev, [name]: value }));
  }

  function setProvider(provider) {
    setIntegrationForm((prev) => ({ ...prev, provider }));
  }

  if (!user) {
    return (
      <section className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:shadow-md">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Settings
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Sign in to see your settings.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your workspace and users
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
        <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-100 pb-4">
          <button
            type="button"
            onClick={() => setActiveMainTab("agency")}
            className={`rounded-full px-5 py-2 text-sm font-medium transition ${
              activeMainTab === "agency"
                ? "bg-blue-100 font-bold text-blue-700 shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Agency
          </button>
          <button
            type="button"
            onClick={() => setActiveMainTab("integrations")}
            className={`rounded-full px-5 py-2 text-sm font-medium transition ${
              activeMainTab === "integrations"
                ? "bg-blue-100 font-bold text-blue-700 shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Integrations
          </button>
        </div>

        {activeMainTab === "agency" ? (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveAgencyTab("overview")}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  activeAgencyTab === "overview"
                    ? "bg-slate-200 font-bold text-slate-900"
                    : "bg-slate-50 font-medium text-slate-600 hover:bg-slate-100"
                }`}
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => setActiveAgencyTab("agency")}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  activeAgencyTab === "agency"
                    ? "bg-slate-200 font-bold text-slate-900"
                    : "bg-slate-50 font-medium text-slate-600 hover:bg-slate-100"
                }`}
              >
                Agency Settings
              </button>
              <button
                type="button"
                onClick={() => setActiveAgencyTab("users")}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  activeAgencyTab === "users"
                    ? "bg-slate-200 font-bold text-slate-900"
                    : "bg-slate-50 font-medium text-slate-600 hover:bg-slate-100"
                }`}
              >
                Users
              </button>
            </div>

            {activeAgencyTab === "overview" ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-5">
                <div className="max-w-3xl space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <span className="text-sm font-medium text-slate-700">
                        Organization Name
                      </span>
                      <p className="text-sm text-slate-900">
                        {basicForm.organizationName || "—"}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-sm font-medium text-slate-700">
                        Organization Code
                      </span>
                      <p className="text-sm text-slate-900">
                        {basicForm.organizationCode || "—"}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-sm font-medium text-slate-700">
                        Organization Address
                      </span>
                      <p className="text-sm text-slate-900">
                        {basicForm.organizationAddress || "—"}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-sm font-medium text-slate-700">
                        Maximum Users
                      </span>
                      <p className="text-sm text-slate-900">
                        {basicForm.maximumUsers || "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {activeAgencyTab === "agency" ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-5">
                <form
                  onSubmit={handleBasicSave}
                  className="max-w-3xl space-y-4"
                >
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      Agency Management
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Update your organization details to keep agency
                      information accurate and up to date.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="block space-y-1.5">
                      <span className="text-sm font-medium text-slate-700">
                        Organization Name
                      </span>
                      <input
                        type="text"
                        name="organizationName"
                        value={basicForm.organizationName}
                        onChange={handleBasicChange}
                        className="crm-focus-ring h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none"
                      />
                    </label>
                    <label className="block space-y-1.5">
                      <span className="text-sm font-medium text-slate-700">
                        Organization Code
                      </span>
                      <input
                        type="text"
                        name="organizationCode"
                        value={basicForm.organizationCode}
                        onChange={handleBasicChange}
                        className="crm-focus-ring h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none"
                      />
                    </label>
                    <label className="block space-y-1.5">
                      <span className="text-sm font-medium text-slate-700">
                        Organization Address
                      </span>
                      <input
                        type="text"
                        name="organizationAddress"
                        value={basicForm.organizationAddress}
                        onChange={handleBasicChange}
                        className="crm-focus-ring h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none"
                      />
                    </label>
                    <label className="block space-y-1.5">
                      <span className="text-sm font-medium text-slate-700">
                        Maximum Users
                      </span>
                      <input
                        type="text"
                        name="maximumUsers"
                        value={basicForm.maximumUsers}
                        onChange={handleBasicChange}
                        className="crm-focus-ring h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none"
                      />
                    </label>
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="submit"
                      className="crm-gradient-bg crm-gradient-bg-hover rounded-xl px-5 py-2 text-sm font-medium text-white"
                    >
                      Save
                    </button>
                    {basicSaveMessage ? (
                      <span className="text-sm font-medium text-emerald-600">
                        {basicSaveMessage}
                      </span>
                    ) : null}
                  </div>
                </form>
              </div>
            ) : null}

            {activeAgencyTab === "users" && canManageUsers ? (
              <div className="space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      User Management
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Invite users and manage access to your CRM
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={openModal}
                    className="crm-gradient-bg crm-gradient-bg-hover shrink-0 rounded-xl px-4 py-2 text-sm font-medium text-white"
                  >
                    Add User
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
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
                          Role
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Status
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Created
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-4 py-12 text-center text-sm text-slate-500"
                          >
                            No users added yet
                          </td>
                        </tr>
                      ) : (
                        users.map((row) => (
                          <tr
                            key={row._id}
                            className="border-b border-slate-100 last:border-0"
                          >
                            <td className="px-4 py-4 font-medium text-slate-900">
                              {row.name}
                            </td>
                            <td className="px-4 py-4 text-slate-600">
                              {row.email}
                            </td>
                            <td className="px-4 py-4">
                              {row.designation || roleBadge(row.role)}
                            </td>
                            <td className="px-4 py-4 text-slate-700">
                              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                {row.status || "Active"}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-slate-500">
                              {row.createdAt
                                ? new Date(row.createdAt).toLocaleDateString()
                                : "—"}
                            </td>
                            <td className="px-4 py-4 text-right">
                              <div className="flex flex-wrap justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsEditMode(true);
                                    setEditUserId(row._id);

                                    const [firstName, ...rest] =
                                      row.name.split(" ");

                                    setModalForm({
                                      firstName: firstName || "",
                                      lastName: rest.join(" ") || "",
                                      email: row.email,
                                      role: row.role,
                                      reportTo: "",
                                    });

                                    setShowModal(true);
                                  }}
                                  className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteUser(row._id)}
                                  className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            {activeAgencyTab === "users" && !canManageUsers ? (
              <p className="text-sm text-slate-600">
                You do not have access to user management.
              </p>
            ) : null}
          </div>
        ) : null}

        {activeMainTab === "integrations" ? (
          <div className="max-w-lg space-y-4 rounded-xl border border-slate-200 bg-slate-50/40 p-5">
            <h2 className="text-base font-semibold text-slate-900">
              Email Configuration
            </h2>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-slate-700">
                Display Name
              </span>
              <input
                name="displayName"
                value={integrationForm.displayName}
                onChange={handleIntegrationChange}
                className="crm-focus-ring h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-slate-700">
                Email Address
              </span>
              <input
                name="emailAddress"
                type="email"
                value={integrationForm.emailAddress}
                onChange={handleIntegrationChange}
                className="crm-focus-ring h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-slate-700">
                Password
              </span>
              <input
                name="password"
                type="password"
                value={integrationForm.password}
                onChange={handleIntegrationChange}
                className="crm-focus-ring h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none"
              />
            </label>
            <div className="space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Provider
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setProvider("gmail")}
                  className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                    integrationForm.provider === "gmail"
                      ? "border-blue-300 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Gmail
                </button>
                <button
                  type="button"
                  onClick={() => setProvider("outlook")}
                  className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                    integrationForm.provider === "outlook"
                      ? "border-blue-300 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Outlook
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              For Gmail, you may need to enable &quot;Less secure app
              access&quot; or use an app password in your Google account
              security settings.
            </p>
          </div>
        ) : null}
      </div>

      {showModal && canManageUsers ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-slate-900/35 p-4">
          <form
            onSubmit={handleCreateUser}
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                {isEditMode ? "Edit User" : "Add User"}
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
                <span className="text-xs font-medium text-slate-600">
                  First Name
                </span>
                <input
                  name="firstName"
                  value={modalForm.firstName}
                  onChange={handleModalChange}
                  className="crm-focus-ring h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-medium text-slate-600">
                  Last Name
                </span>
                <input
                  name="lastName"
                  value={modalForm.lastName}
                  onChange={handleModalChange}
                  className="crm-focus-ring h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-medium text-slate-600">
                  Email
                </span>
                <input
                  name="email"
                  type="email"
                  value={modalForm.email}
                  onChange={handleModalChange}
                  className="crm-focus-ring h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-medium text-slate-600">Role</span>
                <select
                  name="role"
                  value={modalForm.role}
                  onChange={handleModalChange}
                  className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none"
                >
                  <option value="">Select role</option>
                  {roleOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-medium text-slate-600">
                  Report To (optional)
                </span>
                <select
                  name="reportTo"
                  value={modalForm.reportTo}
                  onChange={handleModalChange}
                  className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none"
                >
                  <option value="">None</option>
                  {reportToOptions.filter(Boolean).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {successMessage && (
              <p className="text-sm text-green-600 font-medium mb-2">
                {successMessage}
              </p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="crm-gradient-bg crm-gradient-bg-hover rounded-xl px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {isLoading
                  ? "Processing..."
                  : isEditMode
                    ? "Update User"
                    : "Create User"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  );
}

export default SettingsPage;
