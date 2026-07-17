// Seeds global ingredients + built-in fitness metrics.
// Run: npm run db:seed  (requires DATABASE_URL in .env; run db:push first)
// Idempotent: skips ingredients whose name already exists as a global row.

import postgres from 'postgres'
import { INGREDIENTS } from './seed-data.mjs'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL not set. Copy .env.example to .env and fill it in.')
  process.exit(1)
}

const sql = postgres(url, { prepare: false })

const BUILTIN_METRICS = [
  ['weight_kg', 'Weight', 'kg', 20, 300],
  ['body_fat_pct', 'Body fat', '%', 3, 70],
  ['waist_cm', 'Waist', 'cm', 40, 200],
  ['chest_cm', 'Chest', 'cm', 50, 200],
  ['hip_cm', 'Hip', 'cm', 50, 200],
  ['arm_cm', 'Arm', 'cm', 15, 70],
  ['thigh_cm', 'Thigh', 'cm', 30, 100],
  ['water_l', 'Water intake', 'L', 0, 10],
  ['steps', 'Steps', 'count', 0, 100000],
  ['sleep_h', 'Sleep', 'hours', 0, 24],
]

try {
  let added = 0
  let skipped = 0

  for (const [name, category, unit, kcal, protein, carbs, fat, fiber, extra = {}] of INGREDIENTS) {
    const existing = await sql`
      SELECT id FROM ingredients WHERE user_id IS NULL AND name = ${name} LIMIT 1`
    if (existing.length) {
      skipped++
      continue
    }

    const [row] = await sql`
      INSERT INTO ingredients
        (user_id, name, category, canonical_unit, piece_weight_g, density_g_per_ml,
         kcal, protein_g, carbs_g, fat_g, fiber_g, source)
      VALUES
        (NULL, ${name}, ${category}, ${unit}, ${extra.pieceWeightG ?? null}, ${extra.density ?? null},
         ${kcal}, ${protein}, ${carbs}, ${fat}, ${fiber}, 'seed')
      RETURNING id`

    for (const [unitName, qty] of extra.units ?? []) {
      await sql`
        INSERT INTO ingredient_units (ingredient_id, unit_name, qty_canonical)
        VALUES (${row.id}, ${unitName}, ${qty})
        ON CONFLICT DO NOTHING`
    }
    added++
  }

  for (const [key, label, metricUnit, min, max] of BUILTIN_METRICS) {
    await sql`
      INSERT INTO metric_definitions (user_id, key, label, unit, min_value, max_value)
      SELECT NULL, ${key}, ${label}, ${metricUnit}, ${min}, ${max}
      WHERE NOT EXISTS (
        SELECT 1 FROM metric_definitions WHERE user_id IS NULL AND key = ${key})`
  }

  console.log(`Ingredients: ${added} added, ${skipped} already present.`)
  console.log(`Built-in metrics ensured: ${BUILTIN_METRICS.length}`)
} finally {
  await sql.end()
}
