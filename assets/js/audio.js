class AudioService {
  constructor() {
    this.context = null;
  }

  init() {
    if (!this.context) {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  playBeep(type) {
    this.init();
    if (this.context.state === 'suspended') {
      this.context.resume();
    }
    
    try {
      const o = this.context.createOscillator();
      const g = this.context.createGain();
      o.connect(g);
      g.connect(this.context.destination);
      
      let freq = 440, dur = 0.12;
      if (type === 'correct') { freq = 740; dur = 0.12; }
      else if (type === 'wrong') { freq = 160; dur = 0.18; }
      else if (type === 'victory') { freq = 880; dur = 0.30; }
      else if (type === 'click') { freq = 520; dur = 0.06; }
      
      o.frequency.value = freq;
      g.gain.value = 0.05;
      o.start();
      g.gain.exponentialRampToValueAtTime(0.0001, this.context.currentTime + dur);
      o.stop(this.context.currentTime + dur);
    } catch (e) {
      console.warn('AudioContext beep failed:', e);
    }
  }
}

const audioService = new AudioService();
let musicStarted = false;

function isGamePage(pageId) {
  const current = pageId || location.hash.replace('#', '');
  return String(current).startsWith('game-');
}

function activeMusic() {
  return isGamePage() ? document.getElementById('gameMusic') : document.getElementById('bgMusic');
}

function playSound(type) {
  if (!stateManager.state.soundOn) return;
  const fileSound = type === 'correct' ? document.getElementById('correctSfx')
    : type === 'paper' ? document.getElementById('paperSfx')
    : type === 'wrong' ? document.getElementById('wrongSfx')
    : (type === 'click' || type === 'victory' ? document.getElementById('clickSfx') : null);
  
  if (fileSound) {
    try {
      if (type === 'paper') fileSound.volume = 0.32;
      else fileSound.volume = 1;
      fileSound.currentTime = 0;
      fileSound.play().catch(() => {
        // Fallback to synth beep if play is blocked or fails
        audioService.playBeep(type);
      });
      return;
    } catch (e) {}
  }
  audioService.playBeep(type);
}

function syncMusicButton() {
  const btn = document.getElementById('musicToggle');
  if (!btn) return;
  const music = activeMusic();
  const playing = music && !music.paused;
  btn.classList.toggle('muted', !playing);
  btn.textContent = playing ? 'Ⅱ' : '♪';
  btn.setAttribute('aria-label', playing ? 'Stop background music' : 'Play background music');
  btn.title = playing ? 'Stop background music' : 'Play background music';
}

function startMusic() {
  const music = activeMusic();
  if (!music || !stateManager.state.musicOn) return;
  const other = music.id === 'gameMusic' ? document.getElementById('bgMusic') : document.getElementById('gameMusic');
  if (other) other.pause();
  music.volume = music.id === 'gameMusic' ? 0.42 : 0.34;
  music.play().then(() => {
    musicStarted = true;
    syncMusicButton();
  }).catch(() => syncMusicButton());
}

function updateMusicForPage(pageId) {
  const bg = document.getElementById('bgMusic');
  const game = document.getElementById('gameMusic');
  if (bg && game) {
    if (isGamePage(pageId)) bg.pause();
    else game.pause();
  }
  musicStarted = false;
  if (stateManager.state.musicOn) startMusic();
  else syncMusicButton();
}

function toggleMusic() {
  const music = activeMusic();
  if (!music) return;
  stateManager.update({ musicOn: music.paused });
  if (stateManager.state.musicOn) startMusic();
  else {
    music.pause();
    musicStarted = false;
  }
  syncMusicButton();
}

function initMusic() {
  stateManager.update({ musicOn: true });
  startMusic();
  
  const unlockAndFullscreen = () => {
    audioService.init();
    if (!musicStarted && stateManager.state.musicOn) startMusic();
    
    // Auto-enter fullscreen for immersive gaming experience
    const docEl = document.documentElement;
    if (!document.fullscreenElement) {
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch(() => {});
      } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen().catch(() => {});
      } else if (docEl.msRequestFullscreen) {
        docEl.msRequestFullscreen().catch(() => {});
      }
    }
    
    window.removeEventListener('pointerdown', unlockAndFullscreen);
    window.removeEventListener('keydown', unlockAndFullscreen);
  };
  
  window.addEventListener('pointerdown', unlockAndFullscreen, { once: true });
  window.addEventListener('keydown', unlockAndFullscreen, { once: true });
  
  const persistentFullscreen = () => {
    const docEl = document.documentElement;
    if (!document.fullscreenElement) {
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch(() => {});
      } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen().catch(() => {});
      } else if (docEl.msRequestFullscreen) {
        docEl.msRequestFullscreen().catch(() => {});
      }
    }
  };
  window.addEventListener('click', persistentFullscreen);
  window.addEventListener('touchend', persistentFullscreen);

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && stateManager.state.musicOn) startMusic();
  });
  
  window.addEventListener('load', startMusic);
  syncMusicButton();
}
