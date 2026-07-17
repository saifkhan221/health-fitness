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
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="font-display text-2xl font-extrabold tracking-tight">Meals</h1>
        <p class="mt-1 text-sm text-ink-muted dark:text-ink-inverse-muted">One-tap logging for your usual plates.</p>
      </div>
      <button
        v-if="meals.length"
        class="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 active:scale-[.98]"
        @click="creating = true"
      >
        <AppIcon name="plus" :size="16" />
        New meal
      </button>
    </div>

    <div v-if="meals.length" class="mt-6 grid gap-4 sm:grid-cols-2">
      <article
        v-for="m in meals"
        :key="m.id"
        class="rounded-card border border-line bg-surface p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-lift dark:border-line-dark dark:bg-surface-dark dark:shadow-card-dark"
      >
        <div class="flex items-center gap-3">
          <span
            class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-600/15 dark:text-brand-400"
          >
            <AppIcon name="bowl" :size="19" />
          </span>
          <h2 class="min-w-0 flex-1 truncate font-semibold">{{ m.name }}</h2>
          <span
            class="tnum shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700 dark:bg-brand-600/15 dark:text-brand-400"
          >
            {{ Math.round(Number(m.kcal)) }} kcal
          </span>
        </div>

        <div class="mt-3 flex flex-wrap items-center gap-1.5">
          <span class="tnum rounded-md bg-surface-bg px-2 py-1 text-[11px] font-medium dark:bg-surface-dark-2">
            P {{ Math.round(Number(m.proteinG)) }}g
          </span>
          <span class="tnum rounded-md bg-surface-bg px-2 py-1 text-[11px] font-medium dark:bg-surface-dark-2">
            C {{ Math.round(Number(m.carbsG)) }}g
          </span>
          <span class="tnum rounded-md bg-surface-bg px-2 py-1 text-[11px] font-medium dark:bg-surface-dark-2">
            F {{ Math.round(Number(m.fatG)) }}g
          </span>
          <span class="tnum rounded-md bg-surface-bg px-2 py-1 text-[11px] font-medium dark:bg-surface-dark-2">
            Fbr {{ Math.round(Number(m.fiberG || 0)) }}g
          </span>
          <span class="tnum text-xs text-ink-faint">
            · {{ m.items.length }} ingredient{{ m.items.length === 1 ? '' : 's' }}
          </span>
        </div>
      </article>
    </div>

    <div
      v-else
      class="mt-10 rounded-card border border-dashed border-line bg-surface/60 px-6 py-14 text-center dark:border-line-dark dark:bg-surface-dark/60"
    >
      <div
        class="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-600/15 dark:text-brand-400"
      >
        <AppIcon name="bowl" :size="28" />
      </div>
      <h2 class="mt-4 font-display text-lg font-bold">Build your first meal</h2>
      <p class="mx-auto mt-1 max-w-sm text-sm text-ink-muted dark:text-ink-inverse-muted">
        Save your usual plates once — dal-chawal, poha, chai — then logging them takes a single tap.
      </p>
      <button
        class="mx-auto mt-5 flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 active:scale-[.98]"
        @click="creating = true"
      >
        <AppIcon name="plus" :size="16" />
        New meal
      </button>
    </div>

    <AddFoodSheet v-if="creating" slot-label="new meal" @close="creating = false" @save="saveMeal" />
  </div>
</template>
