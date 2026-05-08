import { useEffect, useState } from "react";
import { X } from "lucide-react";

function initialForm() {
  return {
    name: "",
    email: "",
    plan: "Trial",
    maxUsers: "",
    adminName: "",
    adminEmail: "",
    role: "ADMIN",
    dbType: "internal",
    mongoUri: "",
    dbName: "",
  };
}

function SystemAdminUserModal({ isOpen, onClose, onSubmit, isLoading }) {
  const [form, setForm] = useState(initialForm());
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setForm(initialForm());
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    const requiredFieldsFilled =
      form.name.trim() &&
      form.email.trim() &&
      form.adminName.trim() &&
      form.adminEmail.trim();

    if (!requiredFieldsFilled) {
      setError("Please fill all required fields.");
      return;
    }

    if (
      form.dbType === "external" &&
      (!form.mongoUri.trim() || !form.dbName.trim())
    ) {
      setError("Mongo URI and DB Name are required for external DB.");
      return;
    }

    onSubmit({
      name: form.name.trim(),
      email: form.email.trim(),
      plan: form.plan,
      maxUsers: form.maxUsers ? Number(form.maxUsers) : 0,
      dbType: form.dbType,
      mongoUri: form.dbType === "external" ? form.mongoUri.trim() : "",
      dbName: form.dbType === "external" ? form.dbName.trim() : "",
      adminName: form.adminName.trim(),
      adminEmail: form.adminEmail.trim(),
      role: form.role,
    });
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/35 p-4">
      <div className="mx-auto my-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            Create Organisation
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
            aria-label="close modal"
          >
            <X size={16} />
          </button>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Create a new organisation and primary admin account
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          <div className="rounded-xl border border-slate-200 p-4">
            <h4 className="text-sm font-semibold text-slate-900">
              Organisation Details
            </h4>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="text-sm font-medium text-slate-600">
                  Organisation Name *
                </span>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-400"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-sm font-medium text-slate-600">
                  Organisation Email *
                </span>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-400"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-600">Plan</span>
                <select
                  name="plan"
                  value={form.plan}
                  onChange={handleChange}
                  className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-400"
                >
                  <option value="Trial">Trial</option>
                  <option value="Basic">Basic</option>
                  <option value="Premium">Premium</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-600">
                  Max Users
                </span>
                <input
                  type="number"
                  min="0"
                  name="maxUsers"
                  value={form.maxUsers}
                  onChange={handleChange}
                  className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-400"
                />
              </label>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <h4 className="text-sm font-semibold text-slate-900">
              Admin Details
            </h4>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-600">
                  Admin Name *
                </span>
                <input
                  name="adminName"
                  value={form.adminName}
                  onChange={handleChange}
                  className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-400"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-600">
                  Admin Email *
                </span>
                <input
                  type="email"
                  name="adminEmail"
                  value={form.adminEmail}
                  onChange={handleChange}
                  className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-400"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Role *
                </span>
                <input
                  name="role"
                  value="Admin"
                  readOnly
                  disabled
                  className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-400"
                />
              </label>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <h4 className="text-sm font-semibold text-slate-900">
              Backend Config (optional)
            </h4>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="text-sm font-medium text-slate-600">
                  DB Type
                </span>
                <select
                  name="dbType"
                  value={form.dbType}
                  onChange={handleChange}
                  className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-400"
                >
                  <option value="internal">internal</option>
                  <option value="external">external</option>
                </select>
              </label>

              {form.dbType === "external" ? (
                <>
                  <label className="block sm:col-span-2">
                    <span className="text-sm font-medium text-slate-600">
                      Mongo URI
                    </span>
                    <input
                      name="mongoUri"
                      value={form.mongoUri}
                      onChange={handleChange}
                      className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-400"
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="text-sm font-medium text-slate-600">
                      DB Name
                    </span>
                    <input
                      name="dbName"
                      value={form.dbName}
                      onChange={handleChange}
                      className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-400"
                    />
                  </label>
                </>
              ) : null}
            </div>
          </div>

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Creating..." : "Create Organisation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SystemAdminUserModal;
