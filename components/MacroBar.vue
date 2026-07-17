<script setup lang="ts">
// Slim labelled progress bar for a single macro (protein / carbs / fat).
const props = withDefaults(
  defineProps<{
    label: string
    value: number
    goal: number
    color: string
    unit?: string
  }>(),
  { unit: 'g' },
)

const pct = computed(() => Math.min((props.value / Math.max(props.goal, 1)) * 100, 100))
</script>

<template>
  <div>
    <div class="flex items-baseline justify-between gap-2">
      <span class="text-[13px] font-semibold text-ink dark:text-ink-inverse">{{ label }}</span>
      <span class="tnum text-[13px] text-ink-muted dark:text-ink-inverse-muted">
        {{ Math.round(value) }} / {{ Math.round(goal) }} {{ unit }}
      </span>
    </div>
    <div class="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-bg dark:bg-surface-dark-2">
      <div
        class="h-full rounded-full motion-safe:transition-all motion-safe:duration-500"
        :style="{ width: `${pct}%`, background: color }"
      />
    </div>
  </div>
</template>
