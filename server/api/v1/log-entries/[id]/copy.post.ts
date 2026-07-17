import { z } from 'zod'
import { requireUserId } from '../../../../utils/session'
import { copyLogEntry } from '../../../../services/logging'

const bodySchema = z.object({
  dates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).min(1).max(31),
})

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const id = getRouterParam(event, 'id')!
  const { dates } = bodySchema.parse(await readBody(event))
  return await copyLogEntry(userId, id, dates)
})
