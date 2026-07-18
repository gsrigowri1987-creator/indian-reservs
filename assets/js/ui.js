// Loading Overlay Manager
function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;
  
  const hideLoader = () => {
    setTimeout(() => {
      loader.classList.add('done');
      // Completely remove from DOM after CSS fade-out transition completes
      setTimeout(() => {
        try {
          loader.remove();
        } catch (e) {}
      }, 600);
    }, 400);
  };

  if (document.readyState === 'complete') {
    hideLoader();
  } else {
    window.addEventListener('load', hideLoader);
  }
}

// Custom Cursor with element recycling pool
const TRAIL_POOL_SIZE = 15;
const trailPool = [];
let trailIndex = 0;

function getTrailElement() {
  let el = trailPool[trailIndex];
  if (!el) {
    el = document.createElement('span');
    el.className = 'cursor-trail';
    document.body.appendChild(el);
    trailPool[trailIndex] = el;
  }
  trailIndex = (trailIndex + 1) % TRAIL_POOL_SIZE;
  return el;
}

function initCursor() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = !window.matchMedia('(pointer: coarse)').matches;
  
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');

  if (prefersReduced || !isFinePointer) {
    document.body.style.cursor = 'auto';
    if (dot) dot.style.display = 'none';
    if (ring) ring.style.display = 'none';
    return;
  }

  let x = window.innerWidth / 2, y = window.innerHeight / 2, rx = x, ry = y, lastTrail = 0;
  
  function frame() {
    rx += (x - rx) * 0.18;
    ry += (y - ry) * 0.18;
    if (dot) {
      dot.style.left = x + 'px';
      dot.style.top = y + 'px';
    }
    if (ring) {
      ring.style.left = rx + 'px';
      ring.style.top = ry + 'px';
    }
    requestAnimationFrame(frame);
  }

  window.addEventListener('mousemove', e => {
    x = e.clientX;
    y = e.clientY;
    const now = performance.now();
    if (now - lastTrail > 45) {
      lastTrail = now;
      const t = getTrailElement();
      t.style.left = x + 'px';
      t.style.top = y + 'px';
      t.style.opacity = '0.65';
      t.style.transform = 'translate(-50%, -50%) scale(1)';
      t.style.animation = 'none';
      void t.offsetWidth; // force reflow
      t.style.animation = 'trailFade .55s ease forwards';
    }
  });

  document.addEventListener('mouseover', e => {
    if (ring) {
      const isInteractive = e.target.closest('button, a, .game-card, .option-btn, .mem-card, .jigsaw-tile, .reservoir-photo, .bingo-cell');
      ring.classList.toggle('hover', !!isInteractive);
    }
  });

  frame();
}

// Event delegation also covers buttons added while games and panels are rendered.
function initWaterSplash() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || button.disabled) return;

    const rect = button.getBoundingClientRect();
    const usedKeyboard = event.detail === 0;
    const x = usedKeyboard ? rect.left + rect.width / 2 : event.clientX;
    const y = usedKeyboard ? rect.top + rect.height / 2 : event.clientY;
    const splash = document.createElement('span');
    splash.className = 'water-splash';
    splash.style.left = x + 'px';
    splash.style.top = y + 'px';

    const drops = [
      ['-68deg', '24px'], ['-25deg', '31px'], ['18deg', '27px'],
      ['54deg', '34px'], ['102deg', '25px'], ['146deg', '30px']
    ];
    splash.innerHTML = '<span class="water-splash__ring"></span><span class="water-splash__ring water-splash__ring--inner"></span>' +
      drops.map(([angle, distance]) => `<span class="water-splash__drop" style="--angle:${angle}; --distance:${distance};"></span>`).join('');

    document.body.appendChild(splash);
    window.setTimeout(() => splash.remove(), 800);
  });
}

// Toast notification stacking
const toastQueue = [];
let toastVisible = false;

function toast(msg) {
  toastQueue.push(msg);
  if (!toastVisible) showNextToast();
}

