const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const box = 24;
const canvasSize = 20;
let snake = [{ x: 9, y: 9 }];
let direction = "RIGHT";
let food = randomPosition();
let score = 0;
let gameOver = false;
let moveQueue = [];

// Responsive canvas sizing
function resizeCanvas() {
  const maxWidth = Math.min(window.innerWidth - 40, 480);
  const maxHeight = Math.min(window.innerHeight - 200, 480);
  const size = Math.min(maxWidth, maxHeight);

  canvas.style.width = size + "px";
  canvas.style.height = size + "px";

  // Adjust canvas resolution for retina displays
  const dpr = window.devicePixelRatio || 1;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  ctx.scale(dpr, dpr);

  // Update box size based on canvas size
  const actualSize = Math.min(size, 480);
  return actualSize / canvasSize;
}

let actualBox = resizeCanvas();
window.addEventListener("resize", () => {
  actualBox = resizeCanvas();
});

function randomPosition() {
  return {
    x: Math.floor(Math.random() * canvasSize),
    y: Math.floor(Math.random() * canvasSize),
  };
}

function drawSnake() {
  for (let i = 0; i < snake.length; i++) {
    ctx.save();
    ctx.shadowColor = "#00ff99";
    ctx.shadowBlur = 20;
    ctx.fillStyle = i === 0 ? "#00ff99" : "#00e6b8";
    ctx.beginPath();
    ctx.arc(
      snake[i].x * actualBox + actualBox / 2,
      snake[i].y * actualBox + actualBox / 2,
      actualBox / 2.2,
      0,
      2 * Math.PI
    );
    ctx.fill();
    ctx.restore();
    // Animate tail
    if (i > 0) {
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = "#00ff99";
      ctx.beginPath();
      ctx.arc(
        snake[i].x * actualBox + actualBox / 2,
        snake[i].y * actualBox + actualBox / 2,
        actualBox / 2.5,
        0,
        2 * Math.PI
      );
      ctx.fill();
      ctx.restore();
    }
  }
}

function drawFood() {
  ctx.save();
  ctx.shadowColor = "#ff4444";
  ctx.shadowBlur = 20;
  ctx.fillStyle = "#ff4444";
  ctx.beginPath();
  ctx.arc(
    food.x * actualBox + actualBox / 2,
    food.y * actualBox + actualBox / 2,
    actualBox / 2.1,
    0,
    2 * Math.PI
  );
  ctx.fill();
  ctx.restore();
  // Animate food pulse
  ctx.save();
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(
    food.x * actualBox + actualBox / 2,
    food.y * actualBox + actualBox / 2,
    actualBox / 1.5 + Math.sin(Date.now() / 200) * 2,
    0,
    2 * Math.PI
  );
  ctx.fill();
  ctx.restore();
}

function drawScore() {
  document.getElementById("score").textContent = "Score: " + score;
}

function drawGameOver() {
  document.getElementById("gameOver").style.display = "block";
}

function update() {
  if (gameOver) return;
  let head = { ...snake[0] };
  if (moveQueue.length) {
    direction = moveQueue.shift();
  }
  switch (direction) {
    case "LEFT":
      head.x--;
      break;
    case "UP":
      head.y--;
      break;
    case "RIGHT":
      head.x++;
      break;
    case "DOWN":
      head.y++;
      break;
  }
  // Wall collision
  if (
    head.x < 0 ||
    head.x >= canvasSize ||
    head.y < 0 ||
    head.y >= canvasSize
  ) {
    gameOver = true;
    drawGameOver();
    return;
  }
  // Self collision
  for (let i = 0; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      gameOver = true;
      drawGameOver();
      return;
    }
  }
  snake.unshift(head);
  // Food collision
  if (head.x === food.x && head.y === food.y) {
    score++;
    food = randomPosition();
  } else {
    snake.pop();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawSnake();
  drawFood();
  drawScore();
}

function gameLoop() {
  update();
  draw();
  if (!gameOver) {
    let baseSpeed = 120;
    let speedIncrease = score * 1;
    let currentSpeed = Math.max(40, baseSpeed - speedIncrease);
    requestAnimationFrame(() => setTimeout(gameLoop, currentSpeed));
    // requestAnimationFrame(() => setTimeout(gameLoop, 80));
  }
}

// Keyboard controls
document.addEventListener("keydown", (e) => {
  let newDir = direction;
  if (e.key === "ArrowLeft" && direction !== "RIGHT") newDir = "LEFT";
  if (e.key === "ArrowUp" && direction !== "DOWN") newDir = "UP";
  if (e.key === "ArrowRight" && direction !== "LEFT") newDir = "RIGHT";
  if (e.key === "ArrowDown" && direction !== "UP") newDir = "DOWN";
  if (newDir !== direction) moveQueue.push(newDir);
});

// Touch controls
// function setupTouchControls() {
//   const upBtn = document.getElementById("upBtn");
//   const leftBtn = document.getElementById("leftBtn");
//   const rightBtn = document.getElementById("rightBtn");
//   const downBtn = document.getElementById("downBtn");

//   upBtn.addEventListener("click", () => {
//     if (direction !== "DOWN") moveQueue.push("UP");
//   });

//   leftBtn.addEventListener("click", () => {
//     if (direction !== "RIGHT") moveQueue.push("LEFT");
//   });

//   rightBtn.addEventListener("click", () => {
//     if (direction !== "LEFT") moveQueue.push("RIGHT");
//   });

//   downBtn.addEventListener("click", () => {
//     if (direction !== "UP") moveQueue.push("DOWN");
//   });
// }

// Swipe controls for mobile
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
});

canvas.addEventListener("touchend", (e) => {
  e.preventDefault();
  const touch = e.changedTouches[0];
  const touchEndX = touch.clientX;
  const touchEndY = touch.clientY;

  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;

  const minSwipeDistance = 30;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    // Horizontal swipe
    if (Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0 && direction !== "LEFT") {
        moveQueue.push("RIGHT");
      } else if (deltaX < 0 && direction !== "RIGHT") {
        moveQueue.push("LEFT");
      }
    }
  } else {
    // Vertical swipe
    if (Math.abs(deltaY) > minSwipeDistance) {
      if (deltaY > 0 && direction !== "UP") {
        moveQueue.push("DOWN");
      } else if (deltaY < 0 && direction !== "DOWN") {
        moveQueue.push("UP");
      }
    }
  }
});

// Prevent scrolling when touching the canvas
canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
});

// Restart button
document.getElementById("restartBtn").onclick = function () {
  snake = [{ x: 9, y: 9 }];
  direction = "RIGHT";
  food = randomPosition();
  score = 0;
  gameOver = false;
  moveQueue = [];
  document.getElementById("gameOver").style.display = "none";
  actualBox = resizeCanvas();
  gameLoop();
};

// Initialize touch controls
//setupTouchControls();

// Start game
gameLoop();


