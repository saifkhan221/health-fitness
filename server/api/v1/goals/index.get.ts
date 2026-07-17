import { and, eq, isNull } from 'drizzle-orm'
import { useDb, schema } from '../../../db/client'
import { requireUserId } from '../../../utils/session'

// Current goals, with sensible defaults until the user sets their own.
const DEFAULTS = { kcal: 2000, protein_g: 90, carbs_g: 250, fat_g: 65, fiber_g: 30 }

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const db = useDb()
  const rows = await db
    .select()
    .from(schema.goals)
    .where(and(eq(schema.goals.userId, userId), isNull(schema.goals.effectiveTo)))

  const result: Record<string, number> = { ...DEFAULTS }
  for (const r of rows) result[r.goalType] = Number(r.targetValue)
  return result
})
