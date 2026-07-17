<script setup lang="ts">
const user = useSupabaseUser()
const supabase = useSupabaseClient()
const route = useRoute()

const nav = [
  { to: '/today', label: 'Today', icon: '🍽️' },
  { to: '/calendar', label: 'Calendar', icon: '📅' },
  { to: '/meals', label: 'Meals', icon: '🥘' },
  { to: '/pantry', label: 'Pantry', icon: '🧺' },
  { to: '/fitness', label: 'Fitness', icon: '📈' },
]

async function signOut() {
  await supabase.auth.signOut()
  navigateTo('/login')
}
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <header
      v-if="user"
      class="sticky top-0 z-20 border-b border-stone-200 bg-surface/90 backdrop-blur"
    >
      <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <NuxtLink to="/today" class="font-display text-xl font-extrabold text-brand-700">
          Rasoi
        </NuxtLink>
        <nav class="hidden gap-1 sm:flex">
          <NuxtLink
            v-for="item in nav"
            :key="item.to"
            :to="item.to"
            class="rounded-lg px-3 py-1.5 text-sm font-medium text-ink-muted hover:bg-brand-50 hover:text-brand-700"
            :class="{ 'bg-brand-50 text-brand-700': route.path.startsWith(item.to) }"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>
        <button
          class="rounded-lg px-3 py-1.5 text-sm font-medium text-ink-muted hover:bg-stone-100"
          @click="signOut"
        >
          Sign out
        </button>
      </div>
    </header>

    <main class="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-24 sm:pb-6">
      <slot />
    </main>

    <!-- Mobile bottom tab bar -->
    <nav
      v-if="user"
      class="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t border-stone-200 bg-surface py-2 sm:hidden"
    >
      <NuxtLink
        v-for="item in nav"
        :key="item.to"
        :to="item.to"
        class="flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-[11px] font-medium text-ink-muted"
        :class="{ 'text-brand-700': route.path.startsWith(item.to) }"
      >
        <span class="text-lg leading-none">{{ item.icon }}</span>
        {{ item.label }}
      </NuxtLink>
    </nav>
  </div>
</template>
