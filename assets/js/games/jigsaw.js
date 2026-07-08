class JigsawGame extends GameEngine {
  constructor() {
    super({
      id: 'jigsaw',
      name: 'Jigsaw Puzzle',
      icon: '🧩',
      size: 3
    });
    this.reservoir = null;
    this.order = [];
    this.correctOrder = [];
    this.selected = null;
    this.moves = 0;
    this.url = '';
    this.inProgress = false;
    this.timer = 90;
    this.timerInterval = null;
  }

  async init() {
    super.init();
    this.inProgress = false;
    this.reservoir = RESERVOIRS[Math.floor(Math.random() * RESERVOIRS.length)];
    const size = this.config.size;
    this.moves = 0;
    this.selected = null;
    this.timer = 90;

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    const jigMoves = document.getElementById('jigMoves');
    if (jigMoves) jigMoves.textContent = 0;

    const body = document.getElementById('jigsawBody');
    if (body) {
      body.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
          <p style="color:var(--muted); font-size:.85rem; margin-bottom:0;">Rebuild the photo of <strong>${sanitizeHTML(this.reservoir.name)}</strong>. Swap tiles to complete.</p>
          <div class="pill" id="jigTimerPill" style="display:none;">⏱ <span id="jigTimerVal">${this.timer}</span>s</div>
        </div>
        <div style="display:flex; gap:20px; align-items:center; flex-wrap:wrap; justify-content:center; margin-bottom:16px;">
          <div class="jigsaw-board skel" id="jigBoard" style="width:min(320px,90vw); aspect-ratio:1; grid-template-columns:repeat(${size},1fr); margin:0;"></div>
          <div class="jigsaw-preview-container" id="jigPreview" style="display:none; text-align:center;">
            <p style="font-size:0.75rem; color:var(--muted); margin-bottom:6px;">Reference</p>
            <div style="width:110px; height:110px; border-radius:8px; border:1px solid var(--line); overflow:hidden; background:var(--surface2);" id="jigPreviewImg"></div>
          </div>
        </div>
        <div style="display:flex; gap:10px; justify-content:center;">
          <button class="btn btn-ghost" onclick="startJigsaw()">🔀 New puzzle</button>
        </div>
      `;
    }

    const urls = await fetchReservoirImages(this.reservoir, 1);
    const board = document.getElementById('jigBoard');
    if (!board) return;
    board.classList.remove('skel');

    if (!urls || !urls.length || !this.isActive) {
      board.innerHTML = `<div style="grid-column:1/-1; display:flex; align-items:center; justify-content:center; color:var(--muted); font-weight:600; text-align:center;">🌊 Image unavailable — try a new puzzle</div>`;
      return;
    }

    this.url = urls[0];
    const total = size * size;
    this.correctOrder = Array.from({ length: total }, (_, i) => i);
    this.order = shuffle([...this.correctOrder]);
    this.inProgress = true;
    
    // Make sure it's not already solved
    if (this.order.every((v, i) => v === i)) {
      const tmp = this.order[0];
      this.order[0] = this.order[1];
      this.order[1] = tmp;
    }
    
    this.renderBoard();

    // Show preview reference thumbnail
    const preview = document.getElementById('jigPreview');
    if (preview) preview.style.display = 'block';
    const previewImg = document.getElementById('jigPreviewImg');
    if (previewImg) {
      previewImg.innerHTML = `<img src="${this.url}" style="width:100%; height:100%; object-fit:cover;">`;
    }

    // Start countdown timer
    const timerPill = document.getElementById('jigTimerPill');
    if (timerPill) timerPill.style.display = 'block';
    
    this.timerInterval = this.setInterval(() => {
      this.timer--;
      const val = document.getElementById('jigTimerVal');
      if (val) val.textContent = this.timer;
      if (timerPill) {
        timerPill.classList.toggle('timer-urgent', this.timer <= 15);
      }
      
      if (this.timer <= 0) {
        clearInterval(this.timerInterval);
        this.endGame(false);
      }
    }, 1000);
  }

  renderBoard() {
    const board = document.getElementById('jigBoard');
    if (!board) return;
    
    const size = this.config.size;
    const url = this.url;
    const selected = this.selected;

    board.innerHTML = this.order.map((tileIdx, pos) => {
      const tx = (tileIdx % size) * (100 / (size - 1));
      const ty = Math.floor(tileIdx / size) * (100 / (size - 1));
      return `
        <div class="jigsaw-tile ${selected === pos ? 'selected' : ''}" 
             style="background-image:url('${url}'); background-position:${tx}% ${ty}%;" 
             onclick="selectJigTile(${pos})">
        </div>
      `;
    }).join('');
  }

  selectTile(pos) {
    if (!this.inProgress) return;
    
    if (this.selected === null) {
      this.selected = pos;
      this.renderBoard();
      return;
    }
    if (this.selected === pos) {
      this.selected = null;
      this.renderBoard();
      return;
    }

    const a = this.selected;
    const b = pos;
    
    // Swap tiles
    [this.order[a], this.order[b]] = [this.order[b], this.order[a]];
    this.selected = null;
    this.moves++;
    
    const jigMoves = document.getElementById('jigMoves');
    if (jigMoves) jigMoves.textContent = this.moves;
    
    this.renderBoard();
    playSound('click');

    const solved = this.order.every((v, i) => v === this.correctOrder[i]);
    if (solved) {
      this.endGame(true);
    }
  }

  endGame(success) {
    this.inProgress = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    const body = document.getElementById('jigsawBody');
    if (!body) return;

    if (success) {
      this.recordScore(this.moves);
      addXP(20);
      addCoins(10);
      playSound('victory');
      
      const timeBonus = Math.round(this.timer * 0.2);
      if (timeBonus > 0) {
        addCoins(timeBonus);
        toast(`⏱ Speed swap bonus! +${timeBonus} coins added`);
      }

      body.innerHTML = `
        <div class="results-hero">
          <div class="big">Solved! 🎉</div>
          <p style="color:var(--muted); margin-top:8px;">${sanitizeHTML(this.reservoir.name)} rebuilt in ${this.moves} swaps with ${this.timer}s remaining!</p>
          ${timeBonus > 0 ? `<p style="color:#10B981; font-weight:bold; margin-top:6px;">🪙 +${timeBonus} Speed Bonus Coins</p>` : ''}
          <div class="hero-ctas" style="margin-top:20px;">
            <button class="btn btn-primary" onclick="startJigsaw()">New puzzle</button>
            <button class="btn btn-ghost" onclick="navigate('games')">More games</button>
          </div>
        </div>
      `;
    } else {
      playSound('wrong');
      if (navigator.vibrate) navigator.vibrate([10, 50, 10]);
      body.innerHTML = `
        <div class="results-hero">
          <div class="big" style="color:#EF4444;">Time's Up!</div>
          <p style="color:var(--muted); margin-top:8px;">Rebuilding ${sanitizeHTML(this.reservoir.name)} timed out after 90 seconds.</p>
          <div class="hero-ctas" style="margin-top:20px;">
            <button class="btn btn-primary" onclick="startJigsaw()">Retry</button>
            <button class="btn btn-ghost" onclick="navigate('games')">More games</button>
          </div>
        </div>
      `;
    }
  }

  cleanup() {
    this.inProgress = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.order = [];
    this.correctOrder = [];
    this.reservoir = null;
  }
}

// Global wrappers
function startJigsaw() {
  if (window.activeGameInstance) {
    window.activeGameInstance.destroy();
  }
  window.activeGameInstance = new JigsawGame();
  window.activeGameInstance.init();
}

function selectJigTile(pos) {
  if (window.activeGameInstance && window.activeGameInstance.id === 'jigsaw') {
    window.activeGameInstance.selectTile(pos);
  }
}
