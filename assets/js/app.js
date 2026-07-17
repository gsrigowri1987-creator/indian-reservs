// Global helper utilities
function shuffle(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function resultsHTML(score, total, gameId) {
  return `
    <div class="results-hero">
      <div class="big">${score} / ${total}</div>
      <p style="color:var(--muted); margin-top:8px;">Game completed!</p>
      <div class="hero-ctas" style="margin-top:24px;">
        <button class="btn btn-primary" onclick="start${gameId.charAt(0).toUpperCase() + gameId.slice(1)}()">Play again</button>
        <button class="btn btn-ghost" onclick="navigate('games')">More games</button>
      </div>
    </div>
  `;
}

function quickPlay() {
  const gamesPool = GAMES.map(g => g.route);
  const randomRoute = gamesPool[Math.floor(Math.random() * gamesPool.length)];
  const gameName = GAMES.find(g => g.route === randomRoute).name;
  
  toast(`🎲 Quick Play: Launching ${gameName}!`);
  
  const hasSeenBookTransition = sessionStorage.getItem('seenBookTransition');
  if (hasSeenBookTransition) {
    navigate(randomRoute);
  } else {
    startPlayingWithBook(null, randomRoute);
  }
}

function toggleMobileNav() {
  const nav = document.getElementById('mobileNav');
  if (nav) {
    nav.classList.toggle('open');
  }
}

function applyVideoBg(videoPath) {
  const videoEl = document.getElementById('siteBgVideo');
  if (videoEl) {
    let src = videoPath || 'assets/video/bg.mp4';
    if (src === 'assets/video/video 2.mp4') src = 'assets/video/video2.mp4';
    if (src === 'assets/video/video 3.mp4') src = 'assets/video/video3.mp4';
    
    const safeSrc = encodeURI(src);
    while (videoEl.firstChild) {
      videoEl.removeChild(videoEl.firstChild);
    }
    videoEl.src = safeSrc;
    videoEl.load();
    videoEl.play().catch(err => console.warn('Video background play failed:', err));
  }
}

// Bootstrap
window.addEventListener('DOMContentLoaded', () => {
  buildNav();
  applyTheme();
  applyVideoBg(stateManager.state.videoBg);
  
  // Initialize state subscriptions
  stateManager.subscribe('theme', (newTheme) => {
    themeSystem.apply(newTheme);
  });

  stateManager.subscribe('videoBg', (newVideo) => {
    applyVideoBg(newVideo);
  });
  
  stateManager.subscribe('musicOn', (val) => {
    syncMusicButton();
    const switchMusic = document.getElementById('switchMusic');
    if (switchMusic) {
      switchMusic.classList.toggle('on', val);
    }
  });
  
  stateManager.subscribe('soundOn', (val) => {
    const switchSound = document.getElementById('switchSound');
    if (switchSound) {
      switchSound.classList.toggle('on', val);
    }
  });

  // Start background engines
  initLoader();
  initHeroCanvas();
  initCursor();
  initWaterSplash();
  initMusic();
  
  // Router hash handler
  const initialPage = location.hash.replace('#', '') || 'home';
  navigate(initialPage, { skipSound: true });
  
  window.addEventListener('hashchange', () => {
    const page = location.hash.replace('#', '') || 'home';
    const targetEl = document.getElementById('page-' + page);
    if (targetEl && !targetEl.classList.contains('active')) {
      navigate(page);
    }
  });

  // Service Worker Registration for offline caching (only on secure origins, not local file://)
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js')
      .then(reg => {
        console.log('Offline service worker registered:', reg.scope);
      })
      .catch(err => {
        console.warn('Service worker registration failed:', err);
      });
  }

  // First draw
  renderHomeGrids();
  refreshPills();
  checkAchievements();
});

function toggleSound() {
  const current = !stateManager.state.soundOn;
  stateManager.update({ soundOn: current });
  const switchSound = document.getElementById('switchSound');
  if (switchSound) {
    switchSound.classList.toggle('on', current);
  }
  toast(`🔊 Sound Effects: ${current ? 'ON' : 'OFF'}`);
}

function changeVideoBg(event) {
  const path = event.target.value;
  stateManager.update({ videoBg: path });
  toast(`🎬 Background updated!`);
}

function initSettingsPage() {
  const switchDark = document.getElementById('switchDark');
  if (switchDark) {
    const currentTheme = stateManager.state.theme || 'dark';
    switchDark.classList.toggle('on', currentTheme === 'dark' || currentTheme === 'high-contrast');
  }

  const switchSound = document.getElementById('switchSound');
  if (switchSound) {
    switchSound.classList.toggle('on', stateManager.state.soundOn);
  }

  const switchMusic = document.getElementById('switchMusic');
  if (switchMusic) {
    switchMusic.classList.toggle('on', stateManager.state.musicOn);
  }

  const selectVideoBg = document.getElementById('selectVideoBg');
  if (selectVideoBg) {
    selectVideoBg.value = stateManager.state.videoBg || 'assets/video/bg.mp4';
  }
}

// Cinematic Credits crawl handler
function startAboutCredits() {
  const stage = document.getElementById('aboutCreditsStage');
  const crawl = document.getElementById('aboutCreditsCrawl');
  const audio = document.getElementById('creditsSfx');
  const btn = document.getElementById('playCreditsBtn');
  
  if (!stage || !crawl) return;
  
  // Pause default background tracks
  const bgMusic = document.getElementById('bgMusic');
  const gameMusic = document.getElementById('gameMusic');
  if (bgMusic) bgMusic.pause();
  if (gameMusic) gameMusic.pause();
  
  // cinematic fullscreen activation
  if (stage.requestFullscreen) {
    stage.requestFullscreen().catch(() => {});
  } else if (stage.webkitRequestFullscreen) {
    stage.webkitRequestFullscreen().catch(() => {});
  } else if (stage.msRequestFullscreen) {
    stage.msRequestFullscreen().catch(() => {});
  }
  
  // start CSS scroll animation
  crawl.classList.add('playing');
  
  // Play credits track
  if (audio && stateManager.state.musicOn) {
    audio.currentTime = 0;
    audio.play().catch(e => console.warn('Credits audio play failed:', e));
  }
  
  if (btn) {
    btn.textContent = "Exit Credits";
    btn.setAttribute('onclick', 'stopAboutCredits()');
  }
  
  // Stop and cleanup when exiting fullscreen
  const onFullscreenChange = () => {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      stopAboutCredits();
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
    }
  };
  document.addEventListener('fullscreenchange', onFullscreenChange);
  document.addEventListener('webkitfullscreenchange', onFullscreenChange);
}

function stopAboutCredits() {
  const crawl = document.getElementById('aboutCreditsCrawl');
  const audio = document.getElementById('creditsSfx');
  const btn = document.getElementById('playCreditsBtn');
  
  if (crawl) {
    crawl.classList.remove('playing');
  }
  
  if (audio) {
    audio.pause();
  }
  
  // Resume standard track
  if (typeof startMusic === 'function' && stateManager.state.musicOn) {
    startMusic();
  }
  
  if (btn) {
    btn.textContent = "Roll Credits ♪";
    btn.setAttribute('onclick', 'startAboutCredits()');
  }
  
  // Exit fullscreen if active
  if (document.fullscreenElement || document.webkitFullscreenElement) {
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen().catch(() => {});
    }
  }
}
