import { requireUserId } from '../../../../utils/session'
import { confirmLogEntry } from '../../../../services/logging'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const id = getRouterParam(event, 'id')!
  return await confirmLogEntry(userId, id)
})
