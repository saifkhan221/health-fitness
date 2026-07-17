<script setup lang="ts">
// Hero calorie ring — shows kcal REMAINING (goal − eaten). Over goal → danger state.
const props = withDefaults(
  defineProps<{
    eaten: number
    goal: number
    size?: number
  }>(),
  { size: 150 },
)

const STROKE = 12
const r = computed(() => (props.size - STROKE) / 2)
const circumference = computed(() => 2 * Math.PI * r.value)
const over = computed(() => props.eaten > props.goal)
const pct = computed(() => Math.min(props.eaten / Math.max(props.goal, 1), 1))
const dash = computed(() => `${pct.value * circumference.value} ${circumference.value}`)
const remaining = computed(() => Math.round(Math.abs(props.goal - props.eaten)))
</script>

<template>
  <div class="relative shrink-0" :style="{ width: `${size}px`, height: `${size}px` }">
    <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`">
      <defs>
        <linearGradient id="hero-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#22C55E" />
          <stop offset="100%" stop-color="#16A34A" />
        </linearGradient>
      </defs>
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="r"
        fill="none"
        stroke="currentColor"
        :stroke-width="STROKE"
        class="text-line dark:text-line-dark"
      />
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="r"
        fill="none"
        :stroke="over ? '#F43F5E' : 'url(#hero-ring-grad)'"
        :stroke-width="STROKE"
        stroke-linecap="round"
        :stroke-dasharray="dash"
        :transform="`rotate(-90 ${size / 2} ${size / 2})`"
        class="motion-safe:transition-all motion-safe:duration-500"
      />
    </svg>
    <div class="absolute inset-0 grid place-items-center">
      <div class="flex flex-col items-center">
        <AppIcon name="flame" :size="16" class="text-accent-500" />
        <span
          class="tnum font-display text-4xl font-extrabold tracking-tight"
          :class="over ? 'text-danger' : 'text-ink dark:text-ink-inverse'"
        >
          {{ remaining }}
        </span>
        <span class="text-xs font-medium text-ink-muted dark:text-ink-inverse-muted">
          {{ over ? 'kcal over' : 'kcal left' }}
        </span>
      </div>
    </div>
  </div>
</template>
