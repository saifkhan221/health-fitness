<script setup lang="ts">
// Bottom sheet / modal to compose a meal-slot entry from ingredient search.
interface Ingredient {
  id: string
  name: string
  category: string | null
  canonicalUnit: 'g' | 'ml' | 'piece'
  pieceWeightG: string | null
  kcal: string
  proteinG: string
  units: { unitName: string; qtyCanonical: string }[]
}
interface DraftItem {
  ingredient: Ingredient
  qty: number
  unit: string
}

const props = defineProps<{ slotLabel: string }>()
const emit = defineEmits<{ close: []; save: [items: { ingredientId: string; qty: number; unit: string }[]] }>()

const q = ref('')
const results = ref<Ingredient[]>([])
const draft = ref<DraftItem[]>([])
const searching = ref(false)
const saving = ref(false)
const searchInput = ref<HTMLInputElement | null>(null)

let timer: ReturnType<typeof setTimeout>
watch(q, () => {
  clearTimeout(timer)
  timer = setTimeout(search, 250)
})

async function search() {
  searching.value = true
  try {
    results.value = await $fetch<Ingredient[]>('/api/v1/ingredients', { query: { q: q.value } })
  } catch {
    results.value = []
  } finally {
    searching.value = false
  }
}

function unitOptions(ing: Ingredient): string[] {
  const base = ing.canonicalUnit === 'g' ? ['g', 'kg'] : ing.canonicalUnit === 'ml' ? ['ml', 'tsp', 'tbsp', 'cup'] : ['piece']
  return [...base, ...ing.units.map((u) => u.unitName)]
}

function add(ing: Ingredient) {
  draft.value.push({
    ingredient: ing,
    qty: ing.canonicalUnit === 'piece' ? 1 : 100,
    unit: ing.canonicalUnit,
  })
  q.value = ''
  results.value = []
}

// Qty stepper: ±10 for g/ml, ±1 for pieces & custom units.
function stepFor(d: DraftItem): number {
  return d.unit === 'g' || d.unit === 'ml' ? 10 : 1
}

function stepQty(d: DraftItem, dir: 1 | -1) {
  const next = (Number(d.qty) || 0) + dir * stepFor(d)
  d.qty = Math.max(0, Math.round(next * 100) / 100)
}

// Approximate grams for the live kcal preview (canonical qty ≈ grams; pieces
// use pieceWeightG when present; custom units use their qtyCanonical factor).
const GLOBAL_UNITS: Record<Ingredient['canonicalUnit'], Record<string, number>> = {
  g: { g: 1, kg: 1000, mg: 0.001 },
  ml: { ml: 1, l: 1000, tsp: 5, tbsp: 15, cup: 240 },
  piece: { piece: 1, pc: 1, dozen: 12 },
}

function draftGrams(d: DraftItem): number {
  const ing = d.ingredient
  const u = d.unit.trim().toLowerCase()
  const qty = Number(d.qty) || 0
  let canonical: number | null = null
  const global = GLOBAL_UNITS[ing.canonicalUnit][u]
  if (global !== undefined) {
    canonical = qty * global
  } else {
    const custom = ing.units.find((r) => r.unitName.trim().toLowerCase() === u)
    if (custom) canonical = qty * Number(custom.qtyCanonical)
  }
  if (canonical === null) return 0
  if (ing.canonicalUnit === 'piece') return canonical * (Number(ing.pieceWeightG) || 100)
  return canonical
}

const previewKcal = computed(() =>
  Math.round(draft.value.reduce((sum, d) => sum + (Number(d.ingredient.kcal) / 100) * draftGrams(d), 0)),
)

// Tinted result tiles: deterministic tint per category/name.
const TILE_TINTS = [
  'bg-brand-100 text-brand-700 dark:bg-brand-600/15 dark:text-brand-400',
  'bg-accent-100 text-accent-600 dark:bg-accent-500/15 dark:text-accent-400',
  'bg-money-100 text-money-700 dark:bg-money-600/15 dark:text-money-400',
  'bg-violet-500/15 text-violet-500 dark:bg-violet-500/20 dark:text-violet-400',
]

