<script setup lang="ts">
const { theme } = useTheme()
useHead({
  htmlAttrs: { class: computed(() => (theme.value === 'dark' ? 'dark' : '')) },
})
</script>

<template>
  <div
    class="min-h-screen bg-surface-bg font-sans text-ink antialiased transition-colors duration-300 dark:bg-surface-bg-dark dark:text-ink-inverse"
  >
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style>
html {
  scroll-behavior: smooth;
}
html.dark {
  color-scheme: dark;
}
/* Nutrition/₹ numbers align in columns everywhere */
.tnum {
  font-variant-numeric: tabular-nums;
}
/* Visible, on-brand keyboard focus */
:focus-visible {
  outline: 2px solid #16a34a;
  outline-offset: 2px;
  border-radius: 6px;
}
/* Page transitions */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
@media (prefers-reduced-motion: reduce) {
  .page-enter-active,
  .page-leave-active {
    transition: none;
  }
}
</style>
