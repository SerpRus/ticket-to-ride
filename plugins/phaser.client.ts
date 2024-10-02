import { defineNuxtPlugin } from '#app';
import Phaser from 'phaser';

export default defineNuxtPlugin(() => {
  // Делаем Phaser доступным глобально через window
  if (process.client) {
    window.Phaser = Phaser;
  }
});
