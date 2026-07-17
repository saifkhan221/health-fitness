import { z } from 'zod'
import { requireUserId } from '../../../utils/session'
import { createLogEntry } from '../../../services/logging'

const bodySchema = z.object({
  entryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  mealType: z.enum(['breakfast', 'morning_snack', 'lunch', 'evening_snack', 'dinner']),
  status: z.enum(['planned', 'logged']).optional(),
  mealId: z.string().uuid().optional(),
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
  return await createLogEntry(userId, body)
})
