import { useMemo, useState } from "react";
import {
  Filter,
  Mail,
  MoreHorizontal,
  Pencil,
  Phone,
  Trash2,
} from "lucide-react";

const initialTasks = [
  {
    id: "T-1001",
    title: "Prepare proposal for Nova Retail",
    status: "In Progress",
    dueDate: "2026-05-10",
    progress: 65,
    assignedTo: "Aarav Sharma",
    priority: "High",
  },
  {
    id: "T-1002",
    title: "Follow up on contract terms",
    status: "To Do",
    dueDate: "2026-05-13",
    progress: 15,
    assignedTo: "Priya Singh",
    priority: "Medium",
  },
  {
    id: "T-1003",
    title: "Send onboarding checklist",
    status: "Completed",
    dueDate: "2026-05-07",
    progress: 100,
    assignedTo: "Rahul Verma",
    priority: "Low",
  },
  {
    id: "T-1004",
    title: "Resolve API dependency blocker",
    status: "Blocked",
    dueDate: "2026-05-08",
    progress: 40,
    assignedTo: "Neha Kapoor",
    priority: "High",
  },
  {
    id: "T-1005",
    title: "Schedule product walkthrough",
    status: "In Progress",
    dueDate: "2026-05-11",
    progress: 55,
    assignedTo: "Aditya Rao",
    priority: "Medium",
  },
];

const initialFollowUps = [
  {
    id: 1,
    name: "Sara Khan",
    email: "sara.khan@client.com",
    phone: "+91 98765 43210",
    company: "Nova Retail",
    notes: "Requested callback after demo",
    followedUp: false,
  },
  {
    id: 2,
    name: "Vikram Jain",
    email: "vikram.jain@client.com",
    phone: "+91 99887 66554",
    company: "Orbit Foods",
    notes: "Awaiting pricing confirmation",
    followedUp: false,
  },
  {
    id: 3,
    name: "Ritika Mehta",
    email: "ritika.mehta@client.com",
    phone: "+91 97770 12543",
    company: "Aster Labs",
    notes: "Needs security deck",
    followedUp: true,
  },
  {
    id: 4,
    name: "Nitin Arora",
    email: "nitin.arora@client.com",
    phone: "+91 98110 22446",
    company: "Urban Basket",
    notes: "Pending final approval",
    followedUp: false,
  },
];

const initialReminderEmails = [
  { id: 1, subject: "Task deadline reminder", status: "Sent", date: "2026-05-05" },
  {
    id: 2,
    subject: "Follow-up call schedule",
    status: "Scheduled",
    date: "2026-05-07",
  },
  { id: 3, subject: "Blocked task escalation", status: "Failed", date: "2026-05-04" },
];

function statusBadgeClass(status) {
  if (status === "Completed") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "In Progress") return "bg-blue-50 text-blue-700 border-blue-200";
  if (status === "Blocked") return "bg-rose-50 text-rose-700 border-rose-200";
  return "bg-amber-50 text-amber-700 border-amber-200";
}

function emailStatusBadgeClass(status) {
  if (status === "Sent") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "Scheduled") return "bg-blue-50 text-blue-700 border-blue-200";
  return "bg-rose-50 text-rose-700 border-rose-200";
}

function percentage(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function donutStyle(parts) {
  const total = parts.reduce((sum, part) => sum + part.value, 0) || 1;
  let cursor = 0;
  const segments = parts.map((part) => {
    const start = cursor;
    const chunk = (part.value / total) * 100;
    cursor += chunk;
    return `${part.color} ${start}% ${cursor}%`;
  });
  return { background: `conic-gradient(${segments.join(", ")})` };
}

function ProgressDots({ progress, onStepClick }) {
  const totalSteps = 5;
  const completedSteps = Math.max(
    0,
    Math.min(totalSteps, Math.round((progress / 100) * totalSteps)),
  );

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isDone = index < completedSteps;
        return (
          <button
            type="button"
            key={index}
            onClick={() => onStepClick(index)}
            className={`grid h-4 w-4 place-items-center rounded-full text-[10px] font-bold transition ${
              isDone
                ? "bg-emerald-500 text-white"
                : "border border-slate-300 bg-white text-slate-300"
            }`}
          >
            {isDone ? "✓" : ""}
          </button>
        );
      })}
    </div>
  );
}

