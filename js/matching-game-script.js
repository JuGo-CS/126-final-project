const tileValues = [];
const isTileActive = [];
const maxFaceUpCard = 2;

const basePoint = 50;
const comboPointBonus = 10;

let numRows = 6;
let numCols = 6;
let totalCards = numRows * numCols;
let numVarieties = 6;
let difficulty = "EASY";
let score = 0;
let numOfTilesFlipped = 0;
let numMatchedTiles = 0;
let secondsElapse = 0;
let combo = 0;
let gameInterval = null;
let gameStarted = false;
let isPaused = false;

let resizeTimer;

document.addEventListener("DOMContentLoaded", function () {
    // Wait for the white sphere collapse animation, show difficulty popup, play intro
    setTimeout(function () {
        const overlay = document.getElementById('difficulty-overlay');
        if (overlay) {
            overlay.classList.add('active');
        }
        // Play intro SFX only (BGM starts after difficulty chosen)
        AudioManager.playIntro(1);
    }, 1000);

    // Add hover + click SFX to difficulty buttons
    setTimeout(function () {
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => AudioManager.playHover());
            btn.addEventListener('click', () => AudioManager.playButtonPress());
        });
        // Add hover + click SFX to pause button
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.addEventListener('mouseenter', () => AudioManager.playHover());
        }
        // Add hover + click SFX to end card buttons
        document.querySelectorAll('.button-link').forEach(btn => {
            btn.addEventListener('mouseenter', () => AudioManager.playHover());
        });
        // Add hover + click SFX to pause modal buttons
        document.querySelectorAll('#pause-modal .pause-btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => AudioManager.playHover());
        });
        // Back to home arrow
        const arrowHome = document.getElementById('arrow_goHome');
        if (arrowHome) {
            arrowHome.addEventListener('mouseenter', () => AudioManager.playHover());
        }
    }, 1200);
});

window.addEventListener("load", adjustTileMatrix);
window.addEventListener("resize", adjustTileMatrix);

