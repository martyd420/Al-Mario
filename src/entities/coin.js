export class Coin {
  constructor(pos, spriteManager) {
    this.x = pos.x;
    this.y = pos.y;
    this.radius = 16;
    this.collected = false;
    this.spriteManager = spriteManager;
  }

  draw(ctx, cameraX = 0) {
    if (this.collected) return;
    if (this.spriteManager && this.spriteManager.ready) {
      const img = this.spriteManager.getSprite('coin', 'default');
      if (img) {
        ctx.drawImage(img, this.x - cameraX, this.y, this.radius * 2, this.radius * 2);
        return;
      }
    }
    // Fallback: yellow circle
    ctx.beginPath();
    ctx.arc(this.x + this.radius - cameraX, this.y + this.radius, this.radius, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFD700';
    ctx.fill();
    ctx.strokeStyle = '#C49A6C';
    ctx.stroke();
  }
}