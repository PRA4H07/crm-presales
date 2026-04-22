import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createLead } from "../api/leadApi";
import axiosInstance from "../api/axiosInstance";

const TITLE_OPTIONS = ["Mr", "Ms", "Mrs", "Dr", "Prof", "Other"];
const STATUS_OPTIONS = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal",
  "Negotiation",
  "Booked",
];
const SOURCE_OPTIONS = ["Website", "Referral", "Cold Call"];
const PRIORITY_OPTIONS = ["Low", "Medium", "High"];

function CreateLead() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    title: "",
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phone: "",
    status: "New",
    source: "Website",
    priority: "Medium",
    budget: "",
  });

  useEffect(() => {
    if (!isEditMode) return;

    async function fetchLead() {
      try {
        const res = await axiosInstance.get(`/leads/${id}`);
        const lead = res.data;

        setFormData({
          title: lead.title || "",
          firstName: lead.name?.split(" ")[0] || "",
          middleName: "",
          lastName: lead.name?.split(" ").slice(1).join(" ") || "",
          email: lead.email || "",
          phone: lead.phone || "",
          status: lead.status || "New",
          source: lead.source || "Website",
          priority: lead.priority || "Medium",
          budget: lead.budget || "",
        });
      } catch (err) {
        console.log(err);
      }
    }

    fetchLead();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  function handleCancel() {
    navigate("/leads");
  }

  async function handleCreateLead(e) {
  e.preventDefault();

  const parts = [
    formData.firstName,
    formData.middleName,
    formData.lastName,
  ].filter((part) => part && part.trim());

  const fullName = parts.join(" ").trim() || "Unnamed lead";

  if (isEditMode) {
    await axiosInstance.put(`/leads/${id}`, {
      name: fullName,
      email: formData.email,
      phone: formData.phone,
      status: formData.status,
      source: formData.source,
      priority: formData.priority,
      budget: formData.budget ? Number(formData.budget) : null,
    });
  } else {
    await createLead({
      name: fullName,
      email: formData.email,
      phone: formData.phone,
      status: formData.status,
      source: formData.source,
      priority: formData.priority,
      budget: formData.budget ? Number(formData.budget) : null,
    });
  }

  navigate("/leads");
}

  return (
    <section className="space-y-4">
      <div>
        <Link
          to="/leads"
          className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {isEditMode ? "Edit Lead" : "Create New Lead"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {isEditMode
            ? "Update lead details"
            : "Fill in the details to create a new lead"}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleCreateLead} className="space-y-6">
          <h3 className="mb-4 text-lg font-semibold">Basic Information</h3>

          <div className="space-y-4">
            <div className="overflow-x-auto">
              <div className="grid min-w-[56rem] grid-cols-4 gap-4">
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">
                    Title
                  </span>
                  <select
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none"
                  >
                    <option value="">Select</option>
                    {TITLE_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">
                    First Name
                  </span>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="crm-focus-ring h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none"
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">
                    Middle Name (optional)
                  </span>
                  <input
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleChange}
                    className="crm-focus-ring h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none"
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">
                    Last Name
                  </span>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="crm-focus-ring h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none"
                  />
                </label>
                <label className="col-span-2 block space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">
                    Email Address
                  </span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="crm-focus-ring h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none"
                  />
                </label>
                <label className="col-span-2 block space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">
                    Phone Number
                  </span>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="crm-focus-ring h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none"
                  />
                </label>
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="grid min-w-[56rem] grid-cols-4 gap-4">
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">
                    Status
                  </span>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">
                    Source
                  </span>
                  <select
                    name="source"
                    value={formData.source}
                    onChange={handleChange}
                    className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none"
                  >
                    {SOURCE_OPTIONS.map((source) => (
                      <option key={source} value={source}>
                        {source}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">
                    Priority
                  </span>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none"
                  >
                    {PRIORITY_OPTIONS.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">
                    Budget
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    placeholder="Enter budget"
                    className="crm-focus-ring h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-xl border border-slate-200 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="crm-gradient-bg crm-gradient-bg-hover rounded-xl px-5 py-2 text-sm font-medium text-white"
            >
              {isEditMode ? "Update Lead" : "Create Lead"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default CreateLead;
