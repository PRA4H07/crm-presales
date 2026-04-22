import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { TASK_STATUS } from '../constants/theme'
import { taskService } from '../services/taskService'

const statusClassNames = {
  [TASK_STATUS.TODO]: 'bg-blue-50 text-blue-700 ring-blue-200',
  [TASK_STATUS.IN_PROGRESS]: 'bg-amber-50 text-amber-700 ring-amber-200',
  [TASK_STATUS.BLOCKED]: 'bg-rose-50 text-rose-700 ring-rose-200',
  [TASK_STATUS.COMPLETED]: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
}

const EMPLOYEES = [
  { id: 'user_002', name: 'Pre-Sales Executive' },
  { id: 'user_003', name: 'Account Specialist' },
  { id: 'user_004', name: 'Solutions Consultant' },
]

function TasksPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [tasks, setTasks] = useState([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    assignedTo: EMPLOYEES[0].id,
    priority: 'Medium',
    dueDate: '',
  })

  useEffect(() => {
    async function loadTasks() {
      const response = await taskService.getMyTasks()
      const fetchedTasks = (response.data || []).map((task) => ({
        ...task,
        assignedTo: task.assignedTo || 'user_002',
      }))

      const visibleTasks = isAdmin
        ? fetchedTasks
        : fetchedTasks.filter((task) => task.assignedTo === user?.id)

      setTasks(visibleTasks)
    }

    loadTasks()
  }, [user?.id, user?.role])

  function handleCreateTask() {
    if (!isAdmin) {
      window.alert('Only admin users can create tasks.')
      return
    }

    setIsCreateModalOpen(true)
  }

  function handleTaskFieldChange(event) {
    const { name, value } = event.target
    setNewTaskForm((previous) => ({ ...previous, [name]: value }))
  }

  function handleCloseModal() {
    setIsCreateModalOpen(false)
    setNewTaskForm({
      title: '',
      assignedTo: EMPLOYEES[0].id,
      priority: 'Medium',
      dueDate: '',
    })
  }

  function handleTaskSubmit(event) {
    event.preventDefault()
    if (!isAdmin) {
      window.alert('Only admin users can create tasks.')
      return
    }

    const cleanTitle = newTaskForm.title.trim()
    if (!cleanTitle || !newTaskForm.dueDate) {
      return
    }

    const assignedEmployee = EMPLOYEES.find(
      (employee) => employee.id === newTaskForm.assignedTo,
    )

    const createdTask = {
      id: `task_${Date.now()}`,
      title: cleanTitle,
      assignedTo: newTaskForm.assignedTo,
      leadName: assignedEmployee?.name || 'Unassigned',
      priority: newTaskForm.priority,
      dueDate: newTaskForm.dueDate,
      status: TASK_STATUS.TODO,
    }

    setTasks((previous) => [createdTask, ...previous])
    handleCloseModal()
  }

  const summary = {
    [TASK_STATUS.TODO]: 0,
    [TASK_STATUS.IN_PROGRESS]: 0,
    [TASK_STATUS.BLOCKED]: 0,
    [TASK_STATUS.COMPLETED]: 0,
  }
  for (const task of tasks) {
    if (summary[task.status] !== undefined) {
      summary[task.status] += 1
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Task Board</h1>
          <p className="mt-1 text-sm text-slate-500">
            All assigned tasks and their current execution status.
          </p>
        </div>
        {isAdmin ? (
          <button
            type="button"
            onClick={handleCreateTask}
            className="crm-gradient-bg crm-gradient-bg-hover rounded-xl px-4 py-2 text-sm font-medium text-white transition"
          >
            New Task
          </button>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Object.values(TASK_STATUS).map((status) => (
          <article key={status} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">{status}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{summary[status]}</p>
          </article>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr className="border-b border-slate-200">
              <th className="px-4 py-3 font-medium">Task</th>
              <th className="px-4 py-3 font-medium">Lead</th>
              <th className="px-4 py-3 font-medium">Priority</th>
              <th className="px-4 py-3 font-medium">Due Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-4 font-medium text-slate-900">{task.title}</td>
                <td className="px-4 py-4 text-slate-700">{task.leadName}</td>
                <td className="px-4 py-4 text-slate-700">{task.priority}</td>
                <td className="px-4 py-4 text-slate-700">{task.dueDate}</td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusClassNames[task.status]}`}
                  >
                    {task.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isCreateModalOpen ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-slate-900/35 p-4">
          <form
            onSubmit={handleTaskSubmit}
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Create New Task</h2>
              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <div className="grid gap-3">
              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-600">Task title</span>
                <input
                  name="title"
                  value={newTaskForm.title}
                  onChange={handleTaskFieldChange}
                  className="crm-focus-ring h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none"
                  placeholder="Enter task title"
                  required
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-600">Assign to</span>
                <select
                  name="assignedTo"
                  value={newTaskForm.assignedTo}
                  onChange={handleTaskFieldChange}
                  className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-700 outline-none"
                >
                  {EMPLOYEES.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-xs font-medium text-slate-600">Priority</span>
                  <select
                    name="priority"
                    value={newTaskForm.priority}
                    onChange={handleTaskFieldChange}
                    className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-700 outline-none"
                  >
                    {['Low', 'Medium', 'High'].map((priority) => (
                      <option key={priority}>{priority}</option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1">
                  <span className="text-xs font-medium text-slate-600">Due date</span>
                  <input
                    type="date"
                    name="dueDate"
                    value={newTaskForm.dueDate}
                    onChange={handleTaskFieldChange}
                    className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-700 outline-none"
                    required
                  />
                </label>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="crm-gradient-bg crm-gradient-bg-hover rounded-xl px-4 py-2 text-sm font-medium text-white transition"
              >
                Create Task
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  )
}

export default TasksPage
