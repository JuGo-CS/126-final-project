const tileValues = [];
const isTileActive = [];
const maxFaceUpCard = 2;

const basePoint = 50;
const comboPointBonus = 10;

let numRows = 10;
let numCols = 10;
let totalCards = numRows * numCols;

let numVarieties = 10;

let difficulty = "EASY";
let score = 0;
let numOfTilesFlipped = 0;
let numMatchedTiles = 0;
let secondsElapse = 0;

let combo = 0;


let resizeTimer;

document.addEventListener("DOMContentLoaded", initializePage);

window.addEventListener("load", adjustTileMatrix);
window.addEventListener("resize", adjustTileMatrix);

function initializePage(){
    generateRandomTileValues();
    updateClock();
    setInterval(updateClock, 1000);

    refreshStats();
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // pick a random index from 0 to i
    [array[i], array[j]] = [array[j], array[i]];  // swap elements
  }

  return array;
}

function generateRandomTileValues() {
    const totalTiles = numRows * numCols;
    const pairs = Math.floor(totalTiles / 2);

    for (let i = 0; i < pairs; i++) {
        const value = Math.floor(Math.random() * numVarieties) + 1;
        tileValues.push(value, value);
    }

    shuffleArray(tileValues);

    const boolBuffer = [];
    for (let i = 0; i < numCols; i++) {
        boolBuffer.push(true);
    }

    for (let i = 0; i < numRows; i++) {
        isTileActive.push(boolBuffer);
    }

    generateTileMatrix();
}

function generateTileMatrix() {
    const matrixContainer = document.getElementById("game1-matrix-container");
    const tileContainer = document.getElementById("game1-tile-matrix");
    const tileContainerWidth = matrixContainer.offsetWidth;
    const tileContainerHeight = matrixContainer.offsetHeight;

    const imageSrc = "assets/images/tile.png";
    const tileSize = (tileContainerHeight / numRows) * 0.8;
    const tileContainerSize = tileContainerHeight / numRows;

    tileContainer.innerHTML = "";

    let tileValueTracker = 0;
    for (let row = 0; row < numRows; row++) {
        const tileRow = document.createElement("tr");

        for (let col = 0; col < numCols; col++) {
            const tileCell = document.createElement("td");
            

            if (!isTileActive[row][col]){
                tileRow.appendChild(tileCell);
                continue;
            }

            const tileDiv = document.createElement("div");
            const tileInnerDiv = document.createElement("div");
           
            tileDiv.classList.add("tile");
            tileInnerDiv.classList.add("tile-inner");

            tileDiv.id = tileValueTracker;    

            const tileFrontDiv = document.createElement("div");
            tileFrontDiv.classList.add("tile-front");

            const imgFront = document.createElement("img");
            imgFront.src = imageSrc;
            imgFront.alt = `Tile ${row * numCols + col + 1} Front`;

            tileFrontDiv.appendChild(imgFront);

            const tileBackDiv = document.createElement("div");
            tileBackDiv.classList.add("tile-back");

            const imgBack = document.createElement("img");
            imgBack.src = "assets/tile-entity/" + tileValues[tileValueTracker] + ".png";
            imgBack.alt = `Tile ${row * numCols + col + 1} Back`;

            tileBackDiv.appendChild(imgBack);

            tileInnerDiv.appendChild(tileFrontDiv);
            tileInnerDiv.appendChild(tileBackDiv);

            tileDiv.appendChild(tileInnerDiv);
            tileCell.appendChild(tileDiv);
            tileRow.appendChild(tileCell);

            tileValueTracker++;
        }

        tileContainer.appendChild(tileRow);
    }

    document.querySelectorAll('.tile').forEach(tile => {
        tile.addEventListener('click', () => {
            if (tile.classList.contains('flipped') || countFaceUpTiles() >= maxFaceUpCard) {
                return;
            }

            tile.classList.add('flipped');
            numOfTilesFlipped++;
            refreshStats();

            if (countFaceUpTiles() === maxFaceUpCard) {
                setTimeout(manageFlipEvent, 500);
            }
        });
    });
}

function manageFlipEvent() {
    const flippedTiles = [...document.querySelectorAll('.flipped')];

    if (flippedTiles.length !== 2) return;

    const [tile1, tile2] = flippedTiles;
    const tile1Id = tile1.id;
    const tile2Id = tile2.id;

    console.log(tile1Id, tile2Id);

    if (tileValues[tile1Id] === tileValues[tile2Id]) {
        // Match
        isTileActive[tile1Id] = false;
        isTileActive[tile2Id] = false;

        tile1.style.visibility = 'hidden';
        tile2.style.visibility = 'hidden';

        numMatchedTiles += 2;
        score += basePoint + comboPointBonus*combo;
        combo++;
        refreshStats();

        if (numMatchedTiles == totalCards){
            endGame();
        }
    }
    else {
        combo = 0;
    }

    resetAllFaceUpTiles();
}

function countFaceUpTiles() {
    return document.querySelectorAll('.tile.flipped').length;
}

function resetAllFaceUpTiles() {
    document.querySelectorAll('.tile.flipped').forEach(tile => {
        tile.classList.remove('flipped');
    });
}

function endGame(){
    document.getElementById('game1-end-card').style.display = 'flex';
    document.getElementById('tiles-flipped-end-card').innerHTML = numOfTilesFlipped;
    document.getElementById('elapsed-time-end-card').innerHTML = getTextFormTimeElapse();
    document.getElementById('score-end-card').innerHTML = score;
    document.getElementById('difficulty-end-card').innerHTML = difficulty;y
    document.getElementById('blackBackground_forGameHouses').style.zIndex = '10';

}

function adjustTileMatrix() {
    const matrixContainer = document.getElementById("game1-matrix-container");
    const tileContainer = document.getElementById("game1-tile-matrix");
    const tileContainerWidth = matrixContainer.offsetWidth;
    const tileContainerHeight = matrixContainer.offsetHeight;

    const tileSize = (tileContainerHeight / numRows) * 0.8;
    const tileContainerSize = tileContainerHeight / numRows;

    tileContainer.style.width = tileContainerWidth + "px";
    tileContainer.style.height = tileContainerHeight + "px";

    document.querySelectorAll('#game1-tile-matrix td').forEach(tileCell => {
        tileCell.style.width = tileContainerSize + "px";
        tileCell.style.height = tileContainerSize + "px";
    });

    document.querySelectorAll('#game1-tile-matrix img').forEach(img => {
        img.style.width = tileSize + "px";
        img.style.height = tileSize + "px";
        img.style.margin = tileContainerSize * 0.1 + "px";
    }); 


    document.querySelectorAll('.tile').forEach(tile => {
        tile.style.width = tileSize + "px";
        tile.style.height = tileSize + "px";
    });
}

function refreshStats() {
    document.getElementById("difficulty-value").innerText = difficulty;
    document.getElementById("score-value").innerText = score;
    document.getElementById("tiles-turned-value").innerText = numOfTilesFlipped;
}

function updateClock() {
    document.getElementById('game1-time').innerHTML = getTextFormTimeElapse();

    secondsElapse++;
}

function getTextFormTimeElapse(){
    const minutes = Math.floor(secondsElapse / 60);
    const seconds = secondsElapse%60

    const secondsText = (seconds < 10 ? "0" : "") + seconds.toString();
    
    return `${minutes}:${secondsText}`;
}