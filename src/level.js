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

  setTile(x, y, id) {
    if (x >= 0 && y >= 0 && x < this.width && y < this.height) {
      this.tiles[y][x] = id;
    }
  }

  bumpTile(x, y, callback) {
    const key = `${x},${y}`;
    if (this.bumpTiles[key]) return; // already bumping
    this.bumpTiles[key] = { offset: 0, timer: 0, callback, phase: 'up' };
  }

  // Draw the tilemap
  draw(ctx, cameraX = 0) {
    if (!this.bumpTiles) this.bumpTiles = {};
    const ts = this.tileSize;
    // Animate bump tiles
    for (const key in this.bumpTiles) {
      const [x, y] = key.split(',').map(Number);
      const bump = this.bumpTiles[key];
      if (bump.phase === 'up') {
        bump.offset -= 3;
        bump.timer += 1;
        if (bump.offset <= -12) {
          bump.phase = 'down';
          if (bump.callback) bump.callback();
        }
      } else if (bump.phase === 'down') {
        bump.offset += 2;
        if (bump.offset >= 0) {
          bump.offset = 0;
          delete this.bumpTiles[key];
        }
      }
    }
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const tile = this.tiles[y][x];
        const drawX = x * ts - cameraX;
        let drawY = y * ts;
        const bump = this.bumpTiles[`${x},${y}`];
        if (bump) drawY += bump.offset;
        if (tile === 1) {
          // Solid block (standard)
          ctx.fillStyle = '#8B5C2A';
          ctx.fillRect(drawX, drawY, ts, ts);
          ctx.strokeStyle = '#C49A6C';
          ctx.strokeRect(drawX, drawY, ts, ts);
        } else if (tile === 2) {
          // Indestructible block
          ctx.fillStyle = '#444';
          ctx.fillRect(drawX, drawY, ts, ts);
          ctx.strokeStyle = '#aaa';
          ctx.strokeRect(drawX, drawY, ts, ts);
        } else if (tile === 3) {
          // Breakable block
          ctx.fillStyle = '#b97a56';
          ctx.fillRect(drawX, drawY, ts, ts);
          ctx.strokeStyle = '#fff';
          ctx.strokeRect(drawX, drawY, ts, ts);
        } else if (tile === 4) {
          // Hidden coin block
          ctx.fillStyle = '#e3c800';
          ctx.fillRect(drawX, drawY, ts, ts);
          ctx.strokeStyle = '#fff';
          ctx.strokeRect(drawX, drawY, ts, ts);
        } else if (tile === 5) {
          // Hidden extra life block
          ctx.fillStyle = '#4ad14a';
          ctx.fillRect(drawX, drawY, ts, ts);
          ctx.strokeStyle = '#fff';
          ctx.strokeRect(drawX, drawY, ts, ts);
        } else if (tile === 6) {
          // Hidden invincibility block
          ctx.fillStyle = '#6ad1e3';
          ctx.fillRect(drawX, drawY, ts, ts);
          ctx.strokeStyle = '#fff';
          ctx.strokeRect(drawX, drawY, ts, ts);
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