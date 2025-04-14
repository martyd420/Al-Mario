export class Input {
  constructor() {
    this.left = false;
    this.right = false;
    this.jump = false;

    window.addEventListener('keydown', (e) => this.onKey(e, true));
    window.addEventListener('keyup', (e) => this.onKey(e, false));

    // Touch controls
    const leftBtn = document.getElementById('touch-left');
    const rightBtn = document.getElementById('touch-right');
    const jumpBtn = document.getElementById('touch-jump');

    if (leftBtn && rightBtn && jumpBtn) {
      // Helper for touch start/end
      const setBtn = (btn, prop) => {
        btn.addEventListener('touchstart', (e) => {
          this[prop] = true;
          e.preventDefault();
        }, { passive: false });
        btn.addEventListener('touchend', (e) => {
          this[prop] = false;
          e.preventDefault();
        }, { passive: false });
        btn.addEventListener('touchcancel', (e) => {
          this[prop] = false;
          e.preventDefault();
        }, { passive: false });
      };
      setBtn(leftBtn, 'left');
      setBtn(rightBtn, 'right');
      setBtn(jumpBtn, 'jump');
    }
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