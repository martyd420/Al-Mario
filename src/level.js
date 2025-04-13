export class Level {
  constructor(data) {
    this.width = data.width;
    this.height = data.height;
    this.tiles = data.tiles; // 2D array of tile types (numbers or strings)
    this.playerStart = data.playerStart;
    this.enemies = data.enemies;
    this.coins = data.coins;
    this.goal = data.goal;
    // Tile size in pixels (scaling handled by renderer/canvas size)
    this.tileSize = 48;
  }

  // Get tile at (x, y) in tile coordinates
  getTile(x, y) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return 1; // treat out-of-bounds as solid
    return this.tiles[y][x];
  }

  // Draw the tilemap
  draw(ctx, cameraX = 0) {
    const ts = this.tileSize;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const tile = this.tiles[y][x];
        const drawX = x * ts - cameraX;
        if (tile === 1) {
          // Solid block
          ctx.fillStyle = '#8B5C2A';
          ctx.fillRect(drawX, y * ts, ts, ts);
          ctx.strokeStyle = '#C49A6C';
          ctx.strokeRect(drawX, y * ts, ts, ts);
        } else if (tile === 2) {
          // Coin block (drawn as a yellow block)
          ctx.fillStyle = '#FFD700';
          ctx.fillRect(drawX, y * ts, ts, ts);
          ctx.strokeStyle = '#C49A6C';
          ctx.strokeRect(drawX, y * ts, ts, ts);
        } else {
          // Empty space
          // Optionally draw background grid
        }
      }
    }
    // Draw goal flag
    if (this.goal) {
      const gx = this.goal.x * ts - cameraX;
      ctx.fillStyle = '#fff';
      ctx.fillRect(gx + ts * 0.7, this.goal.y * ts - ts * 1.2, ts * 0.2, ts * 1.2);
      ctx.fillStyle = '#e33';
      ctx.beginPath();
      ctx.moveTo(gx + ts * 0.8, this.goal.y * ts - ts * 1.2);
      ctx.lineTo(gx + ts * 1.2, this.goal.y * ts - ts * 1.0);
      ctx.lineTo(gx + ts * 0.8, this.goal.y * ts - ts * 0.8);
      ctx.closePath();
      ctx.fill();
    }
  }
}