import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'
import { getTask } from '@/server/tasks/runtime'

export const GET = apiHandler(async ({ params }) => {
  const jobId = String(params.jobId ?? '').trim()
  if (!jobId) return raw({ detail: 'jobId is required' }, 400)

  const task = getTask(jobId)
  if (!task) {
    return raw({
      job_id: jobId,
      status: 'not_available',
      detail: 'Job not found or expired',
    }, 404)
  }

  return raw({
    job_id: task.id,
    status: task.status,
    logs: task.logs,
    error: task.error ?? null,
  })
})
