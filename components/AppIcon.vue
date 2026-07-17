<script setup lang="ts">
// Single icon system for the whole app — Lucide-style 24×24 strokes.
// Usage: <AppIcon name="flame" :size="18" />
const props = withDefaults(defineProps<{ name: string; size?: number; strokeWidth?: number }>(), {
  size: 20,
  strokeWidth: 2,
})

const ICONS: Record<string, string> = {
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  bowl: '<path d="M4 12h16"/><path d="M5 12a7 7 0 0 0 14 0"/><path d="M9 5v2M12 3v4M15 5v2"/>',
  basket: '<path d="M2 11h20"/><path d="m5 11 4-7m10 7-4-7"/><path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6L20.5 11"/>',
  activity: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  'chevron-left': '<path d="m15 6-6 6 6 6"/>',
  'chevron-right': '<path d="m9 6 6 6-6 6"/>',
  trash: '<path d="M4 7h16"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><path d="m6 7 .8 12.1A2 2 0 0 0 8.8 21h6.4a2 2 0 0 0 2-1.9L18 7"/>',
  flame: '<path d="M12 3c1.2 3.2 4.5 4.6 4.5 8.5a4.5 4.5 0 0 1-9 0c0-1.2.4-2.3 1-3.2.6.9 1.4 1.4 1.4 1.4C10 7.6 11.2 5.4 12 3z"/>',
  rupee: '<path d="M6 3h12M6 8h12M9 13c6.7 0 6.7-10 0-10M6 13h3l8.5 8"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  sunrise: '<path d="m8 6 4-4 4 4"/><path d="M12 2v8"/><path d="M16 18a4 4 0 0 0-8 0"/><path d="M2 18h2m16 0h2M4.93 10.93l1.41 1.41m11.32 0 1.41-1.41M2 22h20"/>',
  apple: '<path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 4.5c-1.8 0-3 .5-5 .5s-3.2-.5-5-.5A4.9 4.9 0 0 0 2 9.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06z"/><path d="M10 2c1 .5 2 2 2 5"/>',
  coffee: '<path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><path d="M6 2v2m4-2v2m4-2v2"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
  droplet: '<path d="M12 3s6 6.3 6 10.5a6 6 0 0 1-12 0C6 9.3 12 3 12 3z"/>',
  sparkles: '<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9Z"/><path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9Z"/>',
  'arrow-right': '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  check: '<path d="m5 12 5 5 9-9"/>',
  wallet: '<path d="M20 7H4a2 2 0 0 1 0-4h13a1 1 0 0 1 1 1v3"/><path d="M4 7h16a1 1 0 0 1 1 1v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5"/><circle cx="16.5" cy="14" r="1.2" fill="currentColor" stroke="none"/>',
  scale: '<path d="M12 3v18M5 21h14"/><path d="m5 7 3.5 5h-7L5 7zm14 0 3.5 5h-7L19 7z"/><path d="M5 7h14"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
}
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    v-html="ICONS[name] ?? ICONS.bowl"
  />
</template>
