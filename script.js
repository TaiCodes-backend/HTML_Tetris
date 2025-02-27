const canvas = document.getElementById('board');
const context = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const startButton = document.getElementById('start'); // Get the start button

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;

let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
let score = 0;
let currentPiece;
let gameInterval; // Declare gameInterval to manage the game loop

const pieces = [
    [[1, 1, 1, 1]], // I
    [[1, 1, 1], [0, 1, 0]], // T
    [[1, 1, 0], [0, 1, 1]], // Z
    [[0, 1, 1], [1, 1, 0]], // S
    [[1, 1], [1, 1]], // O
    [[1, 1, 1], [1, 0, 0]], // L
    [[1, 1, 1], [0, 0, 1]], // J
];

function drawBoard() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    board.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                context.fillStyle = 'blue';
                context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                context.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        });
    });
}

function drawPiece() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                context.fillStyle = 'red';
                context.fillRect((currentPiece.x + x) * BLOCK_SIZE, (currentPiece.y + y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                context.strokeRect((currentPiece.x + x) * BLOCK_SIZE, (currentPiece.y + y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        });
    });
}

function createPiece() {
    const randomIndex = Math.floor(Math.random() * pieces.length);
    return {
        shape: pieces[randomIndex],
        x: Math.floor(COLS / 2) - 1,
        y: 0,
    };
}

function collide() {
    return currentPiece.shape.some((row, y) => {
        return row.some((value, x) => {
            if (value) {
                const newX = currentPiece.x + x;
                const newY = currentPiece.y + y;
                return newX < 0 || newX >= COLS || newY >= ROWS || (newY >= 0 && board[newY][newX]);
            }
            return false;
        });
    });
}

function merge() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                board[currentPiece.y + y][currentPiece.x + x] = value; // Merge into board
            }
        });
    });
}

function rotatePiece() {
    const shape = currentPiece.shape;
    const rotatedShape = shape[0].map((_, index) => shape.map(row => row[index]).reverse());
    currentPiece.shape = rotatedShape;
    if (collide()) {
        currentPiece.shape = shape;
    }
}

let level = 1;
let linesCleared = 0;

function clearLines() {
    let linesClearedThisTurn = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(value => value)) {
            board.splice(y, 1);
            board.unshift(Array(COLS).fill(0));
            linesClearedThisTurn++;
        }
    }
    linesCleared += linesClearedThisTurn;
    score += linesClearedThisTurn * 10;
    scoreDisplay.textContent = `Score: ${score}`;
    
    if (linesCleared >= level * 10) {
        level++;
        clearInterval(gameInterval);
        gameInterval = setInterval(update, 100 - (level * 10));
    }
}

function spawnPiece() {
    currentPiece = createPiece();
    if (collide()) {
        alert('Game Over, Get Better!');
        board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
        score = 0;
        scoreDisplay.textContent = `Score: ${score}`;
        return false; // Indicate that the game is over
    }
    return true; // Indicate that the game can continue
}

function update() {
    if (!collide({ x: 0, y: 1 })) {
        currentPiece.y++;
    } else {
        merge();
        clearLines();
        if (!spawnPiece()) {
            return; // Stop the update loop if the game is over
        }
    }
    drawBoard();
    drawPiece();
    setTimeout(update, 100 - (level * 10 )); // Adjust game speed as needed
}

function startGame() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0)); // Reset the board
    score = 0; // Reset the score
    scoreDisplay.textContent = `Score: ${score}`; // Update score display
    level = 1; // Reset level
    spawnPiece(); // Spawn the first piece
    update(); // Start the update loop
}

let isPaused = false;

document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowLeft':
            if (!collide({ x: -1, y: 0 })) {
                currentPiece.x--;
            }
            break;
        case 'ArrowRight':
            if (!collide({ x: 1, y: 0 })) {
                currentPiece.x++;
            }
            break;
        case 'ArrowDown':
            if (!collide({ x: 0, y: 1 })) {
                currentPiece.y++;
            }
            break;
        case 'ArrowUp':
            rotatePiece();
            break;
        case 'p': // Press 'p' to pause
            if (isPaused) {
                clearInterval(gameInterval);
            } else {
                gameInterval = setInterval(update, 100 - (level * 10));
            }
            break;
    }
});

startButton.addEventListener('click', startGame); // Add event listener to start button
