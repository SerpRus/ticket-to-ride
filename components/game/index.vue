<script setup lang="ts">
const AXIS = {
  NONE       : 1,
  HORIZONTAL : 2,
  VERTICAL   : 3,
  BOTH       : 4,
};

const controls = {
  left  : false,
  up    : false,
  right : false,
  down  : false,
};

class Rectangle {
  left;

  top;

  width;

  height;

  right;

  bottom;

  constructor(left, top, width, height) {
    this.left = left || 0;
    this.top = top || 0;
    this.width = width || 0;
    this.height = height || 0;
    this.right = this.left + this.width;
    this.bottom = this.top + this.height;
  }

  set(left, top, width, height) {
    this.left = left;
    this.top = top;
    this.width = width || this.width;
    this.height = height || this.height;
    this.right = (this.left + this.width);
    this.bottom = (this.top + this.height);
  }

  within(r) {
    return (r.left <= this.left &&
      r.right >= this.right &&
      r.top <= this.top &&
      r.bottom >= this.bottom);
  }

  overlaps(r) {
    return (this.left < r.right &&
      r.left < this.right &&
      this.top < r.bottom &&
      r.top < this.bottom);
  }
}

class Camera {
  xView;

  yView;

  xDeadZone;

  yDeadZone;

  wView;

  hView;

  axis;

  followed;

  viewportRect;

  worldRect;

  constructor(xView, yView, viewportWidth, viewportHeight, worldWidth, worldHeight) {
    // position of camera (left-top coordinate)
    this.xView = xView || 0;
    this.yView = yView || 0;
    // distance from followed object to border before camera starts move
    this.xDeadZone = 0; // min distance to horizontal borders
    this.yDeadZone = 0; // min distance to vertical borders
    // viewport dimensions
    this.wView = viewportWidth;
    this.hView = viewportHeight;
    // allow camera to move in vertical and horizontal axis
    this.axis = AXIS.BOTH;
    // object that should be followed
    this.followed = null;
    // rectangle that represents the viewport
    this.viewportRect = new Rectangle(this.xView, this.yView, this.wView, this.hView);
    // rectangle that represents the world's boundary (room's boundary)
    this.worldRect = new Rectangle(0, 0, worldWidth, worldHeight);
  }

  follow(gameObject, xDeadZone, yDeadZone) {
    this.followed = gameObject;
    this.xDeadZone = xDeadZone;
    this.yDeadZone = yDeadZone;
  }

  update() {
    // keep following the player (or other desired object)
    if (this.followed != null) {
      if (this.axis === AXIS.HORIZONTAL || this.axis === AXIS.BOTH) {
        // moves camera on horizontal axis based on followed object position
        if (this.followed.x - this.xView + this.xDeadZone > this.wView) {
          this.xView = this.followed.x - (this.wView - this.xDeadZone);
        } else if (this.followed.x - this.xDeadZone < this.xView) {
          this.xView = this.followed.x - this.xDeadZone;
        }
      }
      if (this.axis === AXIS.VERTICAL || this.axis === AXIS.BOTH) {
        // moves camera on vertical axis based on followed object position
        if (this.followed.y - this.yView + this.yDeadZone > this.hView) {
          this.yView = this.followed.y - (this.hView - this.yDeadZone);
        } else if (this.followed.y - this.yDeadZone < this.yView) {
          this.yView = this.followed.y - this.yDeadZone;
        }
      }
    }
    // update viewportRect
    this.viewportRect.set(this.xView, this.yView);
    // don't let camera leaves the world's boundary
    if (!this.viewportRect.within(this.worldRect)) {
      if (this.viewportRect.left < this.worldRect.left) { this.xView = this.worldRect.left; }
      if (this.viewportRect.top < this.worldRect.top) { this.yView = this.worldRect.top; }
      if (this.viewportRect.right > this.worldRect.right) { this.xView = this.worldRect.right - this.wView; }
      if (this.viewportRect.bottom > this.worldRect.bottom) { this.yView = this.worldRect.bottom - this.hView; }
    }
  }
}

class Player {
  x;

  y;

  speed;

  width;

  height;

  constructor(x, y) {
    // (x, y) = center of object
    // ATTENTION:
    // it represents the player position on the world(room), not the canvas position
    this.x = x;
    this.y = y;
    // move speed in pixels per second
    this.speed = 200;
    // render properties
    this.width = 50;
    this.height = 50;
  }

