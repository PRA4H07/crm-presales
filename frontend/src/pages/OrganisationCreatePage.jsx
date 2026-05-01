import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { agencyService } from "../services/agencyService";
import { PLAN_OPTIONS, saveOrgPlan } from "./organisations/organisationUtils";

function OrganisationCreatePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    organizationName: "",
    organizationCode: "",
    maximumUsers: "",
    organizationAddress: "",
    subscriptionPlan: PLAN_OPTIONS[0],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const payload = {
        organizationName: formData.organizationName.trim(),
        organizationCode: formData.organizationCode.trim(),
        maximumUsers: formData.maximumUsers,
        organizationAddress: formData.organizationAddress.trim(),
      };

      const savedAgency = await agencyService.updateAgency(payload);
      const localOrg = {
        _id: String(savedAgency?._id || savedAgency?.id || "1"),
        organizationName: payload.organizationName,
        organizationCode: payload.organizationCode,
        organizationAddress: payload.organizationAddress,
        maximumUsers: payload.maximumUsers,
        plan: formData.subscriptionPlan,
      };
      window.localStorage.setItem("org", JSON.stringify(localOrg));
      const persistedId = String(savedAgency?._id || savedAgency?.id || "default");
      saveOrgPlan(persistedId, formData.subscriptionPlan);
      navigate("/organisations");
    } catch (err) {
      console.error("Failed to create organisation:", err);
      console.log(err?.response?.data);
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to create organisation right now.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="space-y-6">
      <button
        type="button"
        onClick={() => navigate("/organisations")}
        className="text-sm font-medium text-slate-600 transition hover:text-slate-800"
      >
        ← Back
      </button>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Add Organisation</h1>
        <p className="mt-1 text-sm text-slate-500">Create a new organisation profile for your CRM workspace</p>
      </div>

      <div className="crm-card">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-slate-700">Organisation Name</span>
              <input
                required
                type="text"
                name="organizationName"
                value={formData.organizationName}
                onChange={handleChange}
                className="crm-focus-ring h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-slate-700">Organisation Code</span>
              <input
                required
                type="text"
                name="organizationCode"
                value={formData.organizationCode}
                onChange={handleChange}
                className="crm-focus-ring h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-slate-700">Maximum Users</span>
              <input
                required
                type="number"
                min="1"
                name="maximumUsers"
                value={formData.maximumUsers}
                onChange={handleChange}
                className="crm-focus-ring h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-slate-700">Organisation Address</span>
              <input
                required
                type="text"
                name="organizationAddress"
                value={formData.organizationAddress}
                onChange={handleChange}
                className="crm-focus-ring h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none"
              />
            </label>

            <label className="block space-y-1.5 md:col-span-2">
              <span className="text-sm font-medium text-slate-700">Subscription Plan</span>
              <select
                name="subscriptionPlan"
                value={formData.subscriptionPlan}
                onChange={handleChange}
                className="crm-focus-ring h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none"
              >
                {PLAN_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}

          <div>
            <button type="submit" disabled={isSaving} className="crm-primary-btn disabled:opacity-60">
              {isSaving ? "Creating..." : "Create Organisation"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default OrganisationCreatePage;
