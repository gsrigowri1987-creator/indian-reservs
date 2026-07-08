class Analytics {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.events = [];
    this.flushInterval = 5000;
    this.gameStartTime = null;
    this.init();
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  init() {
    // Auto-flush every 5 seconds
    this.interval = setInterval(() => this.flush(), this.flushInterval);
    
    // Track page visibility
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.track('session_pause', { duration: Date.now() - this.startTime });
      } else {
        this.startTime = Date.now();
        this.track('session_resume');
      }
    });

    // Track errors
    window.addEventListener('error', (e) => {
      this.track('error', {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno
      });
    });
  }

  track(event, data = {}) {
    this.events.push({
      sessionId: this.sessionId,
      timestamp: Date.now(),
      event,
      ...data,
      page: location.hash || '#home',
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      theme: document.body.getAttribute('data-theme') || 'dark'
    });

    // Flush if queue is getting large
    if (this.events.length > 50) this.flush();
  }

  trackGameStart(gameId) {
    this.track('game_start', { gameId });
    this.gameStartTime = Date.now();
  }

  trackGameEnd(gameId, score, timeSpent) {
    this.track('game_end', {
      gameId,
      score,
      timeSpent: timeSpent || (this.gameStartTime ? (Date.now() - this.gameStartTime) : 0)
    });
    this.gameStartTime = null;
  }

  trackAchievement(achievementId) {
    this.track('achievement_unlocked', { achievementId });
  }

  flush() {
    if (this.events.length === 0) return;
    
    try {
      const existing = JSON.parse(localStorage.getItem('analytics_events') || '[]');
      localStorage.setItem('analytics_events', JSON.stringify([...existing, ...this.events]));
      this.events = [];
    } catch (e) {
      console.warn('Analytics write failed:', e);
    }
  }

  export() {
    const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
    const blob = new Blob([JSON.stringify(events, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analytics_export.json';
    a.click();
    URL.revokeObjectURL(url);
  }
}

const analytics = new Analytics();
analytics.track('page_view', { page: 'home' });
