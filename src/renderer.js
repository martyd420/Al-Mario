export class Renderer {
  constructor(ctx, level, player, enemies, coins, hud) {
    this.ctx = ctx;
    this.level = level;
    this.player = player;
    this.enemies = enemies;
    this.coins = coins;
    this.hud = hud;
  }

  render() {
    const ctx = this.ctx;
    // Clear screen
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw level tiles
    this.level.draw(ctx);

    // Draw coins
    this.coins.forEach(coin => coin.draw(ctx));

    // Draw enemies
    this.enemies.forEach(enemy => enemy.draw(ctx));

    // Draw player
    this.player.draw(ctx);

    // Draw HUD (score, lives, level)
    this.hud.draw(ctx);
  }
}