// ============================================================
// Called by difficulty popup buttons
// ============================================================
function startGame1(selectedDifficulty) {
    difficulty = selectedDifficulty;
    saveLastPlayed(1, difficulty);

    // Set grid size based on difficulty
    if (difficulty === "EASY") {
        numRows = 6;
        numCols = 6;
        numVarieties = 6;
    } else if (difficulty === "MEDIUM") {
        numRows = 8;
        numCols = 8;
        numVarieties = 8;
    } else { // HARD
        numRows = 10;
        numCols = 10;
        numVarieties = 10;
    }

    totalCards = numRows * numCols;

    // Reset all state
    tileValues.length = 0;
    isTileActive.length = 0;
    score = 0;
    numOfTilesFlipped = 0;
    numMatchedTiles = 0;
    secondsElapse = 0;
    combo = 0;
    isPaused = false;

    // Hide end card if visible
    document.getElementById('game1-end-card').style.display = 'none';
    document.getElementById('blackBackground_forGameHouses').style.zIndex = '-1';

    // Close difficulty popup
    document.getElementById('difficulty-overlay').classList.remove('active');

    // Show pause and tutorial buttons
    document.getElementById('pause-btn').classList.add('visible');
    document.getElementById('tutorial-btn').classList.add('visible');

    // Start game BGM (only after difficulty is chosen)
    AudioManager.playBGM('game1');

    // Start the hourglass GIF
    const hourglass = document.getElementById('timerGlassHour');
    if (hourglass) {
        hourglass.src = 'assets/images/hourglassGif.gif';
    }

    // Start the game
    generateRandomTileValues();
    refreshStats();

    // Adjust tile sizes after a short delay to let DOM settle
    setTimeout(adjustTileMatrix, 50);

    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(updateClock, 1000);
    gameStarted = true;
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

    // Build a fresh 2D active grid — each row gets its OWN array
    for (let r = 0; r < numRows; r++) {
        isTileActive[r] = [];
        for (let c = 0; c < numCols; c++) {
            isTileActive[r][c] = true;
        }
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
    const tile1Id = parseInt(tile1.id);
    const tile2Id = parseInt(tile2.id);

    if (tileValues[tile1Id] === tileValues[tile2Id]) {
        // Match — play correct SFX
        AudioManager.playCorrect();

        // Match — convert flat index to row/col
        const r1 = Math.floor(tile1Id / numCols);
        const c1 = tile1Id % numCols;
        const r2 = Math.floor(tile2Id / numCols);
        const c2 = tile2Id % numCols;

        isTileActive[r1][c1] = false;
        isTileActive[r2][c2] = false;

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
        AudioManager.playWrong();
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
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
    }

    document.getElementById('pause-btn').classList.remove('visible');
    document.getElementById('tutorial-btn').classList.remove('visible');
    document.getElementById('pause-overlay').classList.remove('active');

    // Stop hourglass GIF
    const hourglass = document.getElementById('timerGlassHour');
    if (hourglass) {
        hourglass.src = 'assets/images/hourglass.png';
    }

    // Calculate time bonus: faster = more points
    // Under 30s = full bonus, 30-120s = scaling, over 120s = minimal
    let timeBonus = 0;
    if (secondsElapse <= 30) {
        timeBonus = 2000;
    } else if (secondsElapse <= 120) {
        // Linear scale from 2000 down to 200
        timeBonus = Math.round(2000 - ((secondsElapse - 30) / 90) * 1800);
    } else {
        timeBonus = Math.max(100, Math.round(200 - ((secondsElapse - 120) / 60) * 100));
    }

    // Apply difficulty multiplier to final score
    const difficultyMultiplier = difficulty === "EASY" ? 1 : difficulty === "MEDIUM" ? 1.5 : 2;
    const finalScore = Math.round((score + timeBonus) * difficultyMultiplier);
    score = finalScore;

    document.getElementById('game1-end-card').style.display = 'flex';
    document.getElementById('tiles-flipped-end-card').innerHTML = numOfTilesFlipped;
    document.getElementById('elapsed-time-end-card').innerHTML = getTextFormTimeElapse();
    document.getElementById('score-end-card').innerHTML = score;
    document.getElementById('difficulty-end-card').innerHTML = difficulty;
    document.getElementById('blackBackground_forGameHouses').style.zIndex = '10';

    // Stop BGM and play finish/loss SFX
    AudioManager.stopBGM();

    // Submit score to Supabase leaderboard (only on win — all tiles matched)
    const playerName = getPlayerName();
    if (score > 0) {
        AudioManager.playFinish(null);
        submitScoreGame1(playerName, score, difficulty).then(result => {
            if (result && result.submitted) {
                // Check rank after submission
                getPlayerRank('leaderboard_game1', playerName, difficulty).then(rank => {
                    const rankEl = document.getElementById('game1-rank-display');
                    if (rankEl && rank !== null) {
                        if (rank <= 10) {
                            savePendingCelebration(1, difficulty, rank);
                        }

                        if (rank <= 3) {
                            rankEl.innerHTML = `&#127942; Rank #${rank} — Top 3!`;
                            rankEl.style.color = '#FFD700';
                            AudioManager.playFinish(rank);
                            triggerCelebration(rank);
                        } else if (rank <= 10) {
                            rankEl.innerHTML = `&#127775; Rank #${rank} — Top 10!`;
                            rankEl.style.color = '#FFE0B2';
                            AudioManager.playFinish(rank);
                            triggerCelebration(rank);
                        } else {
                            rankEl.innerHTML = `&#128200; Rank #${rank}`;
                            rankEl.style.color = '#FFF';
                        }
                        rankEl.style.display = 'block';
                    }
                });
            }
        });
    } else {
        AudioManager.playLoss();
    }
}

function playAgain() {
    // Show difficulty popup again to let player choose
    document.getElementById('pause-btn').classList.remove('visible');
    document.getElementById('tutorial-btn').classList.remove('visible');
    document.getElementById('difficulty-overlay').classList.add('active');
}

// ============================================================
// PAUSE / RESUME / RESTART
// ============================================================
function togglePause() {
    const overlay = document.getElementById('pause-overlay');
    if (!overlay || !gameStarted) return;

    AudioManager.playButtonPress();

    if (overlay.classList.contains('active')) {
        // Resume
        overlay.classList.remove('active');
        isPaused = false;
        AudioManager.resumeBGM();
        if (gameInterval === null && numMatchedTiles < totalCards) {
            gameInterval = setInterval(updateClock, 1000);
        }
    } else {
        // Pause
        overlay.classList.add('active');
        isPaused = true;
        AudioManager.pauseBGM();
        if (gameInterval) {
            clearInterval(gameInterval);
            gameInterval = null;
        }
    }
}

function pauseRestart() {
    document.getElementById('pause-overlay').classList.remove('active');
    isPaused = false;
    AudioManager.playButtonPress();
    playAgain();
}

// ============================================================
// TUTORIAL
// ============================================================
function openTutorial() {
    const overlay = document.getElementById('tutorial-overlay');
    if (!overlay) return;

    overlay.classList.add('active');

    // Pause game logic
    if (gameStarted) {
        isPaused = true;
        AudioManager.pauseBGM();
        if (gameInterval) {
            clearInterval(gameInterval);
            gameInterval = null;
        }
    }
}

function closeTutorial() {
    const overlay = document.getElementById('tutorial-overlay');
    if (!overlay) return;

    overlay.classList.remove('active');

    // Resume game logic
    if (gameStarted) {
        isPaused = false;
        AudioManager.resumeBGM();
        if (gameInterval === null && numMatchedTiles < totalCards) {
            gameInterval = setInterval(updateClock, 1000);
        }
    }

    // Mark as seen so it won't auto-show again
    localStorage.setItem('gitlog_tutorial_game1_seen', 'true');
}

// Auto-show tutorial for first-time players
(function checkFirstTime() {
    if (!localStorage.getItem('gitlog_tutorial_game1_seen')) {
        // Wait for page to settle, then show tutorial
        setTimeout(function () {
            const overlay = document.getElementById('tutorial-overlay');
            if (overlay) overlay.classList.add('active');
        }, 2000);
    }
})();

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