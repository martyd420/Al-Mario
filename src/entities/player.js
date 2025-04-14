const GRAVITY = 1.2;
const JUMP_VELOCITY = -18;
const MOVE_SPEED = 7;

export class Player {
  constructor(pos, spriteManager) {
    this.x = pos.x;
    this.y = pos.y;
    this.vx = 0;
    this.vy = 0;
    this.width = 40;
    this.height = 48;
    this.onGround = false;
    this.spriteManager = spriteManager;
    this.facing = 'right'; // left/right/up/down
    this.lastNonZeroVx = 1;
  }

  update(input, level, enemies, coins) {
    // Horizontal movement
    if (input.left) this.vx = -MOVE_SPEED;
    else if (input.right) this.vx = MOVE_SPEED;
    else this.vx = 0;

    // Jump
    if (input.jump && this.onGround) {
      this.vy = JUMP_VELOCITY;
      this.onGround = false;
    }

    // Apply gravity
    this.vy += GRAVITY;

    // Move and handle collisions
    this.moveAndCollide(level);

    // TODO: Check collisions with enemies and coins
    // Update facing direction
    if (this.vx > 0) {
      this.facing = 'right';
      this.lastNonZeroVx = 1;
    } else if (this.vx < 0) {
      this.facing = 'left';
      this.lastNonZeroVx = -1;
    } else if (this.vy < 0) {
      this.facing = 'up';
    } else if (this.vy > 0) {
      this.facing = 'down';
    }
  }

  moveAndCollide(level) {
    // X axis
    this.x += this.vx;
    if (this.collidesWithLevel(level)) {
      this.x -= this.vx;
      this.vx = 0;
    }
    // Y axis
    this.y += this.vy;
    if (this.collidesWithLevel(level)) {
      this.y -= this.vy;
      if (this.vy > 0) this.onGround = true;
      this.vy = 0;
    } else {
      this.onGround = false;
    }
  }

  collidesWithLevel(level) {
    // Check 4 corners for solid tiles
    const ts = level.tileSize;
    const corners = [
      { x: this.x, y: this.y },
      { x: this.x + this.width - 1, y: this.y },
      { x: this.x, y: this.y + this.height - 1 },
      { x: this.x + this.width - 1, y: this.y + this.height - 1 }
    ];
    return corners.some(c => {
      const tx = Math.floor(c.x / ts);
      const ty = Math.floor(c.y / ts);
      return level.getTile(tx, ty) === 1;
    });
  }

  draw(ctx, cameraX = 0) {
    if (this.spriteManager && this.spriteManager.ready) {
      let dir = this.facing;
      // Fallback to last horizontal if idle
      if (dir === 'idle' || dir === undefined) {
        dir = this.lastNonZeroVx < 0 ? 'left' : 'right';
      }
      const img = this.spriteManager.getSprite('player', dir) ||
                  this.spriteManager.getSprite('player', 'idle');
      if (img) {
        ctx.drawImage(img, this.x - cameraX, this.y, this.width, this.height);
        return;
      }
    }
    // Fallback: colored rect
    ctx.fillStyle = '#ff4';
    ctx.fillRect(this.x - cameraX, this.y, this.width, this.height);
    ctx.strokeStyle = '#222';
    ctx.strokeRect(this.x - cameraX, this.y, this.width, this.height);
  }
}