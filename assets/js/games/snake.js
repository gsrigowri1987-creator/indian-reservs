class SnakeGame extends GameEngine {
  constructor() {
    super({
      id: 'snake',
      name: 'Reservoir Snake',
      icon: '🐍',
      gridSize: 20,
      speed: 130 // ms per tick
    });
    this.snake = [];
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
    this.food = null;
    this.score = 0;
    this.lastFact = '';
    this.loopInterval = null;
    this.boundKeyDown = this.handleKeyDown.bind(this);
  }

  init() {
    super.init();
    this.inProgress = true;
    const mid = Math.floor(this.config.gridSize / 2);
    this.snake = [
      { x: mid, y: mid },
      { x: mid - 1, y: mid },
      { x: mid - 2, y: mid }
    ];
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
    this.score = 0;
    this.lastFact = 'Eat water drops to reveal facts about South India\'s reservoirs!';
    
    this.spawnFood();
    this.render();
    
    // Bind keyboard inputs
    this.addEventListener(window, 'keydown', this.boundKeyDown);

    // Start game loop
    if (this.loopInterval) {
      clearInterval(this.loopInterval);
    }
    this.loopInterval = this.setInterval(() => this.gameStep(), this.config.speed);
  }

  spawnFood() {
    const size = this.config.gridSize;
    const available = [];
    
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        const occupies = this.snake.some(segment => segment.x === x && segment.y === y);
        if (!occupies) {
          available.push({ x, y });
        }
      }
    }
    
    if (available.length === 0) {
      this.endGame(true);
      return;
    }
    
    const pos = available[Math.floor(Math.random() * available.length)];
    const randomReservoir = RESERVOIRS[Math.floor(Math.random() * RESERVOIRS.length)];
    
    this.food = {
      x: pos.x,
      y: pos.y,
      fact: `💧 <strong>${randomReservoir.name}:</strong> ${randomReservoir.fact}`
    };
  }

  render() {
    const body = document.getElementById('snakeBody');
    if (!body) return;

    body.innerHTML = `
      <p style="color:var(--muted); font-size:.85rem; margin-bottom:12px;">Guide the snake to collect water drops. Each drop reveals an educational fact!</p>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; flex-wrap:wrap; gap:8px;">
        <div class="pill">⭐ Score: <span id="snakeScoreVal">0</span></div>
        <div class="pill">💧 Facts: <span id="snakeFactsCount">0</span></div>
      </div>
      <div class="snake-canvas-container">
        <canvas id="snakeCanvas" width="400" height="400" class="snake-canvas"></canvas>
      </div>
      <div class="snake-fact-display" id="snakeFactBox">${this.lastFact}</div>
      <div class="snake-controls">
        <div></div>
        <button class="snake-btn" onclick="changeSnakeDirection('up')">▲</button>
        <div></div>
        <button class="snake-btn" onclick="changeSnakeDirection('left')">◀</button>
        <button class="snake-btn" onclick="changeSnakeDirection('down')">▼</button>
        <button class="snake-btn" onclick="changeSnakeDirection('right')">▶</button>
      </div>
    `;

    this.draw();
  }

  draw() {
    const canvas = document.getElementById('snakeCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const scale = canvas.width / this.config.gridSize; // 400 / 20 = 20px

    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.02)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= this.config.gridSize; i++) {
      ctx.beginPath();
      ctx.moveTo(i * scale, 0);
      ctx.lineTo(i * scale, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * scale);
      ctx.lineTo(canvas.width, i * scale);
      ctx.stroke();
    }

    // Draw food (water drop)
    if (this.food) {
      ctx.beginPath();
      ctx.arc(this.food.x * scale + scale / 2, this.food.y * scale + scale / 2, scale / 2 - 2, 0, Math.PI * 2);
      ctx.fillStyle = '#22D3EE';
      ctx.shadowColor = '#22D3EE';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0; // reset
    }

    // Draw snake
    this.snake.forEach((segment, idx) => {
      const isHead = idx === 0;
      ctx.fillStyle = isHead ? '#34D399' : '#10B981'; // Green head, darker green body
      
      // Rounded rectangles for smooth look
      ctx.beginPath();
      const r = scale - 2;
      const x = segment.x * scale + 1;
      const y = segment.y * scale + 1;
      
      ctx.roundRect ? ctx.roundRect(x, y, r, r, 5) : ctx.rect(x, y, r, r);
      ctx.fill();
    });
  }

  handleKeyDown(e) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }
    switch (e.key) {
      case 'ArrowUp':
        this.changeDirection('up');
        break;
      case 'ArrowDown':
        this.changeDirection('down');
        break;
      case 'ArrowLeft':
        this.changeDirection('left');
        break;
      case 'ArrowRight':
        this.changeDirection('right');
        break;
      default:
        break;
    }
  }

  changeDirection(dirStr) {
    const curX = this.direction.x;
    const curY = this.direction.y;

    if (dirStr === 'up' && curY === 0) {
      this.nextDirection = { x: 0, y: -1 };
    } else if (dirStr === 'down' && curY === 0) {
      this.nextDirection = { x: 0, y: 1 };
    } else if (dirStr === 'left' && curX === 0) {
      this.nextDirection = { x: -1, y: 0 };
    } else if (dirStr === 'right' && curX === 0) {
      this.nextDirection = { x: 1, y: 0 };
    }
  }

  gameStep() {
    if (!this.isActive) return;

    this.direction = this.nextDirection;
    const head = this.snake[0];
    const size = this.config.gridSize;

    // Wrap around coordinates
    const newHead = {
      x: (head.x + this.direction.x + size) % size,
      y: (head.y + this.direction.y + size) % size
    };

    // Check collision with self
    const collided = this.snake.slice(1).some(seg => seg.x === newHead.x && seg.y === newHead.y);
    if (collided) {
      this.endGame(false);
      return;
    }

    // Add new head
    this.snake.unshift(newHead);

    // Check if eating food
    if (this.food && newHead.x === this.food.x && newHead.y === this.food.y) {
      this.score++;
      
      const scoreVal = document.getElementById('snakeScoreVal');
      if (scoreVal) scoreVal.textContent = this.score;

      const factsCount = document.getElementById('snakeFactsCount');
      if (factsCount) factsCount.textContent = this.score;

      this.lastFact = this.food.fact;
      const factBox = document.getElementById('snakeFactBox');
      if (factBox) {
        factBox.innerHTML = this.lastFact;
        factBox.style.animation = 'none';
        void factBox.offsetWidth;
        factBox.style.animation = 'microPop 0.2s ease';
      }

      // Trigger floating toast notification of the fact
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = this.food.fact;
      toast(tempDiv.textContent || tempDiv.innerText);
      
      addXP(5);
      addCoins(2);
      playSound('correct');
      if (navigator.vibrate) navigator.vibrate(10);
      
      this.spawnFood();
    } else {
      // Remove tail segment if not eating
      this.snake.pop();
    }

    this.draw();
  }

  endGame(victory) {
    this.inProgress = false;
    if (this.loopInterval) {
      clearInterval(this.loopInterval);
    }
    
    this.recordScore(this.score);
    playSound('victory');

    const body = document.getElementById('snakeBody');
    if (body) {
      body.innerHTML = `
        <div class="results-hero">
          <div class="big">${victory ? 'Winner!' : 'Game Over'}</div>
          <p style="color:var(--muted); margin-top:8px;">You collected ${this.score} water drops and facts!</p>
          <div class="hero-ctas" style="margin-top:24px;">
            <button class="btn btn-primary" onclick="startSnake()">Play again</button>
            <button class="btn btn-ghost" onclick="navigate('games')">More games</button>
          </div>
        </div>
      `;
    }
  }

  cleanup() {
    this.inProgress = false;
    if (this.loopInterval) {
      clearInterval(this.loopInterval);
    }
    this.snake = [];
  }
}

// Global wrappers
function startSnake() {
  if (window.activeGameInstance) {
    window.activeGameInstance.destroy();
  }
  window.activeGameInstance = new SnakeGame();
  window.activeGameInstance.init();
}

function changeSnakeDirection(dir) {
  if (window.activeGameInstance && window.activeGameInstance.id === 'snake') {
    window.activeGameInstance.changeDirection(dir);
  }
}
