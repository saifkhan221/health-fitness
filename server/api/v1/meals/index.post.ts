import { z } from 'zod'
import { inArray } from 'drizzle-orm'
import { useDb, schema } from '../../../db/client'
import { requireUserId } from '../../../utils/session'
import { toCanonical, toGrams, scaleNutrition, round2, type CanonicalUnit } from '../../../services/units'

const bodySchema = z.object({
  name: z.string().min(1).max(120),
  mealTypeHint: z.enum(['breakfast', 'morning_snack', 'lunch', 'evening_snack', 'dinner']).optional(),
  items: z
    .array(
      z.object({
        ingredientId: z.string().uuid(),
        qty: z.number().positive(),
        unit: z.string().min(1).max(40),
      }),
    )
    .min(1),
})

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const body = bodySchema.parse(await readBody(event))
  const db = useDb()

  const ingIds = [...new Set(body.items.map((i) => i.ingredientId))]
  const ings = await db.select().from(schema.ingredients).where(inArray(schema.ingredients.id, ingIds))
  const units = await db
    .select()
    .from(schema.ingredientUnits)
    .where(inArray(schema.ingredientUnits.ingredientId, ingIds))
  const byId = new Map(ings.map((r) => [r.id, r]))

  let totals = { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 }
  const resolved = body.items.map((item) => {
    const ing = byId.get(item.ingredientId)
    if (!ing) throw createError({ statusCode: 400, statusMessage: `Unknown ingredient ${item.ingredientId}` })
    const cu = ing.canonicalUnit as CanonicalUnit
    const qtyCanonical = toCanonical(item.qty, item.unit, cu, units.filter((u) => u.ingredientId === ing.id))
    const grams = toGrams(qtyCanonical, cu, { pieceWeightG: ing.pieceWeightG, densityGPerMl: ing.densityGPerMl })
    const n = scaleNutrition(
      { kcal: Number(ing.kcal), proteinG: Number(ing.proteinG), carbsG: Number(ing.carbsG), fatG: Number(ing.fatG) },
      grams,
    )
    totals = {
      kcal: round2(totals.kcal + n.kcal),
      proteinG: round2(totals.proteinG + n.proteinG),
      carbsG: round2(totals.carbsG + n.carbsG),
      fatG: round2(totals.fatG + n.fatG),
    }
    return { item, qtyCanonical }
  })

  return await db.transaction(async (tx) => {
    const [meal] = await tx
      .insert(schema.meals)
      .values({
        userId,
        name: body.name,
        mealTypeHint: body.mealTypeHint ?? null,
        kcal: String(totals.kcal),
        proteinG: String(totals.proteinG),
        carbsG: String(totals.carbsG),
        fatG: String(totals.fatG),
      })
      .returning()

    await tx.insert(schema.mealItems).values(
      resolved.map((r) => ({
        mealId: meal.id,
        ingredientId: r.item.ingredientId,
        qtyCanonical: String(r.qtyCanonical),
        displayQty: String(r.item.qty),
        displayUnit: r.item.unit,
      })),
    )
    return meal
  })
})
