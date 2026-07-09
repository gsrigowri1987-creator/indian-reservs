const DEFAULT_STATE = {
  xp: 0,
  coins: 0,
  stars: 0,
  gamesPlayed: 0,
  bestScores: {},
  unlocked: [],
  mapDiscovered: [],
  wheelSpins: 0,
  wheelLastSpinTime: 0,
  soundOn: true,
  musicOn: true,
  theme: 'dark',
  videoBg: 'assets/video/bg.mp4',
  ownedItems: [],
  equippedCardStyle: '',
  equippedFrame: '',
  unlockedPacks: []
};

class StateManager {
  constructor(initialState) {
    this.state = initialState;
    this.listeners = new Map();
    this.history = [];
    this.historyIndex = -1;
    
    // Save initial state to history
    this.history.push({ ...initialState });
    this.historyIndex = 0;
  }

  subscribe(path, callback) {
    if (!this.listeners.has(path)) {
      this.listeners.set(path, new Set());
    }
    this.listeners.get(path).add(callback);
    return () => this.listeners.get(path).delete(callback);
  }

  update(updates) {
    const changes = [];
    for (const [key, value] of Object.entries(updates)) {
      if (JSON.stringify(this.state[key]) !== JSON.stringify(value)) {
        changes.push(key);
        this.state[key] = value;
      }
    }
    
    if (changes.length > 0) {
      this.history = this.history.slice(0, this.historyIndex + 1);
      this.history.push(JSON.parse(JSON.stringify(this.state)));
      this.historyIndex = this.history.length - 1;

      for (const key of changes) {
        if (this.listeners.has(key)) {
          for (const callback of this.listeners.get(key)) {
            callback(this.state[key], key);
          }
        }
      }
      this.save();
    }
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.state = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
      this.save();
      this.notifyAll();
    }
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.state = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
      this.save();
      this.notifyAll();
    }
  }

  notifyAll() {
    for (const [key, callbacks] of this.listeners) {
      for (const cb of callbacks) {
        cb(this.state[key], key);
      }
    }
  }

  save() {
    localStorage.setItem('reservoirQuestState', JSON.stringify(this.state));
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem('reservoirQuestState');
    if (!raw) return JSON.parse(JSON.stringify(DEFAULT_STATE));
    const parsed = JSON.parse(raw);
    const validated = {};
    for (const key of Object.keys(DEFAULT_STATE)) {
      if (key in parsed) {
        validated[key] = parsed[key];
      } else {
        validated[key] = DEFAULT_STATE[key];
      }
    }
    return validated;
  } catch (e) {
    console.warn('State load failed, using defaults:', e);
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }
}

// Global instances and helpers for backward compatibility
const state = loadState();
const stateManager = new StateManager(state);

// Helpers to modify state
function saveState() {
  stateManager.save();
}

function addXP(n) {
  stateManager.update({ xp: stateManager.state.xp + n });
  checkAchievements();
}

function addCoins(n) {
  stateManager.update({ coins: stateManager.state.coins + n });
  checkAchievements();
}

function recordScore(gameId, score) {
  const currentBest = stateManager.state.bestScores[gameId];
  if (currentBest === undefined || score > currentBest) {
    const updatedBestScores = { ...stateManager.state.bestScores, [gameId]: score };
    stateManager.update({
      bestScores: updatedBestScores,
      gamesPlayed: stateManager.state.gamesPlayed + 1
    });
  } else {
    stateManager.update({ gamesPlayed: stateManager.state.gamesPlayed + 1 });
  }
  
  if (typeof analytics !== 'undefined') {
    analytics.trackGameEnd(gameId, score);
  }
  
  checkAchievements();
  if (typeof renderLeaderboard === 'function') {
    renderLeaderboard();
  }
}
