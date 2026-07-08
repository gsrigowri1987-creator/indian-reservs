const ACHIEVEMENTS = [
  { id: 'first_game', name: 'First Splash', desc: 'Play your first game', icon: '💧', check: s => s.gamesPlayed >= 1 },
  { id: 'quiz_master', name: 'Quiz Master', desc: 'Score 8+ in a single quiz', icon: '🧠', check: s => s.bestScores.quiz >= 8 },
  { id: 'explorer_5', name: 'Reservoir Explorer', desc: 'Discover 5 reservoirs on the map', icon: '🗺', check: s => (s.mapDiscovered || []).length >= 5 },
  { id: 'explorer_all', name: 'Master Cartographer', desc: 'Discover every reservoir on the map', icon: '🏆', check: s => (s.mapDiscovered || []).length >= 16 },
  { id: 'memory_win', name: 'Sharp Memory', desc: 'Complete a memory match game', icon: '🎴', check: s => s.bestScores.memory !== undefined },
  { id: 'speedster', name: 'Speedster', desc: 'Score 10+ in the 30 second challenge', icon: '⚡', check: s => s.bestScores.challenge30 >= 10 },
  { id: 'coin_collector', name: 'Coin Collector', desc: 'Earn 200 coins in total', icon: '🪙', check: s => s.coins >= 200 },
  { id: 'ten_games', name: 'Dedicated Player', desc: 'Play 10 games in total', icon: '🎮', check: s => s.gamesPlayed >= 10 },
  { id: 'wheel_spinner', name: 'Lucky Spin', desc: 'Spin the wheel 5 times', icon: '🎡', check: s => s.wheelSpins >= 5 },
  { id: 'jigsaw_solver', name: 'Puzzle Solver', desc: 'Complete a jigsaw puzzle', icon: '🧩', check: s => s.bestScores.jigsaw !== undefined }
];

function getAchProgress(a, s) {
  switch (a.id) {
    case 'first_game':
      return { current: s.gamesPlayed || 0, target: 1 };
    case 'quiz_master':
      return { current: s.bestScores.quiz || 0, target: 8 };
    case 'explorer_5':
      return { current: (s.mapDiscovered || []).length, target: 5 };
    case 'explorer_all':
      return { current: (s.mapDiscovered || []).length, target: 16 };
    case 'memory_win':
      return { current: s.bestScores.memory !== undefined ? 1 : 0, target: 1 };
    case 'speedster':
      return { current: s.bestScores.challenge30 || 0, target: 10 };
    case 'coin_collector':
      return { current: s.coins || 0, target: 200 };
    case 'ten_games':
      return { current: s.gamesPlayed || 0, target: 10 };
    case 'wheel_spinner':
      return { current: s.wheelSpins || 0, target: 5 };
    case 'jigsaw_solver':
      return { current: s.bestScores.jigsaw !== undefined ? 1 : 0, target: 1 };
    default:
      return { current: 0, target: 1 };
  }
}

function checkAchievements() {
  const currentUnlocked = [...(stateManager.state.unlocked || [])];
  let changed = false;

  ACHIEVEMENTS.forEach(a => {
    if (!currentUnlocked.includes(a.id) && a.check(stateManager.state)) {
      currentUnlocked.push(a.id);
      changed = true;
      showBadge(a);
      playSound('victory');
      if (typeof analytics !== 'undefined') {
        analytics.trackAchievement(a.id);
      }
    }
  });

  if (changed) {
    stateManager.update({ unlocked: currentUnlocked });
  }

  renderAchPreview();
  renderAchFull();
}

function showBadge(a) {
  const el = document.getElementById('badgeFloat');
  if (!el) return;

  el.innerHTML = `
    <div class="ach-icon">${a.icon}</div>
    <div>
      <strong>${sanitizeHTML(a.name)}</strong>
      <div style="color:var(--muted); font-size:.8rem;">${sanitizeHTML(a.desc)}</div>
    </div>
  `;
  
  el.classList.add('show');
  
  // Auto-dismiss floating achievement card after 3.8s
  setTimeout(() => {
    el.classList.remove('show');
  }, 3800);
}

function achCardHTML(a, locked) {
  const s = stateManager.state;
  const prog = getAchProgress(a, s);
  const currentClamped = Math.min(prog.current, prog.target);
  const percent = Math.round((currentClamped / prog.target) * 100);
  
  const progressBarHTML = locked ? `
    <div style="width:100%; margin-top:8px;">
      <div style="display:flex; justify-content:space-between; font-size:0.7rem; color:var(--muted); margin-bottom:2px;">
        <span>Progress</span>
        <span>${prog.current}/${prog.target}</span>
      </div>
      <div class="progress-bar-outer" style="height:4px; margin:0;">
        <div class="progress-bar-inner" style="width:${percent}%; height:100%;"></div>
      </div>
    </div>
  ` : `
    <div style="color:#10B981; font-size:0.7rem; font-weight:bold; margin-top:6px; display:flex; align-items:center; gap:4px;">
      <span>✓ Completed</span>
    </div>
  `;

  return `
    <div class="ach-card ${locked ? 'locked' : ''}" style="display:flex; flex-direction:column; align-items:flex-start; text-align:left;">
      <div style="display:flex; gap:12px; align-items:center; width:100%;">
        <div class="ach-icon" style="margin:0; font-size:1.6rem;">${a.icon}</div>
        <div style="flex:1;">
          <strong style="font-size:0.92rem; display:block;">${sanitizeHTML(a.name)}</strong>
          <span style="color:var(--muted); font-size:0.75rem; display:block; line-height:1.2; margin-top:1px;">${sanitizeHTML(a.desc)}</span>
        </div>
      </div>
      ${progressBarHTML}
    </div>
  `;
}

function renderAchPreview() {
  const el = document.getElementById('gridAchPreview');
  if (!el) return;
  
  const unlocked = stateManager.state.unlocked || [];
  el.innerHTML = ACHIEVEMENTS.slice(0, 4)
    .map(a => achCardHTML(a, !unlocked.includes(a.id)))
    .join('');
}

function renderAchFull() {
  const el = document.getElementById('gridAchFull');
  if (!el) return;

  const unlocked = stateManager.state.unlocked || [];
  const pct = Math.round((unlocked.length / ACHIEVEMENTS.length) * 100);

  el.innerHTML = ACHIEVEMENTS.map(a => achCardHTML(a, !unlocked.includes(a.id))).join('') + `
    <div class="ach-card" style="grid-column: 1 / -1; justify-content: center;">
      <div style="width:100%;">
        <div style="display:flex; justify-content:space-between; font-size:.85rem; color:var(--muted); margin-bottom:4px;">
          <span>Overall progress</span>
          <span>${unlocked.length}/${ACHIEVEMENTS.length} (${pct}%)</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width:${pct}%"></div>
        </div>
      </div>
    </div>
  `;
}
