// https://nuxt.com/docs/api/configuration/nuxt-config

const dev = process.env.NODE_ENV !== 'production';

export default defineNuxtConfig({
  modules: [
    ...(dev
      ? [
        '@nuxtjs/eslint-module',
      ]
      : []),
  ],
  eslint: {
    lintOnStart : false,
    fix         : true,
  },
  devtools: {
    enabled: true,
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData:
            `
              @use "sass:math";
              @use "sass:list";
              @import "src/scss/abstracts/_mixin.scss";
            `,
        },
      },
    },
  },
});
