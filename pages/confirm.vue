<script setup lang="ts">
// Supabase email-confirmation callback lands here, then we bounce to the app.
const user = useSupabaseUser()
watchEffect(() => {
  if (user.value) navigateTo('/today', { replace: true })
})
</script>

<template>
  <p class="mt-16 text-center text-ink-muted">Confirming your account…</p>
</template>
