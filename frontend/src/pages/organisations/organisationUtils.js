const ORG_PLAN_STORAGE_KEY = "crm.organisationPlans";

export const PLAN_OPTIONS = ["Basic", "Premium"];

function safeParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function planStore() {
  const raw = window.localStorage.getItem(ORG_PLAN_STORAGE_KEY);
  return safeParse(raw, {});
}

export function readOrgPlans() {
  return planStore();
}

export function saveOrgPlan(orgId, plan) {
  const store = planStore();
  store[String(orgId)] = plan;
  window.localStorage.setItem(ORG_PLAN_STORAGE_KEY, JSON.stringify(store));
}

export function getOrgPlan(orgId, fallback = "Basic") {
  const store = planStore();
  return store[String(orgId)] || store.default || fallback;
}

export function normalizeAgencies(payload) {
  const records = Array.isArray(payload) ? payload : payload ? [payload] : [];
  return records.map((agency, index) => {
    const id = String(agency?._id || agency?.id || index + 1);
    return {
      id,
      name: agency?.organizationName || agency?.name || `Organisation ${index + 1}`,
      code: agency?.organizationCode || agency?.code || "N/A",
      address: agency?.organizationAddress || agency?.address || "N/A",
      maxUsers: String(agency?.maximumUsers ?? agency?.maxUsers ?? "N/A"),
    };
  });
}
