// Canonical-unit conversion engine.
// Every ingredient stores quantities in ONE canonical unit: g | ml | piece.
// Global units convert deterministically; per-ingredient household units
// (katori, "medium onion") come from the ingredient_units table.

export type CanonicalUnit = 'g' | 'ml' | 'piece'

// 1 <unit> = N canonical units, grouped by which canonical family they belong to
const GLOBAL_UNITS: Record<CanonicalUnit, Record<string, number>> = {
  g: { g: 1, kg: 1000, mg: 0.001 },
  ml: { ml: 1, l: 1000, tsp: 5, tbsp: 15, cup: 240 },
  piece: { piece: 1, pc: 1, dozen: 12 },
}

export interface IngredientUnitRow {
  unitName: string
  qtyCanonical: string | number
}

/**
 * Convert a user-entered (qty, unit) to canonical units for an ingredient.
 * Resolution order: global units for the ingredient's canonical family,
 * then per-ingredient calibrated units. Throws on unknown unit.
 */
export function toCanonical(
  qty: number,
  unit: string,
  canonicalUnit: CanonicalUnit,
  ingredientUnits: IngredientUnitRow[] = [],
): number {
  if (!Number.isFinite(qty) || qty < 0) throw new Error(`Invalid quantity: ${qty}`)
  const u = unit.trim().toLowerCase()

  const global = GLOBAL_UNITS[canonicalUnit][u]
  if (global !== undefined) return round3(qty * global)

  const custom = ingredientUnits.find((r) => r.unitName.trim().toLowerCase() === u)
  if (custom) return round3(qty * Number(custom.qtyCanonical))

  throw new Error(`Unknown unit "${unit}" for canonical unit "${canonicalUnit}"`)
}

/** Grams equivalent of a canonical quantity — needed for nutrition math. */
export function toGrams(
  qtyCanonical: number,
  canonicalUnit: CanonicalUnit,
  opts: { pieceWeightG?: number | string | null; densityGPerMl?: number | string | null } = {},
): number {
  switch (canonicalUnit) {
    case 'g':
      return qtyCanonical
    case 'ml': {
      const density = opts.densityGPerMl ? Number(opts.densityGPerMl) : 1
      return round3(qtyCanonical * density)
    }
    case 'piece': {
      const w = Number(opts.pieceWeightG)
      if (!w) throw new Error('piece-based ingredient is missing piece_weight_g')
      return round3(qtyCanonical * w)
    }
  }
}

/** Nutrition for a quantity, from per-100g values. */
export function scaleNutrition(
  per100g: { kcal: number; proteinG: number; carbsG: number; fatG: number; fiberG: number },
  grams: number,
) {
  const f = grams / 100
  return {
    kcal: round2(per100g.kcal * f),
    proteinG: round2(per100g.proteinG * f),
    carbsG: round2(per100g.carbsG * f),
    fatG: round2(per100g.fatG * f),
    fiberG: round2(per100g.fiberG * f),
  }
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100
}

export function round3(n: number): number {
  return Math.round(n * 1000) / 1000
}
