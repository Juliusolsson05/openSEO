type TaskStatus = 'accepted' | 'running' | 'completed' | 'failed'

type TaskLog = {
  stage: string
  type: string
  timestamp: string
  data?: Record<string, unknown>
}

type TaskRecord = {
  id: string
  status: TaskStatus
  createdAt: string
  updatedAt: string
  logs: TaskLog[]
  error?: string
}

const tasks = new Map<string, TaskRecord>()

function nowIso() {
  return new Date().toISOString()
}

export function createTask(id?: string): TaskRecord {
  const taskId = id ?? crypto.randomUUID()
  const ts = nowIso()
  const record: TaskRecord = {
    id: taskId,
    status: 'accepted',
    createdAt: ts,
    updatedAt: ts,
    logs: [
      {
        stage: 'task',
        type: 'accepted',
        timestamp: ts,
        data: { status: 'accepted' },
      },
    ],
  }

  tasks.set(taskId, record)
  return record
}

export function setTaskRunning(id: string, stage = 'task') {
  const task = tasks.get(id)
  if (!task) return null
  task.status = 'running'
  task.updatedAt = nowIso()
  task.logs.push({
    stage,
    type: 'stage_started',
    timestamp: task.updatedAt,
    data: { status: 'running' },
  })
  return task
}

export function appendTaskLog(id: string, log: Omit<TaskLog, 'timestamp'> & { timestamp?: string }) {
  const task = tasks.get(id)
  if (!task) return null
  const timestamp = log.timestamp ?? nowIso()
  task.logs.push({ ...log, timestamp })
  task.updatedAt = timestamp
  return task
}

export function completeTask(id: string, message = 'Task completed') {
  const task = tasks.get(id)
  if (!task) return null
  const ts = nowIso()
  task.status = 'completed'
  task.updatedAt = ts
  task.logs.push({
    stage: 'task',
    type: 'status',
    timestamp: ts,
    data: { status: 'completed', message },
  })
  return task
}

export function failTask(id: string, error: string) {
  const task = tasks.get(id)
  if (!task) return null
  const ts = nowIso()
  task.status = 'failed'
  task.error = error
  task.updatedAt = ts
  task.logs.push({
    stage: 'task',
    type: 'status',
    timestamp: ts,
    data: { status: 'failed', error },
  })
  return task
}

export function getTask(id: string) {
  return tasks.get(id) ?? null
}
