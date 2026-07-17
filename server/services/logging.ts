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
        fiberG: Number(ing.fiberG),
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
      fiberG: round2(acc.fiberG + r.nutrition.fiberG),
    }),
    { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0 },
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
        fiberG: String(totals.fiberG),
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
          fiberG: String(r.nutrition.fiberG),
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

/**
 * Duplicate an entry (with its item snapshots) onto other dates, e.g. copying
 * Monday's lunch onto Wednesday. Copies always land as 'planned' — copying an
 * already-eaten meal means "plan to eat this again", not "I already ate it
 * there too" — so it never touches inventory/spend until confirmed.
 */
export async function copyLogEntry(userId: string, entryId: string, dates: string[]) {
  const db = useDb()

  const [source] = await db
    .select()
    .from(schema.mealLogEntries)
    .where(and(eq(schema.mealLogEntries.id, entryId), eq(schema.mealLogEntries.userId, userId)))
  if (!source) throw createError({ statusCode: 404, statusMessage: 'Entry not found' })

  const sourceItems = await db
    .select()
    .from(schema.mealLogItems)
    .where(eq(schema.mealLogItems.entryId, entryId))

  return await db.transaction(async (tx) => {
    const created = []
    for (const entryDate of dates) {
      const [entry] = await tx
        .insert(schema.mealLogEntries)
        .values({
          userId,
          entryDate,
          mealType: source.mealType,
          status: 'planned',
          mealId: source.mealId,
          loggedAt: null,
          kcal: source.kcal,
          proteinG: source.proteinG,
          carbsG: source.carbsG,
          fatG: source.fatG,
          fiberG: source.fiberG,
          costPaise: 0,
        })
        .returning()

      if (sourceItems.length) {
        await tx.insert(schema.mealLogItems).values(
          sourceItems.map((it) => ({
            entryId: entry.id,
            ingredientId: it.ingredientId,
            qtyCanonical: it.qtyCanonical,
            displayQty: it.displayQty,
            displayUnit: it.displayUnit,
            kcal: it.kcal,
            proteinG: it.proteinG,
            carbsG: it.carbsG,
            fatG: it.fatG,
            fiberG: it.fiberG,
            micros: it.micros,
            costPaise: null,
            estimatedCost: false,
          })),
        )
      }
      created.push(entry)
    }
    return created
  })
}

/** Flip a planned entry to logged — "I ate this". No-op if already logged. */
export async function confirmLogEntry(userId: string, entryId: string) {
  const db = useDb()
  const [updated] = await db
    .update(schema.mealLogEntries)
    .set({ status: 'logged', loggedAt: new Date() })
    .where(and(eq(schema.mealLogEntries.id, entryId), eq(schema.mealLogEntries.userId, userId)))
    .returning()
  if (!updated) throw createError({ statusCode: 404, statusMessage: 'Entry not found' })
  return updated
}
