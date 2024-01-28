<script setup lang="ts">
import Game from './components/game/index.vue';
</script>

<template>
  <div>
    <client-only>
      <game />
    </client-only>
  </div>
</template>

<style lang="scss" scoped>
* {
  background-color: #fff;
}
</style>
