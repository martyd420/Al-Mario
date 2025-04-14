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
    this.onReward = null; // callback: (type) => void
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
    let bumpedTile = null;
    let bumpTileX = null, bumpTileY = null, bumpTileId = null;
    if (this.vy < 0) {
      // Check for tile above head (center and corners)
      const ts = level.tileSize;
      const headPoints = [
        { x: this.x + 2, y: this.y },
        { x: this.x + this.width / 2, y: this.y },
        { x: this.x + this.width - 2, y: this.y }
      ];
      for (const pt of headPoints) {
        const tx = Math.floor(pt.x / ts);
        const ty = Math.floor((pt.y - 1) / ts);
        const tileId = level.getTile(tx, ty);
        if ([3, 4, 5, 6].includes(tileId)) {
          bumpedTile = { tx, ty, tileId };
          bumpTileX = tx;
          bumpTileY = ty;
          bumpTileId = tileId;
          break;
        }
      }
    }
    if (this.collidesWithLevel(level)) {
      // If bumping a special tile, handle it
      if (bumpedTile) {
        const { tx, ty, tileId } = bumpedTile;
        if (tileId === 3) {
          // Breakable: break and disappear
          if (typeof level.setTile === "function") {
            level.setTile(tx, ty, 0);
          } else {
            console.warn("level.setTile is not a function", level);
          }
          // TODO: play break sound, add particles
        } else if ([4, 5, 6].includes(tileId)) {
          // Reward tiles: bump animation, spawn reward, then set to 0
          if (typeof level.bumpTile === "function") {
            level.bumpTile(tx, ty, () => {
              if (tileId === 4) {
                // Spawn coin at tile position
                if (level.coins) {
                  level.coins.push({ x: tx * level.tileSize, y: ty * level.tileSize });
                }
                if (typeof this.onReward === "function") this.onReward("coin");
                // TODO: play coin sound
              } else if (tileId === 5) {
                // Spawn extra life (could push to a powerups array)
                if (typeof this.onReward === "function") this.onReward("life");
                // TODO: implement extra life entity and spawn here
              } else if (tileId === 6) {
                // Spawn invincibility (could push to a powerups array)
                if (typeof this.onReward === "function") this.onReward("invincibility");
                // TODO: implement invincibility entity and spawn here
              }
              if (typeof level.setTile === "function") {
                level.setTile(tx, ty, 0);
              } else {
                console.warn("level.setTile is not a function", level);
              }
            });
          } else {
            console.warn("level.bumpTile is not a function", level);
          }
          // TODO: play bump sound
        }
      }
      this.y -= this.vy;
      if (this.vy > 0) this.onGround = true;
      this.vy = 0;
    } else {
      this.onGround = false;
    }
  }

  collidesWithLevel(level) {
    // Check 4 corners for solid tiles (IDs 1-6)
    const ts = level.tileSize;
    const solidIds = [1, 2, 3, 4, 5, 6];
    const corners = [
      { x: this.x, y: this.y },
      { x: this.x + this.width - 1, y: this.y },
      { x: this.x, y: this.y + this.height - 1 },
      { x: this.x + this.width - 1, y: this.y + this.height - 1 }
    ];
    return corners.some(c => {
      const tx = Math.floor(c.x / ts);
      const ty = Math.floor(c.y / ts);
      return solidIds.includes(level.getTile(tx, ty));
    });
  }

  draw(ctx, cameraX = 0, cameraY = 0) {
    const drawX = this.x - cameraX;
    const drawY = this.y - cameraY;
    if (this.spriteManager && this.spriteManager.ready) {
      let dir = this.facing;
      // Fallback to last horizontal if idle
      if (dir === 'idle' || dir === undefined) {
        dir = this.lastNonZeroVx < 0 ? 'left' : 'right';
      }
      const img = this.spriteManager.getSprite('player', dir) ||
                  this.spriteManager.getSprite('player', 'idle');
      if (img) {
        ctx.drawImage(img, drawX, drawY, this.width, this.height);
        return;
      }
    }
    // Fallback: colored rect
    ctx.fillStyle = '#ff4';
    ctx.fillRect(drawX, drawY, this.width, this.height);
    ctx.strokeStyle = '#222';
    ctx.strokeRect(drawX, drawY, this.width, this.height);
  }
}