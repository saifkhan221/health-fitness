import { and, eq, gte, lte, inArray } from 'drizzle-orm'
import { useDb, schema } from '../../../db/client'
import { requireUserId } from '../../../utils/session'

// GET /api/v1/log-entries?from=2026-07-01&to=2026-07-31
export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const { from, to } = getQuery(event) as { from?: string; to?: string }
  if (!from || !to) throw createError({ statusCode: 400, statusMessage: 'from and to are required' })

  const db = useDb()
  const entries = await db
    .select()
    .from(schema.mealLogEntries)
    .where(
      and(
        eq(schema.mealLogEntries.userId, userId),
        gte(schema.mealLogEntries.entryDate, from),
        lte(schema.mealLogEntries.entryDate, to),
      ),
    )

  const ids = entries.map((e) => e.id)
  const items = ids.length
    ? await db.select().from(schema.mealLogItems).where(inArray(schema.mealLogItems.entryId, ids))
    : []

  return entries.map((e) => ({ ...e, items: items.filter((i) => i.entryId === e.id) }))
})
