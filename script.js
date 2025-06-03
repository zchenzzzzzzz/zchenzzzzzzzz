class PuzzleGame {
    constructor() {
        this.puzzleSize = 3;
        this.pieces = [];
        this.correctOrder = [];
        this.currentOrder = [];
        this.emptyIndex = 8; // 空格位置
        this.moveCount = 0;
        this.startTime = null;
        this.timer = null;
        this.isGameActive = false;
        this.currentImage = 'Snipaste_2025-05-28_19-20-16.png';
        this.shuffleTimes = 50; // 默认简单难度
        this.hintAvailable = true; // 默认允许提示
        
        this.initializeGame();
        this.bindEvents();
    }

    initializeGame() {
        this.createPuzzlePieces();
        this.shufflePuzzle();
        this.renderPuzzle();
        this.startTimer();
    }

    createPuzzlePieces() {
        this.pieces = [];
        this.correctOrder = [];
        
        for (let i = 0; i < 9; i++) {
            this.correctOrder.push(i);
            
            if (i === 8) {
                // 空格
                this.pieces.push({
                    id: i,
                    isEmpty: true,
                    backgroundPosition: ''
                });
            } else {
                const row = Math.floor(i / 3);
                const col = i % 3;
                const bgPosX = -col * 150; // 每块150px宽
                const bgPosY = -row * 150; // 每块150px高
                
                this.pieces.push({
                    id: i,
                    isEmpty: false,
                    backgroundPosition: `${bgPosX}px ${bgPosY}px`
                });
            }
        }
    }

    shufflePuzzle() {
        // 使用更智能的洗牌方法，基于真实的移动来打乱拼图
        this.currentOrder = [...this.correctOrder];
        this.emptyIndex = 8;
        
        // 根据难度进行不同次数的随机移动
        for (let i = 0; i < this.shuffleTimes; i++) {
            const possibleMoves = this.getPossibleMoves();
            if (possibleMoves.length > 0) {
                const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                this.swapPieces(randomMove, this.emptyIndex);
                this.emptyIndex = randomMove;
            }
        }
        
        this.isGameActive = true;
    }

    getPossibleMoves() {
        const moves = [];
        const emptyRow = Math.floor(this.emptyIndex / 3);
        const emptyCol = this.emptyIndex % 3;
        
        // 上
        if (emptyRow > 0) moves.push(this.emptyIndex - 3);
        // 下
        if (emptyRow < 2) moves.push(this.emptyIndex + 3);
        // 左
        if (emptyCol > 0) moves.push(this.emptyIndex - 1);
        // 右
        if (emptyCol < 2) moves.push(this.emptyIndex + 1);
        
        return moves;
    }

    swapPieces(pos1, pos2) {
        [this.currentOrder[pos1], this.currentOrder[pos2]] = 
        [this.currentOrder[pos2], this.currentOrder[pos1]];
    }

    renderPuzzle() {
        const container = document.getElementById('puzzleContainer');
        container.innerHTML = '';
        
        for (let i = 0; i < 9; i++) {
            const pieceDiv = document.createElement('div');
            pieceDiv.className = 'puzzle-piece';
            pieceDiv.dataset.position = i;
            
            const pieceId = this.currentOrder[i];
            const piece = this.pieces[pieceId];
            
            if (piece.isEmpty) {
                pieceDiv.classList.add('empty');
                pieceDiv.innerHTML = '';
            } else {
                pieceDiv.style.backgroundImage = `url(${this.currentImage})`;
                pieceDiv.style.backgroundPosition = piece.backgroundPosition;
                pieceDiv.draggable = true;
                pieceDiv.dataset.pieceId = pieceId;
                
                // 添加拖拽事件
                this.addDragEvents(pieceDiv, i);
            }
            
            container.appendChild(pieceDiv);
        }
    }

    addDragEvents(element, position) {
        element.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', position.toString());
            element.classList.add('dragging');
        });

        element.addEventListener('dragend', () => {
            element.classList.remove('dragging');
        });

        element.addEventListener('click', () => {
            this.handlePieceClick(position);
        });

        // 为所有位置添加drop事件
        document.querySelectorAll('.puzzle-piece').forEach((piece, index) => {
            piece.addEventListener('dragover', (e) => {
                e.preventDefault();
                if (this.currentOrder[index] === 8) {
                    piece.classList.add('drag-over');
                }
            });

            piece.addEventListener('dragleave', () => {
                piece.classList.remove('drag-over');
            });

            piece.addEventListener('drop', (e) => {
                e.preventDefault();
                piece.classList.remove('drag-over');
                
                const draggedPosition = parseInt(e.dataTransfer.getData('text/plain'));
                if (this.canMovePiece(draggedPosition, index)) {
                    this.movePiece(draggedPosition, index);
                }
            });
        });
    }

    handlePieceClick(position) {
        if (!this.isGameActive) return;
        
        if (this.canMovePieceToEmpty(position)) {
            this.movePiece(position, this.emptyIndex);
        }
    }

    canMovePieceToEmpty(position) {
        return this.canMovePiece(position, this.emptyIndex);
    }

    canMovePiece(fromPos, toPos) {
        if (this.currentOrder[toPos] !== 8) return false; // 目标位置不是空格
        
        const fromRow = Math.floor(fromPos / 3);
        const fromCol = fromPos % 3;
        const toRow = Math.floor(toPos / 3);
        const toCol = toPos % 3;
        
        // 检查是否相邻
        const rowDiff = Math.abs(fromRow - toRow);
        const colDiff = Math.abs(fromCol - toCol);
        
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }

    movePiece(fromPos, toPos) {
        if (!this.isGameActive) return;
        
        // 交换位置
        [this.currentOrder[fromPos], this.currentOrder[toPos]] = 
        [this.currentOrder[toPos], this.currentOrder[fromPos]];
        
        this.emptyIndex = fromPos;
        this.moveCount++;
        
        this.updateMoveCount();
        this.renderPuzzle();
        
        if (this.isPuzzleSolved()) {
            this.handleWin();
        }
    }

    isPuzzleSolved() {
        return this.currentOrder.every((piece, index) => piece === this.correctOrder[index]);
    }

    handleWin() {
        this.isGameActive = false;
        this.stopTimer();
        
        const finalTime = this.formatTime(Math.floor((Date.now() - this.startTime) / 1000));
        
        document.getElementById('finalMoves').textContent = this.moveCount;
        document.getElementById('finalTime').textContent = finalTime;
        document.getElementById('winModal').style.display = 'block';
        
        // 添加胜利动画
        this.addWinAnimation();
    }

    addWinAnimation() {
        const pieces = document.querySelectorAll('.puzzle-piece:not(.empty)');
        pieces.forEach((piece, index) => {
            setTimeout(() => {
                piece.style.animation = 'bounce 0.6s ease-in-out';
            }, index * 100);
        });
    }

    startTimer() {
        this.startTime = Date.now();
        this.timer = setInterval(() => {
            if (this.isGameActive) {
                const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
                document.getElementById('timer').textContent = this.formatTime(elapsed);
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    updateMoveCount() {
        document.getElementById('moveCount').textContent = this.moveCount;
    }

    resetGame() {
        this.stopTimer();
        this.moveCount = 0;
        this.updateMoveCount();
        this.shufflePuzzle();
        this.renderPuzzle();
        this.startTimer();
        document.getElementById('winModal').style.display = 'none';
    }

    showHint() {
        if (!this.isGameActive || !this.hintAvailable) return;
        
        // 清除之前的提示
        document.querySelectorAll('.puzzle-piece').forEach(piece => {
            piece.classList.remove('hint');
        });
        
        // 找到可以移动的拼图块
        const movablePieces = [];
        for (let i = 0; i < 9; i++) {
            if (this.canMovePieceToEmpty(i)) {
                movablePieces.push(i);
            }
        }
        
        if (movablePieces.length > 0) {
            const randomPiece = movablePieces[Math.floor(Math.random() * movablePieces.length)];
            const pieceElement = document.querySelector(`[data-position="${randomPiece}"]`);
            if (pieceElement && !pieceElement.classList.contains('empty')) {
                pieceElement.classList.add('hint');
                setTimeout(() => {
                    pieceElement.classList.remove('hint');
                }, 2000);
            }
        }
    }

    bindEvents() {
        document.getElementById('shuffleBtn').addEventListener('click', () => {
            this.resetGame();
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetGame();
        });

        document.getElementById('hintBtn').addEventListener('click', () => {
            this.showHint();
        });

        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.resetGame();
        });

        // 点击模态框外部关闭
        document.getElementById('winModal').addEventListener('click', (e) => {
            if (e.target.id === 'winModal') {
                document.getElementById('winModal').style.display = 'none';
            }
        });
    }

    // 扩展功能：切换图片
    changeImage(imagePath) {
        this.currentImage = imagePath;
        document.getElementById('referenceImg').src = imagePath;
        this.resetGame();
    }
}

// 添加弹跳动画CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes bounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }
`;
document.head.appendChild(style);

// 初始化游戏
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new PuzzleGame();
});

// 导出给其他模块使用
window.PuzzleGame = PuzzleGame; 