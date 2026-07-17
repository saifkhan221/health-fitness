<script setup lang="ts">
const supabase = useSupabaseClient()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function login() {
  loading.value = true
  error.value = ''
  const { error: err } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })
  loading.value = false
  if (err) {
    error.value = err.message
    return
  }
  navigateTo('/today')
}
</script>

<template>
  <div class="mx-auto mt-12 max-w-sm rounded-card bg-surface p-6 shadow-sm">
    <h1 class="font-display text-2xl font-bold">Welcome back</h1>
    <form class="mt-5 space-y-3" @submit.prevent="login">
      <input
        v-model="email"
        type="email"
        required
        placeholder="Email"
        class="w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
      />
      <input
        v-model="password"
        type="password"
        required
        placeholder="Password"
        class="w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
      />
      <p v-if="error" class="text-sm text-danger">{{ error }}</p>
      <button
        type="submit"
        :disabled="loading"
        class="w-full rounded-lg bg-brand-600 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {{ loading ? 'Logging in…' : 'Log in' }}
      </button>
    </form>
    <p class="mt-4 text-sm text-ink-muted">
      New here?
      <NuxtLink to="/signup" class="font-medium text-brand-700">Create an account</NuxtLink>
    </p>
  </div>
</template>
