class SyncManager {
  constructor() {
    this.pendingOperations = [];
    this.isOnline = navigator.onLine;
    this.init();
  }

  init() {
    const saved = localStorage.getItem('pendingOperations');
    if (saved) {
      try {
        this.pendingOperations = JSON.parse(saved);
      } catch (e) {
        this.pendingOperations = [];
      }
    }

    window.addEventListener('online', () => {
      this.isOnline = true;
      this.sync();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  queue(operation, data) {
    const op = {
      id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      operation,
      data,
      timestamp: Date.now()
    };
    this.pendingOperations.push(op);
    this.save();
    
    if (this.isOnline) {
      this.sync();
    }
  }

  async sync() {
    if (!this.isOnline || this.pendingOperations.length === 0) return;

    const operations = [...this.pendingOperations];
    let successCount = 0;

    for (const op of operations) {
      try {
        await this.executeOperation(op);
        this.pendingOperations = this.pendingOperations.filter(o => o.id !== op.id);
        successCount++;
      } catch (e) {
        console.error('Sync failed for operation:', op, e);
      }
    }

    this.save();

    if (successCount > 0 && typeof toast === 'function') {
      toast(`🔄 Synced ${successCount} offline operations`);
    }
  }

  async executeOperation(op) {
    switch (op.operation) {
      case 'save_score':
        await this.saveScore(op.data);
        break;
      case 'unlock_achievement':
        await this.unlockAchievement(op.data);
        break;
      default:
        break;
    }
  }

  save() {
    localStorage.setItem('pendingOperations', JSON.stringify(this.pendingOperations));
  }

  async saveScore(data) {
    return new Promise((resolve) => {
      setTimeout(resolve, 300);
    });
  }

  async unlockAchievement(data) {
    return new Promise((resolve) => {
      setTimeout(resolve, 300);
    });
  }
}

const syncManager = new SyncManager();
