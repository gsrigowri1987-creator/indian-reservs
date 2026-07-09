const WHEEL_SEGMENTS = [
  { label: '+20 Coins', type: 'coins', value: 20, color: '#3B82F6' },
  { label: 'Trivia Q', type: 'quiz', color: '#22D3EE' },
  { label: '+15 XP', type: 'xp', value: 15, color: '#34D399' },
  { label: 'True/False', type: 'truefalse', color: '#FBBF24' },
  { label: '+10 Coins', type: 'coins', value: 10, color: '#3B82F6' },
  { label: 'Trivia Q', type: 'quiz', color: '#22D3EE' },
  { label: '+25 XP', type: 'xp', value: 25, color: '#34D399' },
  { label: 'Jackpot 50', type: 'coins', value: 50, color: '#F87171' }
];

class WheelGame extends GameEngine {
  constructor() {
    super({
      id: 'wheel',
      name: 'Spin the Wheel',
      icon: '🎡',
      maxSpins: 3
    });
    this.spinning = false;
    this.animationFrameId = null;
    this.streak = 0;
    this.inProgress = false;
  }

  init() {
    super.init();
    this.spinning = false;
    this.streak = 0;
    this.inProgress = false;
    this.checkCooldown();
    this.render();
    
    // Start interval to update cooldown message if spins are finished
    this.setInterval(() => {
      this.updateCooldownMessage();
    }, 1000);
  }

  checkCooldown() {
    const spinsUsed = stateManager.state.wheelSpins || 0;
    if (spinsUsed >= this.config.maxSpins) {
      const lastTime = stateManager.state.wheelLastSpinTime || 0;
      const now = Date.now();
      const cooldownMs = 10 * 60 * 60 * 1000; // 10 hours
      if (now - lastTime >= cooldownMs) {
        stateManager.update({ wheelSpins: 0, wheelLastSpinTime: 0 });
      }
    }
  }

  updateCooldownMessage() {
    const el = document.getElementById('wheelCooldown');
    if (!el) return;
    
    const spinsUsed = stateManager.state.wheelSpins || 0;
    if (spinsUsed >= this.config.maxSpins) {
      const lastTime = stateManager.state.wheelLastSpinTime || 0;
      const now = Date.now();
      const cooldownMs = 10 * 60 * 60 * 1000; // 10 hours
      const diff = cooldownMs - (now - lastTime);
      
      if (diff <= 0) {
        stateManager.update({ wheelSpins: 0, wheelLastSpinTime: 0 });
        this.render();
      } else {
        const hours = Math.floor(diff / (60 * 60 * 1000));
        const mins = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
        const secs = Math.floor((diff % (60 * 1000)) / 1000);
        const timeStr = `${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`;
        el.innerHTML = `<p style="margin-top:14px; font-weight:700; color:var(--cyan);">🎡 You have used all 3 spins.<br><span style="font-size:0.9rem; color:var(--muted);">Next spins in: ${timeStr}</span></p>`;
      }
    } else {
      el.innerHTML = '';
    }
  }

  render() {
    const body = document.getElementById('wheelBody');
    if (!body) return;
    
    const spinsUsed = stateManager.state.wheelSpins || 0;
    const isFinished = spinsUsed >= this.config.maxSpins;
    
    body.innerHTML = `
      <div class="wheel-wrap">
        <canvas id="wheelCanvas" width="320" height="320"></canvas>
        <button class="btn btn-primary" id="spinBtn" onclick="spinWheel()" ${isFinished ? 'disabled' : ''}>🎡 Spin</button>
        <div id="wheelResult">
          <div id="wheelWinMessage"></div>
          <div id="wheelCooldown"></div>
        </div>
      </div>
    `;
    this.draw(0);
    this.updateCooldownMessage();
  }

