<template>
  <div>
    <h1 class="font-display text-2xl font-extrabold tracking-tight">Fitness</h1>
    <p class="mt-1 text-sm text-ink-muted dark:text-ink-inverse-muted">
      Body metrics &amp; trends — arriving in Phase 4.
    </p>

    <section
      class="mt-6 rounded-card border border-brand-500/30 bg-brand-50/70 p-5 shadow-card sm:p-6 dark:border-brand-500/25 dark:bg-brand-600/10 dark:shadow-card-dark"
    >
      <div class="flex items-center gap-3">
        <span
          class="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-brand-500/20 bg-surface text-brand-600 dark:bg-surface-dark dark:text-brand-400"
        >
          <AppIcon name="flame" :size="20" />
        </span>
        <h2 class="font-display text-lg font-bold text-brand-700 dark:text-brand-400">
          Know your body — coming in Phase 4
        </h2>
      </div>

      <ul class="mt-5 space-y-4">
        <li class="flex items-start gap-3">
          <span
            class="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-brand-500/20 bg-surface text-brand-600 dark:bg-surface-dark dark:text-brand-400"
          >
            <AppIcon name="scale" :size="17" />
          </span>
          <div class="min-w-0">
            <p class="text-sm font-semibold text-ink dark:text-ink-inverse">Weight &amp; body metrics</p>
            <p class="text-sm text-ink-muted dark:text-ink-inverse-muted">
              Log weight and BMI comes free — plus body fat % and waist, chest, hip and arm measurements.
            </p>
          </div>
        </li>
        <li class="flex items-start gap-3">
          <span
            class="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-brand-500/20 bg-surface text-brand-600 dark:bg-surface-dark dark:text-brand-400"
          >
            <AppIcon name="droplet" :size="17" />
          </span>
          <div class="min-w-0">
            <p class="text-sm font-semibold text-ink dark:text-ink-inverse">Custom metrics</p>
            <p class="text-sm text-ink-muted dark:text-ink-inverse-muted">
              Track anything — blood pressure, sleep, steps, water — with trend charts for each.
            </p>
          </div>
        </li>
        <li class="flex items-start gap-3">
          <span
            class="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-brand-500/20 bg-surface text-brand-600 dark:bg-surface-dark dark:text-brand-400"
          >
            <AppIcon name="activity" :size="17" />
          </span>
          <div class="min-w-0">
            <p class="text-sm font-semibold text-ink dark:text-ink-inverse">Smarter calorie goal</p>
            <p class="text-sm text-ink-muted dark:text-ink-inverse-muted">
              Activity level → TDEE → a suggested daily calorie goal that adapts as your body changes.
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
        Log weight → auto BMI → adaptive calorie goal
      </span>
    </div>
  </div>
</template>
