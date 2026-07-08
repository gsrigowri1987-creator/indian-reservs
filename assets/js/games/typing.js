class TypingChallenge extends GameEngine {
  constructor() {
    super({
      id: 'typing',
      name: 'Reservoir Typist',
      icon: '⌨️',
      duration: 30
    });
    this.wordQueue = [];
    this.currentWord = '';
    this.correctCount = 0;
    this.timer = 30;
    this.intervalId = null;
    this.inProgress = false;
    this.isPaused = false;
  }

  init() {
    super.init();
    this.inProgress = true;
    this.isPaused = false;
    this.wordQueue = shuffle(RESERVOIRS.map(r => r.name));
    this.correctCount = 0;
    this.timer = this.config.duration;
    
    this.nextWord();
    this.render();

    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.intervalId = this.setInterval(() => {
      if (this.isPaused) return;
      this.timer--;
      const timerEl = document.getElementById('typingTimerVal');
      if (timerEl) {
        timerEl.textContent = this.timer;
        const pill = document.getElementById('typingTimerPill');
        if (pill) {
          pill.classList.toggle('timer-urgent', this.timer <= 5);
        }
      }
      
      if (this.timer <= 0) {
        clearInterval(this.intervalId);
        this.endGame();
      }
    }, 1000);
  }

  nextWord() {
    if (this.wordQueue.length === 0) {
      this.wordQueue = shuffle(RESERVOIRS.map(r => r.name));
    }
    this.currentWord = this.wordQueue.pop();
  }

  render() {
    const body = document.getElementById('typingBody');
    if (!body) return;

    body.innerHTML = `
      <div class="game-topbar" style="margin-bottom:14px;">
        <button class="back-link" onclick="navigate('games')">← Back to games</button>
        <div class="hud">
          <div class="pill">⭐ Typed: <span id="typingScoreVal">${this.correctCount}</span></div>
          <div class="pill" id="typingTimerPill">⏱ <span id="typingTimerVal">${this.timer}</span>s</div>
        </div>
      </div>
      <div class="typing-container" id="typingBox"></div>
    `;

    this.renderContainer();
  }

  renderContainer() {
    const container = document.getElementById('typingBox');
    if (!container) return;

    container.innerHTML = `
      <p style="color:var(--muted); font-size:.85rem; margin-bottom:14px;">Type the names of the reservoirs as fast and accurately as possible!</p>
      <div class="typing-word-display" id="typingWordShow"></div>
      <input type="text" class="typing-input" id="typingInputField" placeholder="Type here..." autofocus oninput="onTypingInput(event)" autocomplete="off" spellcheck="false">
    `;

    this.updateWordDisplay('');
    
    const input = document.getElementById('typingInputField');
    if (input) {
      this.setTimeout(() => input.focus(), 100);
    }
  }

  updateWordDisplay(typed) {
    const wordShow = document.getElementById('typingWordShow');
    if (!wordShow) return;

    const target = this.currentWord;
    let html = '';
    
    for (let i = 0; i < target.length; i++) {
      if (i < typed.length) {
        if (typed[i].toLowerCase() === target[i].toLowerCase()) {
          html += `<span class="correct-char">${sanitizeHTML(target[i])}</span>`;
        } else {
          html += `<span class="incorrect-char">${sanitizeHTML(target[i])}</span>`;
        }
      } else {
        html += `<span>${sanitizeHTML(target[i])}</span>`;
      }
    }
    
    wordShow.innerHTML = html;
  }

  handleInput(e) {
    if (this.timer <= 0 || this.isPaused) return;
    const inputVal = e.target.value;
    
    this.updateWordDisplay(inputVal);

    if (inputVal.toLowerCase() === this.currentWord.toLowerCase()) {
      this.correctCount++;
      
      const scoreVal = document.getElementById('typingScoreVal');
      if (scoreVal) scoreVal.textContent = this.correctCount;
      
      addXP(5);
      addCoins(2);
      playSound('correct');
      if (navigator.vibrate) navigator.vibrate(10);

      // Trigger learning fact pop-up
      const resObj = RESERVOIRS.find(r => r.name.toLowerCase() === this.currentWord.toLowerCase());
      const fact = resObj ? resObj.description : "An important water source and reservoir in South India.";
      
      this.isPaused = true;
      const box = document.getElementById('typingBox');
      if (box) {
        box.innerHTML = `
          <div class="fact-card animated-zoom" style="text-align:center; padding:22px; background:var(--surface2); border:1px solid var(--line); border-radius:12px; max-width:440px; margin:20px auto;">
            <h3 style="color:var(--cyan); margin-bottom:10px; font-family:var(--font-display); font-size:1.25rem;">✨ Correct! Did you know?</h3>
            <p style="font-size:0.95rem; line-height:1.45; margin-bottom:20px; color:var(--text); font-style:italic;">"${fact}"</p>
            <button class="btn btn-primary" id="typingNextBtn" onclick="nextTypingWord()" style="margin:0 auto; padding:8px 24px;">Continue →</button>
          </div>
        `;
        this.setTimeout(() => {
          const nextBtn = document.getElementById('typingNextBtn');
          if (nextBtn) nextBtn.focus();
        }, 100);
      }
    }
  }

  resumeWord() {
    this.isPaused = false;
    this.nextWord();
    this.renderContainer();
  }

  endGame() {
    this.inProgress = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    this.recordScore(this.correctCount);
    playSound('victory');

    const body = document.getElementById('typingBody');
    if (body) {
      body.innerHTML = `
        <div class="results-hero">
          <div class="big">${this.correctCount} WPM</div>
          <p style="color:var(--muted); margin-top:8px;">You typed ${this.correctCount} reservoir names in 30 seconds!</p>
          <div class="hero-ctas" style="margin-top:24px;">
            <button class="btn btn-primary" onclick="startTyping()">Play again</button>
            <button class="btn btn-ghost" onclick="navigate('games')">More games</button>
          </div>
        </div>
      `;
    }
  }

  cleanup() {
    this.inProgress = false;
    this.isPaused = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.wordQueue = [];
  }
}

// Global wrappers
function startTyping() {
  if (window.activeGameInstance) {
    window.activeGameInstance.destroy();
  }
  window.activeGameInstance = new TypingChallenge();
  window.activeGameInstance.init();
}

function onTypingInput(e) {
  if (window.activeGameInstance && window.activeGameInstance.id === 'typing') {
    window.activeGameInstance.handleInput(e);
  }
}

function nextTypingWord() {
  if (window.activeGameInstance && window.activeGameInstance.id === 'typing') {
    window.activeGameInstance.resumeWord();
  }
}
