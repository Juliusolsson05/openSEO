/**
 * Handler registry for background jobs (P24A foundation).
 *
 * This file is the single place where concrete `job_type -> handler`
 * mappings are wired. It is intentionally EMPTY in sub-plan A: sub-plans
 * B (website-analyzer), C (publishing-sync), and D (quillo autopilot)
 * will add their handlers here as they migrate off `src/server/tasks/runtime.ts`.
 *
 * `registerAllHandlers` is called exactly once at process startup from
 * `instrumentation.ts` (dev) or `worker-entrypoint.ts` (prod).
 */
import { registerHandler } from './worker'

export function registerAllHandlers(): void {
  // Sub-plan B will add:
  //   registerHandler('website.analyze', websiteAnalyzeHandler)
  //
  // Sub-plan C will add:
  //   registerHandler('publishing.push_all_posts', publishingPushAllPostsHandler)
  //   registerHandler('publishing.push_all_dictionaries', publishingPushAllDictionariesHandler)
  //
  // Sub-plan D will add:
  //   registerHandler('quillo.autopilot', quilloAutopilotHandler)

  // Touch the import so TS keeps the symbol wired even while the list is empty.
  void registerHandler
}
