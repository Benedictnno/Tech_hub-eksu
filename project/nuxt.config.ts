// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
  ],

  pinia: {
    autoImports: [
      // automatically imports `defineStore`
      'defineStore',
      // automatically imports `defineStore` as `definePiniaStore`
      ['defineStore', 'definePiniaStore'],
    ],
  },

  app: {
    head: {
      title: 'TechHub Dashboard',
      script: [
        { src: 'https://js.paystack.co/v1/inline.js' }
      ],
      meta: [
        { name: 'description', content: 'Campus TechHub Management Dashboard' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap' }
      ]
    }
  },
  runtimeConfig: {
    public: {
      SECRET_KEY: process.env.NUXT_PUBLIC_KEY,
      URL: process.env.BAESE_URL,

      PAYSTACK:process.env.PAYSTACK_KEY
    },
   
  }
})