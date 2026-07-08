class GuessGame extends GameEngine {
  constructor() {
    super({
      id: 'guess',
      name: 'Guess the Reservoir',
      icon: '🔍',
      maxRounds: 8
    });
    this.pool = [];
    this.currentIndex = 0;
    this.score = 0;
    this.hints = 0;
    this.currentUrl = '';
    this.inProgress = false;
    this.miniMapInstance = null;
  }

  init() {
    super.init();
    this.inProgress = true;
    this.pool = shuffle([...RESERVOIRS]).slice(0, this.config.maxRounds);
    this.currentIndex = 0;
    this.score = 0;
    this.hints = 0;
    
    const guessScore = document.getElementById('guessScore');
    if (guessScore) guessScore.textContent = this.score;

    this.renderRound();
  }

  async renderRound() {
    // Teardown previous mini map instance if active
    if (this.miniMapInstance) {
      try {
        this.miniMapInstance.remove();
      } catch (e) {}
      this.miniMapInstance = null;
    }

    if (this.currentIndex >= this.pool.length) {
      this.inProgress = false;
      this.recordScore(this.score);
      const body = document.getElementById('guessBody');
      if (body) {
        body.innerHTML = resultsHTML(this.score, this.pool.length, 'guess');
      }
      return;
    }

    const guessRound = document.getElementById('guessRound');
    if (guessRound) guessRound.textContent = this.currentIndex + 1;
    
    const r = this.pool[this.currentIndex];
    this.hints = 0;
    const options = shuffle([r, ...shuffle(RESERVOIRS.filter(x => x.id !== r.id)).slice(0, 3)]);
    
    const body = document.getElementById('guessBody');
    if (!body) return;

    body.innerHTML = `
      <div class="blur-frame" id="guessFrame">
        <div class="skel" style="position:absolute; inset:0;"></div>
      </div>
      <div id="guessMiniMap" style="height: 130px; border-radius: var(--radius-sm); border: 1px solid var(--line); margin-top: 10px; display: none; z-index: 5;"></div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin:14px 0;">
        <button class="btn btn-ghost" onclick="revealHint()">💡 Hint (${this.hints}/2 used)</button>
        <span id="hintText" style="color:var(--muted); font-size:.85rem;"></span>
      </div>
      <div style="display:flex; flex-direction:column; gap:10px;" id="guessOptions">
        ${options.map(o => `<button class="option-btn" data-id="${o.id}" onclick="answerGuess('${o.id}','${r.id}')">${sanitizeHTML(o.name)}</button>`).join('')}
      </div>
    `;

    // Fetch images using the global fetch wrapper
    const urls = await fetchReservoirImages(r, 1);
    const frame = document.getElementById('guessFrame');
    if (!frame) return;
    frame.classList.remove('skel');

    if (urls && urls.length && this.isActive) {
      frame.innerHTML = `${imageTag(urls[0], r.name, 'guess-img')}<div class="fallback" style="display:none;">${fallbackTile(r).replace('display:flex;', '')}</div>`;
      const img = frame.querySelector('img');
      if (img) img.style.filter = 'blur(22px) saturate(1.2)';
    } else {
      frame.innerHTML = fallbackTile(r);
    }
    this.currentUrl = urls && urls[0];
  }

  revealHint() {
    if (this.hints >= 2) return;
    this.hints++;
    
    const r = this.pool[this.currentIndex];
    const img = document.querySelector('#guessFrame img');
    if (img) {
      img.style.filter = this.hints === 1 ? 'blur(12px) saturate(1.2)' : 'blur(4px) saturate(1.2)';
    }
    
    const btn = document.querySelector('button[onclick="revealHint()"]');
    if (btn) btn.textContent = `💡 Hint (${this.hints}/2 used)`;
    
    const hintText = document.getElementById('hintText');
    if (hintText) {
      hintText.textContent = this.hints === 1 ? `State: ${r.state}` : `River: ${r.river}`;
    }

    // Initialize mini map coordinate preview on Hint 2
    if (this.hints === 2 && typeof L !== 'undefined' && typeof RESERVOIR_COORDS !== 'undefined') {
      const coords = RESERVOIR_COORDS[r.id];
      if (coords) {
        const mapDiv = document.getElementById('guessMiniMap');
        if (mapDiv) {
          mapDiv.style.display = 'block';
          if (this.miniMapInstance) {
            try { this.miniMapInstance.remove(); } catch (e) {}
          }
          this.miniMapInstance = L.map('guessMiniMap', { zoomControl: false, attributionControl: false }).setView(coords, 7);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.miniMapInstance);
          L.marker(coords).addTo(this.miniMapInstance);
        }
      }
    }
  }

  answer(pickedId, correctId) {
    const buttons = document.querySelectorAll('#guessOptions .option-btn');
    buttons.forEach(b => b.disabled = true);
    
    const img = document.querySelector('#guessFrame img');
    if (img) img.style.filter = 'blur(0px)';
    
    // Check answer and style buttons
    buttons.forEach(b => {
      const id = b.dataset.id;
      if (id === correctId) {
        b.classList.add('correct');
        b.innerHTML += ` <span style="font-weight:bold; margin-left:8px; color:#10B981;">✓</span>`;
      } else if (id === pickedId && pickedId !== correctId) {
        b.classList.add('wrong');
        b.innerHTML += ` <span style="font-weight:bold; margin-left:8px; color:#EF4444;">✗</span>`;
      }
    });

    if (pickedId === correctId) {
      this.score++;
      addXP(15);
      addCoins(8);
      playSound('correct');
      if (navigator.vibrate) navigator.vibrate(10);
    } else {
      playSound('wrong');
      if (navigator.vibrate) navigator.vibrate([10, 50, 10]);
    }
    
    const guessScore = document.getElementById('guessScore');
    if (guessScore) guessScore.textContent = this.score;

    this.setTimeout(() => {
      this.currentIndex++;
      this.renderRound();
    }, 1200);
  }

  cleanup() {
    this.inProgress = false;
    this.currentUrl = '';
    if (this.miniMapInstance) {
      try {
        this.miniMapInstance.remove();
      } catch (e) {}
      this.miniMapInstance = null;
    }
  }
}

// Global wrappers
function startGuess() {
  if (window.activeGameInstance) {
    window.activeGameInstance.destroy();
  }
  window.activeGameInstance = new GuessGame();
  window.activeGameInstance.init();
}

function revealHint() {
  if (window.activeGameInstance && window.activeGameInstance.id === 'guess') {
    window.activeGameInstance.revealHint();
  }
}

function answerGuess(pickedId, correctId) {
  if (window.activeGameInstance && window.activeGameInstance.id === 'guess') {
    window.activeGameInstance.answer(pickedId, correctId);
  }
}
