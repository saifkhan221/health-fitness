<script setup lang="ts">
// Bottom sheet / modal to compose a meal-slot entry from ingredient search.
interface Ingredient {
  id: string
  name: string
  category: string | null
  canonicalUnit: 'g' | 'ml' | 'piece'
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

async function save() {
  if (!draft.value.length) return
  saving.value = true
  try {
    emit('save', draft.value.map((d) => ({ ingredientId: d.ingredient.id, qty: d.qty, unit: d.unit })))
  } finally {
    saving.value = false
  }
}

onMounted(search)
</script>

<template>
  <div class="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center" @click.self="emit('close')">
    <div class="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-surface p-5 shadow-xl sm:rounded-2xl">
      <div class="flex items-center justify-between">
        <h2 class="font-display text-lg font-bold">Add to {{ slotLabel }}</h2>
        <button class="rounded-lg px-2 py-1 text-ink-muted hover:bg-stone-100" @click="emit('close')">✕</button>
      </div>

      <input
        v-model="q"
        type="search"
        placeholder="Search ingredients… (onion, dal, paneer)"
        class="mt-4 w-full rounded-lg border border-stone-300 px-3 py-2.5 focus:border-brand-500 focus:outline-none"
      />

      <!-- search results -->
      <ul v-if="results.length" class="mt-2 max-h-56 divide-y divide-stone-100 overflow-y-auto rounded-lg border border-stone-200">
        <li
          v-for="ing in results"
          :key="ing.id"
          class="flex cursor-pointer items-center justify-between px-3 py-2.5 hover:bg-brand-50"
          @click="add(ing)"
        >
          <div>
            <p class="text-sm font-medium">{{ ing.name }}</p>
            <p class="text-xs text-ink-muted">{{ ing.category }} · {{ Math.round(Number(ing.kcal)) }} kcal/100{{ ing.canonicalUnit === 'piece' ? 'g' : ing.canonicalUnit }}</p>
          </div>
          <span class="text-brand-600">＋</span>
        </li>
      </ul>
      <p v-else-if="q && !searching" class="mt-3 text-sm text-ink-muted">
        Nothing found. You can add custom ingredients from the Meals section.
      </p>

      <!-- draft items -->
      <div v-if="draft.length" class="mt-4 space-y-2">
        <p class="text-xs font-bold uppercase tracking-wide text-ink-muted">In this entry</p>
        <div
          v-for="(d, i) in draft"
          :key="i"
          class="flex items-center gap-2 rounded-lg bg-surface-bg px-3 py-2"
        >
          <span class="flex-1 truncate text-sm font-medium">{{ d.ingredient.name }}</span>
          <input
            v-model.number="d.qty"
            type="number"
            min="0"
            step="any"
            class="w-20 rounded-md border border-stone-300 px-2 py-1 text-right text-sm tnum"
          />
          <select v-model="d.unit" class="rounded-md border border-stone-300 px-1.5 py-1 text-sm">
            <option v-for="u in unitOptions(d.ingredient)" :key="u" :value="u">{{ u }}</option>
          </select>
          <button class="text-ink-muted hover:text-danger" @click="draft.splice(i, 1)">✕</button>
        </div>
      </div>

      <button
        class="mt-5 w-full rounded-xl bg-brand-600 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-40"
        :disabled="!draft.length || saving"
        @click="save"
      >
        {{ saving ? 'Saving…' : `Log ${draft.length} item${draft.length === 1 ? '' : 's'}` }}
      </button>
    </div>
  </div>
</template>
