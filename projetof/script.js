const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');

var tiles = [];
const nTilesX = 10;
const nTilesY = 10;
const nBombs = 10;

class Tile {
    constructor(i, j) {
        this.i = i;
        this.j = j;
        this.isBomb = false;
        this.isOpen = false;
        this.bombsAround = 0;
        this.marked = false;
        this.openedAround = false;
    }
}

function generateTiles() {
    for (let i = 0; i < nTilesX; i++) {
        for (let j = 0; j < nTilesY; j++) {
            let tile = new Tile(i, j);
            tiles.push(tile);
        }
    }
}

function generateBombs() {
    for (let i = 0; i < nBombs; i++) {
        let random = Math.floor(Math.random() * tiles.filter(t => !t.isBomb).length);
        tiles.filter(t => !t.isBomb)[random].isBomb = true;
    }
}

function calculateNBombsAround(tile) {
    let bombCounter = 0;
    for (let i = tile.i - 1; i <= tile.i + 1; i++) {
        for (let j = tile.j - 1; j <= tile.j + 1; j++) {
            if (i != tile.i || j != tile.j) {
                if (getTile(i, j)?.isBomb) bombCounter += 1;
            }
        }
    }
    return bombCounter;
}

function calculateAllBombsAround() {
    tiles.forEach(tile => {
        tile.bombsAround = calculateNBombsAround(tile);
    });
}

function getTile(i, j) {
    return tiles.find(t => t.i == i && t.j == j);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    tiles.forEach(t => {
        drawTile(t);
    });
}

function drawTile(tile) {
    let x = (tile.i * 51) + 1;
    let y = (tile.j * 51) + 1;

    if (tile.isOpen) {
        if (tile.isBomb) {
            ctx.fillStyle = "#ff0000";
            ctx.fillRect(x, y, 50, 50);
        } else {
            ctx.fillStyle = "#999999";
            ctx.fillRect(x, y, 50, 50);
            if (tile.bombsAround) {
                ctx.font = "30px Arial";
                ctx.textAlign = "center";
                ctx.fillStyle = getColorForNumber(tile.bombsAround);
                ctx.fillText(tile.bombsAround, x + 25, y + 30);
            }
        }
    } else {
        ctx.fillStyle = tile.marked ? "#0000ff" : "#aaaaaa";
        ctx.fillRect(x, y, 50, 50);
    }
}

function getColorForNumber(number) {
    switch(number) {
        case 1: return "#0000ff"; 
        case 2: return "#00ff00"; 
        case 3: return "#ff0000"; 
        case 4: return "#000000"; 
        case 5: return "#800000"; 
        case 6: return "#00ffff"; 
        case 7: return "#ff00ff"; 
        case 8: return "#808080"; 
        default: return "#000000"; 
    }
}

function openTile(tile) {
    tile.isOpen = true;
    if (!tile.openedAround && tile.bombsAround == 0) openAround(tile);
}

function openAround(tile) {
    tile.openedAround = true;
    for (let i = tile.i - 1; i <= tile.i + 1; i++) {
        for (let j = tile.j - 1; j <= tile.j + 1; j++) {
            if (i != tile.i || j != tile.j) {
                const currentTile = getTile(i, j);
                if (currentTile && !currentTile.isBomb && !currentTile.isOpen) openTile(currentTile);
            }
        }
    }
}

function startGame() {
    tiles = [];
    generateTiles();
    generateBombs();
    calculateAllBombsAround();
    draw();
    document.getElementById('bombs-count').textContent = nBombs;
    document.getElementById('game-container').style.display = 'block'; 
}

function updateTimer() {
    let startTime = Date.now();
    let timerElement = document.getElementById('timer');
    setInterval(() => {
        let elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        timerElement.textContent = elapsedTime;
    }, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
    startGame();
    updateTimer();
});

canvas.addEventListener("click", e => {
    if (document.getElementById('game-container').style.display === 'none') return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const i = Math.floor((mouseX / canvas.width) * nTilesX);
    const j = Math.floor((mouseY / canvas.height) * nTilesY);

    let tile = getTile(i, j);
    if (tile) {
        if (tile.isBomb) {
            alert('Você perdeu! Recarregue a pagina para jogar novamente :)');
        }
        openTile(tile);
        draw();
        checkWinCondition();
    }
});

canvas.addEventListener("contextmenu", e => {
    if (document.getElementById('game-container').style.display === 'none') return;

    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const i = Math.floor((mouseX / canvas.width) * nTilesX);
    const j = Math.floor((mouseY / canvas.height) * nTilesY);

    let tile = getTile(i, j);
    if (tile) {
        tile.marked = !tile.marked;
        draw();
        const markedBombs = tiles.filter(t => t.marked && t.isBomb).length;
        document.getElementById('bombs-count').textContent = nBombs - markedBombs;
    }
});

function checkWinCondition() {
    const revealedTiles = tiles.filter(t => t.isOpen);
    if (revealedTiles.length === (nTilesX * nTilesY - nBombs)) {
        alert('Parabéns! Você ganhou!');
        document.getElementById('game-container').style.display = 'none';
    }
}