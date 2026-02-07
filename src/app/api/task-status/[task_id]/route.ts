import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'
import { getTask } from '@/server/tasks/runtime'

export const GET = apiHandler(
  async (ctx) => {
    const taskId = Array.isArray(ctx.params.task_id) ? ctx.params.task_id[0] : ctx.params.task_id
    const normalizedTaskId = String(taskId ?? '').trim()

    if (!normalizedTaskId) {
      return raw({ detail: 'task_id is required' }, 400)
    }

    const task = getTask(normalizedTaskId)
    if (!task) {
      return raw({
        task_id: normalizedTaskId,
        status: 'not_available',
        detail: 'Task not found or expired',
      }, 404)
    }

    return raw({
      task_id: task.id,
      status: task.status,
      logs: task.logs,
      error: task.error ?? null,
    })
  },
  { auth: false },
)
