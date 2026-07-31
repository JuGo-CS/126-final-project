let numGuessOptions = 5;
let numGuessTypes = 4;
const categories = ['fruit', 'main', 'drink', 'dessert']; 

let maxAttempts = 8;
const correctValues = [];
let attemptNum = 1;
let difficulty = "EASY";
let isPaused = false;

let lockedCategories = { fruit: null, main: null, drink: null, dessert: null };
let hintedColumns = new Set();

document.addEventListener("DOMContentLoaded", function () {
    // Wait for the white sphere collapse animation, show difficulty popup, play intro
    setTimeout(function () {
        const overlay = document.getElementById('difficulty-overlay');
        if (overlay) {
            overlay.classList.add('active');
        }
        // Play intro SFX only (BGM starts after difficulty chosen)
        AudioManager.playIntro(2);
    }, 1000);

    // Add hover + click SFX to interactive elements
    setTimeout(function () {
        // Difficulty buttons
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => AudioManager.playHover());
            btn.addEventListener('click', () => AudioManager.playButtonPress());
        });
        // Pause button
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.addEventListener('mouseenter', () => AudioManager.playHover());
        }
        // End card buttons
        document.querySelectorAll('.button-link').forEach(btn => {
            btn.addEventListener('mouseenter', () => AudioManager.playHover());
        });
        // Pause modal buttons
        document.querySelectorAll('#pause-modal .pause-btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => AudioManager.playHover());
        });
        // Back to home arrow
        const arrowHome = document.getElementById('arrow_goHome');
        if (arrowHome) {
            arrowHome.addEventListener('mouseenter', () => AudioManager.playHover());
        }
        // Submit and Reset buttons
        const submitBtn = document.getElementById('game2-submit-button');
        if (submitBtn) {
            submitBtn.addEventListener('mouseenter', () => AudioManager.playHover());
            submitBtn.addEventListener('click', () => AudioManager.playButtonPress());
        }
        const resetBtn = document.getElementById('game2-reset-button');
        if (resetBtn) {
            resetBtn.addEventListener('mouseenter', () => AudioManager.playHover());
            resetBtn.addEventListener('click', () => AudioManager.playButtonPress());
        }
    }, 1200);
});

document.getElementById("game2-reset-button").addEventListener("click", resetGuess);
document.getElementById("game2-submit-button").addEventListener("click", evaluateGuess);

// ============================================================
// Called by difficulty popup buttons
// ============================================================
function startGame2(selectedDifficulty) {
    difficulty = selectedDifficulty;
    saveLastPlayed(2, difficulty);

    // Reset state
    correctValues.length = 0;
    attemptNum = 1;
    isPaused = false;

    lockedCategories = { fruit: null, main: null, drink: null, dessert: null };
    hintedColumns = new Set();
    resetCabinetVisualState();

    // ============================================================
    // DIFFICULTY SETTINGS
    // ============================================================
    if (difficulty === "EASY") {
        maxAttempts = 6;
        numGuessOptions = 5;
        numGuessTypes = 4;
    } else if (difficulty === "MEDIUM") {
        maxAttempts = 5;
        numGuessOptions = 5;
        numGuessTypes = 4;
    } else { // HARD
        maxAttempts = 4;
        numGuessOptions = 5;
        numGuessTypes = 4;
    }

    // Hide end card if visible
    document.getElementById('game2-end-card').style.display = 'none';
    document.getElementById('blackBackground_forGameHouses').style.zIndex = '-1';

    // Close difficulty popup
    document.getElementById('difficulty-overlay').classList.remove('active');

    // Show pause and tutorial buttons
    document.getElementById('pause-btn').classList.add('visible');
    document.getElementById('tutorial-btn').classList.add('visible');

    // Start game BGM (only after difficulty is chosen)
    AudioManager.playBGM('game2');

    // Rebuild attempt containers with new maxAttempts
    createAttemptObjects();
    assignOnClickEventToImg();
    generateOrderToGuess();

    // Auto-show tutorial for first-time players
    if (!localStorage.getItem('gitlog_tutorial_game2_seen')) {
        setTimeout(function () {
            const overlay = document.getElementById('tutorial-overlay');
            if (overlay) overlay.classList.add('active');
        }, 500);
    }
}

