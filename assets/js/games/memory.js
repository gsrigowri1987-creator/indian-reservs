class MemoryGame extends GameEngine {
  constructor() {
    super({
      id: 'memory',
      name: 'Memory Match',
      icon: '🎴',
      pairs: 8
    });
    this.cards = [];
    this.flipped = [];
    this.matched = [];
    this.moves = 0;
    this.inProgress = false;
    this.timer = 0;
    this.timerIntervalId = null;
  }

  init() {
    super.init();
    this.inProgress = false;
    this.timer = 0;
    if (this.timerIntervalId) {
      clearInterval(this.timerIntervalId);
    }
    
    const body = document.getElementById('memoryBody');
    if (!body) return;

    body.innerHTML = `
      <div class="difficulty-select-card" style="text-align:center; padding:20px 0;">
        <span style="font-size:3rem; margin-bottom:12px; display:block;">🎴</span>
        <h2 style="font-size:1.6rem; font-family:var(--font-display); margin-bottom:8px;">Select Memory Grid Size</h2>
        <p style="color:var(--muted); font-size:0.9rem; margin-bottom:24px;">Choose how many pairs you want to match:</p>
        <div style="display:flex; flex-direction:column; gap:12px; max-width:320px; margin:0 auto;">
          <button class="btn btn-primary" onclick="selectMemorySize(8)" style="justify-content:center; background:#10B981; color:#fff; border:none; padding:12px 24px;">🟢 Small (8 Pairs, 60s)</button>
          <button class="btn btn-primary" onclick="selectMemorySize(12)" style="justify-content:center; background:#FBBF24; color:#031018; border:none; padding:12px 24px;">🟡 Medium (12 Pairs, 90s)</button>
          <button class="btn btn-primary" onclick="selectMemorySize(16)" style="justify-content:center; background:#EF4444; color:#fff; border:none; padding:12px 24px;">🔴 Hard (16 Pairs, 120s)</button>
        </div>
      </div>
    `;
  }

  startWithSize(size) {
    this.inProgress = true;
    this.config.pairs = size;
    
    if (size === 8) this.timer = 60;
    else if (size === 12) this.timer = 90;
    else if (size === 16) this.timer = 120;
    
    // Select reservoirs prioritizing unique river names to prevent confusing duplicate river cards
    const uniqueRivers = [];
    const duplicates = [];
    const seenRivers = new Set();
    const shuffledReservoirs = shuffle([...RESERVOIRS]);

    shuffledReservoirs.forEach(r => {
      if (!seenRivers.has(r.river.toLowerCase())) {
        seenRivers.add(r.river.toLowerCase());
        uniqueRivers.push(r);
      } else {
        duplicates.push(r);
      }
    });

    let pool = [];
    if (size <= uniqueRivers.length) {
      pool = uniqueRivers.slice(0, size);
    } else {
      pool = [...uniqueRivers, ...duplicates.slice(0, size - uniqueRivers.length)];
    }

    this.cards = [];
    pool.forEach(r => {
      // Use the lowercase river name as the matching key for both cards.
      // This allows matching a reservoir to its corresponding river correctly even if duplicates occur.
      this.cards.push({ key: r.river.toLowerCase(), type: 'name', label: r.name });
      this.cards.push({ key: r.river.toLowerCase(), type: 'river', label: r.river });
    });
    this.cards = shuffle(this.cards);
    this.flipped = [];
    this.matched = [];
    this.moves = 0;

    const memMoves = document.getElementById('memMoves');
    if (memMoves) memMoves.textContent = 0;
    
    const memMatches = document.getElementById('memMatches');
    if (memMatches) memMatches.textContent = `0 / ${size}`;

    const body = document.getElementById('memoryBody');
    if (body) {
      body.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
          <p style="color:var(--muted); font-size:.85rem; margin-bottom:0;">Match each reservoir name with its river.</p>
          <div class="pill" id="memTimerPill">⏱ <span id="memTimerVal">${this.timer}</span>s</div>
        </div>
        <div class="memory-grid" id="memGrid" style="grid-template-columns: repeat(${size === 8 ? 4 : (size === 12 ? 6 : 8)}, 1fr);"></div>
      `;
    }
    
    this.renderGrid();

    if (this.timerIntervalId) {
      clearInterval(this.timerIntervalId);
    }
    this.timerIntervalId = this.setInterval(() => {
      this.timer--;
      const timerVal = document.getElementById('memTimerVal');
      if (timerVal) {
        timerVal.textContent = this.timer;
        const pill = document.getElementById('memTimerPill');
        if (pill) {
          pill.classList.toggle('timer-urgent', this.timer <= 10);
        }
      }
      
      if (this.timer <= 0) {
        clearInterval(this.timerIntervalId);
        this.endGame(false);
      }
    }, 1000);
  }

  renderGrid() {
    const grid = document.getElementById('memGrid');
    if (!grid) return;

    grid.innerHTML = this.cards.map((c, idx) => {
      const isFlipped = this.flipped.includes(idx) || this.matched.includes(idx);
      const isMatched = this.matched.includes(idx);
      return `
        <div class="mem-card ${isFlipped ? 'flipped' : ''} ${isMatched ? 'matched' : ''}" onclick="flipMemCard(${idx})">
          <div class="mem-inner">
            <div class="mem-face mem-front">🌊</div>
            <div class="mem-face mem-back" style="font-size:${this.config.pairs === 16 ? '0.78rem' : '0.9rem'};">${sanitizeHTML(c.label)}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  flipCard(idx) {
    if (this.flipped.length >= 2 || this.flipped.includes(idx) || this.matched.includes(idx)) return;
    
    this.flipped.push(idx);
    this.renderGrid();
    
    if (this.flipped.length === 2) {
      this.moves++;
      const memMoves = document.getElementById('memMoves');
      if (memMoves) memMoves.textContent = this.moves;
      
      const [a, b] = this.flipped;
      const cardA = this.cards[a];
      const cardB = this.cards[b];
      
      if (cardA.key === cardB.key && cardA.type !== cardB.type) {
        this.matched.push(a, b);
        this.flipped = [];
        playSound('correct');
        addXP(8);
        addCoins(4);
        
        if (navigator.vibrate) navigator.vibrate(10);

        const memMatches = document.getElementById('memMatches');
        if (memMatches) memMatches.textContent = `${this.matched.length / 2} / ${this.config.pairs}`;
        
        this.renderGrid();
        
        if (this.matched.length === this.cards.length) {
          this.endGame(true);
        }
      } else {
        playSound('wrong');
        if (navigator.vibrate) navigator.vibrate([10, 50, 10]);
        this.setTimeout(() => {
          this.flipped = [];
          this.renderGrid();
        }, 750);
      }
    }
  }

  endGame(success) {
    this.inProgress = false;
    if (this.timerIntervalId) {
      clearInterval(this.timerIntervalId);
    }

    const body = document.getElementById('memoryBody');
    if (!body) return;

    if (success) {
      this.recordScore(this.moves);
      const bonus = Math.round(this.timer * 0.5);
      if (bonus > 0) {
        addCoins(bonus);
        toast(`⏱ Time Bonus! +${bonus} coins added`);
      }
      
      body.innerHTML = `
        <div class="results-hero">
          <div class="big">${this.moves} moves</div>
          <p style="color:var(--muted); margin-top:8px;">Matched all ${this.config.pairs} pairs with ${this.timer}s remaining!</p>
          ${bonus > 0 ? `<p style="color:#10B981; font-weight:bold; margin-top:6px;">🪙 +${bonus} Time Bonus Coins</p>` : ''}
          <div class="hero-ctas" style="margin-top:24px;">
            <button class="btn btn-primary" onclick="startMemory()">Play again</button>
            <button class="btn btn-ghost" onclick="navigate('games')">More games</button>
          </div>
        </div>
      `;
      playSound('victory');
    } else {
      playSound('wrong');
      body.innerHTML = `
        <div class="results-hero">
          <div class="big" style="color:#EF4444;">Time's Up!</div>
          <p style="color:var(--muted); margin-top:8px;">You ran out of time! Matched ${this.matched.length / 2} out of ${this.config.pairs} pairs.</p>
          <div class="hero-ctas" style="margin-top:24px;">
            <button class="btn btn-primary" onclick="startMemory()">Retry</button>
            <button class="btn btn-ghost" onclick="navigate('games')">More games</button>
          </div>
        </div>
      `;
    }
  }

  cleanup() {
    this.inProgress = false;
    this.cards = [];
    this.flipped = [];
    this.matched = [];
    if (this.timerIntervalId) {
      clearInterval(this.timerIntervalId);
    }
  }
}

// Global wrappers
function startMemory() {
  if (window.activeGameInstance) {
    window.activeGameInstance.destroy();
  }
  window.activeGameInstance = new MemoryGame();
  window.activeGameInstance.init();
}

function selectMemorySize(size) {
  if (window.activeGameInstance && window.activeGameInstance.id === 'memory') {
    window.activeGameInstance.startWithSize(size);
  }
}

function flipMemCard(idx) {
  if (window.activeGameInstance && window.activeGameInstance.id === 'memory') {
    window.activeGameInstance.flipCard(idx);
  }
}
