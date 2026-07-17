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
      <template v-if="!done">
        <h1 class="font-display text-2xl font-extrabold tracking-tight">Create your account</h1>
        <p class="mt-1 text-sm text-ink-muted dark:text-ink-inverse-muted">
          Meals, macros and money — tracked from day one.
        </p>

        <form class="mt-5 space-y-3" @submit.prevent="signup">
          <input
            v-model="name"
            type="text"
            required
            placeholder="Your name"
            autocomplete="name"
            class="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[15px] placeholder:text-ink-faint focus:border-brand-500 focus:outline-none dark:border-line-dark dark:bg-surface-dark-2"
          />
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
            minlength="8"
            placeholder="Password (8+ characters)"
            autocomplete="new-password"
            class="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[15px] placeholder:text-ink-faint focus:border-brand-500 focus:outline-none dark:border-line-dark dark:bg-surface-dark-2"
          />
          <p v-if="error" class="text-sm text-danger">{{ error }}</p>
          <button
            type="submit"
            :disabled="loading"
            class="w-full rounded-xl bg-brand-600 px-4 py-2.5 font-semibold text-white transition hover:bg-brand-700 active:scale-[.98] disabled:opacity-50"
          >
            {{ loading ? 'Creating…' : 'Sign up' }}
          </button>
        </form>
      </template>

      <template v-else>
        <div class="flex flex-col items-center py-2 text-center">
          <span
            class="grid h-12 w-12 place-items-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-600/15 dark:text-brand-400"
          >
            <AppIcon name="check" :size="22" />
          </span>
          <h1 class="mt-4 font-display text-2xl font-extrabold tracking-tight">
            Check your email
          </h1>
          <p class="mt-2 text-sm text-ink-muted dark:text-ink-inverse-muted">
            We sent a confirmation link to
            <strong class="font-semibold text-ink dark:text-ink-inverse">{{ email }}</strong
            >. Click it, then log in.
          </p>
        </div>
      </template>
    </div>

    <p v-if="!done" class="mt-4 text-center text-sm text-ink-muted dark:text-ink-inverse-muted">
      Already have an account?
      <NuxtLink to="/login" class="font-semibold text-brand-600 hover:underline dark:text-brand-400">
        Log in
      </NuxtLink>
    </p>
    <p v-else class="mt-4 text-center text-sm text-ink-muted dark:text-ink-inverse-muted">
      Confirmed already?
      <NuxtLink to="/login" class="font-semibold text-brand-600 hover:underline dark:text-brand-400">
        Log in
      </NuxtLink>
    </p>
  </div>
</template>
