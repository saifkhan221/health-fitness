<script setup lang="ts">
const supabase = useSupabaseClient()
const name = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const done = ref(false)
const loading = ref(false)

async function signup() {
  loading.value = true
  error.value = ''
  const { error: err } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
    options: { data: { display_name: name.value } },
  })
  loading.value = false
  if (err) {
    error.value = err.message
    return
  }
  done.value = true
}
</script>

<template>
  <div class="mx-auto mt-12 max-w-sm rounded-card bg-surface p-6 shadow-sm">
    <template v-if="!done">
      <h1 class="font-display text-2xl font-bold">Create your account</h1>
      <form class="mt-5 space-y-3" @submit.prevent="signup">
        <input
          v-model="name"
          type="text"
          required
          placeholder="Your name"
          class="w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
        />
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
          minlength="8"
          placeholder="Password (8+ characters)"
          class="w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
        />
        <p v-if="error" class="text-sm text-danger">{{ error }}</p>
        <button
          type="submit"
          :disabled="loading"
          class="w-full rounded-lg bg-brand-600 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {{ loading ? 'Creating…' : 'Sign up' }}
        </button>
      </form>
      <p class="mt-4 text-sm text-ink-muted">
        Already have an account?
        <NuxtLink to="/login" class="font-medium text-brand-700">Log in</NuxtLink>
      </p>
    </template>
    <template v-else>
      <h1 class="font-display text-2xl font-bold">Check your email 📬</h1>
      <p class="mt-3 text-ink-muted">
        We sent a confirmation link to <strong>{{ email }}</strong
        >. Click it, then log in.
      </p>
    </template>
  </div>
</template>
