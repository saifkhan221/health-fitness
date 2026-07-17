<script setup lang="ts">
const { data: meals, refresh } = await useFetch('/api/v1/meals', { default: () => [] })
const creating = ref(false)

async function saveMeal(items: { ingredientId: string; qty: number; unit: string }[]) {
  const name = prompt('Name this meal (e.g., "My usual breakfast")')
  if (!name) return
  await $fetch('/api/v1/meals', { method: 'POST', body: { name, items } })
  creating.value = false
  await refresh()
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between">
      <div>
        <h1 class="font-display text-2xl font-extrabold">Meals</h1>
        <p class="mt-1 text-sm text-ink-muted">Reusable compositions for one-tap logging. Recipes live separately (Phase 4).</p>
      </div>
      <button
        class="rounded-xl bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700"
        @click="creating = true"
      >
        ＋ New meal
      </button>
    </div>

    <div v-if="meals.length" class="mt-6 grid gap-3 sm:grid-cols-2">
      <div v-for="m in meals" :key="m.id" class="rounded-card bg-surface p-4 shadow-sm">
        <div class="flex items-start justify-between">
          <h2 class="font-semibold">{{ m.name }}</h2>
          <span class="tnum rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-700">
            {{ Math.round(Number(m.kcal)) }} kcal
          </span>
        </div>
        <p class="tnum mt-1 text-sm text-ink-muted">
          P {{ Math.round(Number(m.proteinG)) }}g · C {{ Math.round(Number(m.carbsG)) }}g · F {{ Math.round(Number(m.fatG)) }}g
          · {{ m.items.length }} ingredients
        </p>
      </div>
    </div>
    <div v-else class="mt-10 rounded-card border border-dashed border-stone-300 p-10 text-center text-ink-muted">
      <p class="text-3xl">🥘</p>
      <p class="mt-2 font-medium">No meals yet</p>
      <p class="text-sm">Create your first reusable meal — then logging it takes one tap.</p>
    </div>

    <AddFoodSheet v-if="creating" slot-label="new meal" @close="creating = false" @save="saveMeal" />
  </div>
</template>
