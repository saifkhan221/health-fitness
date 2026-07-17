// Meal-log entry lifecycle: create entries with nutrition SNAPSHOTS.
// Phase 1: entries are created as 'logged' (diary). Phase 2 adds 'planned'
// and the confirm flow; Phase 3 wires FIFO inventory costing into confirm.

import { and, eq, inArray } from 'drizzle-orm'
import { useDb, schema } from '../db/client'
import { toCanonical, toGrams, scaleNutrition, round2, type CanonicalUnit } from './units'

export interface LogItemInput {
  ingredientId: string
  qty: number
  unit: string
}

export interface CreateEntryInput {
  entryDate: string // YYYY-MM-DD
  mealType: 'breakfast' | 'morning_snack' | 'lunch' | 'evening_snack' | 'dinner'
  status?: 'planned' | 'logged'
  mealId?: string
  items: LogItemInput[]
}

export async function createLogEntry(userId: string, input: CreateEntryInput) {
  const db = useDb()

  const ingredientIds = [...new Set(input.items.map((i) => i.ingredientId))]
  const rows = await db
    .select()
    .from(schema.ingredients)
    .where(inArray(schema.ingredients.id, ingredientIds))
  const byId = new Map(rows.map((r) => [r.id, r]))

  const units = await db
    .select()
    .from(schema.ingredientUnits)
    .where(inArray(schema.ingredientUnits.ingredientId, ingredientIds))

  // Resolve each item to canonical qty + nutrition snapshot
  const resolved = input.items.map((item) => {
    const ing = byId.get(item.ingredientId)
    if (!ing) throw createError({ statusCode: 400, statusMessage: `Unknown ingredient ${item.ingredientId}` })
    if (ing.userId && ing.userId !== userId)
      throw createError({ statusCode: 403, statusMessage: 'Not your ingredient' })

    const ingUnits = units.filter((u) => u.ingredientId === ing.id)
    const qtyCanonical = toCanonical(item.qty, item.unit, ing.canonicalUnit as CanonicalUnit, ingUnits)
    const grams = toGrams(qtyCanonical, ing.canonicalUnit as CanonicalUnit, {
      pieceWeightG: ing.pieceWeightG,
      densityGPerMl: ing.densityGPerMl,
    })
    const nutrition = scaleNutrition(
      {
        kcal: Number(ing.kcal),
        proteinG: Number(ing.proteinG),
        carbsG: Number(ing.carbsG),
        fatG: Number(ing.fatG),
      },
      grams,
    )
    return { item, ing, qtyCanonical, nutrition }
  })

  const totals = resolved.reduce(
    (acc, r) => ({
      kcal: round2(acc.kcal + r.nutrition.kcal),
      proteinG: round2(acc.proteinG + r.nutrition.proteinG),
      carbsG: round2(acc.carbsG + r.nutrition.carbsG),
      fatG: round2(acc.fatG + r.nutrition.fatG),
    }),
    { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 },
  )

  const status = input.status ?? 'logged'

  return await db.transaction(async (tx) => {
    const [entry] = await tx
      .insert(schema.mealLogEntries)
      .values({
        userId,
        entryDate: input.entryDate,
        mealType: input.mealType,
        status,
        mealId: input.mealId ?? null,
        loggedAt: status === 'logged' ? new Date() : null,
        kcal: String(totals.kcal),
        proteinG: String(totals.proteinG),
        carbsG: String(totals.carbsG),
        fatG: String(totals.fatG),
      })
      .returning()

    if (resolved.length) {
      await tx.insert(schema.mealLogItems).values(
        resolved.map((r) => ({
          entryId: entry.id,
          ingredientId: r.ing.id,
          qtyCanonical: String(r.qtyCanonical),
          displayQty: String(r.item.qty),
          displayUnit: r.item.unit,
          kcal: String(r.nutrition.kcal),
          proteinG: String(r.nutrition.proteinG),
          carbsG: String(r.nutrition.carbsG),
          fatG: String(r.nutrition.fatG),
        })),
      )
    }

    return entry
  })
}

export async function deleteLogEntry(userId: string, entryId: string) {
  const db = useDb()
  const [deleted] = await db
    .delete(schema.mealLogEntries)
    .where(and(eq(schema.mealLogEntries.id, entryId), eq(schema.mealLogEntries.userId, userId)))
    .returning({ id: schema.mealLogEntries.id })
  if (!deleted) throw createError({ statusCode: 404, statusMessage: 'Entry not found' })
  return deleted
}
