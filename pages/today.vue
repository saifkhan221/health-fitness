<script setup lang="ts">
const date = ref(todayISO())
const addingTo = ref<null | (typeof MEAL_SLOTS)[number]>(null)

const { data: entries, refresh } = await useFetch('/api/v1/log-entries', {
  query: computed(() => ({ from: date.value, to: date.value })),
  default: () => [],
})
const { data: goals } = await useFetch('/api/v1/goals', {
  default: () => ({ kcal: 2000, protein_g: 90, carbs_g: 250, fat_g: 65 }),
})

const totals = computed(() =>
  (entries.value ?? []).reduce(
    (acc: any, e: any) => ({
      kcal: acc.kcal + Number(e.kcal),
      protein: acc.protein + Number(e.proteinG),
      carbs: acc.carbs + Number(e.carbsG),
      fat: acc.fat + Number(e.fatG),
      cost: acc.cost + Number(e.costPaise || 0),
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0, cost: 0 },
  ),
)

function entriesFor(slot: string) {
  return (entries.value ?? []).filter((e: any) => e.mealType === slot)
}

function shiftDay(delta: number) {
  const d = new Date(date.value)
  d.setDate(d.getDate() + delta)
  date.value = d.toISOString().slice(0, 10)
}

const dateLabel = computed(() => {
  if (date.value === todayISO()) return 'Today'
  return new Date(date.value).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
})

async function saveItems(items: { ingredientId: string; qty: number; unit: string }[]) {
  if (!addingTo.value) return
  await $fetch('/api/v1/log-entries', {
    method: 'POST',
    body: { entryDate: date.value, mealType: addingTo.value.key, items },
  })
  addingTo.value = null
  await refresh()
}

async function removeEntry(id: string) {
  await $fetch(`/api/v1/log-entries/${id}`, { method: 'DELETE' })
  await refresh()
}
</script>

<template>
  <div>
    <!-- date nav -->
    <div class="flex items-center justify-between">
      <h1 class="font-display text-2xl font-extrabold">{{ dateLabel }}</h1>
      <div class="flex items-center gap-1">
        <button class="rounded-lg border border-stone-300 px-3 py-1.5 text-sm hover:bg-stone-100" @click="shiftDay(-1)">←</button>
        <button class="rounded-lg border border-stone-300 px-3 py-1.5 text-sm hover:bg-stone-100" :disabled="date === todayISO()" @click="shiftDay(1)">→</button>
      </div>
    </div>

    <!-- progress rings -->
    <div class="mt-5 grid grid-cols-2 gap-3 rounded-card bg-surface p-5 shadow-sm sm:grid-cols-5">
      <ProgressRing :value="totals.kcal" :max="goals.kcal" label="Calories" color="#16A34A" />
      <ProgressRing :value="totals.protein" :max="goals.protein_g" label="Protein g" color="#8B5CF6" />
      <ProgressRing :value="totals.carbs" :max="goals.carbs_g" label="Carbs g" color="#F59E0B" />
      <ProgressRing :value="totals.fat" :max="goals.fat_g" label="Fat g" color="#F43F5E" />
      <div class="col-span-2 flex flex-col items-center justify-center sm:col-span-1">
        <p class="tnum font-display text-2xl font-extrabold text-money-600">{{ formatPaise(totals.cost) }}</p>
        <p class="text-xs font-semibold">Spent today</p>
        <p class="text-[11px] text-ink-muted">budget tracking → Phase 3</p>
      </div>
    </div>

    <!-- meal slots -->
    <div class="mt-6 space-y-4">
      <div
        v-for="slot in MEAL_SLOTS"
        :key="slot.key"
        class="overflow-hidden rounded-card bg-surface shadow-sm"
        :style="{ borderLeft: `4px solid ${slot.color}` }"
      >
        <div class="flex items-center justify-between px-4 py-3">
          <div class="flex items-center gap-2">
            <span>{{ slot.emoji }}</span>
            <h2 class="font-semibold">{{ slot.label }}</h2>
            <span v-if="entriesFor(slot.key).length" class="tnum text-sm text-ink-muted">
              {{ Math.round(entriesFor(slot.key).reduce((s: number, e: any) => s + Number(e.kcal), 0)) }} kcal
            </span>
          </div>
          <button
            class="rounded-lg px-3 py-1.5 text-sm font-semibold hover:opacity-80"
            :style="{ color: slot.color, background: slot.color + '1A' }"
            @click="addingTo = slot"
          >
            ＋ Add
          </button>
        </div>

        <ul v-if="entriesFor(slot.key).length" class="divide-y divide-stone-100 border-t border-stone-100">
          <li v-for="e in entriesFor(slot.key)" :key="e.id" class="group px-4 py-2.5">
            <div class="flex items-center justify-between">
              <div class="flex flex-wrap gap-x-3 text-sm">
                <span v-for="it in e.items" :key="it.id" class="text-ink">
                  {{ it.displayQty }}{{ it.displayUnit }} <span class="text-ink-muted">·</span>
                </span>
                <span class="tnum text-ink-muted">{{ Math.round(Number(e.kcal)) }} kcal · P {{ Math.round(Number(e.proteinG)) }} · C {{ Math.round(Number(e.carbsG)) }} · F {{ Math.round(Number(e.fatG)) }}</span>
              </div>
              <button
                class="text-sm text-ink-muted opacity-0 transition group-hover:opacity-100 hover:text-danger"
                @click="removeEntry(e.id)"
              >
                delete
              </button>
            </div>
          </li>
        </ul>
        <p v-else class="border-t border-stone-100 px-4 py-3 text-sm text-ink-muted">Nothing logged yet.</p>
      </div>
    </div>

    <AddFoodSheet v-if="addingTo" :slot-label="addingTo.label" @close="addingTo = null" @save="saveItems" />
  </div>
</template>
