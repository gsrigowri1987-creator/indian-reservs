class WordSearchGame extends GameEngine {
  constructor() {
    super({
      id: 'wordsearch',
      name: 'Word Search',
      icon: '🔤',
      gridSize: 12,
      wordsCount: 8
    });
    this.grid = [];
    this.wordList = [];
    this.foundWords = [];
    this.isSelecting = false;
    this.startCell = null;
    this.currentCell = null;
    this.score = 0;
    this.inProgress = false;
    
    // Binding handlers for global cleanup
    this.boundMouseUp = this.onGlobalMouseUp.bind(this);
    this.boundTouchEnd = this.onGlobalTouchEnd.bind(this);
  }

  init() {
    super.init();
    this.inProgress = true;
    this.foundWords = [];
    this.score = 0;
    this.isSelecting = false;
    this.startCell = null;
    this.currentCell = null;

    // Pick 8 random reservoirs of reasonable length
    const wordsPool = RESERVOIRS.map(r => r.id.toUpperCase().replace(/\s/g, ''))
      .filter(w => w.length >= 3 && w.length <= 10);
    this.wordList = shuffle(wordsPool).slice(0, this.config.wordsCount);
    
    this.generateGrid();
    this.render();

    // Add global mouseup / touchend listeners for drag release cleanup
    window.addEventListener('mouseup', this.boundMouseUp);
    window.addEventListener('touchend', this.boundTouchEnd);
  }

  generateGrid() {
    const size = this.config.gridSize;
    // Initialize empty grid
    this.grid = Array(size).fill(null).map(() => Array(size).fill(''));

    // Try placing each word
    const directions = [
      { r: 0, c: 1 },   // horizontal right
      { r: 1, c: 0 },   // vertical down
      { r: 1, c: 1 },   // diagonal down-right
      { r: -1, c: 1 }   // diagonal up-right
    ];

    this.wordList.forEach(word => {
      let placed = false;
      let attempts = 0;

      while (!placed && attempts < 100) {
        attempts++;
        const dir = directions[Math.floor(Math.random() * directions.length)];
        const isReverse = Math.random() > 0.5;
        const processedWord = isReverse ? word.split('').reverse().join('') : word;

        const startR = Math.floor(Math.random() * size);
        const startC = Math.floor(Math.random() * size);

        // Check boundary
        const endR = startR + dir.r * (processedWord.length - 1);
        const endC = startC + dir.c * (processedWord.length - 1);

        if (endR >= 0 && endR < size && endC >= 0 && endC < size) {
          // Check overlap
          let fits = true;
          for (let i = 0; i < processedWord.length; i++) {
            const currentCellChar = this.grid[startR + dir.r * i][startC + dir.c * i];
            if (currentCellChar !== '' && currentCellChar !== processedWord[i]) {
              fits = false;
              break;
            }
          }

          if (fits) {
            for (let i = 0; i < processedWord.length; i++) {
              this.grid[startR + dir.r * i][startC + dir.c * i] = processedWord[i];
            }
            placed = true;
          }
        }
      }
    });

    // Fill empty cells with random letters
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (this.grid[r][c] === '') {
          this.grid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
        }
      }
    }
  }

  render() {
    const body = document.getElementById('wordsearchBody');
    if (!body) return;

    body.innerHTML = `
      <p style="color:var(--muted); font-size:.85rem; margin-bottom:14px;">Find the names of South Indian reservoirs in the grid. Click and drag or swipe to select.</p>
      <div class="ws-grid-container" id="wsGrid" style="grid-template-columns: repeat(${this.config.gridSize}, 1fr);"></div>
      <div class="ws-word-list" id="wsWords"></div>
    `;

    // Render cells
    const gridEl = document.getElementById('wsGrid');
    if (!gridEl) return;

    for (let r = 0; r < this.config.gridSize; r++) {
      for (let c = 0; c < this.config.gridSize; c++) {
        const cell = document.createElement('div');
        cell.className = 'ws-cell';
        cell.dataset.r = r;
        cell.dataset.c = c;
        cell.textContent = this.grid[r][c];
        
        // Listeners for drawing selection
        cell.addEventListener('mousedown', (e) => this.onCellStart(r, c, e));
        cell.addEventListener('mouseover', () => this.onCellEnter(r, c));
        
        cell.addEventListener('touchstart', (e) => {
          e.preventDefault();
          this.onCellStart(r, c, e);
        });
        
        gridEl.appendChild(cell);
      }
    }

    // Touch support for dragging across cells
    gridEl.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      if (element && element.classList.contains('ws-cell')) {
        const r = parseInt(element.dataset.r);
        const c = parseInt(element.dataset.c);
        this.onCellEnter(r, c);
      }
    });

    this.renderWordList();
  }

  renderWordList() {
    const listEl = document.getElementById('wsWords');
    if (!listEl) return;

    listEl.innerHTML = this.wordList.map(word => {
      const isFound = this.foundWords.includes(word);
      return `<span class="ws-word-item ${isFound ? 'found' : ''}">${word}</span>`;
    }).join('');
  }

  onCellStart(r, c, e) {
    this.isSelecting = true;
    this.startCell = { r, c };
    this.currentCell = { r, c };
    this.highlightSelection();
  }

  onCellEnter(r, c) {
    if (!this.isSelecting) return;
    this.currentCell = { r, c };
    this.highlightSelection();
  }

  onGlobalMouseUp() {
    if (this.isSelecting) {
      this.checkSelection();
    }
  }

  onGlobalTouchEnd() {
    if (this.isSelecting) {
      this.checkSelection();
    }
  }

  highlightSelection() {
    const cells = document.querySelectorAll('.ws-cell');
    cells.forEach(cell => cell.classList.remove('selected'));

    const path = this.getSelectionPath();
    path.forEach(pos => {
      const cell = document.querySelector(`.ws-cell[data-r="${pos.r}"][data-c="${pos.c}"]`);
      if (cell) cell.classList.add('selected');
    });
  }

  getSelectionPath() {
    if (!this.startCell || !this.currentCell) return [];

    const start = this.startCell;
    const end = this.currentCell;

    let diffR = end.r - start.r;
    let diffC = end.c - start.c;

    // Standardize drag to straight line directions
    const dist = Math.max(Math.abs(diffR), Math.abs(diffC));
    if (dist === 0) return [start];

    let stepR = 0;
    let stepC = 0;

    if (diffR === 0) {
      stepC = diffC > 0 ? 1 : -1;
    } else if (diffC === 0) {
      stepR = diffR > 0 ? 1 : -1;
    } else if (Math.abs(diffR) === Math.abs(diffC)) {
      stepR = diffR > 0 ? 1 : -1;
      stepC = diffC > 0 ? 1 : -1;
    } else {
      // Not a valid line, drag straight from start to start coordinate
      return [start];
    }

    const path = [];
    for (let i = 0; i <= dist; i++) {
      path.push({
        r: start.r + stepR * i,
        c: start.c + stepC * i
      });
    }
    return path;
  }

  checkSelection() {
    this.isSelecting = false;
    const path = this.getSelectionPath();
    
    // Clear selections
    const cells = document.querySelectorAll('.ws-cell');
    cells.forEach(cell => cell.classList.remove('selected'));

    if (path.length < 2) return;

    // Get selected word string
    const wordStr = path.map(pos => this.grid[pos.r][pos.c]).join('');
    const revWordStr = wordStr.split('').reverse().join('');

    let matchWord = null;
    if (this.wordList.includes(wordStr) && !this.foundWords.includes(wordStr)) {
      matchWord = wordStr;
    } else if (this.wordList.includes(revWordStr) && !this.foundWords.includes(revWordStr)) {
      matchWord = revWordStr;
    }

    if (matchWord) {
      this.foundWords.push(matchWord);
      this.score++;
      
      // Mark found cells permanently
      path.forEach(pos => {
        const cell = document.querySelector(`.ws-cell[data-r="${pos.r}"][data-c="${pos.c}"]`);
        if (cell) cell.classList.add('found');
      });

      addXP(10);
      addCoins(5);
      playSound('correct');
      toast(`🎯 Found: ${matchWord}!`);
      this.renderWordList();

      if (this.foundWords.length === this.wordList.length) {
        this.endGame();
      }
    } else {
      playSound('wrong');
    }
  }

  endGame() {
    this.inProgress = false;
    this.recordScore(this.score);
    playSound('victory');
    const body = document.getElementById('wordsearchBody');
    if (body) {
      body.innerHTML = `
        <div class="results-hero">
          <div class="big">All Found! 🎉</div>
          <p style="color:var(--muted); margin-top:8px;">You found all ${this.config.wordsCount} reservoirs in the grid!</p>
          <div class="hero-ctas" style="margin-top:24px;">
            <button class="btn btn-primary" onclick="startWordSearch()">Play again</button>
            <button class="btn btn-ghost" onclick="navigate('games')">More games</button>
          </div>
        </div>
      `;
    }
  }

  cleanup() {
    this.inProgress = false;
    // Systematic removal of global window listeners to clear memory leaks
    window.removeEventListener('mouseup', this.boundMouseUp);
    window.removeEventListener('touchend', this.boundTouchEnd);
  }
}

// Global wrappers
function startWordSearch() {
  if (window.activeGameInstance) {
    window.activeGameInstance.destroy();
  }
  window.activeGameInstance = new WordSearchGame();
  window.activeGameInstance.init();
}
