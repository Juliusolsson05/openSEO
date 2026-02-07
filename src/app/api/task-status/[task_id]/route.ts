import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'

export const GET = apiHandler(
  async (ctx) => {
    const taskId = Array.isArray(ctx.params.task_id) ? ctx.params.task_id[0] : ctx.params.task_id

    return raw({
      task_id: taskId ?? 'unknown',
      status: 'not_available',
      detail: 'Task queue not yet migrated',
    })
  },
  { auth: false },
)
