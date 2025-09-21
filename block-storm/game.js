class TetrisGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('next-canvas');
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        this.BOARD_WIDTH = 10;
        this.BOARD_HEIGHT = 20;
        this.CELL_SIZE = 40;
        
        this.board = Array(this.BOARD_HEIGHT).fill().map(() => Array(this.BOARD_WIDTH).fill(0));
        this.currentPiece = null;
        this.nextPiece = null;
        this.currentX = 0;
        this.currentY = 0;
        
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.dropTime = 0;
        this.dropCounter = 0;
        this.fallSpeed = 1000;
        
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameOver = false;
        
        this.lastTime = 0;
        
        this.colors = {
            I: '#00f5ff',
            O: '#ffff00', 
            T: '#800080',
            S: '#00ff00',
            Z: '#ff0000',
            J: '#0000ff',
            L: '#ffa500',
            ghost: 'rgba(255, 255, 255, 0.3)',
            grid: 'rgba(255, 255, 255, 0.1)'
        };
        
        this.pieceShapes = {
            I: [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ],
            O: [
                [1, 1],
                [1, 1]
            ],
            T: [
                [0, 1, 0],
                [1, 1, 1],
                [0, 0, 0]
            ],
            S: [
                [0, 1, 1],
                [1, 1, 0],
                [0, 0, 0]
            ],
            Z: [
                [1, 1, 0],
                [0, 1, 1],
                [0, 0, 0]
            ],
            J: [
                [1, 0, 0],
                [1, 1, 1],
                [0, 0, 0]
            ],
            L: [
                [0, 0, 1],
                [1, 1, 1],
                [0, 0, 0]
            ]
        };
        
        this.pieceTypes = Object.keys(this.pieceShapes);
        
        this.initializeGame();
        this.setupEventListeners();
        this.loadHighScore();
        this.createBackgroundParticles();
    }
    
    initializeGame() {
        this.drawGrid();
        this.updateDisplay();
        this.showGameOverlay('Block Storm', '按空格键开始游戏');
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('pause-btn').addEventListener('click', () => this.togglePause());
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
        
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.gameRunning && !this.gamePaused) {
                this.togglePause();
            }
        });
    }
    
    handleKeyPress(e) {
        if (!this.gameRunning || this.gamePaused) {
            if (e.code === 'Space') {
                e.preventDefault();
                if (!this.gameRunning) {
                    this.startGame();
                } else {
                    this.togglePause();
                }
            }
            return;
        }
        
        switch (e.code) {
            case 'ArrowLeft':
                e.preventDefault();
                this.movePiece(-1, 0);
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.movePiece(1, 0);
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.movePiece(0, 1);
                break;
            case 'ArrowUp':
            case 'Space':
                e.preventDefault();
                if (e.code === 'Space') {
                    this.togglePause();
                } else {
                    this.rotatePiece();
                }
                break;
        }
    }
    
    startGame() {
        this.gameRunning = true;
        this.gamePaused = false;
        this.gameOver = false;
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.fallSpeed = 1000;
        this.board = Array(this.BOARD_HEIGHT).fill().map(() => Array(this.BOARD_WIDTH).fill(0));
        
        this.currentPiece = this.createRandomPiece();
        this.nextPiece = this.createRandomPiece();
        this.resetPiecePosition();
        
        this.hideGameOverlay();
        this.updateDisplay();
        this.gameLoop();
    }
    
    restartGame() {
        this.gameRunning = false;
        this.gamePaused = false;
        this.startGame();
    }
    
    togglePause() {
        if (!this.gameRunning || this.gameOver) return;
        
        this.gamePaused = !this.gamePaused;
        
        if (this.gamePaused) {
            this.showGameOverlay('游戏暂停', '按空格键继续游戏');
        } else {
            this.hideGameOverlay();
            this.lastTime = performance.now();
            this.gameLoop();
        }
    }
    
    createRandomPiece() {
        const type = this.pieceTypes[Math.floor(Math.random() * this.pieceTypes.length)];
        return {
            type: type,
            shape: this.pieceShapes[type],
            color: this.colors[type]
        };
    }
    
    resetPiecePosition() {
        this.currentX = Math.floor((this.BOARD_WIDTH - this.currentPiece.shape[0].length) / 2);
        this.currentY = 0;
    }
    
    movePiece(dx, dy) {
        if (this.isValidMove(this.currentX + dx, this.currentY + dy, this.currentPiece.shape)) {
            this.currentX += dx;
            this.currentY += dy;
            this.render();
            return true;
        }
        return false;
    }
    
    rotatePiece() {
        const rotated = this.rotateMatrix(this.currentPiece.shape);
        if (this.isValidMove(this.currentX, this.currentY, rotated)) {
            this.currentPiece.shape = rotated;
            this.render();
        }
    }
    
    rotateMatrix(matrix) {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const rotated = Array(cols).fill().map(() => Array(rows).fill(0));
        
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                rotated[j][rows - 1 - i] = matrix[i][j];
            }
        }
        return rotated;
    }
    
    isValidMove(x, y, shape) {
        for (let py = 0; py < shape.length; py++) {
            for (let px = 0; px < shape[py].length; px++) {
                if (shape[py][px]) {
                    const newX = x + px;
                    const newY = y + py;
                    
                    if (newX < 0 || newX >= this.BOARD_WIDTH || 
                        newY >= this.BOARD_HEIGHT || 
                        (newY >= 0 && this.board[newY][newX])) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    
    placePiece() {
        for (let py = 0; py < this.currentPiece.shape.length; py++) {
            for (let px = 0; px < this.currentPiece.shape[py].length; px++) {
                if (this.currentPiece.shape[py][px]) {
                    const boardY = this.currentY + py;
                    const boardX = this.currentX + px;
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = this.currentPiece.type;
                    }
                }
            }
        }
        
        this.clearLines();
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.createRandomPiece();
        this.resetPiecePosition();
        
        if (!this.isValidMove(this.currentX, this.currentY, this.currentPiece.shape)) {
            this.endGame();
        }
    }
    
    clearLines() {
        const linesToClear = [];
        
        // 找到所有需要消除的行
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            if (this.board[y].every(cell => cell !== 0)) {
                linesToClear.push(y);
            }
        }
        
        
        if (linesToClear.length > 0) {
            this.animateLineClear(linesToClear);
            
            // 创建新的游戏板，过滤掉需要消除的行
            const newBoard = [];
            
            // 添加空行到顶部
            for (let i = 0; i < linesToClear.length; i++) {
                newBoard.push(Array(this.BOARD_WIDTH).fill(0));
            }
            
            // 添加未被消除的行
            for (let y = 0; y < this.BOARD_HEIGHT; y++) {
                if (!linesToClear.includes(y)) {
                    newBoard.push([...this.board[y]]);
                }
            }
            
            this.board = newBoard;
            
            
            this.lines += linesToClear.length;
            this.updateScore(linesToClear.length);
            this.updateLevel();
            this.showScorePopup(linesToClear.length);
        }
    }
    
    
    animateLineClear(lines) {
        lines.forEach(line => {
            const effect = document.createElement('div');
            effect.className = 'line-clear-effect';
            effect.style.top = `${line * this.CELL_SIZE}px`;
            
            const gameBoard = document.querySelector('.game-board');
            gameBoard.appendChild(effect);
            
            setTimeout(() => {
                if (effect.parentNode) {
                    effect.parentNode.removeChild(effect);
                }
            }, 500);
        });
    }
    
    updateScore(linesCleared) {
        const baseScore = [0, 100, 300, 500, 800];
        const lineScore = baseScore[linesCleared] || 0;
        this.score += lineScore * this.level;
        
        if (this.score > this.getHighScore()) {
            this.saveHighScore(this.score);
        }
    }
    
    updateLevel() {
        const newLevel = Math.floor(this.lines / 10) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.fallSpeed = Math.max(50, 1000 - (this.level - 1) * 100);
        }
    }
    
    showScorePopup(linesCleared) {
        const messages = ['', 'Single!', 'Double!', 'Triple!', 'TETRIS!'];
        const message = messages[linesCleared] || 'Amazing!';
        
        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.textContent = message;
        popup.style.left = '50%';
        popup.style.top = '30%';
        popup.style.transform = 'translateX(-50%)';
        
        const gameBoard = document.querySelector('.game-board');
        gameBoard.appendChild(popup);
        
        setTimeout(() => {
            if (popup.parentNode) {
                popup.parentNode.removeChild(popup);
            }
        }, 1500);
    }
    
    endGame() {
        this.gameRunning = false;
        this.gameOver = true;
        this.showGameOverlay('游戏结束', `最终分数: ${this.score}\n按空格键重新开始`);
    }
    
    getGhostPosition() {
        let ghostY = this.currentY;
        while (this.isValidMove(this.currentX, ghostY + 1, this.currentPiece.shape)) {
            ghostY++;
        }
        return ghostY;
    }
    
    gameLoop(time = 0) {
        if (!this.gameRunning || this.gamePaused) return;
        
        const deltaTime = time - this.lastTime;
        this.lastTime = time;
        
        this.dropCounter += deltaTime;
        if (this.dropCounter > this.fallSpeed) {
            if (!this.movePiece(0, 1)) {
                this.placePiece();
            }
            this.dropCounter = 0;
        }
        
        this.render();
        this.updateDisplay();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawGrid();
        this.drawBoard();
        this.drawGhostPiece();
        this.drawCurrentPiece();
        this.drawNextPiece();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = this.colors.grid;
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x <= this.BOARD_WIDTH; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.CELL_SIZE, 0);
            this.ctx.lineTo(x * this.CELL_SIZE, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= this.BOARD_HEIGHT; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.CELL_SIZE);
            this.ctx.lineTo(this.canvas.width, y * this.CELL_SIZE);
            this.ctx.stroke();
        }
    }
    
    drawBoard() {
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                if (this.board[y][x]) {
                    this.drawCell(x, y, this.colors[this.board[y][x]]);
                }
            }
        }
    }
    
    drawGhostPiece() {
        if (!this.currentPiece) return;
        
        const ghostY = this.getGhostPosition();
        for (let py = 0; py < this.currentPiece.shape.length; py++) {
            for (let px = 0; px < this.currentPiece.shape[py].length; px++) {
                if (this.currentPiece.shape[py][px]) {
                    this.drawCell(
                        this.currentX + px, 
                        ghostY + py, 
                        this.colors.ghost
                    );
                }
            }
        }
    }
    
    drawCurrentPiece() {
        if (!this.currentPiece) return;
        
        for (let py = 0; py < this.currentPiece.shape.length; py++) {
            for (let px = 0; px < this.currentPiece.shape[py].length; px++) {
                if (this.currentPiece.shape[py][px]) {
                    this.drawCell(
                        this.currentX + px, 
                        this.currentY + py, 
                        this.currentPiece.color
                    );
                }
            }
        }
    }
    
    drawCell(x, y, color) {
        const cellX = x * this.CELL_SIZE;
        const cellY = y * this.CELL_SIZE;
        
        this.ctx.fillStyle = color;
        this.ctx.fillRect(cellX + 1, cellY + 1, this.CELL_SIZE - 2, this.CELL_SIZE - 2);
        
        const gradient = this.ctx.createLinearGradient(cellX, cellY, cellX + this.CELL_SIZE, cellY + this.CELL_SIZE);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(cellX + 1, cellY + 1, this.CELL_SIZE - 2, this.CELL_SIZE - 2);
    }
    
    drawNextPiece() {
        this.nextCtx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        if (!this.nextPiece) return;
        
        const shape = this.nextPiece.shape;
        const cellSize = 25;
        const offsetX = (this.nextCanvas.width - shape[0].length * cellSize) / 2;
        const offsetY = (this.nextCanvas.height - shape.length * cellSize) / 2;
        
        for (let py = 0; py < shape.length; py++) {
            for (let px = 0; px < shape[py].length; px++) {
                if (shape[py][px]) {
                    const x = offsetX + px * cellSize;
                    const y = offsetY + py * cellSize;
                    
                    this.nextCtx.fillStyle = this.nextPiece.color;
                    this.nextCtx.fillRect(x, y, cellSize - 1, cellSize - 1);
                    
                    const gradient = this.nextCtx.createLinearGradient(x, y, x + cellSize, y + cellSize);
                    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
                    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
                    
                    this.nextCtx.fillStyle = gradient;
                    this.nextCtx.fillRect(x, y, cellSize - 1, cellSize - 1);
                }
            }
        }
    }
    
    updateDisplay() {
        document.getElementById('current-score').textContent = this.score.toLocaleString();
        document.getElementById('high-score').textContent = this.getHighScore().toLocaleString();
        document.getElementById('level').textContent = this.level;
        document.getElementById('lines').textContent = this.lines;
        document.getElementById('speed').textContent = this.level;
    }
    
    showGameOverlay(title, message) {
        const overlay = document.getElementById('game-overlay');
        const titleEl = document.getElementById('overlay-title');
        const messageEl = document.getElementById('overlay-message');
        
        titleEl.textContent = title;
        messageEl.textContent = message;
        overlay.classList.remove('hidden');
    }
    
    hideGameOverlay() {
        const overlay = document.getElementById('game-overlay');
        overlay.classList.add('hidden');
    }
    
    getHighScore() {
        return parseInt(localStorage.getItem('tetris-high-score') || '0');
    }
    
    saveHighScore(score) {
        localStorage.setItem('tetris-high-score', score.toString());
        this.updateDisplay();
    }
    
    loadHighScore() {
        this.updateDisplay();
    }
    
    createBackgroundParticles() {
        const container = document.getElementById('particles-container');
        
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 6 + 's';
            particle.style.animationDuration = (6 + Math.random() * 4) + 's';
            container.appendChild(particle);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const game = new TetrisGame();
});