function createAttemptObjects(){
    const attemptContainer = document.getElementById("game2-attempt-container");
    attemptContainer.innerHTML = ""; // Clear previous attempts

    // Determine which categories to show based on difficulty
    const activeCategories = categories.slice(0, numGuessTypes);

    for (let i = 1; i <= maxAttempts; i++){
        const attemptContent = document.createElement("div");
        attemptContent.id = `attempt-${i}`;

            const attemptImageContainer = document.createElement("div");
            attemptImageContainer.classList.add("attempt-image-container");

            activeCategories.forEach(cat => {
                const imgContainer = document.createElement("div");
                imgContainer.id = `${cat}-attempt-${i}`;
                attemptImageContainer.appendChild(imgContainer);
            });

        attemptContent.appendChild(attemptImageContainer);

            const attemptHint = document.createElement("div");
            attemptHint.id = `attempt-${i}-hint`;
            attemptHint.classList.add("attempt-hints");

        attemptContent.appendChild(attemptHint);
        
        attemptContainer.appendChild(attemptContent);
    }
}

function assignOnClickEventToImg(){
    document.querySelectorAll('#game2-cabinet table img').forEach(choice => {
        choice.addEventListener('click', function () {
            const radio = choice.closest("td").querySelector("input[type='radio']");

            if (!radio) return;

            const clickedCategory = radio.name.replace('-choice', '');
            // On HARD mode, allow changing any category even if locked
            if (difficulty !== "HARD" && lockedCategories[clickedCategory] !== null) {
                return;
            }

            radio.checked = true;

            let divGuessContainer;
            const img = document.createElement("img");
            img.src = choice.src;
            img.alt = choice.alt;

            // Match by class name — works for any category
            for (const cat of categories) {
                if (choice.classList.contains(cat)) {
                    divGuessContainer = document.getElementById(`${cat}-guess`);
                    break;
                }
            }

            if (!divGuessContainer) {
                console.error("Unknown class for choice:", choice.classList);
                return;
            }

            divGuessContainer.innerHTML = "";
            divGuessContainer.appendChild(img);
        });
    });
}