  update(step, worldWidth, worldHeight) {
    // parameter step is the time between frames ( in seconds )
    // check controls and move the player accordingly
    if (controls.left) { this.x -= this.speed * step; }
    if (controls.up) { this.y -= this.speed * step; }
    if (controls.right) { this.x += this.speed * step; }
    if (controls.down) { this.y += this.speed * step; }
    // don't let player leaves the world's boundary
    if (this.x - this.width / 2 < 0) {
      this.x = this.width / 2;
    }
    if (this.y - this.height / 2 < 0) {
      this.y = this.height / 2;
    }
    if (this.x + this.width / 2 > worldWidth) {
      this.x = worldWidth - this.width / 2;
    }
    if (this.y + this.height / 2 > worldHeight) {
      this.y = worldHeight - this.height / 2;
    }
  }

  draw(context, xView, yView) {
    // draw a simple rectangle shape as our player model
    context.save();
    context.fillStyle = 'black';
    // before draw we need to convert player world's position to canvas position
    context.fillRect((this.x - this.width / 2) - xView, (this.y - this.height / 2) - yView, this.width, this.height);
    context.restore();
  }
}

class Map {
  width;

  height;

  image;

  constructor(width, height) {
    // map dimensions
    this.width = width;
    this.height = height;
    // map texture
    this.image = null;
  }

  generate() {
    let ctx = document.createElement('canvas').getContext('2d');
    ctx.canvas.width = this.width;
    ctx.canvas.height = this.height;
    const rows = ~~(this.width / 44) + 1;
    const columns = ~~(this.height / 44) + 1;
    let color = 'red';
    ctx.save();
    ctx.fillStyle = 'red';
    for (let x = 0, i = 0; i < rows; x += 44, i++) {
      ctx.beginPath();
      for (let y = 0, j = 0; j < columns; y += 44, j++) {
        ctx.rect(x, y, 40, 40);
      }
      color = (color === 'red' ? 'blue' : 'red');
      ctx.fillStyle = color;
      ctx.fill();
      ctx.closePath();
    }
    ctx.restore();
    // store the generate map as this image texture
    this.image = new Image();
    this.image.src = ctx.canvas.toDataURL('image/png');
    // clear context
    ctx = null;
  }

