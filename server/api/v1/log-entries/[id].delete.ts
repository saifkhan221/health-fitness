import { requireUserId } from '../../../utils/session'
import { deleteLogEntry } from '../../../services/logging'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const id = getRouterParam(event, 'id')!
  return await deleteLogEntry(userId, id)
})
