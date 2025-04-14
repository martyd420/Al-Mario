import { Renderer } from './renderer.js';
import { Input } from './input.js';
import { Level } from './level.js';
import { Player } from './entities/player.js';
import { Enemy } from './entities/enemy.js';
import { Coin } from './entities/coin.js';
import { HUD } from './hud.js';
import { SpriteManager } from './sprites.js';
// import { Sound } from './sound.js'; // Optional 

// Game constants
const MIN_WIDTH = 800;
const MIN_HEIGHT = 600;
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
let width = MIN_WIDTH;
let height = MIN_HEIGHT;

// Responsive resize
function resizeCanvas() {
  const container = document.getElementById('game-container');
  const w = Math.max(MIN_WIDTH, Math.min(window.innerWidth, MAX_WIDTH));
  const h = Math.max(MIN_HEIGHT, Math.min(window.innerHeight, MAX_HEIGHT));
  width = w;
  height = h * 0.9; // leave space for HUD
  canvas.width = width;
  canvas.height = height;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Game state
let currentLevel = 1;
let levelData = null;
let level = null;
let player = null;
let enemies = [];
let coins = [];
let hud = null;
let input = null;
let renderer = null;
let spriteManager = null;
let gameState = 'playing'; // 'playing', 'dead', 'win', 'gameover'
let score = 0;
let lives = 3;
let deathTimeout = null;

// Camera state
let cameraX = 0;
let cameraY = 0;

// Load level JSON
async function loadLevel(levelNum) {
  const resp = await fetch(`levels/level${levelNum}.json`);
  levelData = await resp.json();
  level = new Level(levelData);
  player = new Player(levelData.playerStart, spriteManager);
  player.onReward = function(type) {
    if (type === "coin") score += 100;
    else if (type === "life") lives += 1;
    else if (type === "invincibility") {
      // TODO: implement invincibility effect
    }
  };
  enemies = levelData.enemies.map(e => new Enemy(e, spriteManager));
  coins = levelData.coins.map(c => new Coin(c, spriteManager));
  hud = new HUD();
  input = new Input();
  renderer = new Renderer(ctx, level, player, enemies, coins, hud);
  gameState = 'playing';
}

// Main game loop
function gameLoop(timestamp) {
  if (gameState === 'playing') {
    player.update(input, level, enemies, coins);
    enemies.forEach(e => e.update(level, player));
    // Coin collection
    coins.forEach(coin => {
      if (!coin.collected && rectsOverlap(player, coin)) {
        coin.collected = true;
        score += coin.value || 1;
      }
    });

    // Enemy collision with "stomp" logic
    let stompedEnemy = null;
    let hitEnemy = null;
    for (let i = 0; i < enemies.length; ++i) {
      const enemy = enemies[i];
      if (rectsOverlap(player, enemy)) {
        // Check if player is falling and above enemy
        const playerBottom = player.y + player.height;
        const enemyTop = enemy.y;
        const verticalOverlap = playerBottom - enemyTop;
        if (player.vy > 0 && verticalOverlap > 0 && verticalOverlap < player.height) {
          stompedEnemy = i;
          break;
        } else {
          hitEnemy = true;
          break;
        }
      }
    }
    if (stompedEnemy !== null) {
      // Remove enemy, bounce player, +1 point
      enemies.splice(stompedEnemy, 1);
      player.vy = -14; // bounce up
      score += 1;
    } else if (hitEnemy) {
      if (gameState !== 'dead' && gameState !== 'gameover') {
        lives -= 1;
        gameState = 'dead';
        if (lives > 0) {
          // Show death animation or pause, then respawn
          deathTimeout = setTimeout(() => {
            // Reload the level to its initial state, but keep score and lives
            loadLevel(currentLevel).then(() => {
              gameState = 'playing';
            });
          }, 1000);
        } else {
          // Game over
          showGameOver();
        }
      }
    }

    // Goal check
    if (level.goal) {
      const ts = level.tileSize;
      const goalRect = {
        x: level.goal.x * ts + ts * 0.7,
        y: level.goal.y * ts - ts * 1.2,
        width: ts * 0.5,
        height: ts * 1.2
      };
      if (rectsOverlap(player, goalRect)) {
        gameState = 'win';
        setTimeout(() => {
          currentLevel += 1;
          loadLevel(currentLevel).catch(() => {
            // No more levels, reset
            currentLevel = 1;
            loadLevel(currentLevel);
          });
        }, 1500);
      }
    }

    // Camera logic
    // Center Mario, or offset slightly forward in direction of movement
    const viewportWidth = canvas.width;
    const viewportHeight = canvas.height;
    const levelPixelWidth = level.width * level.tileSize;
    const levelPixelHeight = level.height * level.tileSize;
    // Forward offset: 40% from left if moving right, 60% if moving left, else center
    let offset = 0.5;
    if (player.vx > 0.5) offset = 0.4;
    else if (player.vx < -0.5) offset = 0.6;
    const targetCameraX = Math.max(0, Math.min(
      player.x + player.width * 0.5 - viewportWidth * offset,
      levelPixelWidth - viewportWidth
    ));
    // Vertical camera: center or slightly lower
    const targetCameraY = Math.max(0, Math.min(
      player.y + player.height * 0.5 - viewportHeight * 0.55,
      levelPixelHeight - viewportHeight
    ));
    // Smoothly interpolate cameraX/Y toward target (lerp)
    cameraX += (targetCameraX - cameraX) * 0.02;
    cameraY += (targetCameraY - cameraY) * 0.02;

    // Helper: rectangle overlap
    function rectsOverlap(a, b) {
      // Accepts {x, y, width, height} or Coin (with radius)
      if (b.radius !== undefined) {
        // Coin: circle-rect collision
        const cx = b.x + b.radius, cy = b.y + b.radius, r = b.radius;
        const rx = a.x, ry = a.y, rw = a.width, rh = a.height;
        // Closest point on rect to circle center
        const closestX = Math.max(rx, Math.min(cx, rx + rw));
        const closestY = Math.max(ry, Math.min(cy, ry + rh));
        const dx = cx - closestX, dy = cy - closestY;
        return (dx * dx + dy * dy) < (r * r);
      } else {
        // Rect-rect
        return (
          a.x < b.x + b.width &&
          a.x + a.width > b.x &&
          a.y < b.y + b.height &&
          a.y + a.height > b.y
        );
      }
    }
    hud.update({ score, lives, level: currentLevel });
  } else if (gameState === 'gameover') {
    renderer.render(cameraX, cameraY);
    return;
  }
  renderer.render(cameraX, cameraY);
  requestAnimationFrame(gameLoop);
}

// Show/hide Game Over overlay
function showGameOver() {
  gameState = 'gameover';
  const overlay = document.getElementById('gameover-overlay');
  if (overlay) overlay.style.display = 'flex';
}
function hideGameOver() {
  const overlay = document.getElementById('gameover-overlay');
  if (overlay) overlay.style.display = 'none';
}

// Restart button handler
const restartBtn = document.getElementById('restart-btn');
if (restartBtn) {
  restartBtn.onclick = () => {
    hideGameOver();
    score = 0;
    lives = 3;
    currentLevel = 1;
    loadLevel(currentLevel).then(() => {
      player.onReward = function(type) {
        if (type === "coin") score += 100;
        else if (type === "life") lives += 1;
        else if (type === "invincibility") {
          // TODO: implement invincibility effect
        }
      };
      gameState = 'playing';
      requestAnimationFrame(gameLoop);
    });
  };
}

// Start game
async function startGame() {
  spriteManager = new SpriteManager();
  await spriteManager.loadConfig();
  await loadLevel(currentLevel);
  requestAnimationFrame(gameLoop);
}

startGame();