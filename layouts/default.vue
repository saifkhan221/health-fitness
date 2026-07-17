<script setup lang="ts">
const user = useSupabaseUser()
const supabase = useSupabaseClient()
const route = useRoute()
const { isDark, toggle } = useTheme()

const nav = [
  { to: '/today', label: 'Today', icon: 'home' },
  { to: '/calendar', label: 'Calendar', icon: 'calendar' },
  { to: '/meals', label: 'Meals', icon: 'bowl' },
  { to: '/pantry', label: 'Pantry', icon: 'basket' },
  { to: '/fitness', label: 'Fitness', icon: 'activity' },
]

function isActive(to: string) {
  return route.path.startsWith(to)
}

async function signOut() {
  await supabase.auth.signOut()
  navigateTo('/login')
}
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <header
      class="sticky top-0 z-20 border-b border-line bg-surface-bg/80 backdrop-blur-md dark:border-line-dark dark:bg-surface-bg-dark/80"
    >
      <div class="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <NuxtLink
          :to="user ? '/today' : '/'"
          class="flex shrink-0 items-center gap-2.5 transition active:scale-[.98]"
        >
          <span class="grid h-8 w-8 place-items-center rounded-xl bg-brand-600">
            <AppIcon name="bowl" :size="18" class="text-white" />
          </span>
          <span class="font-display text-xl font-extrabold tracking-tight">Rasoi</span>
        </NuxtLink>

        <nav v-if="user" class="hidden items-center gap-1 sm:flex">
          <NuxtLink
            v-for="item in nav"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition active:scale-[.98]"
            :class="
              isActive(item.to)
                ? 'bg-brand-600/10 text-brand-700 dark:text-brand-400'
                : 'text-ink-muted hover:bg-surface hover:text-ink dark:text-ink-inverse-muted dark:hover:bg-surface-dark-2 dark:hover:text-ink-inverse'
            "
          >
            <AppIcon :name="item.icon" :size="16" />
            {{ item.label }}
          </NuxtLink>
        </nav>

        <div class="flex shrink-0 items-center gap-2">
          <button
            type="button"
            class="grid h-9 w-9 place-items-center rounded-full border border-line text-ink-muted transition hover:bg-surface hover:text-ink active:scale-[.98] dark:border-line-dark dark:text-ink-inverse-muted dark:hover:bg-surface-dark-2 dark:hover:text-ink-inverse"
            :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            @click="toggle"
          >
            <AppIcon :name="isDark ? 'sun' : 'moon'" :size="17" />
          </button>
          <button
            v-if="user"
            type="button"
            class="grid h-9 w-9 place-items-center rounded-full border border-line text-ink-muted transition hover:bg-surface hover:text-ink active:scale-[.98] dark:border-line-dark dark:text-ink-inverse-muted dark:hover:bg-surface-dark-2 dark:hover:text-ink-inverse"
            aria-label="Sign out"
            @click="signOut"
          >
            <AppIcon name="logout" :size="17" />
          </button>
        </div>
      </div>
    </header>

    <main class="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-28 sm:pb-10">
      <slot />
    </main>

    <!-- Mobile floating pill dock -->
    <nav
      v-if="user"
      class="fixed inset-x-3 bottom-3 z-20 flex items-stretch justify-around rounded-2xl border border-line bg-surface/90 px-1 py-1.5 shadow-lift backdrop-blur-md dark:border-line-dark dark:bg-surface-dark/90 sm:hidden"
    >
      <NuxtLink
        v-for="item in nav"
        :key="item.to"
        :to="item.to"
        class="flex flex-1 flex-col items-center gap-0.5 rounded-xl px-1 pb-1 pt-1.5 text-[10px] font-semibold transition active:scale-[.98]"
        :class="
          isActive(item.to)
            ? 'text-brand-600 dark:text-brand-400'
            : 'text-ink-muted dark:text-ink-inverse-muted'
        "
      >
        <AppIcon :name="item.icon" :size="19" />
        {{ item.label }}
        <span
          class="h-1 w-1 rounded-full"
          :class="isActive(item.to) ? 'bg-brand-600 dark:bg-brand-400' : 'bg-transparent'"
        />
      </NuxtLink>
    </nav>
  </div>
</template>
