export const MEAL_SLOTS = [
  { key: 'breakfast', label: 'Breakfast', icon: 'sunrise', color: '#F59E0B', tint: '#FEF3C7', hint: '7–10 am' },
  { key: 'morning_snack', label: 'Morning Snack', icon: 'apple', color: '#F97316', tint: '#FFEDD5', hint: '10–12' },
  { key: 'lunch', label: 'Lunch', icon: 'sun', color: '#16A34A', tint: '#DCFCE7', hint: '12–3 pm' },
  { key: 'evening_snack', label: 'Evening Snack', icon: 'coffee', color: '#0D9488', tint: '#CCFBF1', hint: '4–6 pm' },
  { key: 'dinner', label: 'Dinner', icon: 'moon', color: '#6366F1', tint: '#E0E7FF', hint: '7–10 pm' },
] as const

export type MealSlotKey = (typeof MEAL_SLOTS)[number]['key']

export function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function formatPaise(paise: number): string {
  return `₹${(paise / 100).toFixed(2).replace(/\.00$/, '')}`
}

export function addDays(iso: string, delta: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, m - 1, d + delta)
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
}

/** Monday of the week containing the given ISO date. */
export function mondayOf(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const dow = (new Date(y, m - 1, d).getDay() + 6) % 7 // Mon=0..Sun=6
  return addDays(iso, -dow)
}
