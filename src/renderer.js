export class Renderer {
  constructor(ctx, level, player, enemies, coins, hud) {
    this.ctx = ctx;
    this.level = level;
    this.player = player;
    this.enemies = enemies;
    this.coins = coins;
    this.hud = hud;
  }

  render(cameraX = 0) {
    const ctx = this.ctx;
    // Clear screen
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw level tiles
    this.level.draw(ctx, cameraX);

    // Draw coins
    this.coins.forEach(coin => coin.draw(ctx, cameraX));

    // Draw enemies
    this.enemies.forEach(enemy => enemy.draw(ctx, cameraX));

    // Draw player
    this.player.draw(ctx, cameraX);

    // Draw HUD (score, lives, level)
    this.hud.draw(ctx);
  }
}