import { and, eq, ilike, isNull, or, sql } from 'drizzle-orm'
import { useDb, schema } from '../../../db/client'
import { requireUserId } from '../../../utils/session'

// GET /api/v1/ingredients?q=onion — global seeds + the user's own, with units
export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const q = (getQuery(event).q as string | undefined)?.trim()

  const db = useDb()
  const where = and(
    or(isNull(schema.ingredients.userId), eq(schema.ingredients.userId, userId)),
    eq(schema.ingredients.isDeleted, false),
    q ? ilike(schema.ingredients.name, `%${q}%`) : undefined,
  )

  const rows = await db
    .select()
    .from(schema.ingredients)
    .where(where)
    .orderBy(sql`${schema.ingredients.name} ASC`)
    .limit(30)

  const ids = rows.map((r) => r.id)
  const units = ids.length
    ? await db
        .select()
        .from(schema.ingredientUnits)
        .where(sql`${schema.ingredientUnits.ingredientId} IN ${ids}`)
    : []

  return rows.map((r) => ({
    ...r,
    units: units.filter((u) => u.ingredientId === r.id),
  }))
})
