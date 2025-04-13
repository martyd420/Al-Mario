export class HUD {
  constructor() {
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.hudDiv = document.getElementById('hud');
    this.update({ score: 0, lives: 3, level: 1 });
  }

  update({ score, lives, level }) {
    if (score !== undefined) this.score = score;
    if (lives !== undefined) this.lives = lives;
    if (level !== undefined) this.level = level;
    if (this.hudDiv) {
      this.hudDiv.textContent = `Score: ${this.score}   Lives: ${this.lives}   Level: ${this.level}`;
    }
  }

  draw(ctx) {
    // No-op: HUD is handled by the DOM
  }
}