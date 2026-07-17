<template>
  <div>
    <h1 class="font-display text-2xl font-extrabold tracking-tight">Pantry &amp; Budget</h1>
    <p class="mt-1 text-sm text-ink-muted dark:text-ink-inverse-muted">
      Purchases, true meal costs and run-out forecasts.
    </p>

    <section
      class="mt-6 rounded-card border border-money-500/30 bg-money-100/40 p-5 shadow-card sm:p-6 dark:border-money-500/25 dark:bg-money-500/10 dark:shadow-card-dark"
    >
      <div class="flex items-center gap-3">
        <span
          class="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-money-500/20 bg-surface text-money-600 dark:bg-surface-dark dark:text-money-400"
        >
          <AppIcon name="wallet" :size="20" />
        </span>
        <h2 class="font-display text-lg font-bold text-money-700 dark:text-money-400">
          The moat — coming in Phase 3
        </h2>
      </div>

      <ul class="mt-5 space-y-4">
        <li class="flex items-start gap-3">
          <span
            class="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-money-500/20 bg-surface text-money-600 dark:bg-surface-dark dark:text-money-400"
          >
            <AppIcon name="rupee" :size="17" />
          </span>
          <div class="min-w-0">
            <p class="text-sm font-semibold text-ink dark:text-ink-inverse">True cost per meal</p>
            <p class="text-sm text-ink-muted dark:text-ink-inverse-muted">
              Record purchases — "Onion 1 kg · ₹40" — and every plate shows its real ₹ cost via FIFO.
            </p>
          </div>
        </li>
        <li class="flex items-start gap-3">
          <span
            class="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-money-500/20 bg-surface text-money-600 dark:bg-surface-dark dark:text-money-400"
          >
            <AppIcon name="basket" :size="17" />
          </span>
          <div class="min-w-0">
            <p class="text-sm font-semibold text-ink dark:text-ink-inverse">Live stock &amp; run-outs</p>
            <p class="text-sm text-ink-muted dark:text-ink-inverse-muted">
              Stock bars for every ingredient, with forecasts like "olive oil runs out next Thursday".
            </p>
          </div>
        </li>
        <li class="flex items-start gap-3">
          <span
            class="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-money-500/20 bg-surface text-money-600 dark:bg-surface-dark dark:text-money-400"
          >
            <AppIcon name="activity" :size="17" />
          </span>
          <div class="min-w-0">
            <p class="text-sm font-semibold text-ink dark:text-ink-inverse">Spend analytics</p>
            <p class="text-sm text-ink-muted dark:text-ink-inverse-muted">
              Weekly spend vs budget, cost per meal slot, and your most expensive meals.
            </p>
          </div>
        </li>
      </ul>
    </section>

    <div class="mt-6">
      <span
        class="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs font-medium text-ink-muted dark:border-line-dark dark:bg-surface-dark dark:text-ink-inverse-muted"
      >
        <AppIcon name="sparkles" :size="14" />
        Purchases → FIFO costing → run-out forecasts
      </span>
    </div>
  </div>
</template>
