import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { clientService } from "../services/clientService";
import { formatDateTime } from "../utils/formatters";

const CLIENT_PROGRESS_STEPS = [
  "New",
  "Active",
  "Engaged",
  "Retained",
  "Churned",
];

function resolveClientProgressStepIndex(status) {
  if (!status) return 0;
  let idx = CLIENT_PROGRESS_STEPS.indexOf(status);
  if (idx !== -1) return idx;
  const lower = String(status).toLowerCase();
  idx = CLIENT_PROGRESS_STEPS.findIndex((step) => step.toLowerCase() === lower);
  if (idx !== -1) return idx;
  if (lower === "prospect") return 0;
  if (lower === "inactive") return 4;
  return 0;
}

function formatCreatedAt(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return "—";
  }
}

function managedByLabel(createdBy) {
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

function ClientDetailsPage() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  const derivedStepIndex = useMemo(
    () => resolveClientProgressStepIndex(client?.status),
    [client?.status],
  );
  const [progressUiStepIndex, setProgressUiStepIndex] = useState(0);

  useEffect(() => {
    async function loadClient() {
      setLoading(true);
      try {
        const payload = await clientService.getClientById(clientId);
        const entity = payload?.data ?? payload;
        if (entity && typeof entity === "object" && !entity.message) {
          setClient(entity);
        } else {
          setClient(null);
        }
      } catch {
        setClient(null);
      } finally {
        setLoading(false);
      }
    }
    loadClient();
  }, [clientId]);

  useEffect(() => {
    setProgressUiStepIndex(derivedStepIndex);
  }, [derivedStepIndex, clientId]);

  if (loading) {
    return (
      <section className="space-y-4">
        <p className="text-sm text-slate-600">Loading...</p>
        <div className="h-36 animate-pulse rounded-2xl bg-slate-100" />
      </section>
    );
  }

  if (!client) {
    return (
      <section className="space-y-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back
        </button>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          Client not found.
        </div>
      </section>
    );
  }

  const statusLabel = (client.status || "New").toUpperCase();
  const communicationHistory = Array.isArray(client.communicationHistory)
    ? client.communicationHistory
    : [];
  const relatedTasks = Array.isArray(client.relatedTasks)
    ? client.relatedTasks
    : [];

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back
        </button>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-700">
          {statusLabel}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <h2 className="mb-4 text-sm font-semibold text-slate-900">
              Client progress
            </h2>
            <div className="overflow-x-auto pb-2">
              <div className="flex min-w-max items-start">
                {CLIENT_PROGRESS_STEPS.map((step, index) => {
                  const isCompleted = index <= progressUiStepIndex;
                  const isCurrent = index === progressUiStepIndex;

                  return (
                    <div key={step} className="flex items-start">
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={async () => {
                          try {
                            const newStatus = CLIENT_PROGRESS_STEPS[index];

                            const updated =
                              await clientService.updateClientStatus(
                                client._id,
                                newStatus,
                              );

                            setClient(updated);
                          } catch (err) {
                            console.log("Status update failed:", err);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setProgressUiStepIndex(index);
                          }
                        }}
                        className="flex w-24 cursor-pointer flex-col items-center text-center transition-all duration-200"
                      >
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold transition-all duration-200 ${
                            isCurrent
                              ? "bg-blue-600 text-white shadow-md"
                              : isCompleted
                                ? "bg-blue-100 text-blue-700"
                                : "bg-slate-200 text-slate-500"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <p
                          className={`mt-2 text-xs leading-tight ${isCurrent ? "font-semibold text-blue-700" : "text-slate-600"}`}
                        >
                          {step}
                        </p>
                      </div>
                      {index < CLIENT_PROGRESS_STEPS.length - 1 ? (
                        <div
                          className={`mt-5 h-0.5 w-12 rounded-full transition-all duration-200 ${
                            index < progressUiStepIndex
                              ? "bg-blue-200"
                              : "bg-slate-200"
                          }`}
                        />
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Client information
            </h2>
            <div className="space-y-2 text-sm text-slate-700">
              <p>
                <strong className="text-slate-900">Name:</strong>{" "}
                {client.name || "—"}
              </p>
              <p>
                <strong className="text-slate-900">Email:</strong>{" "}
                {client.email || "—"}
              </p>
              <p>
                <strong className="text-slate-900">Phone:</strong>{" "}
                {client.phone || "—"}
              </p>
              <p>
                <strong className="text-slate-900">Company:</strong>{" "}
                {client.company || "—"}
              </p>
              <p>
                <strong className="text-slate-900">Status:</strong>{" "}
                {client.status || "—"}
              </p>
              <p>
                <strong className="text-slate-900">Created at:</strong>{" "}
                {formatCreatedAt(client.createdAt)}
              </p>
              <p>
                <strong className="text-slate-900">Managed by:</strong>{" "}
                {managedByLabel(client.createdBy)}
              </p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900">
                  Communication History
                </h2>
                <Link
                  to="/communication"
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Open Communication
                </Link>
              </div>
              <ul className="space-y-2 text-sm text-slate-600">
                {communicationHistory.length ? (
                  communicationHistory.map((item, index) => (
                    <li key={index} className="rounded-xl bg-slate-50 p-3">
                      {item}
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400">No communication history.</li>
                )}
              </ul>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900">
                  Related Tasks
                </h2>
                <Link
                  to="/tasks"
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Open Tasks
                </Link>
              </div>
              <ul className="space-y-2 text-sm text-slate-600">
                {relatedTasks.length ? (
                  relatedTasks.map((task, index) => (
                    <li key={index} className="rounded-xl bg-slate-50 p-3">
                      {task}
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400">No related tasks.</li>
                )}
              </ul>
            </article>
          </div>
        </div>

        <div className="col-span-1">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <h2 className="mb-3 text-base font-semibold text-slate-900">
              Ai Insights
            </h2>
            <p className="mt-3 text-sm text-slate-600"></p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ClientDetailsPage;