function showNextToast() {
  if (toastQueue.length === 0) {
    toastVisible = false;
    return;
  }
  toastVisible = true;
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = toastQueue.shift();
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => {
    t.classList.remove('show');
    setTimeout(showNextToast, 300);
  }, 2200);
}

// Book Opening Transition
let bookTransitionActive = false;

function startPlayingWithBook(ev, destPageId) {
  destPageId = destPageId || 'games';
  const hasSeenBookTransition = sessionStorage.getItem('seenBookTransition');
  if (hasSeenBookTransition) {
    navigate(destPageId, { skipSound: true });
    return;
  }
  
  const btn = ev ? ev.currentTarget : null;
  if (btn) {
    btn.classList.remove('micro-pop');
    void btn.offsetWidth;
    btn.classList.add('micro-pop');
  }
  
  playSound('click');
  if (bookTransitionActive) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    sessionStorage.setItem('seenBookTransition', 'true');
    setTimeout(() => navigate(destPageId, { skipSound: true }), 120);
    return;
  }
  
  sessionStorage.setItem('seenBookTransition', 'true');
  setTimeout(() => runBookOpeningTransition(destPageId), 120);
}

function runBookOpeningTransition(destPageId) {
  destPageId = destPageId || 'games';
  bookTransitionActive = true;
  const overlay = document.createElement('div');
  overlay.className = 'book-transition-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = `
    <div class="book-transition-dim"></div>
    <div class="book-scene">
      <div class="book-3d">
        <div class="book-spine"></div>
        <div class="book-back"></div>
        <div class="book-pages-block"></div>
        <div class="book-inside">
          <div class="book-inside-map"></div>
          <div class="book-inside-label">
            <span>🗺️</span>
            <strong>South India Atlas</strong>
            <em>Games · Chapter I</em>
          </div>
        </div>
        <div class="book-page-flip p1"></div>
        <div class="book-page-flip p2"></div>
        <div class="book-page-flip p3"></div>
        <div class="book-light-sweep"></div>
        <div class="book-cover-wrap">
          <div class="book-cover-front">
            <div class="book-cover-shine"></div>
            <div class="book-cover-title">
              <div class="book-cover-emblem">🌊</div>
              <h2>Reservoir Quest</h2>
              <div class="book-cover-sub">Geography &amp; Atlas</div>
            </div>
            <div class="book-cover-edge"></div>
          </div>
        </div>
      </div>
      <div class="book-dust">
        <span></span><span></span><span></span><span></span><span></span><span></span>
      </div>
    </div>`;
  
  document.body.appendChild(overlay);

  // Safety fallback timeout in case animation fails/gets stuck
  const safetyTimeout = setTimeout(() => {
    const activeOverlay = document.querySelector('.book-transition-overlay');
    if (activeOverlay) {
      activeOverlay.remove();
      bookTransitionActive = false;
      const targetPage = document.getElementById('page-' + destPageId);
      if (targetPage) targetPage.style.visibility = '';
    }
  }, 3000);

  setTimeout(() => playSound('paper'), 340);
  
  setTimeout(() => {
    navigate(destPageId, { skipSound: true });
    const targetPage = document.getElementById('page-' + destPageId);
    if (targetPage) targetPage.style.visibility = 'hidden';
  }, 700);

  setTimeout(() => {
    const targetPage = document.getElementById('page-' + destPageId);
    if (targetPage) {
      targetPage.style.visibility = '';
      targetPage.classList.add('book-reveal-stagger');
    }
    overlay.remove();
    bookTransitionActive = false;
    clearTimeout(safetyTimeout);
    
    setTimeout(() => {
      if (targetPage) targetPage.classList.remove('book-reveal-stagger');
    }, 950);
  }, 1120);
}

const NAV_ITEMS_ICONS = {
  home: '🏠',
  games: '🎮',
  shop: '🛒',
  achievements: '🏆',
  leaderboard: '📊',
  chat: '💬',
  settings: '⚙️',
  about: 'ℹ️'
};

// Navigation & Layout Building
function buildNav() {
  const nav = document.getElementById('navLinks');
  if (nav) {
    nav.innerHTML = NAV_ITEMS.map(([id, label]) => {
      const icon = NAV_ITEMS_ICONS[id] || '🔹';
      return `<button data-page="${id}" onclick="navigate('${id}')"><span class="nav-icon-desktop">${icon}</span> ${label}</button>`;
    }).join('');
  }
  const sheet = document.getElementById('mobileNavSheet');
  if (sheet) {
    sheet.innerHTML = NAV_ITEMS.map(([id, label]) => {
      const icon = NAV_ITEMS_ICONS[id] || '🔹';
      return `<button data-page="${id}" onclick="navigate('${id}')"><span style="margin-right:12px; font-size:1.2rem;">${icon}</span> ${label}</button>`;
    }).join('');
  }
}

// Grids & Walls Rendering
function gameCardHTML(g) {
  const diffClass = g.diff.toLowerCase();
  const cardStyle = stateManager.state.equippedCardStyle ? 'style-' + stateManager.state.equippedCardStyle.replace('style_', '') : '';
  return `
    <div class="game-card ${cardStyle}" 
         onclick="navigate('${g.route}')" 
         onkeydown="if(event.key==='Enter'||event.key===' ') { navigate('${g.route}'); }"
         role="button" 
         tabindex="0"
         aria-label="Play ${g.name}">
      <div class="icon">${g.icon}</div>
      <h3>${g.name}</h3>
      <p>${g.desc}</p>
      <div class="meta">
        <span class="tag ${diffClass}">${g.diff}</span>
        <span class="tag">${g.time}</span>
      </div>
      <div class="play-btn">Play now →</div>
    </div>
  `;
}

function renderHomeGrids() {
  const gridPopular = document.getElementById('gridPopular');
  if (gridPopular) gridPopular.innerHTML = GAMES.slice(0, 4).map(gameCardHTML).join('');

  const gridQuiz = document.getElementById('gridQuiz');
  if (gridQuiz) gridQuiz.innerHTML = GAMES.filter(g => g.cat === 'quiz').map(gameCardHTML).join('');

  const gridPuzzle = document.getElementById('gridPuzzle');
  if (gridPuzzle) gridPuzzle.innerHTML = GAMES.filter(g => g.cat === 'puzzle').map(gameCardHTML).join('');

  const gridChallenge = document.getElementById('gridChallenge');
  if (gridChallenge) gridChallenge.innerHTML = GAMES.filter(g => g.cat === 'challenge').map(gameCardHTML).join('');

  renderPhotoWall();
}

function renderAllGamesGrid() {
  const gridAll = document.getElementById('gridAll');
  if (gridAll) gridAll.innerHTML = GAMES.map(gameCardHTML).join('');
}

function imageTag(url, alt, cls) {
  return `<img src="${url}" alt="${alt}" loading="lazy" class="${cls || ''}" onerror="this.closest('.blur-frame,.img-box,.reservoir-photo')?.classList.add('img-failed'); this.style.display='none'; const fb=this.nextElementSibling; if(fb) fb.style.display='flex';">`;
}

function fallbackTile(reservoir) {
  return `<div class="fallback" style="display:flex;"><span style="font-size:2rem;">🌊</span><span>${reservoir.name}</span></div>`;
}

let carouselActiveIndex = 0;
let carouselTouchStartX = 0;
let carouselTouchEndX = 0;

async function renderPhotoWall() {
  const wall = document.getElementById('reservoirPhotoWall');
  if (!wall) return;
  
  // Render slides inside the track
  wall.innerHTML = RESERVOIRS.map((r, idx) => {
    return `
      <div class="carousel-slide" data-reservoir-id="${r.id}" onclick="openPhotoLightbox('${r.id}')">
        <div class="reservoir-photo-card">
          ${fallbackTile(r)}
          <div class="slide-info">
            <button class="download-photo-btn" onclick="downloadReservoirImage(event, '${r.id}')" aria-label="Download photo of ${sanitizeHTML(r.name)}">
              ↓ Download photo
            </button>
            <h3>${sanitizeHTML(r.name)}</h3>
            <p>📍 ${sanitizeHTML(r.state)} · ${sanitizeHTML(r.river)} River</p>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Render indicators
  const dotsContainer = document.getElementById('carouselDots');
  if (dotsContainer) {
    dotsContainer.innerHTML = RESERVOIRS.map((_, idx) => `
      <button class="carousel-dot ${idx === 0 ? 'active' : ''}" onclick="jumpToCarouselSlide(${idx})" aria-label="Go to slide ${idx + 1}"></button>
    `).join('');
  }

  // Load actual reservoir images dynamically
  RESERVOIRS.forEach(async r => {
    const slideCard = wall.querySelector(`[data-reservoir-id="${r.id}"] .reservoir-photo-card`);
    if (!slideCard) return;
    const urls = await fetchReservoirImages(r, 1);
    if (urls && urls.length) {
      const fb = slideCard.querySelector('.fallback');
      if (fb) fb.style.display = 'none';
      slideCard.insertAdjacentHTML('afterbegin', imageTag(urls[0], r.name));
    }
  });

  // Swipe gestures setup
  const wrapper = document.getElementById('carouselTrackWrapper');
  if (wrapper) {
    wrapper.addEventListener('touchstart', e => {
      carouselTouchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    wrapper.addEventListener('touchend', e => {
      carouselTouchEndX = e.changedTouches[0].screenX;
      handleCarouselSwipe();
    }, { passive: true });
  }

  carouselActiveIndex = 0;
  updateCarouselPosition();
}

function handleCarouselSwipe() {
  const threshold = 50;
  if (carouselTouchStartX - carouselTouchEndX > threshold) {
    shiftCarousel(1); // Swipe left -> next
  } else if (carouselTouchEndX - carouselTouchStartX > threshold) {
    shiftCarousel(-1); // Swipe right -> prev
  }
}

function shiftCarousel(dir) {
  carouselActiveIndex += dir;
  if (carouselActiveIndex < 0) {
    carouselActiveIndex = RESERVOIRS.length - 1;
  } else if (carouselActiveIndex >= RESERVOIRS.length) {
    carouselActiveIndex = 0;
  }
  updateCarouselPosition();
}

function jumpToCarouselSlide(idx) {
  carouselActiveIndex = idx;
  updateCarouselPosition();
}

function updateCarouselPosition() {
  const wall = document.getElementById('reservoirPhotoWall');
  if (!wall) return;
  
  const percent = -carouselActiveIndex * 100;
  wall.style.transform = `translateX(${percent}%)`;

  const dots = document.querySelectorAll('.carousel-dot');
  dots.forEach((dot, idx) => {
    dot.classList.toggle('active', idx === carouselActiveIndex);
  });
}

async function downloadReservoirImage(event, id) {
  if (event) event.stopPropagation();

  const reservoir = RESERVOIRS.find(r => r.id === id);
  if (!reservoir) return;

  const button = event ? event.currentTarget : null;
  const originalLabel = button ? button.textContent : '';
  if (button) {
    button.disabled = true;
    button.textContent = 'Preparing download…';
  }

  try {
    const urls = await fetchReservoirImages(reservoir, 1);
    const imageUrl = urls && urls[0];
    if (!imageUrl) throw new Error('No image is available.');

    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error('Image download failed.');

    const blob = await response.blob();
    const extension = blob.type === 'image/png' ? 'png' : 'jpg';
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = reservoir.id + '-reservoir.' + extension;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(downloadUrl);
    toast('Downloaded ' + reservoir.name + ' photo.');
  } catch (error) {
    console.warn('Reservoir photo download failed:', error);
    toast('Could not download this photo. Please try again.');
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = originalLabel;
    }
  }
}

// Lightbox Modal functions
async function openPhotoLightbox(id) {
  const r = RESERVOIRS.find(x => x.id === id);
  if (!r) return;

  const lightbox = document.getElementById('photoLightbox');
  if (!lightbox) return;

  document.getElementById('lightboxTitle').textContent = r.name;
  document.getElementById('lightboxDam').textContent = r.dam;
  document.getElementById('lightboxRiver').textContent = r.river;
  document.getElementById('lightboxState').textContent = r.state;
  document.getElementById('lightboxFact').textContent = r.description || r.fact;

  const imgBox = document.getElementById('lightboxImgBox');
  if (imgBox) {
    imgBox.innerHTML = `<div class="skel" style="width:100%; height:100%;"></div>`;
    const urls = await fetchReservoirImages(r, 1);
    if (urls && urls.length) {
      imgBox.innerHTML = `<img src="${urls[0]}" alt="${r.name}" style="width:100%; height:100%; object-fit:cover;">`;
    } else {
      imgBox.innerHTML = fallbackTile(r);
    }
  }

  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden'; // lock background scroll
}

function closePhotoLightbox(e) {
  const lightbox = document.getElementById('photoLightbox');
  if (lightbox) {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; // unlock scroll
  }
}

// Leaderboard best scores rendering
function renderLeaderboard() {
  const el = document.getElementById('leaderboardList');
  if (!el) return;
  
  const rows = [
    ['🧠', 'Reservoir Quiz', 'quiz'],
    ['🔍', 'Guess the Reservoir', 'guess'],
    ['🎴', 'Memory Match', 'memory'],
    ['🧩', 'Jigsaw Puzzle', 'jigsaw'],
    ['🎡', 'Spin the Wheel', 'wheel'],
    ['⚡', '30 Second Challenge', 'challenge30'],
    ['🐍', 'Reservoir Snake', 'snake'],
    ['⌨️', 'Reservoir Typist', 'typing']
  ];

  const bestScores = stateManager.state.bestScores || {};
  const validScores = rows.map(r => bestScores[r[2]]).filter(v => v !== undefined);
  const maxScore = validScores.length > 0 ? Math.max(...validScores) : -1;
  
  const hasAny = rows.some(r => bestScores[r[2]] !== undefined);
  if (!hasAny) {
    el.innerHTML = `<div class="empty-state"><div class="e">📊</div>Play a game to see your best scores here.</div>`;
    return;
  }

  el.innerHTML = rows.map(([icon, label, key]) => {
    const score = bestScores[key];
    const isBest = score === maxScore && score !== undefined;
    return `
      <div class="leaderboard-row">
        <span style="font-size:1.2rem;">${icon}</span>
        <span>${label}</span>
        <strong style="${isBest ? 'color:var(--cyan); text-shadow:0 0 12px rgba(34,211,238,0.3);' : ''}">
          ${score !== undefined ? score : '—'}
          ${isBest ? ' 👑' : ''}
        </strong>
      </div>
    `;
  }).join('') + `
    <div style="margin-top:16px; padding-top:16px; border-top:1px solid var(--line); display:flex; justify-content:space-between; color:var(--muted); font-size:.85rem;">
      <span>Total XP</span>
      <strong style="color:var(--cyan);">${stateManager.state.xp}</strong>
    </div>
    <div style="display:flex; justify-content:space-between; color:var(--muted); font-size:.85rem; margin-top:6px;">
      <span>Games played</span>
      <strong>${stateManager.state.gamesPlayed}</strong>
    </div>
    <div style="display:flex; justify-content:space-between; color:var(--muted); font-size:.85rem; margin-top:6px;">
      <span>Achievements</span>
      <strong>${(stateManager.state.unlocked || []).length}/${ACHIEVEMENTS.length}</strong>
    </div>
  `;
}

// Refresh pills & profile indicators
function refreshPills() {
  const pXP = document.getElementById('pillXP');
  const pCoins = document.getElementById('pillCoins');
  const gPlayed = document.getElementById('statGamesPlayed');
  
  if (pXP) pXP.textContent = stateManager.state.xp;
  if (pCoins) pCoins.textContent = stateManager.state.coins;
  if (gPlayed) gPlayed.textContent = stateManager.state.gamesPlayed;

  const pPill = document.getElementById('profilePill');
  if (pPill) {
    pPill.className = 'pill';
    if (stateManager.state.equippedFrame) {
      pPill.classList.add('profile-frame-' + stateManager.state.equippedFrame.replace('frame_', ''));
    }
  }
}
