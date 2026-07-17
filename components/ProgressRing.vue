<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    value: number
    max: number
    label: string
    sublabel?: string
    color?: string
    size?: number
  }>(),
  { color: '#16A34A', size: 108 },
)

const r = 44
const circumference = 2 * Math.PI * r
const pct = computed(() => Math.min(props.value / Math.max(props.max, 1), 1))
const dash = computed(() => `${pct.value * circumference} ${circumference}`)
const over = computed(() => props.value > props.max)
</script>

<template>
  <div class="flex flex-col items-center gap-1">
    <svg :width="size" :height="size" viewBox="0 0 108 108">
      <circle cx="54" cy="54" :r="r" fill="none" stroke="#E7E0D6" stroke-width="9" />
      <circle
        cx="54"
        cy="54"
        :r="r"
        fill="none"
        :stroke="over ? '#F43F5E' : color"
        stroke-width="9"
        stroke-linecap="round"
        :stroke-dasharray="dash"
        transform="rotate(-90 54 54)"
        class="transition-all duration-500"
      />
      <text x="54" y="50" text-anchor="middle" class="tnum" font-size="19" font-weight="700" fill="currentColor">
        {{ Math.round(value) }}
      </text>
      <text x="54" y="68" text-anchor="middle" font-size="11" fill="#78716C">/ {{ Math.round(max) }}</text>
    </svg>
    <span class="text-xs font-semibold">{{ label }}</span>
    <span v-if="sublabel" class="-mt-1 text-[11px] text-ink-muted">{{ sublabel }}</span>
  </div>
</template>
