<script setup lang="ts">
// Plan or review a single day+slot from the weekly calendar: pick from saved
// Meals for one-tap planning, compose custom ingredients, or copy an existing
// entry onto other days of the week.
const props = defineProps<{
  date: string
  slot: (typeof MEAL_SLOTS)[number]
  entries: any[]
  meals: any[]
  weekDates: string[]
}>()
const emit = defineEmits<{ close: []; changed: [] }>()
const { isDark } = useTheme()

const composing = ref(false)
const addingMealId = ref<string | null>(null)
const copyingEntryId = ref<string | null>(null)
const copyTargets = ref<string[]>([])
const copyBusy = ref(false)
const busyEntryId = ref<string | null>(null)

const dateLabel = computed(() =>
  new Date(props.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }),
)

const WEEKDAY_LETTERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const copyChoices = computed(() =>
  props.weekDates
    .filter((d) => d !== props.date)
    .map((d) => ({ iso: d, label: WEEKDAY_LETTERS[new Date(d).getDay()], dayNum: Number(d.slice(-2)) })),
)

function tileStyle() {
  return { background: isDark.value ? `${props.slot.color}26` : props.slot.tint, color: props.slot.color }
}

function entryDescription(e: any): string {
  return (e.items ?? []).map((it: any) => `${Number(it.displayQty)} ${it.displayUnit}`).join(' · ') || 'Custom entry'
}

async function addFromMeal(meal: any) {
  addingMealId.value = meal.id
  try {
    await $fetch('/api/v1/log-entries', {
      method: 'POST',
      body: {
        entryDate: props.date,
        mealType: props.slot.key,
        status: 'planned',
        mealId: meal.id,
        items: meal.items.map((i: any) => ({
          ingredientId: i.ingredientId,
          qty: Number(i.displayQty),
          unit: i.displayUnit,
        })),
      },
    })
    emit('changed')
  } finally {
    addingMealId.value = null
  }
}

async function saveCustom(items: { ingredientId: string; qty: number; unit: string }[]) {
  await $fetch('/api/v1/log-entries', {
    method: 'POST',
    body: { entryDate: props.date, mealType: props.slot.key, status: 'planned', items },
  })
  composing.value = false
  emit('changed')
}

function startCopy(entryId: string) {
  copyingEntryId.value = entryId
  copyTargets.value = []
}
function toggleTarget(iso: string) {
  const i = copyTargets.value.indexOf(iso)
  if (i === -1) copyTargets.value.push(iso)
  else copyTargets.value.splice(i, 1)
}
async function confirmCopy(entryId: string) {
  if (!copyTargets.value.length) return
  copyBusy.value = true
  try {
    await $fetch(`/api/v1/log-entries/${entryId}/copy`, {
      method: 'POST',
      body: { dates: copyTargets.value },
    })
    copyingEntryId.value = null
    emit('changed')
  } finally {
    copyBusy.value = false
  }
}

async function markEaten(entryId: string) {
  busyEntryId.value = entryId
  try {
    await $fetch(`/api/v1/log-entries/${entryId}/confirm`, { method: 'POST' })
    emit('changed')
  } finally {
    busyEntryId.value = null
  }
}
async function removeEntry(entryId: string) {
  busyEntryId.value = entryId
  try {
    await $fetch(`/api/v1/log-entries/${entryId}`, { method: 'DELETE' })
    emit('changed')
  } finally {
    busyEntryId.value = null
  }
}
</script>

