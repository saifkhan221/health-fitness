<script setup lang="ts">
const cursor = ref(mondayOf(todayISO())) // Monday of the viewed week

const weekDates = computed(() => Array.from({ length: 7 }, (_, i) => addDays(cursor.value, i)))
const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const range = computed(() => ({ from: weekDates.value[0], to: weekDates.value[6] }))
const { data: entries, refresh: refreshEntries } = await useFetch('/api/v1/log-entries', {
  query: range,
  default: () => [],
})
const { data: goals } = await useFetch('/api/v1/goals', {
  default: () => ({ kcal: 2000, protein_g: 90, carbs_g: 250, fat_g: 65, fiber_g: 30 }),
})
const { data: meals } = await useFetch('/api/v1/meals', { default: () => [] })

const hoveredDate = ref<string | null>(null)
const planTarget = ref<{ date: string; slot: (typeof MEAL_SLOTS)[number] } | null>(null)

function openPlanSheet(date: string, slotKey: string) {
  const slot = MEAL_SLOTS.find((s) => s.key === slotKey)
  if (slot) planTarget.value = { date, slot }
}

const planSheetEntries = computed(() =>
  planTarget.value
    ? (entries.value ?? []).filter(
        (e: any) => e.entryDate === planTarget.value!.date && e.mealType === planTarget.value!.slot.key,
      )
    : [],
)

const days = computed(() =>
  weekDates.value.map((iso, i) => ({
    iso,
    weekdayLabel: WEEKDAY_LABELS[i],
    dayNum: Number(iso.slice(-2)),
    isToday: iso === todayISO(),
    entries: (entries.value ?? []).filter((e: any) => e.entryDate === iso),
  })),
)

const chartDays = computed(() =>
  days.value.map((d) => ({
    iso: d.iso,
    label: d.weekdayLabel,
    kcal: Math.round(d.entries.reduce((s: number, e: any) => s + Number(e.kcal), 0)),
    cost: d.entries.reduce((s: number, e: any) => s + Number(e.costPaise || 0), 0),
    isToday: d.isToday,
  })),
)

const weekTotals = computed(() =>
  chartDays.value.reduce(
    (acc, d) => ({ kcal: acc.kcal + d.kcal, cost: acc.cost + d.cost }),
    { kcal: 0, cost: 0 },
  ),
)

const weekRangeLabel = computed(() => {
  const start = new Date(weekDates.value[0])
  const end = new Date(weekDates.value[6])
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()
  const startStr = start.toLocaleDateString('en-IN', { day: 'numeric', month: sameMonth ? undefined : 'short' })
  const endStr = end.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  return `${startStr} – ${endStr}`
})

const isCurrentWeek = computed(() => cursor.value === mondayOf(todayISO()))

function shiftWeek(delta: number) {
  cursor.value = addDays(cursor.value, delta * 7)
}
function jumpToThisWeek() {
  cursor.value = mondayOf(todayISO())
}
</script>

