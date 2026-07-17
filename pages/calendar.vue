<script setup lang="ts">
const cursor = ref(new Date())

const monthLabel = computed(() =>
  cursor.value.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
)

const range = computed(() => {
  const y = cursor.value.getFullYear()
  const m = cursor.value.getMonth()
  const from = `${y}-${String(m + 1).padStart(2, '0')}-01`
  const to = `${y}-${String(m + 1).padStart(2, '0')}-${String(new Date(y, m + 1, 0).getDate()).padStart(2, '0')}`
  return { from, to }
})

const { data: entries } = await useFetch('/api/v1/log-entries', {
  query: range,
  default: () => [],
})

const weeks = computed(() => {
  const y = cursor.value.getFullYear()
  const m = cursor.value.getMonth()
  const firstDow = (new Date(y, m, 1).getDay() + 6) % 7 // Monday-first
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  const cells: (string | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => `${y}-${String(m + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`),
  ]
  while (cells.length % 7) cells.push(null)
  const out: (string | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) out.push(cells.slice(i, i + 7))
  return out
})

function chips(day: string) {
  return (entries.value ?? []).filter((e: any) => e.entryDate === day)
}
function slotColor(mealType: string) {
  return MEAL_SLOTS.find((s) => s.key === mealType)?.color ?? '#78716C'
}
function shiftMonth(d: number) {
  cursor.value = new Date(cursor.value.getFullYear(), cursor.value.getMonth() + d, 1)
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between">
      <h1 class="font-display text-2xl font-extrabold">{{ monthLabel }}</h1>
      <div class="flex gap-1">
        <button class="rounded-lg border border-stone-300 px-3 py-1.5 text-sm hover:bg-stone-100" @click="shiftMonth(-1)">←</button>
        <button class="rounded-lg border border-stone-300 px-3 py-1.5 text-sm hover:bg-stone-100" @click="shiftMonth(1)">→</button>
      </div>
    </div>
    <p class="mt-1 text-sm text-ink-muted">
      Click a day to log it. Drag-planning, repeat patterns &amp; day tinting arrive in Phase 2.
    </p>

    <div class="mt-5 overflow-x-auto">
      <div class="min-w-[640px] rounded-card bg-surface p-3 shadow-sm">
        <div class="grid grid-cols-7 gap-1 pb-2 text-center text-xs font-bold uppercase tracking-wide text-ink-muted">
          <span v-for="d in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']" :key="d">{{ d }}</span>
        </div>
        <div v-for="(week, wi) in weeks" :key="wi" class="grid grid-cols-7 gap-1">
          <NuxtLink
            v-for="(day, di) in week"
            :key="di"
            :to="day ? '/today' : ''"
            class="min-h-[84px] rounded-lg border border-stone-100 p-1.5"
            :class="day ? 'bg-surface-bg/60 hover:border-brand-500' : 'opacity-0 pointer-events-none'"
          >
            <template v-if="day">
              <span class="text-xs font-semibold" :class="{ 'rounded-full bg-brand-600 px-1.5 py-0.5 text-white': day === todayISO() }">
                {{ Number(day.slice(-2)) }}
              </span>
              <div class="mt-1 flex flex-wrap gap-0.5">
                <span
                  v-for="e in chips(day)"
                  :key="e.id"
                  class="h-1.5 w-4 rounded-full"
                  :style="{ background: slotColor(e.mealType), opacity: e.status === 'planned' ? 0.45 : 1 }"
                  :title="e.mealType"
                />
              </div>
            </template>
          </NuxtLink>
        </div>
      </div>
    </div>

    <div class="mt-3 flex flex-wrap gap-3 text-xs text-ink-muted">
      <span v-for="s in MEAL_SLOTS" :key="s.key" class="flex items-center gap-1.5">
        <span class="h-2 w-4 rounded-full" :style="{ background: s.color }" /> {{ s.label }}
      </span>
    </div>
  </div>
</template>
