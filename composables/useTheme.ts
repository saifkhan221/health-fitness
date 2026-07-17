// App-wide light/dark theme, persisted in a cookie (SSR-safe).
export function useTheme() {
  const theme = useCookie<'light' | 'dark'>('rasoi-theme', {
    default: () => 'light',
    maxAge: 60 * 60 * 24 * 365,
  })

  function toggle() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  return { theme, toggle, isDark: computed(() => theme.value === 'dark') }
}