<template>
  <div>
    <!-- header -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="font-display text-2xl font-extrabold tracking-tight">Week of {{ weekRangeLabel }}</h1>
        <p class="mt-0.5 text-sm text-ink-muted dark:text-ink-inverse-muted">
          Every meal slot, at a glance — click a day to log or edit it.
        </p>
      </div>
      <div class="flex items-center gap-1.5">
        <button
          type="button"
          aria-label="Previous week"
          class="grid h-9 w-9 place-items-center rounded-full border border-line text-ink-muted transition hover:bg-surface-bg hover:text-ink active:scale-[.98] dark:border-line-dark dark:text-ink-inverse-muted dark:hover:bg-surface-dark-2 dark:hover:text-ink-inverse"
          @click="shiftWeek(-1)"
        >
          <AppIcon name="chevron-left" :size="18" />
        </button>
        <button
          type="button"
          class="rounded-full border border-line px-3.5 py-1.5 text-sm font-semibold text-ink-muted transition hover:bg-surface-bg hover:text-ink active:scale-[.98] disabled:opacity-40 dark:border-line-dark dark:text-ink-inverse-muted dark:hover:bg-surface-dark-2 dark:hover:text-ink-inverse"
          :disabled="isCurrentWeek"
          @click="jumpToThisWeek"
        >
          This week
        </button>
        <button
          type="button"
          aria-label="Next week"
          class="grid h-9 w-9 place-items-center rounded-full border border-line text-ink-muted transition hover:bg-surface-bg hover:text-ink active:scale-[.98] dark:border-line-dark dark:text-ink-inverse-muted dark:hover:bg-surface-dark-2 dark:hover:text-ink-inverse"
          @click="shiftWeek(1)"
        >
          <AppIcon name="chevron-right" :size="18" />
        </button>
      </div>
    </div>

    <!-- Mon–Sun day cards -->
    <div class="-mx-1 mt-5 flex gap-2.5 overflow-x-auto px-1 pb-1 sm:mx-0 sm:grid sm:grid-cols-7 sm:overflow-visible sm:px-0">
      <WeekDayCard
        v-for="day in days"
        :key="day.iso"
        :date="day.iso"
        :weekday-label="day.weekdayLabel"
        :day-num="day.dayNum"
        :is-today="day.isToday"
        :entries="day.entries"
        :kcal-goal="goals.kcal"
        :highlighted="hoveredDate === day.iso"
        @hover="hoveredDate = $event"
        @plan-slot="openPlanSheet(day.iso, $event)"
      />
    </div>

    <!-- legend -->
    <div class="mt-4 flex flex-wrap items-center gap-2">
      <span
        v-for="s in MEAL_SLOTS"
        :key="s.key"
        class="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-xs font-medium text-ink-muted dark:border-line-dark dark:bg-surface-dark dark:text-ink-inverse-muted"
      >
        <span class="h-2 w-2 rounded-full" :style="{ background: s.color }" />
        {{ s.label }}
      </span>
    </div>

    <!-- creative weekly chart -->
    <section
      class="mt-8 rounded-card border border-line bg-surface p-5 shadow-card dark:border-line-dark dark:bg-surface-dark dark:shadow-card-dark sm:p-6"
    >
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 class="font-display text-lg font-bold text-ink dark:text-ink-inverse">This week's rhythm</h2>
          <p class="mt-0.5 text-sm text-ink-muted dark:text-ink-inverse-muted">
            Calorie skyline against your goal, with a spend river flowing over it.
          </p>
        </div>
        <div class="flex gap-4 text-right">
          <div>
            <p class="tnum font-display text-xl font-extrabold text-ink dark:text-ink-inverse">
              {{ weekTotals.kcal.toLocaleString('en-IN') }}
            </p>
            <p class="text-[11px] text-ink-faint">kcal this week</p>
          </div>
          <div>
            <p class="tnum font-display text-xl font-extrabold text-money-600 dark:text-money-400">
              {{ formatPaise(weekTotals.cost) }}
            </p>
            <p class="text-[11px] text-ink-faint">spent this week</p>
          </div>
        </div>
      </div>

      <div class="mt-5">
        <WeekChart
          :days="chartDays"
          :kcal-goal="goals.kcal"
          :hovered="hoveredDate"
          @hover="hoveredDate = $event"
        />
      </div>
    </section>

    <p class="mt-3 flex items-center gap-1.5 text-xs text-ink-faint">
      <AppIcon name="sparkles" :size="14" />
      Tap any slot to plan a meal or copy it to other days — drag-and-drop planning arrives later.
    </p>

    <PlanSlotSheet
      v-if="planTarget"
      :date="planTarget.date"
      :slot="planTarget.slot"
      :entries="planSheetEntries"
      :meals="meals"
      :week-dates="weekDates"
      @close="planTarget = null"
      @changed="refreshEntries"
    />
  </div>
</template>
