export class SpriteManager {
  constructor() {
    this.config = null;
    this.images = {};
    this.ready = false;
  }

  async loadConfig(configPath = 'assets/sprites.json') {
    const resp = await fetch(configPath);
    this.config = await resp.json();
    await this._loadAllImages();
    this.ready = true;
  }

  async _loadAllImages() {
    const promises = [];
    for (const [entity, directions] of Object.entries(this.config)) {
      this.images[entity] = {};
      for (const [dir, path] of Object.entries(directions)) {
        promises.push(
          this._loadImage(path).then(img => {
            this.images[entity][dir] = img;
          })
        );
      }
    }
    await Promise.all(promises);
  }

  _loadImage(path) {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.src = path;
      img.onload = () => resolve(img);
      img.onerror = () => {
        // Fallback: transparent 1x1 pixel
        const fallback = document.createElement('canvas');
        fallback.width = fallback.height = 1;
        resolve(fallback);
      };
    });
  }

  // Get the sprite image for an entity and direction, with fallback logic
  getSprite(entity, direction) {
    if (!this.ready) return null;
    const entityImages = this.images[entity];
    if (!entityImages) return null;
    if (entityImages[direction]) return entityImages[direction];
    if (entityImages['idle']) return entityImages['idle'];
    // Fallback to any available image
    const keys = Object.keys(entityImages);
    return keys.length > 0 ? entityImages[keys[0]] : null;
  }
}