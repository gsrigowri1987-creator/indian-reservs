class Challenge30Game extends GameEngine {
  constructor() {
    super({
      id: 'challenge30',
      name: '30 Second Challenge',
      icon: '⚡',
      duration: 30
    });
    this.score = 0;
    this.timer = 30;
    this.intervalId = null;
    this.pool = [];
    this.current = null;
    this.inProgress = false;
  }

  init() {
    super.init();
    this.score = 0;
    this.timer = this.config.duration;
    this.pool = shuffle([...QUIZ_QUESTIONS]);
    this.inProgress = true;
    
    const c30Score = document.getElementById('c30Score');
    if (c30Score) c30Score.textContent = 0;
    
    const c30Timer = document.getElementById('c30Timer');
    if (c30Timer) c30Timer.textContent = this.timer;
    
    const pill = document.getElementById('c30TimerPill');
    if (pill) pill.classList.remove('timer-urgent');

    this.nextQuestion();

    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.intervalId = this.setInterval(() => {
      this.timer--;
      const t = document.getElementById('c30Timer');
      if (t) t.textContent = this.timer;
      
      const p = document.getElementById('c30TimerPill');
      if (p) {
        p.classList.toggle('timer-urgent', this.timer <= 5);
      }
      
      if (this.timer <= 0) {
        clearInterval(this.intervalId);
        this.endGame();
      }
    }, 1000);
  }

  nextQuestion() {
    if (this.pool.length === 0) {
      this.pool = shuffle([...QUIZ_QUESTIONS]);
    }
    const q = this.pool.shift();
    this.current = q;
    
    const body = document.getElementById('challenge30Body');
    if (!body) return;

    body.innerHTML = `
      <h3 style="font-size:1.15rem; margin-bottom:16px;">${sanitizeHTML(q.q)}</h3>
      <div style="display:flex; flex-direction:column; gap:10px;" id="c30Options">
        ${q.options.map((o, idx) => `<button class="option-btn" onclick="answerC30(${idx})">${sanitizeHTML(o)}</button>`).join('')}
      </div>
    `;
  }

  answer(idx) {
    if (this.timer <= 0) return;
    const q = this.current;
    if (idx === q.a) {
      this.score++;
      addXP(6);
      playSound('correct');
      if (navigator.vibrate) navigator.vibrate(10);
    } else {
      playSound('wrong');
      if (navigator.vibrate) navigator.vibrate([10, 50, 10]);
    }
    
    const c30Score = document.getElementById('c30Score');
    if (c30Score) c30Score.textContent = this.score;
    
    this.nextQuestion();
  }

  endGame() {
    this.inProgress = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    const pill = document.getElementById('c30TimerPill');
    if (pill) pill.classList.remove('timer-urgent');
    
    this.recordScore(this.score);
    
    const body = document.getElementById('challenge30Body');
    if (body) {
      body.innerHTML = resultsHTML(this.score, '∞', 'challenge30');
    }
  }

  cleanup() {
    this.inProgress = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.current = null;
    this.pool = [];
  }
}

// Global wrappers
function startChallenge30() {
  if (window.activeGameInstance) {
    window.activeGameInstance.destroy();
  }
  window.activeGameInstance = new Challenge30Game();
  window.activeGameInstance.init();
}

function answerC30(idx) {
  if (window.activeGameInstance && window.activeGameInstance.id === 'challenge30') {
    window.activeGameInstance.answer(idx);
  }
}