  draw(context, xView, yView) {
    // easiest way: draw the entire map changing only the destination coordinate in canvas
    // canvas will cull the image by itself (no performance gaps -> in hardware accelerated environments, at least)
    /* context.drawImage(this.image, 0, 0, this.image.width, this.image.height, -xView, -yView, this.image.width, this.image.height); */
    // didactic way ( "s" is for "source" and "d" is for "destination" in the variable names):
    let sx,
      sy,
      dx,
      dy;
    let sWidth,
      sHeight,
      dWidth,
      dHeight;
    // offset point to crop the image
    sx = xView;
    sy = yView;
    // dimensions of cropped image
    sWidth = context.canvas.width;
    sHeight = context.canvas.height;
    // if cropped image is smaller than canvas we need to change the source dimensions
    if (this.image.width - sx < sWidth) {
      sWidth = this.image.width - sx;
    }
    if (this.image.height - sy < sHeight) {
      sHeight = this.image.height - sy;
    }
    // location on canvas to draw the croped image
    dx = 0;
    dy = 0;
    // match destination with source to not scale the image
    dWidth = sWidth;
    dHeight = sHeight;
    context.drawImage(this.image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
  }
}

window.Game = {};

const canvas = ref<HTMLCanvasElement | null>(null);

onMounted(() => {
  const context = canvas.value?.getContext('2d');
  // game settings:
  const FPS = 30;
  const INTERVAL = 1000 / FPS; // milliseconds
  const STEP = INTERVAL / 1000; // seconds
  // setup an object that represents the room
  const room = {
    width  : 5000,
    height : 3000,
    map    : new Map(5000, 3000),
  };
  // generate a large image texture for the room
  room.map.generate();
  // setup player
  const player = new Player(50, 50);
  // Old camera setup. It not works with maps smaller than canvas. Keeping the code deactivated here as reference.
  /* var camera = new Game.Camera(0, 0, canvas.width, canvas.height, room.width, room.height); */
  /* camera.follow(player, canvas.width / 2, canvas.height / 2); */
  // Set the right viewport size for the camera
  const vWidth = Math.min(room.width, canvas.width);
  const vHeight = Math.min(room.height, canvas.height);
  // Setup the camera
  const camera = new Camera(0, 0, vWidth, vHeight, room.width, room.height);
  console.log(camera);
  camera.follow(player, vWidth / 2, vHeight / 2);
  // Game update function
  const update = function () {
    player.update(STEP, room.width, room.height);
    camera.update();
  };
  // Game draw function
  const draw = function () {
    // clear the entire canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    // redraw all objects
    room.map.draw(context, camera.xView, camera.yView);
    player.draw(context, camera.xView, camera.yView);
  };
  // Game Loop
  const gameLoop = function () {
    update();
    draw();
  };
  // <-- configure play/pause capabilities:
  // Using setInterval instead of requestAnimationFrame for better cross browser support,
  // but it's easy to change to a requestAnimationFrame polyfill.
  let runningId = -1;
  Game.play = function () {
    if (runningId == -1) {
      runningId = setInterval(() => {
        gameLoop();
      }, INTERVAL);
      console.log('play');
    }
  };
  Game.togglePause = function () {
    if (runningId == -1) {
      Game.play();
    } else {
      clearInterval(runningId);
      runningId = -1;
      console.log('paused');
    }
  };

  // <-- configure Game controls:
  Game.controls = {
    left  : false,
    up    : false,
    right : false,
    down  : false,
  };

  window.addEventListener('keydown', (e) => {
    switch (e.keyCode) {
      case 37: // left arrow
        controls.left = true;
        break;
      case 38: // up arrow
        controls.up = true;
        break;
      case 39: // right arrow
        controls.right = true;
        break;
      case 40: // down arrow
        controls.down = true;
        break;
    }
  }, false);
  window.addEventListener('keyup', (e) => {
    switch (e.keyCode) {
      case 37: // left arrow
        controls.left = false;
        break;
      case 38: // up arrow
        controls.up = false;
        break;
      case 39: // right arrow
        controls.right = false;
        break;
      case 40: // down arrow
        controls.down = false;
        break;
      case 80: // key P pauses the game
        Game.togglePause();
        break;
    }
  }, false);

  Game.play();
});

// ======================================================

// const canvas = ref<HTMLCanvasElement | null>(null);
//
// function renderImage(ctx, src, x, y) {
//   const baseImage = new Image();
//   baseImage.src = src;
//   baseImage.onload = () => {
//     // ctx.drawImage(baseImage, 0, 0, 7016, 4960);
//     ctx.drawImage(baseImage, x, y, 7016 * 4, 4960 * 4, 0, 0, 7016, 4960);
//   };
// }
//
// let ctx;
//
// onMounted(() => {
//   ctx = canvas.value?.getContext('2d');
//   ctx.canvas.width = document.documentElement.clientWidth;
//   ctx.canvas.height = document.documentElement.clientHeight;
//
//   renderImage(ctx, '/images/board.jpg', 0, 0);
//
//   new Game().play();
// });
//
// function draw(x, y) {
//   ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
//   ctx.beginPath();
//   renderImage(ctx, '/images/board.jpg', x, y);
//   // ctx.fillStyle = 'skyblue';
//   // ctx.strokeStyle = 'gray';
//   // ctx.rect(x, y, 30, 20);
//   // ctx.fill();
//   // ctx.stroke();
// }
//
// function handleMouseDown(e) {
//   const rect = e.target.getBoundingClientRect();
//   console.log(e.target.getBoundingClientRect());
//   console.log(e);
//   console.log(e.clientX);
//   const mouseX = parseInt(e.clientX - rect.x, 10);
//   const mouseY = parseInt(e.clientY - rect.y, 10);
//   console.log(`Down: ${mouseX} / ${mouseY}`);
//
//   // Call the draw function with the mouse coordinates
//   draw(-mouseX * 4, -mouseY * 4);
// }

</script>

<template>
  <!--<canvas ref="canvas" class="canvas" @mousemove="handleMouseDown" />-->
  <!--<canvas ref="canvas" class="canvas" @mousedown="handleMouseDown" />-->
  <canvas id="gameCanvas" ref="canvas" class="canvas" width="400" height="400" />
</template>

<style lang="scss" scoped>
.canvas {
  //width: 100%;
  //height: 100%;
  //width: 400px;
  //height: 400px;
}
</style>