function tileTint(ing: Ingredient): string {
  const key = ing.category ?? ing.name
  let h = 0
  for (let i = 0; i < key.length; i++) h = (h + key.charCodeAt(i)) % TILE_TINTS.length
  return TILE_TINTS[h]
}

async function save() {
  if (!draft.value.length) return
  saving.value = true
  try {
    emit('save', draft.value.map((d) => ({ ingredientId: d.ingredient.id, qty: d.qty, unit: d.unit })))
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  search()
  searchInput.value?.focus()
})
</script>

<template>
  <div
    class="fixed inset-0 z-40 flex items-end justify-center bg-black/50 backdrop-blur-[2px] motion-safe:animate-fade-in sm:items-center sm:p-4"
    @click.self="emit('close')"
  >
    <div
      role="dialog"
      aria-modal="true"
      :aria-label="`Add to ${slotLabel}`"
      class="flex max-h-[88vh] w-full max-w-lg flex-col rounded-t-sheet bg-surface text-ink shadow-sheet motion-safe:animate-slide-up dark:bg-surface-dark dark:text-ink-inverse sm:rounded-sheet"
    >
      <!-- Sticky header: drag handle + title + search -->
      <div class="shrink-0 px-5 pb-3 pt-3 sm:pt-5">
        <div class="mx-auto mb-3 h-1 w-10 rounded-full bg-line dark:bg-line-dark sm:hidden" />
        <div class="flex items-center justify-between gap-3">
          <h2 class="font-display text-lg font-bold">Add to {{ slotLabel }}</h2>
          <button
            type="button"
            aria-label="Close"
            class="grid h-9 w-9 place-items-center rounded-full border border-line text-ink-muted transition hover:bg-surface-bg hover:text-ink active:scale-[.98] dark:border-line-dark dark:text-ink-inverse-muted dark:hover:bg-surface-dark-2 dark:hover:text-ink-inverse"
            @click="emit('close')"
          >
            <AppIcon name="x" :size="16" />
          </button>
        </div>

        <div class="relative mt-4">
          <span class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint">
            <AppIcon name="search" :size="17" />
          </span>
          <input
            ref="searchInput"
            v-model="q"
            type="search"
            autofocus
            placeholder="Search ingredients… (onion, dal, paneer)"
            class="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-3.5 text-[15px] placeholder:text-ink-faint focus:border-brand-500 focus:outline-none dark:border-line-dark dark:bg-surface-dark-2"
          />
        </div>
      </div>

      <!-- Scrollable middle -->
      <div class="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
        <!-- Search results -->
        <ul v-if="results.length" class="space-y-0.5">
          <li
            v-for="ing in results"
            :key="ing.id"
            class="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-brand-50 active:scale-[.98] dark:hover:bg-brand-600/10"
            @click="add(ing)"
          >
            <span
              class="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-sm font-bold"
              :class="tileTint(ing)"
            >
              <template v-if="ing.category">{{ ing.category.charAt(0).toUpperCase() }}</template>
              <AppIcon v-else name="bowl" :size="16" />
            </span>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium">{{ ing.name }}</p>
              <p class="truncate text-xs text-ink-muted dark:text-ink-inverse-muted">
                <span class="tnum">{{ Math.round(Number(ing.kcal)) }}</span> kcal ·
                P <span class="tnum">{{ Number(ing.proteinG) }}</span> ·
                per 100{{ ing.canonicalUnit === 'ml' ? 'ml' : 'g' }}
              </p>
            </div>
            <span class="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-600/20 dark:text-brand-400">
              <AppIcon name="plus" :size="14" />
            </span>
          </li>
        </ul>

        <!-- Searching -->
        <p v-else-if="searching" class="py-6 text-center text-sm text-ink-faint">Searching…</p>

        <!-- No results -->
        <div v-else-if="q" class="flex flex-col items-center gap-1 py-8 text-center">
          <p class="text-sm font-medium text-ink-muted dark:text-ink-inverse-muted">No match — try 'dal' or 'paneer'</p>
          <p class="text-xs text-ink-faint">You can add custom ingredients from the Meals section.</p>
        </div>

        <!-- Empty search state -->
        <div v-else class="flex flex-col items-center gap-3 py-8 text-center">
          <span class="grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-600/15 dark:text-brand-400">
            <AppIcon name="search" :size="24" />
          </span>
          <div>
            <p class="text-sm font-medium text-ink-muted dark:text-ink-inverse-muted">Search 120+ Indian foods</p>
            <p class="mt-0.5 text-xs text-ink-faint">Try 'onion', 'dal' or 'paneer'</p>
          </div>
        </div>

        <!-- Draft items -->
        <div v-if="draft.length" class="mt-4 space-y-2">
          <p class="text-xs font-bold uppercase tracking-wide text-ink-faint">In this entry</p>
          <div
            v-for="(d, i) in draft"
            :key="i"
            class="flex items-center gap-2 rounded-xl bg-surface-bg px-3 py-2 dark:bg-surface-dark-2"
          >
            <span class="min-w-0 flex-1 truncate text-sm font-medium">{{ d.ingredient.name }}</span>

            <div class="flex items-center">
              <button
                type="button"
                :aria-label="`Decrease ${d.ingredient.name} quantity`"
                class="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line text-ink-muted transition hover:bg-surface hover:text-ink active:scale-[.98] dark:border-line-dark dark:text-ink-inverse-muted dark:hover:bg-surface-dark dark:hover:text-ink-inverse"
                @click="stepQty(d, -1)"
              >
                <AppIcon name="minus" :size="13" />
              </button>
              <input
                v-model.number="d.qty"
                type="number"
                min="0"
                step="any"
                class="w-14 border-0 bg-transparent p-0 text-center text-sm font-semibold tnum [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <button
                type="button"
                :aria-label="`Increase ${d.ingredient.name} quantity`"
                class="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line text-ink-muted transition hover:bg-surface hover:text-ink active:scale-[.98] dark:border-line-dark dark:text-ink-inverse-muted dark:hover:bg-surface-dark dark:hover:text-ink-inverse"
                @click="stepQty(d, 1)"
              >
                <AppIcon name="plus" :size="13" />
              </button>
            </div>

            <select
              v-model="d.unit"
              class="rounded-lg border border-line bg-transparent px-2 py-1 text-xs font-medium focus:border-brand-500 focus:outline-none dark:border-line-dark"
            >
              <option v-for="u in unitOptions(d.ingredient)" :key="u" :value="u">{{ u }}</option>
            </select>

            <button
              type="button"
              :aria-label="`Remove ${d.ingredient.name}`"
              class="grid h-7 w-7 shrink-0 place-items-center rounded-full text-ink-faint transition hover:text-danger active:scale-[.98]"
              @click="draft.splice(i, 1)"
            >
              <AppIcon name="x" :size="14" />
            </button>
          </div>
        </div>
      </div>

      <!-- Sticky footer -->
      <div class="shrink-0 border-t border-line px-5 py-4 dark:border-line-dark">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p v-if="draft.length" class="tnum text-sm font-semibold">≈ {{ previewKcal }} kcal</p>
            <p v-else class="text-sm text-ink-faint">No items yet</p>
            <p v-if="draft.length" class="text-[11px] text-ink-faint">estimated</p>
          </div>
          <button
            type="button"
            class="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 font-semibold text-white transition hover:bg-brand-700 active:scale-[.98] disabled:opacity-40"
            :disabled="!draft.length || saving"
            @click="save"
          >
            <AppIcon name="check" :size="16" />
            {{ saving ? 'Saving…' : `Log ${draft.length} item${draft.length === 1 ? '' : 's'}` }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
