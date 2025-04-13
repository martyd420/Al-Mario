export class Input {
  constructor() {
    this.left = false;
    this.right = false;
    this.jump = false;

    window.addEventListener('keydown', (e) => this.onKey(e, true));
    window.addEventListener('keyup', (e) => this.onKey(e, false));
  }

  onKey(e, isDown) {
    switch (e.code) {
      case 'ArrowLeft':
      case 'KeyA':
        this.left = isDown;
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.right = isDown;
        break;
      case 'ArrowUp':
      case 'Space':
      case 'KeyW':
        this.jump = isDown;
        break;
    }
    // Prevent scrolling with arrow keys/space
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'Space'].includes(e.code)) {
      e.preventDefault();
    }
  }
}