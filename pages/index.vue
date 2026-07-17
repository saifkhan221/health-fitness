<script setup lang="ts">
const user = useSupabaseUser()
watchEffect(() => {
  if (user.value) navigateTo('/today', { replace: true })
})
</script>

<template>
  <div class="mx-auto max-w-xl py-16 text-center">
    <h1 class="font-display text-4xl font-extrabold text-brand-700">Rasoi</h1>
    <p class="mt-3 text-lg text-ink-muted">
      Track your meals, macros <span class="font-semibold text-money-600">and money</span> —
      plan the week, budget every ingredient, watch your pantry.
    </p>
    <div class="mt-8 flex justify-center gap-3">
      <NuxtLink
        to="/signup"
        class="rounded-xl bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700"
      >
        Get started
      </NuxtLink>
      <NuxtLink
        to="/login"
        class="rounded-xl border border-stone-300 px-5 py-2.5 font-semibold text-ink hover:bg-stone-100"
      >
        Log in
      </NuxtLink>
    </div>
  </div>
</template>
