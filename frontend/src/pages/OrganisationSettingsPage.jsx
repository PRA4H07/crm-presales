import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { agencyService } from "../services/agencyService";
import OrganisationUsersTable from "./organisations/OrganisationUsersTable";
import {
  PLAN_OPTIONS,
  getOrgPlan,
  normalizeAgencies,
  saveOrgPlan,
} from "./organisations/organisationUtils";

function OrganisationSettingsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState({
    organizationName: "",
    organizationCode: "",
    maximumUsers: "",
    organizationAddress: "",
  });
  const [selectedPlan, setSelectedPlan] = useState(PLAN_OPTIONS[0]);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    async function loadOrganisation() {
      try {
        const payload = await agencyService.getAgency();
        const organisations = normalizeAgencies(payload);
        const selectedOrg = organisations.find((org) => String(org.id) === String(id)) || organisations[0];

        if (!selectedOrg) {
          return;
        }

        setFormData({
          organizationName: selectedOrg.name || "",
          organizationCode: selectedOrg.code || "",
          maximumUsers: selectedOrg.maxUsers === "N/A" ? "" : selectedOrg.maxUsers,
          organizationAddress: selectedOrg.address === "N/A" ? "" : selectedOrg.address,
        });
        setSelectedPlan(getOrgPlan(selectedOrg.id));
      } catch (error) {
        console.error("Failed to load organisation settings:", error);
      }
    }

    loadOrganisation();
  }, [id]);

  function handleFormChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setStatusMessage("");
  }

  async function handleSaveBasic(event) {
    event.preventDefault();
    try {
      await agencyService.updateAgency({
        organizationName: formData.organizationName,
        organizationCode: formData.organizationCode,
        maximumUsers: formData.maximumUsers,
        organizationAddress: formData.organizationAddress,
      });
      setStatusMessage("Organisation settings saved.");
    } catch (error) {
      console.error("Failed to save settings:", error);
      setStatusMessage("Unable to save organisation settings.");
    }
  }

  function handleSelectPlan(plan) {
    setSelectedPlan(plan);
    saveOrgPlan(id, plan);
    setStatusMessage("Subscription plan saved locally.");
  }

  return (
    <section className="space-y-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="text-sm font-medium text-slate-600 transition hover:text-slate-800"
      >
        ← Back
      </button>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Organisation Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage organisation details, subscription, and users</p>
      </div>

      <div className="crm-card space-y-5">
        <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-4">
          <button
            type="button"
            onClick={() => setActiveTab("basic")}
            className={`crm-tab-btn ${
              activeTab === "basic"
                ? "bg-blue-100 font-semibold text-blue-700"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Basic
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("subscription")}
            className={`crm-tab-btn ${
              activeTab === "subscription"
                ? "bg-blue-100 font-semibold text-blue-700"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Subscription
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={`crm-tab-btn ${
              activeTab === "users"
                ? "bg-blue-100 font-semibold text-blue-700"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Users
          </button>
        </div>

        {activeTab === "basic" ? (
          <form onSubmit={handleSaveBasic} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-slate-700">Organisation Name</span>
                <input
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleFormChange}
                  className="crm-focus-ring h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-slate-700">Organisation Code</span>
                <input
                  name="organizationCode"
                  value={formData.organizationCode}
                  onChange={handleFormChange}
                  className="crm-focus-ring h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-slate-700">Maximum Users</span>
                <input
                  name="maximumUsers"
                  value={formData.maximumUsers}
                  onChange={handleFormChange}
                  className="crm-focus-ring h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-slate-700">Organisation Address</span>
                <input
                  name="organizationAddress"
                  value={formData.organizationAddress}
                  onChange={handleFormChange}
                  className="crm-focus-ring h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none"
                />
              </label>
            </div>
            <button type="submit" className="crm-primary-btn">
              Save Basic Settings
            </button>
          </form>
        ) : null}

        {activeTab === "subscription" ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {PLAN_OPTIONS.map((plan) => {
              const isActive = selectedPlan === plan;
              const isPremium = plan === "Premium";
              return (
                <button
                  key={plan}
                  type="button"
                  onClick={() => handleSelectPlan(plan)}
                  className={`rounded-2xl border p-5 text-left transition duration-200 ${
                    isPremium
                      ? "md:scale-[1.02]"
                      : ""
                  } ${
                    isActive && !isPremium
                      ? "border-blue-300 bg-blue-50 shadow-sm"
                      : isActive && isPremium
                        ? "border-purple-300 bg-gradient-to-r from-purple-100 to-indigo-100 shadow-md"
                        : isPremium
                          ? "border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 hover:shadow-md"
                          : "border-blue-200 bg-blue-50/60 hover:shadow-sm"
                  }`}
                >
                  <p className="text-xs uppercase tracking-wide text-slate-500">Plan</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">{plan}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {plan === "Premium"
                      ? "Advanced controls and team scale support."
                      : "Core CRM features for small teams."}
                  </p>
                  {isActive ? (
                    <span className="mt-3 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                      Current Plan
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : null}

        {activeTab === "users" ? <OrganisationUsersTable /> : null}

        {statusMessage ? <p className="text-sm font-medium text-emerald-600">{statusMessage}</p> : null}
      </div>
    </section>
  );
}

export default OrganisationSettingsPage;
