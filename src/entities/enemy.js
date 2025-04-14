const GRAVITY = 1.2;
const ENEMY_SPEED = 2.5;

export class Enemy {
  constructor(pos, spriteManager) {
    this.x = pos.x;
    this.y = pos.y;
    this.vx = -ENEMY_SPEED; // Always start moving left for deterministic behavior
    this.vy = 0;
    this.width = 40;
    this.height = 40;
    this.onGround = false;
    this.spriteManager = spriteManager;
    this.facing = 'left';
  }

  update(level, player) {
    // Simple AI: walk left/right, turn at edges or on collision
    this.vy += GRAVITY;
    this.x += this.vx;
    if (this.collidesWithLevel(level)) {
      this.x -= this.vx;
      this.vx *= -1;
    }
    this.y += this.vy;
    if (this.collidesWithLevel(level)) {
      this.y -= this.vy;
      this.vy = 0;
      this.onGround = true;
    } else {
      this.onGround = false;
    }
    // Update facing
    if (this.vx > 0) this.facing = 'right';
    else if (this.vx < 0) this.facing = 'left';
  }

  collidesWithLevel(level) {
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
      let dir = this.facing || 'left';
      const img = this.spriteManager.getSprite('enemy', dir) ||
                  this.spriteManager.getSprite('enemy', 'idle');
      if (img) {
        ctx.drawImage(img, this.x - cameraX, this.y, this.width, this.height);
        return;
      }
    }
    // Fallback: colored rect
    ctx.fillStyle = '#b44';
    ctx.fillRect(this.x - cameraX, this.y, this.width, this.height);
    ctx.strokeStyle = '#222';
    ctx.strokeRect(this.x - cameraX, this.y, this.width, this.height);
  }
}