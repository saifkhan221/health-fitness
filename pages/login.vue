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
  <div class="mx-auto mt-10 w-full max-w-sm sm:mt-16">
    <div class="flex flex-col items-center gap-2.5">
      <span class="grid h-12 w-12 place-items-center rounded-2xl bg-brand-600 shadow-card">
        <AppIcon name="bowl" :size="24" class="text-white" />
      </span>
      <span class="font-display text-lg font-extrabold tracking-tight">Rasoi</span>
    </div>

    <div
      class="mt-6 rounded-card border border-line bg-surface p-6 shadow-card dark:border-line-dark dark:bg-surface-dark dark:shadow-card-dark"
    >
      <h1 class="font-display text-2xl font-extrabold tracking-tight">Welcome back</h1>
      <p class="mt-1 text-sm text-ink-muted dark:text-ink-inverse-muted">
        Log in to keep tracking meals, macros and money.
      </p>

      <form class="mt-5 space-y-3" @submit.prevent="login">
        <input
          v-model="email"
          type="email"
          required
          placeholder="Email"
          autocomplete="email"
          class="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[15px] placeholder:text-ink-faint focus:border-brand-500 focus:outline-none dark:border-line-dark dark:bg-surface-dark-2"
        />
        <input
          v-model="password"
          type="password"
          required
          placeholder="Password"
          autocomplete="current-password"
          class="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[15px] placeholder:text-ink-faint focus:border-brand-500 focus:outline-none dark:border-line-dark dark:bg-surface-dark-2"
        />
        <p v-if="error" class="text-sm text-danger">{{ error }}</p>
        <button
          type="submit"
          :disabled="loading"
          class="w-full rounded-xl bg-brand-600 px-4 py-2.5 font-semibold text-white transition hover:bg-brand-700 active:scale-[.98] disabled:opacity-50"
        >
          {{ loading ? 'Logging in…' : 'Log in' }}
        </button>
      </form>
    </div>

    <p class="mt-4 text-center text-sm text-ink-muted dark:text-ink-inverse-muted">
      New here?
      <NuxtLink
        to="/signup"
        class="font-semibold text-brand-600 hover:underline dark:text-brand-400"
      >
        Create an account
      </NuxtLink>
    </p>
  </div>
</template>
