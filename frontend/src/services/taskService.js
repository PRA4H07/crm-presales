import { API_ENDPOINTS } from '../constants/api'
import { TASK_STATUS } from '../constants/theme'
import httpClient from './httpClient'

const mockTasks = [
  {
    id: 'task_001',
    title: 'Schedule discovery call with NovaEdge',
    assignedTo: 'user_002',
    leadName: 'Aarav Sharma',
    priority: 'High',
    dueDate: '2026-04-08',
    status: TASK_STATUS.IN_PROGRESS,
  },
  {
    id: 'task_002',
    title: 'Send revised proposal deck',
    assignedTo: 'user_003',
    leadName: 'Priya Iyer',
    priority: 'Medium',
    dueDate: '2026-04-10',
    status: TASK_STATUS.TODO,
  },
  {
    id: 'task_003',
    title: 'Collect pricing approvals from finance',
    assignedTo: 'user_004',
    leadName: 'Kabir Mehta',
    priority: 'High',
    dueDate: '2026-04-07',
    status: TASK_STATUS.BLOCKED,
  },
  {
    id: 'task_004',
    title: 'Log post-demo feedback notes',
    assignedTo: 'user_002',
    leadName: 'Rhea Joshi',
    priority: 'Low',
    dueDate: '2026-04-06',
    status: TASK_STATUS.COMPLETED,
  },
]

export const taskService = {
  async getMyTasks(params = {}, useMock = true) {
    if (useMock) {
      return Promise.resolve({ data: mockTasks })
    }

    const response = await httpClient.get(API_ENDPOINTS.tasks.myTasks, { params })
    return response.data
  },
}
