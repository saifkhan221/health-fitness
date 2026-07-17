<script setup lang="ts">
const user = useSupabaseUser()
watchEffect(() => {
  if (user.value) navigateTo('/today', { replace: true })
})

const features = [
  {
    icon: 'flame',
    title: 'Calories & macros',
    body: 'Log any of 120+ Indian foods in two taps and watch protein, carbs and fat fill up in real time.',
    tile: 'bg-accent-100 text-accent-600 dark:bg-accent-500/15 dark:text-accent-400',
  },
  {
    icon: 'wallet',
    title: 'Every meal, priced',
    body: 'Each plate shows its ₹ cost, so your food budget is as visible as your calorie budget.',
    tile: 'bg-money-100 text-money-600 dark:bg-money-500/15 dark:text-money-400',
  },
  {
    icon: 'basket',
    title: 'A pantry that thinks ahead',
    body: 'FIFO costing tracks what is on the shelf and forecasts run-outs before the dabba is empty.',
    tile: 'bg-brand-100 text-brand-600 dark:bg-brand-600/15 dark:text-brand-400',
  },
]

const stats = ['120+ Indian foods', '₹ FIFO costing', 'WhatsApp coach']
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="mx-auto max-w-2xl py-14 text-center sm:py-20">
      <span
        class="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs font-semibold text-ink-muted dark:border-line-dark dark:bg-surface-dark dark:text-ink-inverse-muted"
      >
        <AppIcon name="sparkles" :size="13" class="text-brand-600 dark:text-brand-400" />
        Meals · Macros · Money
      </span>

      <h1
        class="mt-6 font-display text-5xl font-extrabold tracking-tight sm:text-6xl"
      >
        Eat well.
        <span class="bg-gradient-to-r from-brand-600 to-money-600 bg-clip-text text-transparent">
          Spend smart.
        </span>
      </h1>

      <p class="mx-auto mt-5 max-w-xl text-lg text-ink-muted dark:text-ink-inverse-muted">
        Plan the week, budget every ingredient and watch your pantry — Rasoi keeps your meals,
        macros and money on one plate.
      </p>

      <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
        <NuxtLink
          to="/signup"
          class="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 font-semibold text-white transition hover:bg-brand-700 active:scale-[.98]"
        >
          Start tracking free
          <AppIcon name="arrow-right" :size="16" />
        </NuxtLink>
        <NuxtLink
          to="/login"
          class="inline-flex items-center rounded-xl border border-line bg-surface px-5 py-2.5 font-semibold transition hover:bg-surface-bg active:scale-[.98] dark:border-line-dark dark:bg-surface-dark dark:hover:bg-surface-dark-2"
        >
          Log in
        </NuxtLink>
      </div>
    </section>

    <!-- Feature cards -->
    <section class="mx-auto grid max-w-4xl gap-4 sm:grid-cols-3">
      <article
        v-for="f in features"
        :key="f.title"
        class="rounded-card border border-line bg-surface p-5 shadow-card transition hover:shadow-lift dark:border-line-dark dark:bg-surface-dark dark:shadow-card-dark"
      >
        <span class="grid h-10 w-10 place-items-center rounded-xl" :class="f.tile">
          <AppIcon :name="f.icon" :size="20" />
        </span>
        <h2 class="mt-4 font-display text-base font-bold">{{ f.title }}</h2>
        <p class="mt-1.5 text-sm leading-relaxed text-ink-muted dark:text-ink-inverse-muted">
          {{ f.body }}
        </p>
      </article>
    </section>

    <!-- Stat chips -->
    <section class="mt-10 flex flex-wrap items-center justify-center gap-2 pb-6">
      <span
        v-for="s in stats"
        :key="s"
        class="tnum rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs font-semibold text-ink-muted dark:border-line-dark dark:bg-surface-dark dark:text-ink-inverse-muted"
      >
        {{ s }}
      </span>
    </section>
  </div>
</template>