function generateOrderToGuess(){
    // Build pool [0..numGuessOptions-1], shuffle, take first numGuessTypes.
    // Guarantees no duplicate value across categories -> 1 correct per column.
    const pool = Array.from({ length: numGuessOptions }, (_, i) => i);

    for (let i = pool.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    for (let i = 0; i < numGuessTypes; i++){
        correctValues.push(pool[i].toString());
    }
}

function resetGuess() {
    categories.slice(0, numGuessTypes).forEach(cat => {
        const el = document.getElementById(`${cat}-guess`);
        if (el) el.innerHTML = "";
    });
}

function evaluateGuess() {
    if (!isValidSubmit()){
        alert("Please complete your guess.");
        return;
    }

    const activeCategories = categories.slice(0, numGuessTypes);
    const playerGuessValues = [];
    const categoryNames = [];

    activeCategories.forEach(cat => {
        const selected = document.querySelector(`input[name="${cat}-choice"]:checked`);
        playerGuessValues.push(selected ? selected.value : null);
        categoryNames.push(cat);
    });

    let correctGuess = 0;
    let correctRow = 0;

    const playerWrongGuess = [];
    const correctRowValues = new Set();

    for (let i = 0; i < numGuessTypes; i++){
        if (playerGuessValues[i] == correctValues[i]){
            correctGuess++;
        }
        else {
            playerWrongGuess.push(playerGuessValues[i]);
            correctRowValues.add(correctValues[i]);
        }
    }

    for (let i = 0; i < playerWrongGuess.length; i++){
        if (correctRowValues.has(playerWrongGuess[i])){
            correctRow++;
        }
    }

    for (let i = 0; i < numGuessTypes; i++){
        if (playerGuessValues[i] === correctValues[i]){
            lockedCategories[categoryNames[i]] = correctValues[i];
        } else if (correctRowValues.has(playerGuessValues[i])){
            hintedColumns.add(playerGuessValues[i]);
        }
    }
    updateCabinetVisualState();

    // Open takeout box
    document.getElementById(`attempt-${attemptNum}`).style.backgroundImage = 'url("assets/images/Takeout box open back.png")';
    document.getElementById(`attempt-${attemptNum}`).style.backgroundSize = 'cover';
    document.getElementById(`attempt-${attemptNum}`).style.backgroundRepeat = 'no-repeat';

    // Show guessed items in the attempt box
    activeCategories.forEach((cat, idx) => {
        const img = document.createElement('img');
        img.src = `assets/cabinet/${cat}-${playerGuessValues[idx]}.png`;
        const container = document.getElementById(`${cat}-attempt-${attemptNum}`);
        if (container) container.appendChild(img);
    });

    // Show hint numbers (hidden on HARD — player must rely on memory)
    if (difficulty !== "HARD") {
        const correctGuessStatus = document.createElement('h3');
        correctGuessStatus.innerHTML = correctGuess.toString();
        correctGuessStatus.classList.add("attempt-hint-correct-guess");
        document.getElementById(`attempt-${attemptNum}-hint`).appendChild(correctGuessStatus);

        const correctRowStatus = document.createElement('h3');
        correctRowStatus.innerHTML = correctRow.toString();
        correctRowStatus.classList.add("attempt-hint-correct-row");
        document.getElementById(`attempt-${attemptNum}-hint`).appendChild(correctRowStatus);
    }

    attemptNum++;

    document.getElementById("correct-guess-prompt").innerHTML = `Correct Guess: ${correctGuess}`;
    document.getElementById("correct-row-prompt").innerHTML = `Correct Column: ${correctRow}`;

    if (correctGuess == numGuessTypes ){
        endGame(true);
    }
    else if (attemptNum - 1 == maxAttempts){
        endGame(false);
    }
    else {
        // Wrong guess (but game continues) — play wrong SFX
        AudioManager.playWrong();
    }
}

function updateCabinetVisualState() {
    categories.forEach(cat => {
        const radios = document.querySelectorAll(`input[name="${cat}-choice"]`);
        const lockedValue = lockedCategories[cat];
 
        radios.forEach(radio => {
            const td = radio.closest('td');
            const isCorrect = lockedValue !== null && radio.value === lockedValue;
 
            if (lockedValue !== null) {
                if (radio.value === lockedValue) {
                    radio.checked = true;
                }

                // HARD: green lock, but no column hints
                if (difficulty === "HARD") {
                    radio.disabled = true;
                    if (radio.value === lockedValue) {
                        radio.classList.add('locked-correct');
                    } else {
                        radio.classList.remove('locked-correct');
                    }
                    td.classList.remove('hint-yellow-col');
                }
                // MEDIUM: green lock only, no column hints
                else if (difficulty === "MEDIUM") {
                    radio.disabled = true;
                    if (radio.value === lockedValue) {
                        radio.classList.add('locked-correct');
                    } else {
                        radio.classList.remove('locked-correct');
                    }
                    td.classList.remove('hint-yellow-col');
                }
                // EASY: full hints (green lock + no yellow on locked row)
                else {
                    radio.disabled = true;
                    if (radio.value === lockedValue) {
                        radio.classList.add('locked-correct');
                    } else {
                        radio.classList.remove('locked-correct');
                    }
                    td.classList.remove('hint-yellow-col');
                }
            } else {
                radio.disabled = false;
                radio.classList.remove('locked-correct');

                // MEDIUM & HARD: no column hints
                if (difficulty === "MEDIUM" || difficulty === "HARD") {
                    td.classList.remove('hint-yellow-col');
                } else if (hintedColumns.has(radio.value)) {
                    td.classList.add('hint-yellow-col');
                } else {
                    td.classList.remove('hint-yellow-col');
                }
            }
        });
    });
}

function resetCabinetVisualState() {
    document.querySelectorAll('#game2-cabinet input[type="radio"]').forEach(radio => {
        radio.checked = false;
        radio.disabled = false;
        radio.classList.remove('locked-correct');
    });
    document.querySelectorAll('#game2-cabinet td').forEach(td => {
        td.classList.remove('hint-yellow-col');
    });
}

function isValidSubmit() {
    const form = document.getElementById("guess-form");
    const radioInputs = form.querySelectorAll('input[type="radio"]');
    const radioNames = new Set();


    radioInputs.forEach(radio => radioNames.add(radio.name));

    let guessComplete = true;
    radioNames.forEach(name => {
        const isChecked = form.querySelector(`input[name="${name}"]:checked`);
        if (!isChecked) {
            guessComplete = false;
        }
    });

    return guessComplete;
}

function endGame(win){
    const result = (win ? "YOU WIN" : "YOU LOSE");

    const activeCategories = categories.slice(0, numGuessTypes);

    // Clear old correct images
    activeCategories.forEach(cat => {
        const container = document.getElementById(`${cat}-correct`);
        if (container) {
            const img = container.querySelector('img');
            if (img) img.remove();
        }
    });

    document.getElementById('game2-end-card').style.display = 'flex';
    document.getElementById('game2-result').innerHTML = result;
    document.getElementById('attempts-end-card').innerHTML = attemptNum - 1;
    document.getElementById('difficulty-end-card').innerHTML = difficulty;
    document.getElementById('score-end-card').innerHTML = calculateGame2Score(win, attemptNum - 1);

    // Show correct items
    activeCategories.forEach((cat, idx) => {
        const container = document.getElementById(`${cat}-correct`);
        if (container) {
            const img = document.createElement('img');
            img.src = `assets/cabinet/${cat}-${correctValues[idx]}.png`;
            container.appendChild(img);
        }
    });
    
    document.getElementById('blackBackground_forGameHouses').style.zIndex = '10';

    // Hide pause and tutorial buttons
    document.getElementById('pause-btn').classList.remove('visible');
    document.getElementById('tutorial-btn').classList.remove('visible');
    document.getElementById('pause-overlay').classList.remove('active');

    // Stop BGM
    AudioManager.stopBGM();

    // Show correct combo on loss
    if (!win) {
        const comboContainer = document.getElementById('game2-correct-combo');
        if (comboContainer) {
            const comboItems = comboContainer.querySelector('.combo-items');
            if (comboItems) {
                comboItems.innerHTML = '';
                activeCategories.forEach((cat, idx) => {
                    const slot = document.createElement('div');
                    slot.className = 'combo-slot';
                    slot.innerHTML = `<img src="assets/cabinet/${cat}-${correctValues[idx]}.png" alt="Correct ${cat}">`;
                    comboItems.appendChild(slot);
                });
            }
            comboContainer.style.display = 'block';
        }
    }

    // Calculate and submit score (only on win)
    if (win) {
        AudioManager.playFinish(null);
        const finalScore = calculateGame2Score(win, attemptNum - 1);
        const playerName = getPlayerName();
        submitScoreGame2(playerName, finalScore, difficulty).then(result => {
            if (result && result.submitted) {
                // Check rank after submission
                getPlayerRank('leaderboard_game2', playerName, difficulty).then(rank => {
                    const rankEl = document.getElementById('game2-rank-display');
                    if (rankEl && rank !== null) {
                        if (rank <= 10) {
                            savePendingCelebration(2, difficulty, rank);
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

function calculateGame2Score(win, attemptsUsed) {
    if (!win) return 0;
    // More points for fewer attempts, bonus for harder difficulty
    const difficultyMultiplier = difficulty === "EASY" ? 1 : difficulty === "MEDIUM" ? 2 : 3;
    const baseScore = 1000;
    const attemptBonus = Math.max(0, (maxAttempts - attemptsUsed) * 150);
    return (baseScore + attemptBonus) * difficultyMultiplier;
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
    if (!overlay) return;

    AudioManager.playButtonPress();

    if (overlay.classList.contains('active')) {
        overlay.classList.remove('active');
        isPaused = false;
        AudioManager.resumeBGM();
    } else {
        overlay.classList.add('active');
        isPaused = true;
        AudioManager.pauseBGM();
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
    AudioManager.pauseBGM();
}

function closeTutorial() {
    const overlay = document.getElementById('tutorial-overlay');
    if (!overlay) return;
    overlay.classList.remove('active');
    AudioManager.resumeBGM();
    localStorage.setItem('gitlog_tutorial_game2_seen', 'true');
}