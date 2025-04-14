export class Coin {
  static TYPE_VALUES = {
    bronze: 1,
    silver: 5,
    gold: 10
  };

  constructor(pos, spriteManager) {
    this.x = pos.x;
    this.y = pos.y;
    this.type = pos.type || "bronze";
    this.value = Coin.TYPE_VALUES[this.type] || 1;
    this.radius = 16;
    this.collected = false;
    this.spriteManager = spriteManager;
  }

  draw(ctx, cameraX = 0) {
    if (this.collected) return;
    if (this.spriteManager && this.spriteManager.ready) {
      const img = this.spriteManager.getSprite('coin', this.type) ||
                  this.spriteManager.getSprite('coin', 'default');
      if (img) {
        ctx.drawImage(img, this.x - cameraX, this.y, this.radius * 2, this.radius * 2);
        return;
      }
    }
    // Fallback: colored circle per type
    ctx.beginPath();
    ctx.arc(this.x + this.radius - cameraX, this.y + this.radius, this.radius, 0, 2 * Math.PI);
    if (this.type === "gold") ctx.fillStyle = "#FFD700";
    else if (this.type === "silver") ctx.fillStyle = "#C0C0C0";
    else ctx.fillStyle = "#cd7f32"; // bronze
    ctx.fill();
    ctx.strokeStyle = '#C49A6C';
    ctx.stroke();
  }
}