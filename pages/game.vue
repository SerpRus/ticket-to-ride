<script lang="ts" setup>
import { onMounted, onBeforeUnmount } from 'vue';

import boardImage from '@/src/images/board.jpg';

const BOARD_SIZE = {
  width  : 1200,
  height : 800,
};
const BOARD_IMAGE_SIZE = {
  width  : 7016,
  height : 4960,
};
const SCALE_STEP = 0.05;

let game = null;

onMounted(() => {
  let scale = 0.3;

  let boardMinRightPosition = -(BOARD_IMAGE_SIZE.width * scale - BOARD_SIZE.width);
  let boardMinBottomPosition = -(BOARD_IMAGE_SIZE.height * scale - BOARD_SIZE.height);

  let board;
  let cursors;

  let isDragging = false;
  let prevPointerX = null;
  let prevPointerY = null;

  const onPointermove = (pointer) => {
    if (!isDragging) {
      return;
    }

    boardMinRightPosition = -(BOARD_IMAGE_SIZE.width * scale - BOARD_SIZE.width);
    boardMinBottomPosition = -(BOARD_IMAGE_SIZE.height * scale - BOARD_SIZE.height);

    if (prevPointerX !== null && prevPointerY !== null) {
      // Рассчитываем, на сколько пикселей сместилась мышь
      const deltaX = pointer.x - prevPointerX;
      const deltaY = pointer.y - prevPointerY;

      // Смещаем картинку на это расстояние
      if ((deltaX > 0 && board.x < 0) || (deltaX < 0 && board.x > boardMinRightPosition)) {
        const newPositionX = board.x + deltaX;

        if (newPositionX > 0) {
          board.x = 0;
        } else if (newPositionX < boardMinRightPosition) {
          board.x = boardMinRightPosition;
        } else {
          board.x = newPositionX;
        }
      }

      if ((deltaY > 0 && board.y < 0) || (deltaY < 0 && board.y > boardMinBottomPosition)) {
        const newPositionY = board.y + deltaY;

        if (newPositionY > 0) {
          board.y = 0;
        } else if (newPositionY < boardMinBottomPosition) {
          board.y = boardMinBottomPosition;
        } else {
          board.y = newPositionY;
        }
      }
    }

    // Обновляем предыдущие координаты указателя мыши
    prevPointerX = pointer.x;
    prevPointerY = pointer.y;
  };

  function preload() {
    this.load.image('board', boardImage);
  }

  function create() {
    board = this.add.image(0, 0, 'board').setOrigin(0, 0).setScale(scale);

    cursors = this.input.keyboard.createCursorKeys();

    this.input.on('pointerout', () => {
      console.log('123');
    });

    this.input.on('pointerdown', (pointer) => {
      isDragging = true;

      prevPointerX = pointer.x;
      prevPointerY = pointer.y;

      this.input.on('pointermove', onPointermove);
    });

    this.input.on('pointerup', () => {
      isDragging = false;
      this.input.off('pointermove', onPointermove);
    });

    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
      const isUpScroll = deltaY > 0;

      if ((!isUpScroll && board.scale < 0.5) || (isUpScroll && board.scale > 0.2)) {
        const cursorX = pointer.x - board.x;
        const cursorY = pointer.y - board.y;

        const currentScale = board.scale;

        if (pointer.deltaY < 0) {
          scale = currentScale + SCALE_STEP;
        } else {
          scale = currentScale - SCALE_STEP;
        }

        board.setScale(scale);

        boardMinRightPosition = -(BOARD_IMAGE_SIZE.width * scale - BOARD_SIZE.width);
        boardMinBottomPosition = -(BOARD_IMAGE_SIZE.height * scale - BOARD_SIZE.height);

        const newPositionX = board.x + cursorX * (1 - scale / currentScale);
        const newPositionY = board.y + cursorY * (1 - scale / currentScale);

        if (newPositionX < boardMinRightPosition) {
          board.x = boardMinRightPosition;
        } else if (newPositionX > 0) {
          board.x = 0;
        } else {
          board.x = newPositionX;
        }

        if (newPositionY < boardMinBottomPosition) {
          board.y = boardMinBottomPosition;
        } else if (newPositionY > 0) {
          board.y = 0;
        } else {
          board.y = newPositionY;
        }
      }
    });
  }

  function update() {
    // console.log('cursors', cursors);
    if (cursors.left.isDown && board.x < 0) {
      board.x += 10;
    } else if (cursors.right.isDown && board.x > -904.8) {
      board.x -= 10;
      // player.setVelocityX(160);
      //
      // player.anims.play('right', true);
    }

    if (cursors.up.isDown && board.y < 0) {
      board.y += 10;
      // player.setVelocityX(0);
      //
      // player.anims.play('turn');
    } else if (cursors.down.isDown && board.y > -688) {
      board.y -= 10;
      // player.setVelocityX(0);
      //
      // player.anims.play('turn');
    }

    // if (cursors.up.isDown && player.body.touching.down) {
    //   player.setVelocityY(-330);
    // }

    // console.log('prevPointerX', prevPointerX);
    // console.log('prevPointerY', prevPointerY);
  }

  const config = {
    type    : Phaser.AUTO,
    width   : BOARD_SIZE.width,
    height  : BOARD_SIZE.height,
    physics : {
      default : 'arcade',
      arcade  : {
        gravity : { y: 300 },
        debug   : false,
      },
    },
    scene: {
      preload,
      create,
      update,
    },
    parent: 'gameRef',
  };

  game = new Phaser.Game(config);
  console.log('game', game);

  const canvas = document.querySelector('canvas');
  canvas.addEventListener('mouseleave', () => {
    console.log('mouseleave');
    isDragging = false;
  });
});

onBeforeUnmount(() => {
  if (game) {
    game.destroy(true); // Удаляем игру и очищаем ресурсы
    game = null;
  }
});
</script>

<template>
  <div ref="gameRef" />
</template>

<style lang="scss" scoped>

</style>
