const PAGES = [
  'home', 'games', 'achievements', 'leaderboard', 'settings', 'about', 
  'game-quiz', 'game-guess', 'game-memory', 'game-wheel', 'game-challenge30', 
  'game-jigsaw', 'game-wordsearch', 'game-snake', 'game-typing', 'shop'
];

const NAV_ITEMS = [
  ['home', 'Home'],
  ['games', 'Games'],
  ['shop', 'Shop'],
  ['achievements', 'Achievements'],
  ['leaderboard', 'Leaderboard'],
  ['settings', 'Settings'],
  ['about', 'About']
];

window.activeGameInstance = null;
const imageAbortControllers = new Map();

const imgCache = {};

function abortAllImageLoads() {
  for (const [id, controller] of imageAbortControllers) {
    try {
      controller.abort();
    } catch (e) {}
  }
  imageAbortControllers.clear();
}

async function fetchReservoirImages(reservoir, limit) {
  limit = limit || 1;
  if (typeof RESERVOIR_IMAGES !== 'undefined' && RESERVOIR_IMAGES[reservoir.id]) {
    imgCache[reservoir.id] = RESERVOIR_IMAGES[reservoir.id].slice(0, limit);
    return imgCache[reservoir.id];
  }
  if (imgCache[reservoir.id]) return imgCache[reservoir.id];

  const controller = new AbortController();
  const id = reservoir.id + '_' + Date.now();
  imageAbortControllers.set(id, controller);
  
  let urls = [];
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(reservoir.wiki)}`, { signal: controller.signal });
    const data = await res.json();
    if (data.thumbnail && data.thumbnail.source) {
      urls = [data.thumbnail.source.replace(/\/\d+px-/, '/500px-')];
    } else if (data.originalimage) {
      urls = [data.originalimage.source];
    }
  } catch (e) {
    if (e.name === 'AbortError') return [];
  } finally {
    imageAbortControllers.delete(id);
  }

  if (urls.length === 0) {
    const catController = new AbortController();
    const catId = reservoir.id + '_cat_' + Date.now();
    imageAbortControllers.set(catId, catController);
    try {
      const catUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=categorymembers&gcmtitle=${encodeURIComponent('Category:'+reservoir.category)}&gcmtype=file&gcmlimit=${Math.max(limit,6)}&prop=imageinfo&iiprop=url&iiurlwidth=500&format=json&origin=*`;
      const res = await fetch(catUrl, { signal: catController.signal });
      const data = await res.json();
      if (data.query && data.query.pages) {
        urls = Object.values(data.query.pages)
          .filter(p => p.imageinfo && p.imageinfo[0] && /\.(jpe?g|png)$/i.test(p.title))
          .map(p => p.imageinfo[0].thumburl || p.imageinfo[0].url);
      }
    } catch (e) {
      if (e.name === 'AbortError') return [];
    } finally {
      imageAbortControllers.delete(catId);
    }
  }
  
  imgCache[reservoir.id] = urls;
  return urls;
}


let currentPageId = 'home';

function navigate(pageId, opts) {
  opts = opts || {};
  
  // Confirmation check before leaving an active game in progress
  if (window.activeGameInstance && window.activeGameInstance.inProgress) {
    if (!confirm('Leave this game? Your current progress will be lost.')) {
      if (location.hash.replace('#', '') !== currentPageId) {
        location.hash = currentPageId;
      }
      return false;
    }
  }
  
  currentPageId = pageId;
  
  // Abort any ongoing image fetches
  abortAllImageLoads();
  
  // Teardown the active game instance if we are leaving a game page
  if (window.activeGameInstance) {
    window.activeGameInstance.destroy();
    window.activeGameInstance = null;
  }
  
  // Manage background timers from original code just in case
  if (typeof quizState !== 'undefined' && quizState.interval) {
    clearInterval(quizState.interval);
    quizState.interval = null;
  }
  if (typeof c30State !== 'undefined' && c30State.interval) {
    clearInterval(c30State.interval);
    c30State.interval = null;
  }
  if (typeof wsState !== 'undefined' && wsState.timerInterval) {
    clearInterval(wsState.timerInterval);
    wsState.timerInterval = null;
  }

  // Handle Home particle canvas visibility
  if (pageId === 'home') {
    if (typeof heroParticleSystem !== 'undefined' && heroParticleSystem) {
      heroParticleSystem.start();
    }
  } else {
    if (typeof heroParticleSystem !== 'undefined' && heroParticleSystem) {
      heroParticleSystem.stop();
    }
  }

  // Swap active page elements
  PAGES.forEach(p => {
    const el = document.getElementById('page-' + p);
    if (el) {
      el.classList.remove('active');
      el.classList.remove('book-reveal-stagger');
    }
  });

  const target = document.getElementById('page-' + pageId);
  if (target) {
    target.classList.add('active');
  }

  // Smooth scroll to top unless user prefers reduced motion
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  
  location.hash = pageId;

  // Sync menu highlights
  document.querySelectorAll('.nav-links button, .mobile-nav-sheet button').forEach(b => {
    b.classList.toggle('active', b.dataset.page === pageId);
  });
  
  const mobileNav = document.getElementById('mobileNav');
  if (mobileNav) mobileNav.classList.remove('open');
  
  if (typeof updateMusicForPage === 'function') {
    updateMusicForPage(pageId);
  }

  // Initialize specific page contents
  if (pageId === 'games' && typeof renderAllGamesGrid === 'function') {
    renderAllGamesGrid();
  }
  if (pageId === 'achievements' && typeof renderAchFull === 'function') {
    renderAchFull();
  }
  if (pageId === 'leaderboard' && typeof renderLeaderboard === 'function') {
    renderLeaderboard();
  }
  if (pageId === 'shop' && typeof renderShop === 'function') {
    renderShop();
  }
  if (pageId === 'settings' && typeof initSettingsPage === 'function') {
    initSettingsPage();
  }
  
  // Game launch triggers (wrapped for backwards compatibility)
  if (pageId === 'game-quiz' && typeof startQuiz === 'function') {
    startQuiz();
  }
  if (pageId === 'game-guess' && typeof startGuess === 'function') {
    startGuess();
  }
  if (pageId === 'game-memory' && typeof startMemory === 'function') {
    startMemory();
  }
  if (pageId === 'game-wheel' && typeof renderWheel === 'function') {
    renderWheel();
  }
  if (pageId === 'game-challenge30' && typeof startChallenge30 === 'function') {
    startChallenge30();
  }
  if (pageId === 'game-jigsaw' && typeof startJigsaw === 'function') {
    startJigsaw();
  }
  if (pageId === 'game-wordsearch' && typeof startWordSearch === 'function') {
    startWordSearch();
  }
  if (pageId === 'game-snake' && typeof startSnake === 'function') {
    startSnake();
  }
  if (pageId === 'game-typing' && typeof startTyping === 'function') {
    startTyping();
  }

  // Trigger leaflet map rendering
  if (pageId === 'home' && typeof initReservoirMap === 'function') {
    // Delay slightly to let layout settle
    setTimeout(initReservoirMap, 200);
  }

  if (!opts || !opts.skipSound) {
    if (typeof playSound === 'function') {
      playSound('click');
    }
  }
}
