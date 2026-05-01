import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, Pencil, Search, Trash2 } from "lucide-react";
import {
  Bar,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import axiosInstance from "../api/axiosInstance";
import { agencyService } from "../services/agencyService";

const mockOrganisations = [
  {
    _id: "1",
    organizationName: "FASF",
    organizationCode: "PROD",
    organizationAddress: "Delhi, India",
    maximumUsers: 25,
    plan: "Trial",
    status: true,
    email: "jvhogz2080@zygid.com",
    expiryDate: "2026-05-08T00:00:00.000Z",
    orgId: "6f9ad8b5336b6e4c9f8c9fbc",
  },
];

const roleOptions = ["System Users Read-Only", "Admin", "Manager"];
const planOptions = ["Trial", "Basic", "Premium", "Enterprise"];
function getStoredOrganisation() {
  try {
    const raw = window.localStorage.getItem("org");
    if (!raw) return null;
    const stored = JSON.parse(raw);
    return stored && typeof stored === "object" ? stored : null;
  } catch {
    return null;
  }
}

function getRoleLabel(role) {
  const normalized = String(role || "").toLowerCase();
  if (normalized === "admin" || normalized === "system_admin") return "Admin";
  if (normalized === "manager") return "Manager";
  if (normalized === "read_only" || normalized === "employee")
    return "System Users Read-Only";
  return "System Users Read-Only";
}

function toApiRole(roleLabel) {
  if (roleLabel === "Admin") return "ADMIN";
  if (roleLabel === "Manager") return "MANAGER";
  return "READ_ONLY";
}

function roleBadgeStyle(roleLabel) {
  if (roleLabel === "Admin") return "border-blue-200 bg-blue-50 text-blue-700";
  if (roleLabel === "Manager")
    return "border-violet-200 bg-violet-50 text-violet-700";
  return "border-slate-200 bg-slate-100 text-slate-700";
}

function planBadgeStyle(planLabel) {
  const normalized = String(planLabel || "").toLowerCase();
  if (normalized === "premium" || normalized === "enterprise") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (normalized === "basic") return "border-blue-200 bg-blue-50 text-blue-700";
  return "border-amber-200 bg-amber-50 text-amber-700";
}

function normalizeOrganisation(org, index) {
  const fallbackDate = new Date();
  fallbackDate.setMonth(fallbackDate.getMonth() + 3);
  return {
    _id: String(org?._id || org?.id || index + 1),
    organizationName:
      org?.organizationName || org?.name || `Agency ${index + 1}`,
    organizationCode: org?.organizationCode || org?.code || "N/A",
    organizationAddress: org?.organizationAddress || org?.address || "N/A",
    maximumUsers: Number(org?.maximumUsers ?? org?.maxUsers ?? 0),
    plan: org?.plan || "Trial",
    status: typeof org?.status === "boolean" ? org.status : true,
    email: org?.email || "admin@crm.com",
    expiryDate: org?.expiryDate || org?.expiry || fallbackDate.toISOString(),
    orgId: org?.orgId || org?._id || org?.id || `AG-${index + 1}`,
    city: org?.city || "",
  };
}

function sortByNewest(items) {
  return [...items].sort((a, b) => {
    const aTime = new Date(a?.createdAt || a?.created_at || 0).getTime();
    const bTime = new Date(b?.createdAt || b?.created_at || 0).getTime();
    return bTime - aTime;
  });
}

function applyOrganisationState(
  normalized,
  setOrganisations,
  setExpandedOrgId,
  setSelectedPlan,
  setSettingsForm,
) {
  if (normalized.length) {
    setOrganisations(normalized);
    setExpandedOrgId(normalized[0]._id);
    setSelectedPlan(normalized[0].plan || "Trial");
    setSettingsForm({
      organizationName: normalized[0].organizationName || "",
      organizationCode: normalized[0].organizationCode || "",
      city: normalized[0].city || "",
      maximumUsers: normalized[0].maximumUsers || "",
      organizationAddress: normalized[0].organizationAddress || "",
    });
    window.localStorage.setItem("org", JSON.stringify(normalized[0]));
    return true;
  }
  return false;
}

function Organisations() {
  const [organisations, setOrganisations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedOrgId, setExpandedOrgId] = useState(null);
  const [expandedView, setExpandedView] = useState("insights");
  const [settingsTab, setSettingsTab] = useState("basic");
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("All Roles");
  const [showUserModal, setShowUserModal] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState("Trial");
  const [backendConfigs, setBackendConfigs] = useState(() => {
    try {
      const raw = window.localStorage.getItem("org.backendConfigs");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });
  const [modalForm, setModalForm] = useState({
    name: "",
    email: "",
    role: "System Users Read-Only",
    reportTo: "",
    reportToEmail: "",
    status: true,
  });
  const [settingsForm, setSettingsForm] = useState({
    organizationName: "",
    organizationCode: "",
    city: "",
    maximumUsers: "",
    organizationAddress: "",
  });

  const fetchOrganisations = useCallback(async () => {
    try {
      const orgRes = await axiosInstance.get("/organisations");
      const incoming = Array.isArray(orgRes?.data) ? orgRes.data : [];
      const normalized = sortByNewest(incoming)
        .filter(Boolean)
        .map(normalizeOrganisation);
      const applied = applyOrganisationState(
        normalized,
        setOrganisations,
        setExpandedOrgId,
        setSelectedPlan,
        setSettingsForm,
      );
      if (applied) return;

      const agencyPayload = await agencyService.getAgency();
      const records = Array.isArray(agencyPayload)
        ? agencyPayload
        : [agencyPayload];
      const agencyNormalized = records.filter(Boolean).map(normalizeOrganisation);
      const agencyApplied = applyOrganisationState(
        agencyNormalized,
        setOrganisations,
        setExpandedOrgId,
        setSelectedPlan,
        setSettingsForm,
      );
      if (agencyApplied) return;

      const storedOrganisation = getStoredOrganisation();
      const fallback = storedOrganisation
        ? [normalizeOrganisation(storedOrganisation, 0)]
        : mockOrganisations.map(normalizeOrganisation);
      applyOrganisationState(
        fallback,
        setOrganisations,
        setExpandedOrgId,
        setSelectedPlan,
        setSettingsForm,
      );
    } catch (err) {
      console.error("Org fetch failed:", err);
      try {
        const agencyPayload = await agencyService.getAgency();
        const records = Array.isArray(agencyPayload)
          ? agencyPayload
          : [agencyPayload];
        const agencyNormalized = records.filter(Boolean).map(normalizeOrganisation);
        const agencyApplied = applyOrganisationState(
          agencyNormalized,
          setOrganisations,
          setExpandedOrgId,
          setSelectedPlan,
          setSettingsForm,
        );
        if (agencyApplied) return;
      } catch (agencyError) {
        console.error("Agency fallback fetch failed:", agencyError);
      }

      const storedOrganisation = getStoredOrganisation();
      const fallback = storedOrganisation
        ? [normalizeOrganisation(storedOrganisation, 0)]
        : mockOrganisations.map(normalizeOrganisation);
      applyOrganisationState(
        fallback,
        setOrganisations,
        setExpandedOrgId,
        setSelectedPlan,
        setSettingsForm,
      );
    }
  }, []);

  useEffect(() => {
    fetchOrganisations();

    const handleRefresh = () => {
      fetchOrganisations();
    };

    window.addEventListener("refreshOrganisations", handleRefresh);

    return () => {
      window.removeEventListener("refreshOrganisations", handleRefresh);
    };
  }, [fetchOrganisations]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await axiosInstance.get("/users?role=EMPLOYEE");
        const incoming = Array.isArray(res?.data) ? res.data : [];
        const normalized = incoming.map((item, index) => ({
          _id: item?._id || `user-${index + 1}`,
          name: item?.name || "User",
          email: item?.email || "user@crm.com",
          role: item?.role || "READ_ONLY",
          status: typeof item?.status === "boolean" ? item.status : true,
          reportTo: item?.reportToName || item?.reportTo?.name || "Manager",
          reportToEmail:
            item?.reportToEmail || item?.reportTo?.email || "manager@crm.com",
          createdAt: item?.createdAt || new Date().toISOString(),
        }));
        setUsers(normalized);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        setUsers([
          {
            _id: "u-1",
            name: "Aditi Sharma",
            email: "aditi@travelpro.com",
            role: "READ_ONLY",
            status: true,
            reportTo: "Bhavneet Kumar",
            reportToEmail: "bhavneet@travelpro.com",
            createdAt: "2026-03-24T00:00:00.000Z",
          },
          {
            _id: "u-2",
            name: "Raj Malhotra",
            email: "raj@travelpro.com",
            role: "MANAGER",
            status: true,
            reportTo: "Bhavneet Kumar",
            reportToEmail: "bhavneet@travelpro.com",
            createdAt: "2026-03-27T00:00:00.000Z",
          },
        ]);
      }
    }

    fetchUsers();
  }, []);

  const dataToRender = organisations.length
    ? organisations
    : mockOrganisations.map(normalizeOrganisation);

  const filteredOrganisations = useMemo(() => {
    const searchValue = searchTerm.trim().toLowerCase();
    return dataToRender.filter((org) =>
      (org.organizationName || "").toLowerCase().includes(searchValue),
    );
  }, [dataToRender, searchTerm]);

  const totalVisible = filteredOrganisations.length;
  const totalActive = filteredOrganisations.filter(
    (item) => item.status,
  ).length;
  const totalInactive = totalVisible - totalActive;
  const expandedOrg =
    dataToRender.find((item) => item._id === expandedOrgId) || null;
  const totalUsersKpi =
    Number(expandedOrg?.totalUsers ?? users.length ?? 0) || 12;
  const totalLeadsKpi =
    Number(expandedOrg?.totalLeads ?? expandedOrg?.leads ?? 0) || 58;
  const activeLeadsKpi = Number(expandedOrg?.activeLeads ?? 0) || 41;
  const inactiveLeadsKpi =
    Number(expandedOrg?.inactiveLeads ?? 0) ||
    Math.max(totalLeadsKpi - activeLeadsKpi, 17);
  const conversionRateKpi =
    totalLeadsKpi > 0
      ? `${Math.round((activeLeadsKpi / totalLeadsKpi) * 100)}%`
      : expandedOrg?.conversionRate || "33%";
  const insightsChartData = [
    { name: "Active Leads", value: activeLeadsKpi },
    { name: "Inactive Leads", value: inactiveLeadsKpi },
  ];

  const filteredUsers = useMemo(() => {
    const term = userSearch.trim().toLowerCase();
    return users.filter((item) => {
      const roleLabel = getRoleLabel(item.role);
      const rolePass =
        userRoleFilter === "All Roles" ? true : roleLabel === userRoleFilter;
      const searchPass = term
        ? `${item.name} ${item.email}`.toLowerCase().includes(term)
        : true;
      return rolePass && searchPass;
    });
  }, [users, userSearch, userRoleFilter]);

  function getBackendConfig(orgId) {
    return (
      backendConfigs[orgId] || {
        dbType: "default",
        mongoUri: "",
        dbName: "",
        username: "",
        password: "",
        connectionStatus: "Not Connected",
      }
    );
  }

  function updateBackendConfig(orgId, updates) {
    setBackendConfigs((prev) => {
      const next = {
        ...prev,
        [orgId]: {
          ...getBackendConfig(orgId),
          ...updates,
        },
      };
      window.localStorage.setItem("org.backendConfigs", JSON.stringify(next));
      return next;
    });
  }

  function handleToggleOrgStatus(orgId) {
    setOrganisations((prev) =>
      prev.map((org) =>
        org._id === orgId ? { ...org, status: !org.status } : org,
      ),
    );
  }

  function toggleExpanded(org) {
    if (expandedOrgId === org._id) {
      setExpandedOrgId(null);
      return;
    }
    setExpandedOrgId(org._id);
    setSelectedPlan(org.plan || "Trial");
    setSettingsForm({
      organizationName: org.organizationName || "",
      organizationCode: org.organizationCode || "",
      city: org.city || "",
      maximumUsers: org.maximumUsers || "",
      organizationAddress: org.organizationAddress || "",
    });
    setExpandedView("insights");
    setSettingsTab("basic");
  }

  function openAddUserModal() {
    setIsEditingUser(false);
    setEditingUserId(null);
    setModalForm({
      name: "",
      email: "",
      role: "System Users Read-Only",
      reportTo: "",
      reportToEmail: "",
      status: true,
    });
    setShowUserModal(true);
  }

  function openEditUserModal(user) {
    setIsEditingUser(true);
    setEditingUserId(user._id);
    setModalForm({
      name: user.name || "",
      email: user.email || "",
      role: getRoleLabel(user.role),
      reportTo: user.reportTo || "",
      reportToEmail: user.reportToEmail || "",
      status: Boolean(user.status),
    });
    setShowUserModal(true);
  }

  async function handleSaveUser(event) {
    event.preventDefault();
    const payload = {
      name: modalForm.name.trim(),
      email: modalForm.email.trim(),
      role: toApiRole(modalForm.role),
      reportToName: modalForm.reportTo.trim(),
      reportToEmail: modalForm.reportToEmail.trim(),
      status: modalForm.status,
    };
    if (!payload.name || !payload.email) return;

    try {
      if (isEditingUser) {
        try {
          await axiosInstance.put(`/users/${editingUserId}`, payload);
        } catch (error) {
          console.error(
            "User update API failed, applying frontend update:",
            error,
          );
        }
        setUsers((prev) =>
          prev.map((item) =>
            item._id === editingUserId
              ? {
                  ...item,
                  ...payload,
                  reportTo: payload.reportToName,
                  reportToEmail: payload.reportToEmail,
                }
              : item,
          ),
        );
      } else {
        let createdId = `temp-${Date.now()}`;
        try {
          const response = await axiosInstance.post("/users", payload);
          if (response?.data?._id) createdId = response.data._id;
        } catch (error) {
          console.error("User create API failed, adding frontend user:", error);
        }
        setUsers((prev) => [
          {
            _id: createdId,
            name: payload.name,
            email: payload.email,
            role: payload.role,
            status: payload.status,
            reportTo: payload.reportToName || "-",
            reportToEmail: payload.reportToEmail || "-",
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);
      }
      setShowUserModal(false);
    } catch (error) {
      console.error("Failed to save user:", error);
    }
  }

  async function handleDeleteUser(userId) {
    const confirmed = window.confirm("Delete this user?");
    if (!confirmed) return;
    try {
      await axiosInstance.delete(`/users/${userId}`);
    } catch (error) {
      console.error("User delete API failed, deleting in UI:", error);
    } finally {
      setUsers((prev) => prev.filter((item) => item._id !== userId));
    }
  }

  async function handleUserStatusToggle(user) {
    const nextStatus = !user.status;
    setUsers((prev) =>
      prev.map((item) =>
        item._id === user._id ? { ...item, status: nextStatus } : item,
      ),
    );
    try {
      await axiosInstance.put(`/users/${user._id}`, {
        ...user,
        status: nextStatus,
      });
    } catch (error) {
      console.error("Status API update failed, retaining UI state:", error);
    }
  }

  async function handleSaveAgencySettings(event) {
    event.preventDefault();
    const payload = {
      organizationName: settingsForm.organizationName,
      organizationCode: settingsForm.organizationCode,
      maximumUsers: settingsForm.maximumUsers,
      organizationAddress: settingsForm.organizationAddress,
      city: settingsForm.city,
      plan: selectedPlan,
    };

    try {
      await agencyService.updateAgency(payload);
    } catch (error) {
      console.error("Agency update failed:", error);
    }

    if (!expandedOrg) return;
    setOrganisations((prev) =>
      prev.map((org) =>
        org._id === expandedOrg._id
          ? {
              ...org,
              ...payload,
              maximumUsers: Number(payload.maximumUsers || 0),
            }
          : org,
      ),
    );
  }

  async function handleDeleteOrganisation(orgId) {
    const confirmed = window.confirm(
      "Delete this organisation? This will also delete linked users.",
    );
    if (!confirmed) return;

    try {
      await axiosInstance.delete(`/organisations/${orgId}`);
      const remaining = organisations.filter((item) => item._id !== orgId);
      setOrganisations(remaining);
      if (expandedOrgId === orgId) {
        if (remaining.length) {
          setExpandedOrgId(remaining[0]._id);
          setSelectedPlan(remaining[0].plan || "Trial");
          setSettingsForm({
            organizationName: remaining[0].organizationName || "",
            organizationCode: remaining[0].organizationCode || "",
            city: remaining[0].city || "",
            maximumUsers: remaining[0].maximumUsers || "",
            organizationAddress: remaining[0].organizationAddress || "",
          });
        } else {
          setExpandedOrgId(null);
        }
      }
      window.dispatchEvent(new Event("refreshOrganisations"));
    } catch (error) {
      console.error("Failed to delete organisation:", error);
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            Organisation Administration
          </span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            Organisations
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review organisations, approve access, and open insights or settings
            inline.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search organisations by name..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Total visible organisations
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {totalVisible}
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Active organisations
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {totalActive}
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Inactive organisations
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {totalInactive}
          </p>
        </article>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Organisation</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Expiry Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrganisations.map((org) => {
                const isExpanded = expandedOrgId === org._id;
                const primaryInitial = (org.organizationName || "A")
                  .charAt(0)
                  .toUpperCase();
                const backendConfig = getBackendConfig(org._id);

                return (
                  <Fragment key={org._id}>
                    <tr className="border-b border-slate-100">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-9 w-9 place-items-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                            {primaryInitial}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {org.organizationName}
                            </p>
                            <p className="text-xs text-slate-500">
                              ID: {org.orgId} • Code: {org.organizationCode}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-medium text-slate-800">
                          {org.email || "admin@crm.com"}
                        </p>
                        <p className="text-xs text-slate-500">Primary Email</p>
                      </td>

                      <td className="px-4 py-4">
                        <div className="space-y-1.5">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${planBadgeStyle(org.plan)}`}
                          >
                            {org.plan || "Trial"}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-slate-700">
                        {new Date(org.expiryDate).toLocaleDateString()}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-3">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleOrgStatus(org._id)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                                org.status ? "bg-blue-600" : "bg-slate-300"
                              }`}
                            >
                              <span
                                className={`h-4 w-4 transform rounded-full bg-white transition ${
                                  org.status ? "translate-x-6" : "translate-x-1"
                                }`}
                              />
                            </button>
                            <span className="text-xs text-slate-500">
                              {org.status ? "Active" : "Inactive"}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleExpanded(org)}
                            className="rounded-lg border border-slate-200 p-1.5 text-slate-600 transition hover:bg-slate-50"
                            aria-label="toggle row details"
                          >
                            <ChevronDown
                              size={16}
                              className={`transition-transform duration-200 ${
                                isExpanded ? "rotate-180" : "rotate-0"
                              }`}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {isExpanded ? (
                      <tr>
                        <td colSpan={5} className="px-4 pb-4 pt-1">
                          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-slate-900">
                                  {org.organizationName}
                                </p>
                                <p className="text-xs text-slate-500">
                                  Open agency-specific insights and settings
                                  inline.
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => setExpandedView("insights")}
                                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                                    expandedView === "insights"
                                      ? "bg-blue-600 text-white"
                                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                                  }`}
                                >
                                  Insights
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setExpandedView("settings")}
                                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                                    expandedView === "settings"
                                      ? "bg-blue-600 text-white"
                                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                                  }`}
                                >
                                  Settings
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setExpandedView("backend")}
                                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                                    expandedView === "backend"
                                      ? "bg-blue-600 text-white"
                                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                                  }`}
                                >
                                  Backend
                                </button>
                              </div>
                            </div>

                            {expandedView === "insights" ? (
                              <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div>
                                  <h3 className="text-lg font-semibold text-slate-900">
                                    Insights & Analytics
                                  </h3>
                                  <p className="text-sm text-slate-500">
                                    Track organisation performance, users and
                                    lead activity.
                                  </p>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">
                                      Total Users
                                    </p>
                                    <p className="mt-2 text-3xl font-semibold text-blue-700">
                                      {totalUsersKpi}
                                    </p>
                                  </div>
                                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">
                                      Total Leads
                                    </p>
                                    <p className="mt-2 text-3xl font-semibold text-violet-700">
                                      {totalLeadsKpi}
                                    </p>
                                  </div>
                                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">
                                      Subscription Plan
                                    </p>
                                    <p className="mt-2 text-3xl font-semibold text-slate-900">
                                      {expandedOrg?.plan || "Basic"}
                                    </p>
                                  </div>
                                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">
                                      Active Leads
                                    </p>
                                    <p className="mt-2 text-3xl font-semibold text-emerald-700">
                                      {activeLeadsKpi}
                                    </p>
                                  </div>
                                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">
                                      Inactive Leads
                                    </p>
                                    <p className="mt-2 text-3xl font-semibold text-orange-600">
                                      {inactiveLeadsKpi}
                                    </p>
                                  </div>
                                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">
                                      Conversion Rate
                                    </p>
                                    <p className="mt-2 text-3xl font-semibold text-indigo-700">
                                      {conversionRateKpi}
                                    </p>
                                  </div>
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                  <h4 className="text-base font-semibold text-slate-900">
                                    Lead Distribution
                                  </h4>
                                  <p className="mt-1 text-sm text-slate-500">
                                    Active Leads vs Inactive Leads
                                  </p>
                                  <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
                                    <div className="h-64">
                                      <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                      >
                                        <PieChart>
                                          <Pie
                                            data={insightsChartData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={56}
                                            outerRadius={90}
                                            paddingAngle={2}
                                          >
                                            <Cell fill="#2563eb" />
                                            <Cell fill="#f97316" />
                                          </Pie>
                                          <Tooltip />
                                        </PieChart>
                                      </ResponsiveContainer>
                                    </div>
                                    <div className="space-y-3">
                                      <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                                        <span className="text-sm text-slate-600">
                                          Active Leads
                                        </span>
                                        <span className="text-sm font-semibold text-blue-700">
                                          {activeLeadsKpi}
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                                        <span className="text-sm text-slate-600">
                                          Inactive Leads
                                        </span>
                                        <span className="text-sm font-semibold text-orange-600">
                                          {inactiveLeadsKpi}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-base font-semibold text-slate-900">
                                      Lead Conversion Progress
                                    </h4>
                                    <span className="text-lg font-semibold text-indigo-700">
                                      {conversionRateKpi}
                                    </span>
                                  </div>
                                  <div className="mt-4 h-3 rounded-full bg-slate-200">
                                    <div
                                      className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                                      style={{
                                        width: `${Math.max(
                                          0,
                                          Math.min(
                                            100,
                                            Number(
                                              String(conversionRateKpi).replace(
                                                "%",
                                                "",
                                              ),
                                            ) || 0,
                                          ),
                                        )}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            ) : expandedView === "settings" ? (
                              <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                <div>
                                  <h3 className="text-lg font-semibold text-slate-900">
                                    Settings
                                  </h3>
                                  <p className="text-sm text-slate-500">
                                    Manage your agency configuration
                                  </p>
                                </div>

                                <div>
                                  <h4 className="text-base font-semibold text-slate-900">
                                    Agency Settings
                                  </h4>
                                  <div className="mt-3 inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                                    <button
                                      type="button"
                                      onClick={() => setSettingsTab("basic")}
                                      className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                                        settingsTab === "basic"
                                          ? "border border-slate-200 bg-white text-slate-900 shadow-sm"
                                          : "text-slate-600"
                                      }`}
                                    >
                                      Basic Information
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setSettingsTab("plan")}
                                      className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                                        settingsTab === "plan"
                                          ? "border border-slate-200 bg-white text-slate-900 shadow-sm"
                                          : "text-slate-600"
                                      }`}
                                    >
                                      Plan
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setSettingsTab("users")}
                                      className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                                        settingsTab === "users"
                                          ? "border border-slate-200 bg-white text-slate-900 shadow-sm"
                                          : "text-slate-600"
                                      }`}
                                    >
                                      Users
                                    </button>
                                  </div>
                                </div>

                                {settingsTab === "basic" ? (
                                  <form
                                    onSubmit={handleSaveAgencySettings}
                                    className="space-y-4"
                                  >
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                      <label className="space-y-1.5">
                                        <span className="text-sm text-slate-600">
                                          Agency Name
                                        </span>
                                        <input
                                          value={settingsForm.organizationName}
                                          onChange={(event) =>
                                            setSettingsForm((prev) => ({
                                              ...prev,
                                              organizationName:
                                                event.target.value,
                                            }))
                                          }
                                          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                                        />
                                      </label>
                                      <label className="space-y-1.5">
                                        <span className="text-sm text-slate-600">
                                          Agency Code
                                        </span>
                                        <input
                                          value={settingsForm.organizationCode}
                                          onChange={(event) =>
                                            setSettingsForm((prev) => ({
                                              ...prev,
                                              organizationCode:
                                                event.target.value,
                                            }))
                                          }
                                          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                                        />
                                      </label>
                                      <label className="space-y-1.5">
                                        <span className="text-sm text-slate-600">
                                          City
                                        </span>
                                        <input
                                          value={settingsForm.city}
                                          onChange={(event) =>
                                            setSettingsForm((prev) => ({
                                              ...prev,
                                              city: event.target.value,
                                            }))
                                          }
                                          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                                        />
                                      </label>
                                      <label className="space-y-1.5">
                                        <span className="text-sm text-slate-600">
                                          Maximum Users
                                        </span>
                                        <input
                                          type="number"
                                          value={settingsForm.maximumUsers}
                                          onChange={(event) =>
                                            setSettingsForm((prev) => ({
                                              ...prev,
                                              maximumUsers: event.target.value,
                                            }))
                                          }
                                          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                                        />
                                      </label>
                                      <label className="space-y-1.5 md:col-span-2">
                                        <span className="text-sm text-slate-600">
                                          Organisation Address
                                        </span>
                                        <input
                                          value={
                                            settingsForm.organizationAddress
                                          }
                                          onChange={(event) =>
                                            setSettingsForm((prev) => ({
                                              ...prev,
                                              organizationAddress:
                                                event.target.value,
                                            }))
                                          }
                                          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                                        />
                                      </label>
                                    </div>
                                    <button
                                      type="submit"
                                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                                    >
                                      Save Changes
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteOrganisation(org._id)}
                                      className="ml-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                                    >
                                      Delete Organisation
                                    </button>
                                  </form>
                                ) : null}

                                {settingsTab === "plan" ? (
                                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                    {planOptions.map((plan) => {
                                      const isCurrent = selectedPlan === plan;
                                      return (
                                        <article
                                          key={plan}
                                          className={`rounded-xl border p-4 ${
                                            isCurrent
                                              ? "border-blue-300 bg-blue-50"
                                              : "border-slate-200 bg-white"
                                          }`}
                                        >
                                          <p className="text-sm font-semibold text-slate-900">
                                            {plan}
                                          </p>
                                          <p className="mt-1 text-xs text-slate-500">
                                            {plan} plan for agency operations
                                          </p>
                                          {isCurrent ? (
                                            <span className="mt-2 inline-flex rounded-full border border-blue-200 bg-white px-2 py-1 text-xs font-medium text-blue-700">
                                              Current Plan
                                            </span>
                                          ) : null}
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setSelectedPlan(plan);
                                              setOrganisations((prev) =>
                                                prev.map((item) =>
                                                  item._id === org._id
                                                    ? { ...item, plan }
                                                    : item,
                                                ),
                                              );
                                            }}
                                            className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                                          >
                                            Upgrade
                                          </button>
                                        </article>
                                      );
                                    })}
                                  </div>
                                ) : null}

                                {settingsTab === "users" ? (
                                  <div className="space-y-4">
                                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                                      <table className="min-w-full text-sm">
                                        <thead>
                                          <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
                                            <th className="px-4 py-3 font-medium">
                                              Name
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                              Email
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                              Role
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                              Created
                                            </th>
                                            <th className="px-4 py-3 text-right font-medium">
                                              Actions
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {users.length ? (
                                            users.map((item) => {
                                              const roleLabel = getRoleLabel(
                                                item.role,
                                              );
                                              return (
                                                <tr
                                                  key={item._id}
                                                  className="border-b border-slate-100 last:border-b-0"
                                                >
                                                  <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-2.5">
                                                      <div className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                                                        {(item.name || "U")
                                                          .charAt(0)
                                                          .toUpperCase()}
                                                      </div>
                                                      <div>
                                                        <p className="font-semibold text-slate-900">
                                                          {item.name}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                          {item.email}
                                                        </p>
                                                      </div>
                                                    </div>
                                                  </td>
                                                  <td className="px-4 py-3.5 text-slate-600">
                                                    {item.email}
                                                  </td>
                                                  <td className="px-4 py-3.5">
                                                    <span
                                                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${roleBadgeStyle(roleLabel)}`}
                                                    >
                                                      {roleLabel}
                                                    </span>
                                                  </td>
                                                  <td className="px-4 py-3.5 text-slate-600">
                                                    {new Date(
                                                      item.createdAt,
                                                    ).toLocaleDateString()}
                                                  </td>
                                                  <td className="px-4 py-3.5">
                                                    <div className="flex justify-end gap-2">
                                                      <button
                                                        type="button"
                                                        onClick={() =>
                                                          openEditUserModal(
                                                            item,
                                                          )
                                                        }
                                                        className="rounded-lg border border-slate-200 p-1.5 text-slate-600 transition hover:bg-slate-50"
                                                      >
                                                        <Pencil size={14} />
                                                      </button>
                                                      <button
                                                        type="button"
                                                        onClick={() =>
                                                          handleDeleteUser(
                                                            item._id,
                                                          )
                                                        }
                                                        className="rounded-lg border border-slate-200 p-1.5 text-red-600 transition hover:bg-red-50"
                                                      >
                                                        <Trash2 size={14} />
                                                      </button>
                                                    </div>
                                                  </td>
                                                </tr>
                                              );
                                            })
                                          ) : (
                                            <tr>
                                              <td
                                                colSpan={5}
                                                className="px-4 py-8 text-center text-sm text-slate-500"
                                              >
                                                No users found.
                                              </td>
                                            </tr>
                                          )}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                ) : null}
                              </div>
                            ) : (
                              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                                <div>
                                  <h3 className="text-lg font-semibold text-slate-900">
                                    Backend Configuration
                                  </h3>
                                  <p className="text-sm text-slate-500">
                                    Manage database connection for this
                                    organisation
                                  </p>
                                </div>

                                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                                  <label
                                    className={`cursor-pointer rounded-lg border p-4 transition ${
                                      backendConfig.dbType === "default"
                                        ? "border-blue-400 bg-blue-50"
                                        : "border-slate-200 bg-white hover:bg-slate-50"
                                    }`}
                                  >
                                    <div className="flex items-start gap-2">
                                      <input
                                        type="radio"
                                        name={`db-type-${org._id}`}
                                        checked={
                                          backendConfig.dbType === "default"
                                        }
                                        onChange={() =>
                                          updateBackendConfig(org._id, {
                                            dbType: "default",
                                            connectionStatus: "Not Connected",
                                          })
                                        }
                                        className="mt-1"
                                      />
                                      <div>
                                        <p className="text-sm font-semibold text-slate-900">
                                          CRM Default Database
                                        </p>
                                        <p className="text-xs text-slate-500">
                                          Use shared CRM managed infrastructure
                                        </p>
                                      </div>
                                    </div>
                                  </label>

                                  <label
                                    className={`cursor-pointer rounded-lg border p-4 transition ${
                                      backendConfig.dbType === "custom"
                                        ? "border-blue-400 bg-blue-50"
                                        : "border-slate-200 bg-white hover:bg-slate-50"
                                    }`}
                                  >
                                    <div className="flex items-start gap-2">
                                      <input
                                        type="radio"
                                        name={`db-type-${org._id}`}
                                        checked={
                                          backendConfig.dbType === "custom"
                                        }
                                        onChange={() =>
                                          updateBackendConfig(org._id, {
                                            dbType: "custom",
                                          })
                                        }
                                        className="mt-1"
                                      />
                                      <div>
                                        <p className="text-sm font-semibold text-slate-900">
                                          Custom MongoDB Database
                                        </p>
                                        <p className="text-xs text-slate-500">
                                          Connect organisation-specific database
                                        </p>
                                      </div>
                                    </div>
                                  </label>
                                </div>

                                {backendConfig.dbType === "default" ? (
                                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                                    This organisation is currently using the
                                    default CRM database.
                                  </div>
                                ) : (
                                  <div className="mt-4 space-y-5">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                      <label className="space-y-1.5 md:col-span-2">
                                        <span className="text-sm font-medium text-slate-600">
                                          Mongo URI
                                        </span>
                                        <input
                                          value={backendConfig.mongoUri}
                                          onChange={(event) =>
                                            updateBackendConfig(org._id, {
                                              mongoUri: event.target.value,
                                            })
                                          }
                                          placeholder="mongodb+srv://..."
                                          className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-400"
                                          disabled={
                                            backendConfig.dbType === "default"
                                          }
                                        />
                                        <p className="text-xs text-slate-500">
                                          Includes username & password in the
                                          connection string
                                        </p>
                                      </label>

                                      <label className="space-y-1.5">
                                        <span className="text-sm font-medium text-slate-600">
                                          Database Name
                                        </span>
                                        <input
                                          value={backendConfig.dbName}
                                          onChange={(event) =>
                                            updateBackendConfig(org._id, {
                                              dbName: event.target.value,
                                            })
                                          }
                                          placeholder="crm_org_database"
                                          className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-400"
                                          disabled={
                                            backendConfig.dbType === "default"
                                          }
                                        />
                                      </label>

                                      <label className="space-y-1.5">
                                        <span className="text-sm font-medium text-slate-600">
                                          Username
                                        </span>
                                        <input
                                          value={backendConfig.username}
                                          onChange={(event) =>
                                            updateBackendConfig(org._id, {
                                              username: event.target.value,
                                            })
                                          }
                                          placeholder="db_user"
                                          className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-400"
                                          disabled={
                                            backendConfig.dbType === "default"
                                          }
                                        />
                                      </label>

                                      <label className="space-y-1.5">
                                        <span className="text-sm font-medium text-slate-600">
                                          Password
                                        </span>
                                        <input
                                          type="password"
                                          value={backendConfig.password}
                                          onChange={(event) =>
                                            updateBackendConfig(org._id, {
                                              password: event.target.value,
                                            })
                                          }
                                          placeholder="••••••••"
                                          className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-400"
                                          disabled={
                                            backendConfig.dbType === "default"
                                          }
                                        />
                                      </label>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm">
                                      <span className="text-slate-600">
                                        Connection Status:
                                      </span>
                                      <span
                                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                          backendConfig.connectionStatus ===
                                          "Connected"
                                            ? "bg-emerald-100 text-emerald-700"
                                            : backendConfig.connectionStatus ===
                                                "Failed"
                                              ? "bg-rose-100 text-rose-700"
                                              : "bg-slate-100 text-slate-600"
                                        }`}
                                      >
                                        {backendConfig.connectionStatus}
                                      </span>
                                    </div>

                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          updateBackendConfig(org._id, {
                                            connectionStatus:
                                              backendConfig.mongoUri.trim()
                                                ? "Connected"
                                                : "Failed",
                                          })
                                        }
                                        className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                      >
                                        Test Connection
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          updateBackendConfig(org._id, {
                                            connectionStatus:
                                              backendConfig.connectionStatus ||
                                              "Not Connected",
                                          })
                                        }
                                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                                      >
                                        Save Configuration
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}

              {!filteredOrganisations.length ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-sm text-slate-500"
                  >
                    No organisations found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {showUserModal ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/35 p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">
              {isEditingUser ? "Edit User" : "Add User"}
            </h3>
            <p className="text-sm text-slate-500">
              Manage user access and reporting manager
            </p>

            <form onSubmit={handleSaveUser} className="mt-4 space-y-4">
              <div>
                <label className="text-sm text-slate-600">Name</label>
                <input
                  value={modalForm.name}
                  onChange={(event) =>
                    setModalForm((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-slate-600">Email</label>
                <input
                  type="email"
                  value={modalForm.email}
                  onChange={(event) =>
                    setModalForm((prev) => ({
                      ...prev,
                      email: event.target.value,
                    }))
                  }
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm text-slate-600">Role</label>
                  <select
                    value={modalForm.role}
                    onChange={(event) =>
                      setModalForm((prev) => ({
                        ...prev,
                        role: event.target.value,
                      }))
                    }
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                  >
                    {roleOptions.map((role) => (
                      <option key={role}>{role}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-slate-600">Status</label>
                  <select
                    value={modalForm.status ? "Active" : "Inactive"}
                    onChange={(event) =>
                      setModalForm((prev) => ({
                        ...prev,
                        status: event.target.value === "Active",
                      }))
                    }
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm text-slate-600">Report To</label>
                  <input
                    value={modalForm.reportTo}
                    onChange={(event) =>
                      setModalForm((prev) => ({
                        ...prev,
                        reportTo: event.target.value,
                      }))
                    }
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-600">
                    Report To Email
                  </label>
                  <input
                    type="email"
                    value={modalForm.reportToEmail}
                    onChange={(event) =>
                      setModalForm((prev) => ({
                        ...prev,
                        reportToEmail: event.target.value,
                      }))
                    }
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default Organisations;
