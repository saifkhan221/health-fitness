<script setup lang="ts">
const route = useRoute()
const date = ref((route.query.date as string) || todayISO())
const addingTo = ref<null | (typeof MEAL_SLOTS)[number]>(null)
const { isDark } = useTheme()

const { data: entries, refresh } = await useFetch('/api/v1/log-entries', {
  query: computed(() => ({ from: date.value, to: date.value })),
  default: () => [],
})
const { data: goals } = await useFetch('/api/v1/goals', {
  default: () => ({ kcal: 2000, protein_g: 90, carbs_g: 250, fat_g: 65, fiber_g: 30 }),
})

// Only logged (actually-eaten) entries count toward the day's real totals —
// planned entries show projected macros/cost but must never inflate them.
const totals = computed(() =>
  (entries.value ?? [])
    .filter((e: any) => e.status === 'logged')
    .reduce(
      (acc: any, e: any) => ({
        kcal: acc.kcal + Number(e.kcal),
        protein: acc.protein + Number(e.proteinG),
        carbs: acc.carbs + Number(e.carbsG),
        fat: acc.fat + Number(e.fatG),
        fiber: acc.fiber + Number(e.fiberG || 0),
        cost: acc.cost + Number(e.costPaise || 0),
      }),
      { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, cost: 0 },
    ),
)

function entriesFor(slot: string) {
  return (entries.value ?? []).filter((e: any) => e.mealType === slot)
}

function slotKcal(slot: string): number {
  return Math.round(
    entriesFor(slot)
      .filter((e: any) => e.status === 'logged')
      .reduce((s: number, e: any) => s + Number(e.kcal), 0),
  )
}

async function markEaten(id: string) {
  await $fetch(`/api/v1/log-entries/${id}/confirm`, { method: 'POST' })
  await refresh()
}

function entryDescription(e: any): string {
  return (e.items ?? []).map((it: any) => `${Number(it.displayQty)} ${it.displayUnit}`).join(' · ')
}

const WEEKDAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

// 7-day strip centered on the selected date: 3 before, 3 after.
const weekDays = computed(() =>
  Array.from({ length: 7 }, (_, i) => {
    const iso = addDays(date.value, i - 3)
    const [y, m, d] = iso.split('-').map(Number)
    return {
      iso,
      letter: WEEKDAY_LETTERS[new Date(y, m - 1, d).getDay()],
      dayNum: d,
      isSelected: iso === date.value,
      isToday: iso === todayISO(),
    }
  }),
)

const dateLabel = computed(() => {
  if (date.value === todayISO()) return 'Today'
  return new Date(date.value).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
})

const dateSubline = computed(() =>
  new Date(date.value).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }),
)