  draw(rotation) {
    const canvas = document.getElementById('wheelCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = 160, cy = 160, r = 150, n = WHEEL_SEGMENTS.length, arc = Math.PI * 2 / n;
    
    ctx.clearRect(0, 0, 320, 320);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    
    WHEEL_SEGMENTS.forEach((seg, i) => {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r, i * arc, (i + 1) * arc);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.globalAlpha = 0.85;
      ctx.fill();
      ctx.globalAlpha = 1.0;
      
      ctx.save();
      ctx.rotate(i * arc + arc / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#031018';
      ctx.font = 'bold 13px Inter, sans-serif';
      ctx.fillText(seg.label, r - 14, 5);
      ctx.restore();
    });
    
    ctx.restore();
    
    ctx.beginPath();
    ctx.arc(cx, cy, 150, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,.15)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(cx + 150, cy - 14);
    ctx.lineTo(cx + 178, cy);
    ctx.lineTo(cx + 150, cy + 14);
    ctx.closePath();
    ctx.fillStyle = '#22D3EE';
    ctx.fill();
  }

  spin() {
    if (this.spinning || (stateManager.state.wheelSpins || 0) >= this.config.maxSpins) return;
    this.spinning = true;
    this.inProgress = true;
    
    const spinBtn = document.getElementById('spinBtn');
    if (spinBtn) spinBtn.disabled = true;
    
    const n = WHEEL_SEGMENTS.length, arc = Math.PI * 2 / n;
    const targetIndex = Math.floor(Math.random() * n);
    const extraSpins = 5 * Math.PI * 2;
    const finalRotation = extraSpins + (Math.PI * 2 - (targetIndex * arc + arc / 2));
    const duration = 3200;
    const start = performance.now();
    
    const frame = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      this.draw(finalRotation * eased);
      
      if (t < 1 && this.isActive) {
        this.animationFrameId = requestAnimationFrame(frame);
      } else if (this.isActive) {
        this.spinning = false;
        
        const currentSpins = (stateManager.state.wheelSpins || 0) + 1;
        const updates = { wheelSpins: currentSpins };
        
        if (currentSpins >= this.config.maxSpins) {
          this.inProgress = false;
          updates.wheelLastSpinTime = Date.now();
        }
        stateManager.update(updates);

        const nextSpinBtn = document.getElementById('spinBtn');
        if (nextSpinBtn) {
          nextSpinBtn.disabled = currentSpins >= this.config.maxSpins;
        }
        
        this.resolveSegment(WHEEL_SEGMENTS[targetIndex]);
        this.updateCooldownMessage();
      }
    };
    
    this.animationFrameId = requestAnimationFrame(frame);
  }

  resolveSegment(seg) {
    const el = document.getElementById('wheelWinMessage');
    if (!el) return;

    if (seg.type === 'coins') {
      this.streak++;
      const mult = 1 + (this.streak - 1) * 0.2;
      const val = Math.round(seg.value * mult);
      addCoins(val);
      playSound('victory');
      el.innerHTML = `<p style="margin-top:14px; font-weight:700; color:var(--success);">🔥 Streak x${this.streak}! You won ${val} coins! 🪙</p>`;
      this.recordScore(stateManager.state.coins);
    } else if (seg.type === 'xp') {
      this.streak++;
      const mult = 1 + (this.streak - 1) * 0.2;
      const val = Math.round(seg.value * mult);
      addXP(val);
      playSound('victory');
      el.innerHTML = `<p style="margin-top:14px; font-weight:700; color:var(--success);">🔥 Streak x${this.streak}! You earned ${val} XP! ⚡</p>`;
      this.recordScore(stateManager.state.coins);
    } else if (seg.type === 'quiz') {
      const q = QUIZ_QUESTIONS[Math.floor(Math.random() * QUIZ_QUESTIONS.length)];
      el.innerHTML = `
        <div style="margin-top:18px; text-align:left;">
          <p style="font-weight:700; margin-bottom:12px;">${q.q}</p>
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${q.options.map((o, idx) => `<button class="option-btn" onclick="wheelQuizAnswer(${idx},${q.a})">${sanitizeHTML(o)}</button>`).join('')}
          </div>
        </div>
      `;
    } else if (seg.type === 'truefalse') {
      const r = RESERVOIRS[Math.floor(Math.random() * RESERVOIRS.length)];
      const isTrue = Math.random() > 0.5;
      const shownState = isTrue ? r.state : RESERVOIRS.filter(x => x.state !== r.state)[0].state;
      el.innerHTML = `
        <div style="margin-top:18px;">
          <p style="font-weight:700; margin-bottom:12px;">True or false: ${r.name} is located in ${shownState}.</p>
          <div style="display:flex; gap:10px; justify-content:center;">
            <button class="btn btn-ghost" onclick="wheelTFAnswer(${isTrue === true})">True</button>
            <button class="btn btn-ghost" onclick="wheelTFAnswer(${isTrue === false})">False</button>
          </div>
        </div>
      `;
    }
  }

