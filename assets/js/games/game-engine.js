class GameEngine {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.icon = config.icon;
    this.config = config;
    this.state = {};
    this.timers = [];
    this.intervals = [];
    this.eventListeners = [];
    this.isActive = false;
  }

  init() {
    this.isActive = true;
    if (typeof analytics !== 'undefined') {
      analytics.trackGameStart(this.id);
    }
  }

  render() {}
  update() {}
  cleanup() {}

  setTimeout(callback, delay) {
    const id = window.setTimeout(callback, delay);
    this.timers.push(id);
    return id;
  }

  setInterval(callback, interval) {
    const id = window.setInterval(callback, interval);
    this.intervals.push(id);
    return id;
  }

  addEventListener(target, event, handler) {
    target.addEventListener(event, handler);
    this.eventListeners.push({ target, event, handler });
  }

  recordScore(score) {
    if (typeof recordScore === 'function') {
      recordScore(this.id, score);
    }
  }

  destroy() {
    this.isActive = false;
    
    // Clear timeouts
    for (const id of this.timers) {
      clearTimeout(id);
    }
    this.timers = [];

    // Clear intervals
    for (const id of this.intervals) {
      clearInterval(id);
    }
    this.intervals = [];

    // Unregister event listeners
    for (const { target, event, handler } of this.eventListeners) {
      if (target && typeof target.removeEventListener === 'function') {
        target.removeEventListener(event, handler);
      }
    }
    this.eventListeners = [];

    // Perform game-specific custom cleanups
    this.cleanup();
  }
}
