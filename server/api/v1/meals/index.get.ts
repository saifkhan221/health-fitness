import { and, eq, inArray } from 'drizzle-orm'
import { useDb, schema } from '../../../db/client'
import { requireUserId } from '../../../utils/session'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const db = useDb()

  const meals = await db
    .select()
    .from(schema.meals)
    .where(and(eq(schema.meals.userId, userId), eq(schema.meals.isDeleted, false)))

  const ids = meals.map((m) => m.id)
  const items = ids.length
    ? await db.select().from(schema.mealItems).where(inArray(schema.mealItems.mealId, ids))
    : []

  return meals.map((m) => ({ ...m, items: items.filter((i) => i.mealId === m.id) }))
})