function tileStyle(slot: (typeof MEAL_SLOTS)[number]) {
  return { background: isDark.value ? `${slot.color}26` : slot.tint, color: slot.color }
}

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
    <!-- header -->
    <div class="flex items-start justify-between gap-3">
      <div>
        <h1 class="font-display text-2xl font-extrabold tracking-tight text-ink dark:text-ink-inverse">
          {{ dateLabel }}
        </h1>
        <p class="mt-0.5 text-sm text-ink-muted dark:text-ink-inverse-muted">{{ dateSubline }}</p>
      </div>
      <button
        v-if="date !== todayISO()"
        class="rounded-full border border-line px-3.5 py-1.5 text-sm font-semibold text-brand-600 transition hover:bg-surface-bg active:scale-[.98] dark:border-line-dark dark:text-brand-400 dark:hover:bg-surface-dark-2"
        @click="date = todayISO()"
      >
        Today
      </button>
    </div>

    <!-- 7-day date strip -->
    <div class="-mx-1 mt-4 flex items-stretch gap-1 overflow-x-auto px-1 pb-1 sm:gap-2">
      <button
        v-for="day in weekDays"
        :key="day.iso"
        class="flex min-w-[3rem] flex-1 flex-col items-center gap-1.5 rounded-xl py-1.5 transition active:scale-[.98]"
        :aria-pressed="day.isSelected"
        @click="date = day.iso"
      >
        <span class="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">{{ day.letter }}</span>
        <span
          class="tnum grid h-10 w-10 place-items-center rounded-full text-sm transition"
          :class="
            day.isSelected
              ? 'bg-brand-600 font-bold text-white'
              : day.isToday
                ? 'font-semibold text-brand-600 ring-1 ring-brand-500 dark:text-brand-400'
                : 'text-ink hover:bg-line/60 dark:text-ink-inverse dark:hover:bg-surface-dark-2'
          "
        >
          {{ day.dayNum }}
        </span>
      </button>
    </div>

    <!-- hero summary card -->
    <section
      class="mt-5 rounded-card border border-line bg-surface p-5 shadow-card dark:border-line-dark dark:bg-surface-dark dark:shadow-card-dark sm:p-6"
    >
      <div class="grid items-center gap-6 sm:grid-cols-[auto_1fr]">
        <HeroRing class="justify-self-center" :eaten="totals.kcal" :goal="goals.kcal" />
        <div class="flex flex-col gap-4">
          <MacroBar label="Protein" :value="totals.protein" :goal="goals.protein_g" color="#8B5CF6" />
          <MacroBar label="Carbs" :value="totals.carbs" :goal="goals.carbs_g" color="#F59E0B" />
          <MacroBar label="Fat" :value="totals.fat" :goal="goals.fat_g" color="#F43F5E" />
          <MacroBar label="Fiber" :value="totals.fiber" :goal="goals.fiber_g" color="#78350F" />
          <div class="flex items-center gap-2 border-t border-line pt-3.5 dark:border-line-dark">
            <AppIcon name="wallet" :size="16" class="shrink-0 text-money-600" />
            <span class="text-sm font-semibold text-ink dark:text-ink-inverse">Spent today</span>
            <span class="tnum font-display font-bold text-money-600">{{ formatPaise(totals.cost) }}</span>
            <span
              class="ml-auto rounded-full bg-surface-bg px-2.5 py-1 text-[11px] font-medium text-ink-muted dark:bg-surface-dark-2 dark:text-ink-inverse-muted"
            >
              budget · Phase 3
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- meal slots -->
    <div class="mt-6 space-y-4">
      <section
        v-for="slot in MEAL_SLOTS"
        :key="slot.key"
        class="overflow-hidden rounded-card border border-line bg-surface shadow-card dark:border-line-dark dark:bg-surface-dark dark:shadow-card-dark"
      >
        <div class="flex items-center gap-3 p-4">
          <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl" :style="tileStyle(slot)">
            <AppIcon :name="slot.icon" :size="20" />
          </span>
          <div class="min-w-0 flex-1">
            <h2 class="font-semibold text-ink dark:text-ink-inverse">{{ slot.label }}</h2>
            <p class="text-xs text-ink-faint">{{ slot.hint }}</p>
          </div>
          <div v-if="entriesFor(slot.key).length" class="flex shrink-0 items-center gap-1.5">
            <span class="tnum text-sm font-semibold text-ink dark:text-ink-inverse">{{ slotKcal(slot.key) }} kcal</span>
            <AppIcon name="chevron-right" :size="16" class="text-ink-faint" />
          </div>
        </div>

        <ul v-if="entriesFor(slot.key).length">
          <li
            v-for="e in entriesFor(slot.key)"
            :key="e.id"
            class="flex items-center gap-3 border-t border-line/70 px-4 py-2.5 dark:border-line-dark/70"
          >
            <div class="min-w-0 flex-1">
              <p class="flex items-center gap-1.5 truncate text-sm text-ink dark:text-ink-inverse">
                {{ entryDescription(e) }}
                <span
                  v-if="e.status === 'planned'"
                  class="shrink-0 rounded-full bg-accent-100 px-1.5 py-0.5 text-[10px] font-semibold text-accent-600 dark:bg-accent-500/15 dark:text-accent-400"
                >
                  Planned
                </span>
              </p>
              <p class="tnum text-xs text-ink-muted dark:text-ink-inverse-muted">
                P {{ Math.round(Number(e.proteinG)) }} · C {{ Math.round(Number(e.carbsG)) }} · F
                {{ Math.round(Number(e.fatG)) }} · Fbr {{ Math.round(Number(e.fiberG || 0)) }}
              </p>
            </div>
            <span class="tnum shrink-0 text-sm font-semibold text-ink dark:text-ink-inverse">
              {{ Math.round(Number(e.kcal)) }} kcal
            </span>
            <button
              v-if="e.status === 'planned'"
              class="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-faint transition hover:bg-brand-50 hover:text-brand-600 active:scale-[.98] dark:hover:bg-brand-600/15"
              :aria-label="`Mark ${slot.label} entry as eaten`"
              title="Mark as eaten"
              @click="markEaten(e.id)"
            >
              <AppIcon name="check" :size="15" />
            </button>
            <button
              class="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-faint transition hover:bg-surface-bg hover:text-danger active:scale-[.98] dark:hover:bg-surface-dark-2"
              :aria-label="`Delete ${slot.label} entry`"
              @click="removeEntry(e.id)"
            >
              <AppIcon name="trash" :size="15" />
            </button>
          </li>
        </ul>

        <button
          class="flex w-full items-center justify-center gap-1.5 border-t border-line/70 py-3 text-sm font-semibold transition hover:bg-surface-bg active:scale-[.99] dark:border-line-dark/70 dark:hover:bg-surface-dark-2"
          :style="{ color: slot.color }"
          @click="addingTo = slot"
        >
          <AppIcon name="plus" :size="16" />
          Add food
        </button>
      </section>
    </div>

    <AddFoodSheet v-if="addingTo" :slot-label="addingTo.label" @close="addingTo = null" @save="saveItems" />
  </div>
</template>
