<script setup lang="ts">
const props = defineProps<{
  date: string
  weekdayLabel: string
  dayNum: number
  isToday: boolean
  entries: any[]
  kcalGoal: number
  highlighted?: boolean
}>()
const emit = defineEmits<{ hover: [date: string | null]; planSlot: [slotKey: string] }>()
const { isDark } = useTheme()

const slotTotals = computed(() =>
  MEAL_SLOTS.map((slot) => {
    const rows = props.entries.filter((e) => e.mealType === slot.key)
    return {
      slot,
      kcal: Math.round(rows.reduce((s, e) => s + Number(e.kcal), 0)),
      cost: rows.reduce((s, e) => s + Number(e.costPaise || 0), 0),
      count: rows.length,
      allPlanned: rows.length > 0 && rows.every((e) => e.status === 'planned'),
    }
  }),
)

const dayKcal = computed(() => Math.round(props.entries.reduce((s, e) => s + Number(e.kcal), 0)))
const dayCost = computed(() => props.entries.reduce((s, e) => s + Number(e.costPaise || 0), 0))
const overGoal = computed(() => dayKcal.value > props.kcalGoal)

function tileStyle(slot: (typeof MEAL_SLOTS)[number]) {
  return { background: isDark.value ? `${slot.color}26` : slot.tint, color: slot.color }
}
</script>

<template>
  <article
    class="flex min-w-[9.5rem] flex-1 flex-col overflow-hidden rounded-card border bg-surface shadow-card transition dark:bg-surface-dark dark:shadow-card-dark"
    :class="[
      isToday ? 'border-brand-500/50' : 'border-line dark:border-line-dark',
      highlighted ? 'ring-2 ring-brand-400 ring-offset-1 ring-offset-surface-bg dark:ring-offset-surface-bg-dark' : '',
    ]"
    @mouseenter="emit('hover', date)"
    @mouseleave="emit('hover', null)"
  >
    <!-- header -->
    <NuxtLink
      :to="{ path: '/today', query: { date } }"
      class="flex items-center justify-between px-3 py-2.5 transition hover:opacity-80"
      :class="isToday ? 'bg-brand-50 dark:bg-brand-600/10' : ''"
      :title="`Open ${weekdayLabel} ${dayNum} on Today`"
    >
      <span
        class="text-[11px] font-bold uppercase tracking-wider"
        :class="isToday ? 'text-brand-700 dark:text-brand-400' : 'text-ink-faint'"
      >
        {{ weekdayLabel }}
      </span>
      <span
        class="tnum grid h-6 w-6 place-items-center rounded-full text-xs font-bold"
        :class="isToday ? 'bg-brand-600 text-white' : 'text-ink dark:text-ink-inverse'"
      >
        {{ dayNum }}
      </span>
    </NuxtLink>

    <!-- slot rows: click any row to plan/review that slot -->
    <ul class="flex-1 space-y-0.5 px-1.5 py-2">
      <li v-for="st in slotTotals" :key="st.slot.key">
        <button
          type="button"
          class="flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-left transition hover:bg-surface-bg active:scale-[.98] dark:hover:bg-surface-dark-2"
          :class="st.allPlanned && 'opacity-60'"
          :title="`${st.slot.label}: ${st.count ? `${st.kcal} kcal · ${formatPaise(st.cost)}` : 'tap to plan'}`"
          @click="emit('planSlot', st.slot.key)"
        >
          <span
            class="grid h-5 w-5 shrink-0 place-items-center rounded-md"
            :style="st.count ? tileStyle(st.slot) : undefined"
            :class="!st.count && 'text-ink-faint/50 dark:text-ink-inverse-muted/30'"
          >
            <AppIcon :name="st.slot.icon" :size="12" />
          </span>
          <span
            class="tnum text-[11px] font-medium"
            :class="st.count ? 'text-ink dark:text-ink-inverse' : 'text-ink-faint/70'"
          >
            {{ st.count ? st.kcal : '–' }}
          </span>
          <span v-if="st.count" class="tnum ml-auto text-[10px] text-money-600 dark:text-money-400">
            {{ formatPaise(st.cost) }}
          </span>
          <AppIcon v-else name="plus" :size="11" class="ml-auto text-ink-faint/60" />
        </button>
      </li>
    </ul>

    <!-- footer totals -->
    <NuxtLink
      :to="{ path: '/today', query: { date } }"
      class="flex items-center justify-between border-t border-line/70 px-3 py-2 transition hover:bg-surface-bg dark:border-line-dark/70 dark:hover:bg-surface-dark-2"
    >
      <span
        class="tnum text-xs font-bold"
        :class="overGoal ? 'text-danger' : 'text-ink dark:text-ink-inverse'"
      >
        {{ dayKcal }} <span class="font-normal text-ink-faint">kcal</span>
      </span>
      <span class="tnum flex items-center gap-0.5 text-xs font-semibold text-money-600 dark:text-money-400">
        <AppIcon name="rupee" :size="11" />{{ formatPaise(dayCost) }}
      </span>
    </NuxtLink>
  </article>
</template>
