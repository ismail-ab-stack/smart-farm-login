const gameBoard = document.getElementById('gameBoard');
const playerEl = document.getElementById('player');
const targetEl = document.getElementById('target');
const kissBurstEl = document.getElementById('kissBurst');
const messageEl = document.getElementById('message');
const scoreEl = document.getElementById('scoreValue');
const timeEl = document.getElementById('timeValue');
const levelEl = document.getElementById('levelValue');
const startButton = document.getElementById('startButton');
const resetButton = document.getElementById('resetButton');

const state = {
  running: false,
  score: 0,
  timeLeft: 25,
  level: 1,
  player: { x: 120, y: 460 },
  target: { x: 420, y: 190 },
  keys: new Set(),
  playerSpeed: 8,
  targetSpeed: 2.6,
  timerId: null,
  animationId: null,
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function boardMetrics() {
  return {
    width: gameBoard.clientWidth,
    height: gameBoard.clientHeight,
    padding: 44,
  };
}

function placeCharacter(element, position) {
  element.style.left = `${position.x}px`;
  element.style.top = `${position.y}px`;
}

function syncHud() {
  scoreEl.textContent = state.score;
  timeEl.textContent = state.timeLeft;
  levelEl.textContent = state.level;
}

function setMessage(text) {
  messageEl.textContent = text;
}

function resetPositions() {
  const { width, height, padding } = boardMetrics();
  state.player.x = padding + 40;
  state.player.y = height - padding - 50;
  state.target.x = width - padding - 40;
  state.target.y = padding + 80;
  placeCharacter(playerEl, state.player);
  placeCharacter(targetEl, state.target);
}

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

function teleportTarget() {
  const { width, height, padding } = boardMetrics();
  let nextX = randomRange(padding, width - padding);
  let nextY = randomRange(padding, height - padding);

  const dx = nextX - state.player.x;
  const dy = nextY - state.player.y;
  if (Math.hypot(dx, dy) < 160) {
    nextX = clamp(nextX + 140, padding, width - padding);
    nextY = clamp(nextY - 120, padding, height - padding);
  }

  state.target.x = nextX;
  state.target.y = nextY;
  placeCharacter(targetEl, state.target);
}

function showKissBurst() {
  kissBurstEl.style.left = `${state.target.x}px`;
  kissBurstEl.style.top = `${state.target.y - 20}px`;
  kissBurstEl.classList.add('show');
  window.setTimeout(() => kissBurstEl.classList.remove('show'), 220);
}

function handleCatch() {
  state.score += 1;
  state.level = Math.min(9, 1 + Math.floor(state.score / 2));
  state.targetSpeed = 2.6 + state.score * 0.38;
  syncHud();
  showKissBurst();

  if (state.score >= 5) {
    finishGame(true);
    return;
  }

  setMessage(`A stolen kiss for Soundous! ${5 - state.score} more to win the moonlit date.`);
  teleportTarget();
}

function finishGame(won) {
  state.running = false;
  state.keys.clear();
  if (state.timerId) {
    window.clearInterval(state.timerId);
    state.timerId = null;
  }
  if (state.animationId) {
    window.cancelAnimationFrame(state.animationId);
    state.animationId = null;
  }

  if (won) {
    setMessage('You caught Soundous 5 times! The vampire-doll kiss date is a success 💖');
    startButton.textContent = 'Play again';
  } else {
    setMessage('Moonlight ran out! Start again and chase faster for Soundous 💫');
    startButton.textContent = 'Try again';
  }
}

function movePlayerToward(targetX, targetY) {
  const dx = targetX - state.player.x;
  const dy = targetY - state.player.y;
  const distance = Math.hypot(dx, dy) || 1;
  const step = Math.min(60, distance);
  state.player.x += (dx / distance) * step;
  state.player.y += (dy / distance) * step;
}

function update() {
  if (!state.running) {
    return;
  }

  const { width, height, padding } = boardMetrics();

  let moveX = 0;
  let moveY = 0;
  if (state.keys.has('arrowleft') || state.keys.has('a')) moveX -= 1;
  if (state.keys.has('arrowright') || state.keys.has('d')) moveX += 1;
  if (state.keys.has('arrowup') || state.keys.has('w')) moveY -= 1;
  if (state.keys.has('arrowdown') || state.keys.has('s')) moveY += 1;

  if (moveX !== 0 || moveY !== 0) {
    const length = Math.hypot(moveX, moveY) || 1;
    state.player.x += (moveX / length) * state.playerSpeed;
    state.player.y += (moveY / length) * state.playerSpeed;
  }

  const fleeX = state.target.x - state.player.x;
  const fleeY = state.target.y - state.player.y;
  const fleeDistance = Math.hypot(fleeX, fleeY) || 1;

  if (fleeDistance < 240) {
    state.target.x += (fleeX / fleeDistance) * state.targetSpeed;
    state.target.y += (fleeY / fleeDistance) * state.targetSpeed;
  } else {
    state.target.x += Math.sin(Date.now() / 350) * 0.9;
    state.target.y += Math.cos(Date.now() / 470) * 0.7;
  }

  state.player.x = clamp(state.player.x, padding, width - padding);
  state.player.y = clamp(state.player.y, padding, height - padding);
  state.target.x = clamp(state.target.x, padding, width - padding);
  state.target.y = clamp(state.target.y, padding, height - padding);

  placeCharacter(playerEl, state.player);
  placeCharacter(targetEl, state.target);

  if (Math.hypot(state.target.x - state.player.x, state.target.y - state.player.y) < 68) {
    handleCatch();
  }

  state.animationId = window.requestAnimationFrame(update);
}

function startGame() {
  state.running = true;
  state.score = 0;
  state.timeLeft = 25;
  state.level = 1;
  state.targetSpeed = 2.6;
  syncHud();
  resetPositions();
  setMessage('The chase is on! Catch Soundous before she flutters away with the bats.');
  startButton.textContent = 'Game running';

  if (state.timerId) {
    window.clearInterval(state.timerId);
  }

  state.timerId = window.setInterval(() => {
    state.timeLeft -= 1;
    syncHud();
    if (state.timeLeft <= 0) {
      finishGame(false);
    }
  }, 1000);

  if (state.animationId) {
    window.cancelAnimationFrame(state.animationId);
  }
  state.animationId = window.requestAnimationFrame(update);
}

startButton.addEventListener('click', () => {
  if (!state.running) {
    startGame();
  }
});

resetButton.addEventListener('click', () => {
  finishGame(false);
  state.score = 0;
  state.timeLeft = 25;
  state.level = 1;
  syncHud();
  resetPositions();
  setMessage('Everything is reset. Tap start when Ismail is ready to chase again.');
  startButton.textContent = 'Start the chase';
});

window.addEventListener('keydown', (event) => {
  state.keys.add(event.key.toLowerCase());
});

window.addEventListener('keyup', (event) => {
  state.keys.delete(event.key.toLowerCase());
});

gameBoard.addEventListener('pointerdown', (event) => {
  if (!state.running) {
    return;
  }

  const rect = gameBoard.getBoundingClientRect();
  movePlayerToward(event.clientX - rect.left, event.clientY - rect.top);
});

window.addEventListener('resize', () => {
  resetPositions();
});

syncHud();
resetPositions();
