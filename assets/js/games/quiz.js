class QuizGame extends GameEngine {
  constructor() {
    super({
      id: 'quiz',
      name: 'Reservoir Quiz',
      icon: '🧠',
      maxQuestions: 10,
      lives: 3
    });
    this.questions = [];
    this.currentIndex = 0;
    this.score = 0;
    this.lives = 3;
    this.timer = 15;
    this.timerLimit = 15;
    this.xpMultiplier = 1.0;
    this.streak = 0;
    this.maxStreak = 0;
    this.startTime = null;
    this.intervalId = null;
    this.inProgress = false;
    this.difficulty = 'medium';
  }

  init() {
    super.init();
    this.inProgress = false;
    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.removeStreakBadge();
    
    const body = document.getElementById('quizBody');
    if (!body) return;

    body.innerHTML = `
      <div class="difficulty-select-card" style="text-align:center; padding:20px 0;">
        <span style="font-size:3rem; margin-bottom:12px; display:block;">🧠</span>
        <h2 style="font-size:1.6rem; font-family:var(--font-display); margin-bottom:8px;">Select Quiz Difficulty</h2>
        <p style="color:var(--muted); font-size:0.9rem; margin-bottom:24px;">Choose a level to test your reservoir knowledge:</p>
        <div style="display:flex; flex-direction:column; gap:12px; max-width:320px; margin:0 auto;">
          <button class="btn btn-primary" onclick="selectQuizDifficulty('easy')" style="justify-content:center; background:#10B981; color:#fff; border:none; padding:12px 24px;">🟢 Easy (20s, 1.0x XP)</button>
          <button class="btn btn-primary" onclick="selectQuizDifficulty('medium')" style="justify-content:center; background:#FBBF24; color:#031018; border:none; padding:12px 24px;">🟡 Medium (15s, 1.5x XP)</button>
          <button class="btn btn-primary" onclick="selectQuizDifficulty('hard')" style="justify-content:center; background:#EF4444; color:#fff; border:none; padding:12px 24px;">🔴 Hard (10s, 2.0x XP)</button>
        </div>
      </div>
    `;
  }

  startWithDifficulty(diff) {
    this.difficulty = diff;
    this.inProgress = true;

    let pool = [...QUIZ_QUESTIONS];
    if (diff === 'easy') {
      pool = pool.filter(q => q.diff === 'easy' || q.diff === 'medium');
      this.timerLimit = 20;
      this.xpMultiplier = 1.0;
    } else if (diff === 'medium') {
      this.timerLimit = 15;
      this.xpMultiplier = 1.5;
    } else if (diff === 'hard') {
      pool = pool.filter(q => q.diff === 'medium' || q.diff === 'hard');
      this.timerLimit = 10;
      this.xpMultiplier = 2.0;
    }

    this.questions = shuffle(pool).slice(0, this.config.maxQuestions);
    this.currentIndex = 0;
    this.lives = this.config.lives;
    this.startTime = Date.now();

    const quizLives = document.getElementById('quizLives');
    if (quizLives) quizLives.textContent = this.lives;

    this.renderQuestion();
  }

  renderQuestion() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    if (this.currentIndex >= this.questions.length || this.lives <= 0) {
      this.endGame();
      return;
    }

    const q = this.questions[this.currentIndex];
    this.timer = this.timerLimit;
    
    const pill = document.getElementById('quizTimerPill');
    if (pill) pill.classList.remove('timer-urgent');
    
    const quizScore = document.getElementById('quizScore');
    if (quizScore) quizScore.textContent = this.score;
    
    const quizTimer = document.getElementById('quizTimer');
    if (quizTimer) quizTimer.textContent = this.timer;
    
    const body = document.getElementById('quizBody');
    if (!body) return;

    const newHTML = `
      <div class="progress-bar-outer" style="margin-bottom:18px;">
        <div class="progress-bar-inner" id="quizProgress" style="width:${(this.currentIndex / this.questions.length * 100)}%"></div>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <div>
          <span class="tag ${q.diff}">${q.diff.toUpperCase()}</span> 
          <span style="color:var(--muted); font-size:.82rem;">Question ${this.currentIndex + 1} of ${this.questions.length}</span>
        </div>
        <span class="tag" style="background:var(--surface3); border-color:var(--line); text-transform:capitalize;">Mode: ${this.difficulty}</span>
      </div>
      <h3 style="font-size:1.25rem; margin:14px 0 20px;">${q.q}</h3>
      <div style="display:flex; flex-direction:column; gap:10px;" id="quizOptions">
        ${q.options.map((o, idx) => `<button class="option-btn" onclick="answerQuiz(${idx})">${sanitizeHTML(o)}<span></span></button>`).join('')}
      </div>
    `;

    body.innerHTML = `<div id="quizQuestionWrap" style="transition: opacity 130ms ease, transform 130ms ease; opacity: 0; transform: translateY(15px);">${newHTML}</div>`;
    const wrap = document.getElementById('quizQuestionWrap');
    if (wrap) {
      void wrap.offsetHeight;
      wrap.style.opacity = '1';
      wrap.style.transform = 'translateY(0)';
    }
    
    this.startQuestionTimer();
  }

  startQuestionTimer() {
    this.intervalId = this.setInterval(() => {
      this.timer -= 1;
      const t = document.getElementById('quizTimer');
      if (t) t.textContent = this.timer;
      
      const pill = document.getElementById('quizTimerPill');
      if (pill) {
        pill.classList.toggle('timer-urgent', this.timer <= 4);
      }
      
      if (this.timer <= 0) {
        clearInterval(this.intervalId);
        this.answer(-1);
      }
    }, 1000);
  }

  answer(idx) {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    const q = this.questions[this.currentIndex];
    const buttons = document.querySelectorAll('#quizOptions .option-btn');
    buttons.forEach(b => b.disabled = true);
    
    if (idx === q.a) {
      if (idx >= 0 && buttons[idx]) {
        buttons[idx].classList.add('correct');
        buttons[idx].innerHTML += ` <span style="font-weight:bold; margin-left:8px; color:#10B981;">✓</span>`;
      }
      this.score++;
      
      const xpReward = Math.round(10 * this.xpMultiplier);
      const coinsReward = Math.round(5 * this.xpMultiplier);
      addXP(xpReward);
      addCoins(coinsReward);
      playSound('correct');
      
      if (navigator.vibrate) navigator.vibrate(10);
      
      this.streak++;
      if (this.streak > this.maxStreak) {
        this.maxStreak = this.streak;
      }
      this.showStreakBadge(this.streak);
    } else {
      if (idx >= 0 && buttons[idx]) {
        buttons[idx].classList.add('wrong');
        buttons[idx].innerHTML += ` <span style="font-weight:bold; margin-left:8px; color:#EF4444;">✗</span>`;
      }
      if (buttons[q.a]) {
        buttons[q.a].classList.add('correct');
        buttons[q.a].innerHTML += ` <span style="font-weight:bold; margin-left:8px; color:#10B981;">✓</span>`;
      }
      
      this.lives--;
      const quizLives = document.getElementById('quizLives');
      if (quizLives) quizLives.textContent = this.lives;
      
      playSound('wrong');
      if (navigator.vibrate) navigator.vibrate([10, 50, 10]);
      
      this.streak = 0;
      this.removeStreakBadge();
    }

    this.setTimeout(() => {
      this.currentIndex++;
      this.renderQuestion();
    }, 1000);
  }

  showStreakBadge(streak) {
    if (streak < 2) {
      this.removeStreakBadge();
      return;
    }
    let pill = document.getElementById('quizStreakPill');
    if (!pill) {
      const hud = document.querySelector('#page-game-quiz .hud');
      if (hud) {
        pill = document.createElement('div');
        pill.id = 'quizStreakPill';
        pill.className = 'pill streak-pill';
        hud.appendChild(pill);
      }
    }
    if (pill) {
      pill.innerHTML = `🔥 Streak x${streak}`;
      pill.style.display = 'block';
      pill.style.animation = 'none';
      void pill.offsetWidth;
      pill.style.animation = 'streakPulse 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both';
    }
  }

  removeStreakBadge() {
    const pill = document.getElementById('quizStreakPill');
    if (pill) {
      pill.style.display = 'none';
    }
  }

  endGame() {
    this.inProgress = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.removeStreakBadge();
    this.recordScore(this.score);
    
    const total = this.config.maxQuestions;
    const accuracy = Math.round((this.score / total) * 100);
    const xpEarned = Math.round(this.score * 10 * this.xpMultiplier);
    const coinsEarned = Math.round(this.score * 5 * this.xpMultiplier);
    const timeTaken = Math.round((Date.now() - this.startTime) / 1000);

    const body = document.getElementById('quizBody');
    if (!body) return;

    body.innerHTML = `
      <div class="quiz-complete-card">
        <div style="font-size:3rem; margin-bottom:12px;">🏆</div>
        <h2 style="font-size:1.8rem; font-weight:800; background:linear-gradient(135deg,#fff,var(--cyan)); -webkit-background-clip:text; background-clip:text; color:transparent; margin-bottom:6px;">Quiz Complete!</h2>
        <p style="color:var(--muted); font-size:0.9rem; margin-bottom:20px;">Completed on ${this.difficulty.toUpperCase()} difficulty</p>
        
        <div class="quiz-complete-grid">
          <div class="quiz-complete-stat highlight">
            <span class="lbl">Score</span>
            <span class="val">${this.score}/${total}</span>
          </div>
          <div class="quiz-complete-stat">
            <span class="lbl">Accuracy</span>
            <span class="val">${accuracy}%</span>
          </div>
          <div class="quiz-complete-stat highlight">
            <span class="lbl">XP Earned</span>
            <span class="val">+<span id="animateXP">0</span></span>
          </div>
          <div class="quiz-complete-stat">
            <span class="lbl">Coins Earned</span>
            <span class="val">🪙 +<span id="animateCoins">0</span></span>
          </div>
          <div class="quiz-complete-stat">
            <span class="lbl">Time Taken</span>
            <span class="val">${timeTaken}s</span>
          </div>
          <div class="quiz-complete-stat streak-stat">
            <span class="lbl">Highest Streak</span>
            <span class="val">🔥 ${this.maxStreak}</span>
          </div>
        </div>
        
        <div style="display:flex; flex-direction:column; gap:10px; margin-top:24px;">
          <button class="btn btn-primary" onclick="startQuiz()">Play Again</button>
          <div style="display:flex; gap:10px;">
            <button class="btn btn-ghost" style="flex:1;" onclick="navigate('games')">Back to Games</button>
            <button class="btn btn-ghost" style="flex:1;" onclick="navigate('home')">Home</button>
          </div>
        </div>
      </div>
    `;

    animateValue('animateXP', 0, xpEarned, 1000);
    animateValue('animateCoins', 0, coinsEarned, 1000);
    this.triggerConfetti();
  }

  triggerConfetti() {
    const container = document.getElementById('quizBody');
    if (!container) return;
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '100';
    container.style.position = 'relative';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let w = canvas.width = container.clientWidth;
    let h = canvas.height = container.clientHeight;

    const colors = ['#22d3ee', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * w,
      y: Math.random() * -h - 20,
      r: Math.random() * 6 + 4,
      d: Math.random() * h,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 5,
      tiltAngleIncremental: Math.random() * 0.07 + 0.02,
      tiltAngle: 0,
      vy: Math.random() * 2 + 2,
      vx: Math.random() * 2 - 1
    }));

    let animationId;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      let active = false;

      particles.forEach(p => {
        p.tiltAngle += p.tiltAngleIncremental;
        p.y += p.vy;
        p.x += p.vx;
        p.tilt = Math.sin(p.tiltAngle - (p.r / 2)) * 10;

        if (p.y < h + 20) {
          active = true;
        }

        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
        ctx.stroke();
      });

      if (active && this.isActive) {
        animationId = requestAnimationFrame(draw);
      } else {
        canvas.remove();
      }
    };

    const ro = new ResizeObserver(() => {
      if (canvas) {
        w = canvas.width = container.clientWidth;
        h = canvas.height = container.clientHeight;
      }
    });
    ro.observe(container);

    draw();
    this.setTimeout(() => {
      cancelAnimationFrame(animationId);
      canvas.remove();
      ro.disconnect();
    }, 4000);
  }

  cleanup() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.removeStreakBadge();
  }
}

// Global wrappers
function startQuiz() {
  if (window.activeGameInstance) {
    window.activeGameInstance.destroy();
  }
  window.activeGameInstance = new QuizGame();
  window.activeGameInstance.init();
}

function selectQuizDifficulty(diff) {
  if (window.activeGameInstance && window.activeGameInstance.id === 'quiz') {
    window.activeGameInstance.startWithDifficulty(diff);
  }
}

function answerQuiz(idx) {
  if (window.activeGameInstance && window.activeGameInstance.id === 'quiz') {
    window.activeGameInstance.answer(idx);
  }
}

function quitQuiz() {
  if (confirm('Quit the quiz? Your progress will be lost.')) {
    if (window.activeGameInstance) {
      window.activeGameInstance.destroy();
      window.activeGameInstance = null;
    }
    navigate('games');
  }
}

// Value animator utility function
function animateValue(id, start, end, duration) {
  const obj = document.getElementById(id);
  if (!obj) return;
  const startTime = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const value = Math.floor(progress * (end - start) + start);
    obj.textContent = value;
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      obj.textContent = end;
    }
  }
  requestAnimationFrame(update);
}