function AdminTasksPage() {
  const [tasks, setTasks] = useState(initialTasks);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [filters, setFilters] = useState({ status: "All", priority: "All" });
  const [sortBy, setSortBy] = useState("dueDateAsc");
  const [bulkAction, setBulkAction] = useState("none");
  const [followUps, setFollowUps] = useState(initialFollowUps);
  const [reminders, setReminders] = useState(initialReminderEmails);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [toastMessage, setToastMessage] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const [editingReminder, setEditingReminder] = useState(null);
  const [followUpMenuId, setFollowUpMenuId] = useState(null);
  const [emailModal, setEmailModal] = useState({ open: false, id: null, to: "", message: "" });
  const [phoneModal, setPhoneModal] = useState({
    open: false,
    id: null,
    phone: "",
    callStatus: "Not Called",
    notes: "",
  });
  const [showAddFollowUp, setShowAddFollowUp] = useState(false);
  const [newFollowUp, setNewFollowUp] = useState({
    name: "",
    phone: "",
    email: "",
    company: "",
    notes: "",
  });

  const completedCount = tasks.filter((task) => task.status === "Completed").length;
  const pendingCount = tasks.filter((task) => task.status !== "Completed").length;
  const overdueCount = tasks.filter(
    (task) => task.status !== "Completed" && new Date(task.dueDate) < new Date(),
  ).length;
  const completionPercent = percentage(completedCount, tasks.length);
  const pendingPercent = percentage(pendingCount, tasks.length);
  const overduePercent = percentage(overdueCount, tasks.length);

  const statusBreakdown = [
    {
      label: "To Do",
      value: tasks.filter((task) => task.status === "To Do").length,
      color: "#F59E0B",
    },
    {
      label: "In Progress",
      value: tasks.filter((task) => task.status === "In Progress").length,
      color: "#2563EB",
    },
    {
      label: "Blocked",
      value: tasks.filter((task) => task.status === "Blocked").length,
      color: "#E11D48",
    },
  ];

  const priorityBreakdown = [
    {
      label: "High",
      value: tasks.filter((task) => task.priority === "High").length,
      color: "#DC2626",
    },
    {
      label: "Medium",
      value: tasks.filter((task) => task.priority === "Medium").length,
      color: "#0EA5E9",
    },
    {
      label: "Low",
      value: tasks.filter((task) => task.priority === "Low").length,
      color: "#16A34A",
    },
  ];

  const visibleTasks = useMemo(() => {
    let next = [...tasks];
    if (filters.status !== "All") {
      next = next.filter((task) => task.status === filters.status);
    }
    if (filters.priority !== "All") {
      next = next.filter((task) => task.priority === filters.priority);
    }
    if (sortBy === "dueDateAsc") {
      next.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    } else if (sortBy === "dueDateDesc") {
      next.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
    } else if (sortBy === "progressDesc") {
      next.sort((a, b) => b.progress - a.progress);
    } else {
      next.sort((a, b) => a.title.localeCompare(b.title));
    }
    return next;
  }, [tasks, filters, sortBy]);

  function toggleTaskSelection(taskId) {
    setSelectedTasks((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId],
    );
  }

  function toggleSelectAll(checked) {
    if (checked) {
      setSelectedTasks(visibleTasks.map((task) => task.id));
      return;
    }
    setSelectedTasks([]);
  }

  function applyBulkAction(value) {
    setBulkAction(value);
    if (value === "markCompleted") {
      setTasks((prev) =>
        prev.map((task) =>
          selectedTasks.includes(task.id)
            ? { ...task, status: "Completed", progress: 100 }
            : task,
        ),
      );
    } else if (value === "clearSelection") {
      setSelectedTasks([]);
    }
  }

  function handleDeleteReminder(emailId) {
    setReminders((prev) => prev.filter((item) => item.id !== emailId));
    setToastMessage("Reminder deleted.");
    window.setTimeout(() => setToastMessage(""), 1800);
  }

  function handleAddFollowUp() {
    if (!newFollowUp.name.trim() || !newFollowUp.phone.trim() || !newFollowUp.email.trim()) return;
    setFollowUps((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: newFollowUp.name.trim(),
        phone: newFollowUp.phone.trim(),
        email: newFollowUp.email.trim(),
        company: newFollowUp.company.trim(),
        notes: newFollowUp.notes.trim(),
        followedUp: false,
      },
    ]);
    setShowAddFollowUp(false);
    setNewFollowUp({ name: "", phone: "", email: "", company: "", notes: "" });
    setToastMessage("Follow-up contact added.");
    window.setTimeout(() => setToastMessage(""), 1800);
  }

  function handleEditTask() {
    if (!editingTask) return;
    setTasks((prev) => prev.map((task) => (task.id === editingTask.id ? editingTask : task)));
    setEditingTask(null);
    setToastMessage("Task changes saved.");
    window.setTimeout(() => setToastMessage(""), 1800);
  }

  function handleDeleteTask(taskId) {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
    setSelectedTasks((prev) => prev.filter((id) => id !== taskId));
    setToastMessage("Task deleted.");
    window.setTimeout(() => setToastMessage(""), 1800);
  }

  function handleTaskProgressStep(taskId, stepIndex) {
    const totalSteps = 5;
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        const currentSteps = Math.round((task.progress / 100) * totalSteps);
        const nextSteps = currentSteps === stepIndex + 1 ? stepIndex : stepIndex + 1;
        const nextProgress = Math.round((nextSteps / totalSteps) * 100);
        let nextStatus = task.status;
        if (nextProgress === 100) nextStatus = "Completed";
        else if (nextProgress > 0 && task.status === "To Do") nextStatus = "In Progress";
        else if (nextProgress === 0) nextStatus = "To Do";
        return { ...task, progress: nextProgress, status: nextStatus };
      }),
    );
  }

  function openEmailModal(person) {
    setEmailModal({
      open: true,
      id: person.id,
      to: person.email,
      message: `Hi ${person.name},\n\nSharing a quick follow-up from our last conversation.\n\nRegards,\nAdmin`,
    });
  }

  function sendEmailMessage() {
    setEmailModal({ open: false, id: null, to: "", message: "" });
    setToastMessage("Mock email sent.");
    window.setTimeout(() => setToastMessage(""), 1800);
  }

  function openPhoneModal(person) {
    setPhoneModal({
      open: true,
      id: person.id,
      phone: person.phone,
      callStatus: "Not Called",
      notes: person.notes ?? "",
    });
  }

  function savePhoneLog() {
    if (!phoneModal.id) return;
    setFollowUps((prev) =>
      prev.map((item) =>
        item.id === phoneModal.id
          ? { ...item, phone: phoneModal.phone, notes: phoneModal.notes, followedUp: phoneModal.callStatus === "Connected" }
          : item,
      ),
    );
    setPhoneModal({ open: false, id: null, phone: "", callStatus: "Not Called", notes: "" });
    setToastMessage("Call log saved.");
    window.setTimeout(() => setToastMessage(""), 1800);
  }

  function handleFollowUpAction(action, personId) {
    if (action === "remove") {
      setFollowUps((prev) => prev.filter((item) => item.id !== personId));
      setToastMessage("Follow-up removed.");
    } else if (action === "mark") {
      setFollowUps((prev) =>
        prev.map((item) => (item.id === personId ? { ...item, followedUp: true } : item)),
      );
      setToastMessage("Contact marked as followed up.");
    } else if (action === "edit") {
      const person = followUps.find((item) => item.id === personId);
      if (person) {
        setShowAddFollowUp(true);
        setNewFollowUp({
          name: person.name,
          phone: person.phone,
          email: person.email,
          company: person.company ?? "",
          notes: person.notes ?? "",
        });
        setFollowUps((prev) => prev.filter((item) => item.id !== personId));
      }
      setToastMessage("Edit contact details and re-add.");
    }
    setFollowUpMenuId(null);
    window.setTimeout(() => setToastMessage(""), 1800);
  }

  function handleReminderEditSave() {
    if (!editingReminder) return;
    setReminders((prev) => prev.map((item) => (item.id === editingReminder.id ? editingReminder : item)));
    setEditingReminder(null);
    setToastMessage("Reminder updated.");
    window.setTimeout(() => setToastMessage(""), 1800);
  }

  const highPriorityTasks = tasks.filter((task) => task.priority === "High");
  const allVisibleSelected =
    visibleTasks.length > 0 && visibleTasks.every((task) => selectedTasks.includes(task.id));

  return (
    <section className="mx-auto w-full max-w-[1180px] space-y-3 overflow-x-hidden px-1 sm:px-0">
      {toastMessage ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
          {toastMessage}
        </div>
      ) : null}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">CRM Tasks Center</h1>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="space-y-2 lg:border-r lg:border-slate-200 lg:pr-4">
            <h2 className="text-sm font-semibold text-slate-900">Task Progress Overview</h2>
            <p className="text-xs text-slate-500">Linear Progress</p>
            <div>
              <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                <span className="font-medium text-slate-700">Completed</span>
                <span>{completionPercent}% Completed</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100">
                <div
                  className="h-2.5 rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                <span>Pending</span>
                <span>{pendingPercent}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100">
                <div
                  className="h-2.5 rounded-full bg-amber-500 transition-all"
                  style={{ width: `${pendingPercent}%` }}
                />
              </div>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                <span>Overdue</span>
                <span>{overduePercent}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100">
                <div
                  className="h-2.5 rounded-full bg-rose-500 transition-all"
                  style={{ width: `${overduePercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="lg:border-r lg:border-slate-200 lg:px-2">
            <h2 className="text-sm font-semibold text-slate-900">Task Status Breakdown</h2>
            <div className="mt-3 flex items-center gap-4">
              <div className="grid h-24 w-24 place-items-center rounded-full border border-slate-200 bg-white">
                <div className="grid h-16 w-16 place-items-center rounded-full" style={donutStyle(statusBreakdown)}>
                  <span className="h-8 w-8 rounded-full bg-white" />
                </div>
              </div>
              <div className="space-y-2 text-xs">
                {statusBreakdown.map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-slate-600">
                    <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                    <span>{item.label}</span>
                    <span className="font-semibold text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:pl-2">
            <h2 className="text-sm font-semibold text-slate-900">Task Priority Distribution</h2>
            <div className="mt-3 flex items-center gap-4">
              <div className="grid h-24 w-24 place-items-center rounded-full border border-slate-200 bg-white">
                <div className="grid h-16 w-16 place-items-center rounded-full" style={donutStyle(priorityBreakdown)}>
                  <span className="h-8 w-8 rounded-full bg-white" />
                </div>
              </div>
              <div className="space-y-2 text-xs">
                {priorityBreakdown.map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-slate-600">
                    <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                    <span>{item.label}</span>
                    <span className="font-semibold text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,2.3fr)_minmax(280px,1fr)]">
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-slate-900">Lined Up Tasks</h2>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setFiltersOpen((prev) => !prev)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <Filter size={14} />
                Filter
              </button>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-blue-400"
              >
                <option value="dueDateAsc">Sort: Due Date (Near)</option>
                <option value="dueDateDesc">Sort: Due Date (Far)</option>
                <option value="progressDesc">Sort: Progress</option>
                <option value="titleAsc">Sort: Title</option>
              </select>
              <select
                value={bulkAction}
                onChange={(event) => applyBulkAction(event.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-blue-400"
              >
                <option value="none">Bulk Actions</option>
                <option value="markCompleted">Mark Completed</option>
                <option value="clearSelection">Clear Selection</option>
              </select>
            </div>
          </div>

          {filtersOpen ? (
            <div className="mb-2 grid grid-cols-1 gap-2 md:grid-cols-3">
              <select
                value={filters.status}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, status: event.target.value }))
                }
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-blue-400"
              >
                <option value="All">Status: All</option>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Blocked">Blocked</option>
              </select>
              <select
                value={filters.priority}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, priority: event.target.value }))
                }
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-blue-400"
              >
                <option value="All">Priority: All</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
                {selectedTasks.length} task(s) selected
              </div>
            </div>
          ) : null}

          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full table-fixed text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
                  <th className="w-8 px-2 py-2">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={(event) => toggleSelectAll(event.target.checked)}
                    />
                  </th>
                  <th className="w-[15%] px-2.5 py-2 font-medium">Status</th>
                  <th className="w-[31%] px-2.5 py-2 font-medium">Title</th>
                  <th className="w-[13%] px-2.5 py-2 font-medium">Due Date</th>
                  <th className="w-[13%] px-2.5 py-2 font-medium">Progress</th>
                  <th className="w-[19%] px-3 py-2 font-medium">Assigned To</th>
                  <th className="w-[9%] px-2 py-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleTasks.map((task) => (
                  <tr key={task.id} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-2 py-3 align-middle">
                      <input
                        type="checkbox"
                        checked={selectedTasks.includes(task.id)}
                        onChange={() => toggleTaskSelection(task.id)}
                      />
                    </td>
                    <td className="px-2.5 py-3 align-middle">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusBadgeClass(task.status)}`}
                      >
                        {task.status}
                      </span>
                    </td>
                    <td className="px-2.5 py-3 align-middle font-medium text-slate-800">
                      <span
                        className="block overflow-hidden text-ellipsis leading-5"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {task.title}
                      </span>
                    </td>
                    <td className="px-2.5 py-3 align-middle text-slate-600">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-2.5 py-3 align-middle">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <ProgressDots
                          progress={task.progress}
                          onStepClick={(stepIndex) => handleTaskProgressStep(task.id, stepIndex)}
                        />
                        <span className="text-[11px] leading-none text-slate-500">{task.progress}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 align-middle text-xs text-slate-700">
                      <span className="block pl-1 pr-1 text-left whitespace-nowrap">{task.assignedTo}</span>
                    </td>
                    <td className="px-2 py-3 align-middle">
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTask({ ...task });
                          }}
                          className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTask(task.id)}
                          className="rounded-lg border border-rose-200 p-1.5 text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="min-w-0 space-y-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Follow-Ups</h2>
              <button
                type="button"
                onClick={() => setShowAddFollowUp(true)}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
              >
                Add New
              </button>
            </div>
            <div className="mt-2 space-y-1.5">
              {followUps.map((person) => (
                <div key={person.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-1.5 py-1.5">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <div className="grid h-7 w-7 place-items-center rounded-full bg-blue-100 text-[10px] font-semibold text-blue-700">
                      {person.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-slate-800">{person.name}</p>
                      <p className="truncate text-[11px] text-slate-500">{person.company}</p>
                    </div>
                  </div>
                  <div className="relative flex gap-1">
                    <button
                      type="button"
                      onClick={() => openEmailModal(person)}
                      className="rounded-md border border-slate-200 p-1 text-slate-600 hover:bg-slate-50"
                    >
                      <Mail size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => openPhoneModal(person)}
                      className="rounded-md border border-slate-200 p-1 text-slate-600 hover:bg-slate-50"
                    >
                      <Phone size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFollowUpMenuId((prev) => (prev === person.id ? null : person.id))
                      }
                      className="rounded-md border border-slate-200 p-1 text-slate-600 hover:bg-slate-50"
                    >
                      <MoreHorizontal size={13} />
                    </button>
                    {followUpMenuId === person.id ? (
                      <div className="absolute right-0 top-8 z-20 w-40 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
                        <button
                          type="button"
                          onClick={() => handleFollowUpAction("edit", person.id)}
                          className="w-full rounded-md px-2 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-100"
                        >
                          Edit Contact
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFollowUpAction("remove", person.id)}
                          className="w-full rounded-md px-2 py-1.5 text-left text-xs text-rose-600 hover:bg-rose-50"
                        >
                          Remove Contact
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFollowUpAction("mark", person.id)}
                          className="w-full rounded-md px-2 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-100"
                        >
                          Mark Followed Up
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Reminder Emails</h2>
            <div className="mt-2.5 overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full table-fixed text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
                    <th className="w-[42%] px-2.5 py-2 font-medium">Subject</th>
                    <th className="w-[22%] px-2.5 py-2 font-medium">Status</th>
                    <th className="w-[24%] px-2.5 py-2 font-medium">Date</th>
                    <th className="w-[12%] px-2 py-2 font-medium text-center">Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {reminders.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 last:border-b-0">
                      <td className="px-2.5 py-3 text-slate-800 break-words">{item.subject}</td>
                      <td className="px-2.5 py-3">
                        <span
                          className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${emailStatusBadgeClass(item.status)}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-2.5 py-3 text-slate-600">
                        {new Date(item.date).toLocaleDateString()}
                      </td>
                      <td className="px-2 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => setEditingReminder({ ...item })}
                          className="rounded-md border border-slate-200 p-1 text-slate-600 hover:bg-slate-50"
                        >
                          <Pencil size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-[1fr_auto]">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 shadow-sm">
          <h2 className="text-sm font-semibold text-amber-900">High Priority Tasks</h2>
          <ul className="mt-1.5 space-y-1">
            {highPriorityTasks.map((task) => (
              <li
                key={task.id}
                className="rounded-md border border-amber-200 bg-white px-2.5 py-1 text-xs text-amber-900"
              >
                {task.title}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-end lg:pb-0.5">
          <button
            type="button"
            onClick={() => console.log("Open full reports")}
            className="h-9 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Full Reports
          </button>
        </div>
      </div>
      {editingTask ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-slate-900/40 px-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
            <h3 className="text-sm font-semibold text-slate-900">Edit Task</h3>
            <div className="mt-3 space-y-2.5 text-xs">
              <input
                value={editingTask.title}
                onChange={(event) => setEditingTask((prev) => ({ ...prev, title: event.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-blue-400"
                placeholder="Task title"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={editingTask.status}
                  onChange={(event) => setEditingTask((prev) => ({ ...prev, status: event.target.value }))}
                  className="rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-blue-400"
                >
                  <option>To Do</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                  <option>Blocked</option>
                </select>
                <input
                  type="date"
                  value={editingTask.dueDate}
                  onChange={(event) => setEditingTask((prev) => ({ ...prev, dueDate: event.target.value }))}
                  className="rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-blue-400"
                />
              </div>
              <input
                value={editingTask.assignedTo}
                onChange={(event) => setEditingTask((prev) => ({ ...prev, assignedTo: event.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-blue-400"
                placeholder="Assigned person"
              />
              <div>
                <label className="mb-1 block text-[11px] text-slate-500">Progress</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={editingTask.progress}
                  onChange={(event) =>
                    setEditingTask((prev) => ({ ...prev, progress: Number(event.target.value) }))
                  }
                  className="w-full"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEditTask}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {emailModal.open ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-slate-900/40 px-4">
          <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
            <h3 className="text-sm font-semibold text-slate-900">Send Email</h3>
            <div className="mt-3 space-y-2 text-xs">
              <input
                value={emailModal.to}
                onChange={(event) => setEmailModal((prev) => ({ ...prev, to: event.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-blue-400"
              />
              <textarea
                rows={4}
                value={emailModal.message}
                onChange={(event) => setEmailModal((prev) => ({ ...prev, message: event.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-blue-400"
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEmailModal({ open: false, id: null, to: "", message: "" })}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={sendEmailMessage}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {phoneModal.open ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-slate-900/40 px-4">
          <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
            <h3 className="text-sm font-semibold text-slate-900">Call Details</h3>
            <div className="mt-3 space-y-2 text-xs">
              <input
                value={phoneModal.phone}
                onChange={(event) => setPhoneModal((prev) => ({ ...prev, phone: event.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-blue-400"
              />
              <select
                value={phoneModal.callStatus}
                onChange={(event) => setPhoneModal((prev) => ({ ...prev, callStatus: event.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-blue-400"
              >
                <option>Not Called</option>
                <option>Connected</option>
                <option>No Answer</option>
                <option>Busy</option>
              </select>
              <textarea
                rows={3}
                value={phoneModal.notes}
                onChange={(event) => setPhoneModal((prev) => ({ ...prev, notes: event.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-blue-400"
                placeholder="Notes"
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPhoneModal({ open: false, id: null, phone: "", callStatus: "Not Called", notes: "" })}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={savePhoneLog}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {showAddFollowUp ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-slate-900/40 px-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
            <h3 className="text-sm font-semibold text-slate-900">Add Follow-Up Contact</h3>
            <div className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
              <input
                value={newFollowUp.name}
                onChange={(event) => setNewFollowUp((prev) => ({ ...prev, name: event.target.value }))}
                className="rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-blue-400"
                placeholder="Contact Name"
              />
              <input
                value={newFollowUp.phone}
                onChange={(event) => setNewFollowUp((prev) => ({ ...prev, phone: event.target.value }))}
                className="rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-blue-400"
                placeholder="Phone Number"
              />
              <input
                value={newFollowUp.email}
                onChange={(event) => setNewFollowUp((prev) => ({ ...prev, email: event.target.value }))}
                className="rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-blue-400 sm:col-span-2"
                placeholder="Email"
              />
              <input
                value={newFollowUp.company}
                onChange={(event) => setNewFollowUp((prev) => ({ ...prev, company: event.target.value }))}
                className="rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-blue-400 sm:col-span-2"
                placeholder="Company"
              />
              <textarea
                rows={3}
                value={newFollowUp.notes}
                onChange={(event) => setNewFollowUp((prev) => ({ ...prev, notes: event.target.value }))}
                className="rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-blue-400 sm:col-span-2"
                placeholder="Notes"
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddFollowUp(false);
                  setNewFollowUp({ name: "", phone: "", email: "", company: "", notes: "" });
                }}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddFollowUp}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white"
              >
                Add Contact
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {editingReminder ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-slate-900/40 px-4">
          <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
            <h3 className="text-sm font-semibold text-slate-900">Edit Reminder</h3>
            <div className="mt-3 space-y-2 text-xs">
              <input
                value={editingReminder.subject}
                onChange={(event) =>
                  setEditingReminder((prev) => ({ ...prev, subject: event.target.value }))
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-blue-400"
                placeholder="Subject"
              />
              <select
                value={editingReminder.status}
                onChange={(event) =>
                  setEditingReminder((prev) => ({ ...prev, status: event.target.value }))
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-blue-400"
              >
                <option>Sent</option>
                <option>Scheduled</option>
                <option>Failed</option>
              </select>
              <input
                type="date"
                value={editingReminder.date}
                onChange={(event) => setEditingReminder((prev) => ({ ...prev, date: event.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-blue-400"
              />
            </div>
            <div className="mt-4 flex justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  handleDeleteReminder(editingReminder.id);
                  setEditingReminder(null);
                }}
                className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
              >
                Delete
              </button>
              <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditingReminder(null)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReminderEditSave}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white"
              >
                Save
              </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default AdminTasksPage;