<template>
  <div
    class="fixed inset-0 z-40 flex items-end justify-center bg-black/50 motion-safe:animate-fade-in sm:items-center"
    @click.self="emit('close')"
  >
    <div
      class="flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-t-sheet bg-surface shadow-sheet motion-safe:animate-slide-up dark:bg-surface-dark sm:rounded-sheet"
    >
      <!-- header -->
      <div class="shrink-0 px-5 pb-3 pt-3 sm:pt-5">
        <div class="mx-auto mb-3 h-1 w-10 rounded-full bg-line dark:bg-line-dark sm:hidden" />
        <div class="flex items-center gap-3">
          <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl" :style="tileStyle()">
            <AppIcon :name="slot.icon" :size="19" />
          </span>
          <div class="min-w-0 flex-1">
            <h2 class="font-display text-lg font-bold text-ink dark:text-ink-inverse">{{ slot.label }}</h2>
            <p class="text-xs text-ink-muted dark:text-ink-inverse-muted">{{ dateLabel }}</p>
          </div>
          <button
            class="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-muted transition hover:bg-surface-bg dark:text-ink-inverse-muted dark:hover:bg-surface-dark-2"
            aria-label="Close"
            @click="emit('close')"
          >
            <AppIcon name="x" :size="18" />
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto px-5 pb-5">
        <!-- existing entries -->
        <div v-if="entries.length" class="mb-5 space-y-2.5">
          <p class="text-xs font-bold uppercase tracking-wide text-ink-faint">Already here</p>
          <div
            v-for="e in entries"
            :key="e.id"
            class="rounded-xl border border-line bg-surface-bg/60 p-3 dark:border-line-dark dark:bg-surface-dark-2/60"
          >
            <div class="flex items-start gap-2">
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium text-ink dark:text-ink-inverse">{{ entryDescription(e) }}</p>
                <p class="tnum text-xs text-ink-muted dark:text-ink-inverse-muted">
                  {{ Math.round(Number(e.kcal)) }} kcal
                  <span
                    class="ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                    :class="
                      e.status === 'planned'
                        ? 'bg-accent-100 text-accent-600 dark:bg-accent-500/15 dark:text-accent-400'
                        : 'bg-brand-100 text-brand-700 dark:bg-brand-600/15 dark:text-brand-400'
                    "
                  >
                    {{ e.status === 'planned' ? 'Planned' : 'Logged' }}
                  </span>
                </p>
              </div>
              <div class="flex shrink-0 items-center gap-1">
                <button
                  v-if="e.status === 'planned' && date <= todayISO()"
                  class="grid h-8 w-8 place-items-center rounded-full text-ink-faint transition hover:bg-brand-50 hover:text-brand-600 disabled:opacity-40 dark:hover:bg-brand-600/15"
                  :disabled="busyEntryId === e.id"
                  aria-label="Mark as eaten"
                  title="Mark as eaten"
                  @click="markEaten(e.id)"
                >
                  <AppIcon name="check" :size="15" />
                </button>
                <button
                  class="grid h-8 w-8 place-items-center rounded-full text-ink-faint transition hover:bg-surface-bg hover:text-ink dark:hover:bg-surface-dark-2"
                  aria-label="Copy to other days"
                  title="Copy to other days"
                  @click="startCopy(e.id)"
                >
                  <AppIcon name="copy" :size="14" />
                </button>
                <button
                  class="grid h-8 w-8 place-items-center rounded-full text-ink-faint transition hover:bg-surface-bg hover:text-danger disabled:opacity-40 dark:hover:bg-surface-dark-2"
                  :disabled="busyEntryId === e.id"
                  aria-label="Delete"
                  @click="removeEntry(e.id)"
                >
                  <AppIcon name="trash" :size="15" />
                </button>
              </div>
            </div>

            <!-- inline copy-target picker -->
            <div v-if="copyingEntryId === e.id" class="mt-3 border-t border-line/70 pt-3 dark:border-line-dark/70">
              <p class="mb-2 text-xs font-medium text-ink-muted dark:text-ink-inverse-muted">Copy to:</p>
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="c in copyChoices"
                  :key="c.iso"
                  class="rounded-full border px-2.5 py-1 text-xs font-semibold transition"
                  :class="
                    copyTargets.includes(c.iso)
                      ? 'border-brand-600 bg-brand-600 text-white'
                      : 'border-line text-ink-muted hover:bg-surface-bg dark:border-line-dark dark:text-ink-inverse-muted dark:hover:bg-surface-dark-2'
                  "
                  @click="toggleTarget(c.iso)"
                >
                  {{ c.label }} {{ c.dayNum }}
                </button>
              </div>
              <div class="mt-2.5 flex items-center gap-2">
                <button
                  class="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-700 disabled:opacity-40"
                  :disabled="!copyTargets.length || copyBusy"
                  @click="confirmCopy(e.id)"
                >
                  {{ copyBusy ? 'Copying…' : `Copy to ${copyTargets.length || ''} day${copyTargets.length === 1 ? '' : 's'}` }}
                </button>
                <button
                  class="rounded-lg px-3 py-1.5 text-xs font-semibold text-ink-muted hover:bg-surface-bg dark:text-ink-inverse-muted dark:hover:bg-surface-dark-2"
                  @click="copyingEntryId = null"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- add from saved meals -->
        <div class="mb-4">
          <p class="mb-2 text-xs font-bold uppercase tracking-wide text-ink-faint">Add from your meals</p>
          <div v-if="meals.length" class="space-y-1.5">
            <button
              v-for="m in meals"
              :key="m.id"
              class="flex w-full items-center gap-3 rounded-xl border border-line px-3 py-2.5 text-left transition hover:border-brand-500/60 hover:bg-brand-50 disabled:opacity-50 dark:border-line-dark dark:hover:bg-brand-600/10"
              :disabled="addingMealId === m.id"
              @click="addFromMeal(m)"
            >
              <span class="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-600/15 dark:text-brand-400">
                <AppIcon name="bowl" :size="15" />
              </span>
              <span class="min-w-0 flex-1 truncate text-sm font-medium text-ink dark:text-ink-inverse">{{ m.name }}</span>
              <span class="tnum shrink-0 text-xs text-ink-muted dark:text-ink-inverse-muted">
                {{ addingMealId === m.id ? 'Adding…' : `${Math.round(Number(m.kcal))} kcal` }}
              </span>
            </button>
          </div>
          <p v-else class="text-sm text-ink-muted dark:text-ink-inverse-muted">
            No saved meals yet —
            <NuxtLink to="/meals" class="font-semibold text-brand-600 hover:underline dark:text-brand-400">create one</NuxtLink>
            for one-tap planning.
          </p>
        </div>

        <button
          class="flex w-full items-center justify-center gap-1.5 rounded-xl border border-line py-2.5 text-sm font-semibold text-ink-muted transition hover:bg-surface-bg dark:border-line-dark dark:text-ink-inverse-muted dark:hover:bg-surface-dark-2"
          @click="composing = true"
        >
          <AppIcon name="plus" :size="15" />
          Add custom ingredients
        </button>
      </div>
    </div>

    <AddFoodSheet v-if="composing" :slot-label="slot.label" @close="composing = false" @save="saveCustom" />
  </div>
</template>
