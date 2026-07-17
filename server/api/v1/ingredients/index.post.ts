import { z } from 'zod'
import { useDb, schema } from '../../../db/client'
import { requireUserId } from '../../../utils/session'

const bodySchema = z.object({
  name: z.string().min(1).max(120),
  category: z.string().max(40).optional(),
  canonicalUnit: z.enum(['g', 'ml', 'piece']),
  pieceWeightG: z.number().positive().optional(),
  densityGPerMl: z.number().positive().optional(),
  kcal: z.number().min(0),
  proteinG: z.number().min(0).default(0),
  carbsG: z.number().min(0).default(0),
  fatG: z.number().min(0).default(0),
  fiberG: z.number().min(0).default(0),
})

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const body = bodySchema.parse(await readBody(event))

  if (body.canonicalUnit === 'piece' && !body.pieceWeightG)
    throw createError({ statusCode: 400, statusMessage: 'piece-based ingredients need pieceWeightG' })

  const db = useDb()
  const [row] = await db
    .insert(schema.ingredients)
    .values({
      userId,
      name: body.name,
      category: body.category ?? null,
      canonicalUnit: body.canonicalUnit,
      pieceWeightG: body.pieceWeightG ? String(body.pieceWeightG) : null,
      densityGPerMl: body.densityGPerMl ? String(body.densityGPerMl) : null,
      kcal: String(body.kcal),
      proteinG: String(body.proteinG),
      carbsG: String(body.carbsG),
      fatG: String(body.fatG),
      fiberG: String(body.fiberG),
      source: 'user',
    })
    .returning()
  return row
})
