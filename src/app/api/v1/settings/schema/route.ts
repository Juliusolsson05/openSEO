import { apiHandler } from '@/server/api/handler'
import { success } from '@/server/api/response'
import { SETTINGS_SCHEMA_CATALOG, SETTINGS_VERSION } from '@/server/services/settings.service'

export const GET = apiHandler(async () => {
  return success({
    version: SETTINGS_VERSION,
    domains: SETTINGS_SCHEMA_CATALOG,
  })
})
