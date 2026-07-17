export default defineNuxtConfig({
  compatibilityDate: '2026-07-17',
  devtools: { enabled: true },
  modules: ['@nuxtjs/supabase', '@nuxtjs/tailwindcss'],

  supabase: {
    // Reads SUPABASE_URL / SUPABASE_KEY from .env
    // TODO: set redirect back to true once real Supabase keys are in .env —
    // disabled for now so screens can be previewed without an account.
    redirect: false,
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/', '/signup'],
    },
  },

  runtimeConfig: {
    // Server-only: direct Postgres connection for Drizzle (Supabase connection string)
    databaseUrl: process.env.DATABASE_URL || '',
  },

  app: {
    head: {
      title: 'Rasoi — meals, macros & money',
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap',
        },
      ],
    },
  },
})