  quizAnswer(picked, correct) {
    const ok = picked === correct;
    let resultText = '';
    
    if (ok) {
      this.streak++;
      const mult = 1 + (this.streak - 1) * 0.2;
      const xp = Math.round(12 * mult);
      const coins = Math.round(6 * mult);
      addXP(xp);
      addCoins(coins);
      playSound('correct');
      if (navigator.vibrate) navigator.vibrate(10);
      resultText = `🔥 Streak x${this.streak}! Correct! +${xp} XP +${coins} Coins`;
    } else {
      this.streak = 0;
      playSound('wrong');
      if (navigator.vibrate) navigator.vibrate([10, 50, 10]);
      resultText = 'Not quite! Streak reset.';
    }
    
    const el = document.getElementById('wheelWinMessage');
    if (el) {
      el.innerHTML = `<p style="margin-top:14px; font-weight:700; color:${ok ? 'var(--success)' : 'var(--danger)'};">${resultText}</p>`;
    }
    this.recordScore(stateManager.state.coins);
  }

  tfAnswer(correct) {
    let resultText = '';
    
    if (correct) {
      this.streak++;
      const mult = 1 + (this.streak - 1) * 0.2;
      const xp = Math.round(10 * mult);
      const coins = Math.round(5 * mult);
      addXP(xp);
      addCoins(coins);
      playSound('correct');
      if (navigator.vibrate) navigator.vibrate(10);
      resultText = `🔥 Streak x${this.streak}! Correct! +${xp} XP +${coins} Coins`;
    } else {
      this.streak = 0;
      playSound('wrong');
      if (navigator.vibrate) navigator.vibrate([10, 50, 10]);
      resultText = 'Not quite! Streak reset.';
    }
    
    const el = document.getElementById('wheelWinMessage');
    if (el) {
      el.innerHTML = `<p style="margin-top:14px; font-weight:700; color:${correct ? 'var(--success)' : 'var(--danger)'};">${resultText}</p>`;
    }
    this.recordScore(stateManager.state.coins);
  }

  cleanup() {
    this.inProgress = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}

// Global wrappers
function renderWheel() {
  if (window.activeGameInstance) {
    window.activeGameInstance.destroy();
  }
  window.activeGameInstance = new WheelGame();
  window.activeGameInstance.init();
}

function spinWheel() {
  if (window.activeGameInstance && window.activeGameInstance.id === 'wheel') {
    window.activeGameInstance.spin();
  }
}

function wheelQuizAnswer(picked, correct) {
  if (window.activeGameInstance && window.activeGameInstance.id === 'wheel') {
    window.activeGameInstance.quizAnswer(picked, correct);
  }
}

function wheelTFAnswer(correct) {
  if (window.activeGameInstance && window.activeGameInstance.id === 'wheel') {
    window.activeGameInstance.tfAnswer(correct);
  }
}
