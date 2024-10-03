import { defineNuxtPlugin } from '#app';
import Phaser from 'phaser';

export default defineNuxtPlugin(() => {
  if (process.client) {
    window.Phaser = Phaser;
  }
});
