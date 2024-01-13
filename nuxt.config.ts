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
  css: [
    '/src/scss/index.scss',
  ],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData:
            `
              @use "sass:math";
              @use "sass:list";
              @import "src/scss/abstracts/_mixin.scss";
              @import "src/scss/abstracts/_function.scss";
              @import "src/scss/abstracts/_variables.scss";
              @import "src/scss/base/_fonts.scss";
              @import "src/scss/base/_generic.scss";
            `,
        },
      },
    },
  },
});
