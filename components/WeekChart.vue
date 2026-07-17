<script setup lang="ts">
// A "kitchen skyline" chart: calorie bars (skyline towers, colored by goal
// adherence) with a smooth spend line (a river) flowing over them. Hand-built
// in SVG — no charting library — to keep the brand's own gradients and colors.
interface DayPoint {
  iso: string
  label: string
  kcal: number
  cost: number
  isToday: boolean
}

const props = defineProps<{ days: DayPoint[]; kcalGoal: number; hovered?: string | null }>()
const emit = defineEmits<{ hover: [iso: string | null] }>()

const W = 700
const TOP = 18
const BASE = 190
const BARS_H = BASE - TOP
const LABEL_Y = 214
const COL_W = W / 7

const maxKcal = computed(() => Math.max(props.kcalGoal, ...props.days.map((d) => d.kcal), 1) * 1.15)
const maxCost = computed(() => Math.max(...props.days.map((d) => d.cost), 1) * 1.3)
const hasSpend = computed(() => props.days.some((d) => d.cost > 0))

const bars = computed(() =>
  props.days.map((d, i) => {
    const cx = COL_W * i + COL_W / 2
    const h = (d.kcal / maxKcal.value) * BARS_H
    return {
      ...d,
      cx,
      x: cx - 20,
      y: BASE - h,
      w: 40,
      h,
      overGoal: d.kcal > props.kcalGoal,
    }
  }),
)

const goalY = computed(() => BASE - (props.kcalGoal / maxKcal.value) * BARS_H)

const riverPoints = computed(() =>
  bars.value.map((b) => ({
    x: b.cx,
    y: BASE - (b.cost / maxCost.value) * BARS_H * 0.82,
  })),
)

// Catmull-Rom -> cubic Bezier smoothing (tension 1/6) for a fluid river line.
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return ''
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`
  }
  return d
}

const riverLine = computed(() => smoothPath(riverPoints.value))
const riverArea = computed(() => {
  const pts = riverPoints.value
  if (!pts.length) return ''
  const first = pts[0]
  const last = pts[pts.length - 1]
  return `${smoothPath(pts)} L ${last.x} ${BASE} L ${first.x} ${BASE} Z`
})
</script>

<template>
  <div>
    <svg
      :viewBox="`0 0 ${W} 226`"
      class="block w-full overflow-visible"
      role="img"
      aria-label="Weekly calories versus goal, with daily spend"
    >
      <defs>
        <linearGradient id="barGradGood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#4ADE80" />
          <stop offset="100%" stop-color="#16A34A" />
        </linearGradient>
        <linearGradient id="barGradOver" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FDA4AF" />
          <stop offset="100%" stop-color="#F43F5E" />
        </linearGradient>
        <linearGradient id="riverFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#14B8A6" stop-opacity="0.38" />
          <stop offset="100%" stop-color="#14B8A6" stop-opacity="0.02" />
        </linearGradient>
        <filter id="riverGlow" x="-20%" y="-100%" width="140%" height="300%">
          <feGaussianBlur stdDeviation="3.2" result="blur" />
        </filter>
      </defs>

      <!-- hover / today column highlight -->
      <rect
        v-for="(b, i) in bars"
        :key="`hl-${b.iso}`"
        :x="COL_W * i"
        :y="TOP - 10"
        :width="COL_W"
        :height="BASE - TOP + 34"
        rx="10"
        fill="#16A34A"
        class="transition-opacity duration-150"
        :opacity="hovered === b.iso ? 0.08 : b.isToday ? 0.05 : 0"
      />

      <!-- goal reference line -->
      <line :x1="6" :x2="W - 6" :y1="goalY" :y2="goalY" stroke="currentColor" class="text-line dark:text-line-dark" stroke-width="1.5" stroke-dasharray="5 5" />
      <text :x="W - 4" :y="goalY - 6" text-anchor="end" class="fill-ink-faint text-[10px] font-medium tnum">
        goal {{ Math.round(kcalGoal) }}
      </text>

      <!-- calorie bars (the skyline) -->
      <g v-for="b in bars" :key="b.iso" class="cursor-pointer" @mouseenter="emit('hover', b.iso)" @mouseleave="emit('hover', null)">
        <title>{{ b.label }} — {{ b.kcal }} kcal · {{ formatPaise(b.cost) }}</title>
        <rect
          v-if="b.kcal > 0"
          :x="b.x"
          :y="b.y"
          :width="b.w"
          :height="Math.max(b.h, 3)"
          rx="7"
          :fill="b.overGoal ? 'url(#barGradOver)' : 'url(#barGradGood)'"
          class="transition-opacity"
          :opacity="hovered && hovered !== b.iso ? 0.55 : 1"
        />
        <rect
          v-else
          :x="b.x"
          :y="BASE - 10"
          :width="b.w"
          height="10"
          rx="5"
          fill="none"
          stroke="currentColor"
          class="text-line dark:text-line-dark"
          stroke-width="1.5"
          stroke-dasharray="3 3"
        />
      </g>

      <!-- spend river -->
      <template v-if="hasSpend">
        <path :d="riverArea" fill="url(#riverFill)" />
        <path :d="riverLine" fill="none" stroke="#0D9488" stroke-width="3" opacity=".45" filter="url(#riverGlow)" />
        <path :d="riverLine" fill="none" stroke="#0D9488" stroke-width="2.25" stroke-linecap="round" />
        <circle
          v-for="p in riverPoints"
          :key="`pt-${p.x}`"
          :cx="p.x"
          :cy="p.y"
          r="3.5"
          class="fill-money-500 stroke-surface dark:stroke-surface-dark"
          stroke-width="1.5"
        />
      </template>

      <!-- x-axis weekday labels -->
      <g v-for="b in bars" :key="`lbl-${b.iso}`">
        <circle v-if="b.isToday" :cx="b.cx" :cy="LABEL_Y - 4" r="11" class="fill-brand-50 dark:fill-brand-600/15" />
        <text
          :x="b.cx"
          :y="LABEL_Y"
          text-anchor="middle"
          class="text-[11px] font-semibold tnum"
          :class="b.isToday ? 'fill-brand-700 dark:fill-brand-400' : 'fill-ink-muted dark:fill-ink-inverse-muted'"
        >
          {{ b.label }}
        </text>
      </g>
    </svg>

    <!-- legend -->
    <div class="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-muted dark:text-ink-inverse-muted">
      <span class="flex items-center gap-1.5">
        <span class="h-2.5 w-4 rounded-sm" style="background: linear-gradient(#4ADE80, #16A34A)" />
        Calories (within goal)
      </span>
      <span class="flex items-center gap-1.5">
        <span class="h-2.5 w-4 rounded-sm" style="background: linear-gradient(#FDA4AF, #F43F5E)" />
        Over goal
      </span>
      <span class="flex items-center gap-1.5">
        <svg width="18" height="10" viewBox="0 0 18 10"><line x1="0" y1="5" x2="18" y2="5" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 3" class="text-ink-faint" /></svg>
        Daily goal
      </span>
      <span class="flex items-center gap-1.5">
        <svg width="18" height="10" viewBox="0 0 18 10"><path d="M0 8 Q9 -2 18 8" fill="none" stroke="#0D9488" stroke-width="2" /></svg>
        Spend (₹)
      </span>
    </div>
    <p v-if="!hasSpend" class="mt-2 flex items-center gap-1.5 text-xs text-ink-faint">
      <AppIcon name="sparkles" :size="13" />
      The spend river fills in once purchases are logged in Pantry (Phase 3).
    </p>
  </div>
</template>
