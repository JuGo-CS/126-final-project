// ============================================================
// LEADERBOARD LOGIC
// Note: Supabase client is loaded from supabase-helper.js
// ============================================================

let currentBoard = 1;
let currentDifficulty = "ALL";
let hasAnimatedTopTen = false;
let pendingCelebration = null;
let celebrationTimer = null;

document.addEventListener("DOMContentLoaded", initializePage);

function initializePage(){
    document.querySelectorAll('#leaderboard-table-container table').forEach(table =>{
        table.classList.add('inactive-board');
    });

    // Determine initial board/difficulty from the player's last played game
    const lastPlayed = getLastPlayed();
    if (lastPlayed && (lastPlayed.game === 1 || lastPlayed.game === 2)) {
        currentBoard = lastPlayed.game;
        currentDifficulty = lastPlayed.difficulty || "ALL";
    }

    pendingCelebration = consumePendingCelebration();

    // Set initial active button (Game 1 is checked by default)
    const defaultBtn = document.getElementById(`leaderboard-game${currentBoard}-switch`);
    if (defaultBtn) defaultBtn.classList.add('active-btn');

    const radio = document.getElementById(`game${currentBoard}-radio`);
    if (radio) radio.checked = true;

    document.querySelectorAll('.diff-btn').forEach(btn => btn.classList.remove('active-diff'));
    const activeDiffBtn = document.querySelector(`.diff-btn[data-diff="${currentDifficulty}"]`);
    if (activeDiffBtn) activeDiffBtn.classList.add('active-diff');

    // Start homepage/leaderboard BGM
    AudioManager.playBGM('homepage');

    // Add hover + click SFX to leaderboard buttons
    document.querySelectorAll('#leaderboard-switch-button-container button').forEach(btn => {
        btn.addEventListener('mouseenter', () => AudioManager.playHover());
    });
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.addEventListener('mouseenter', () => AudioManager.playHover());
    });

    loadLeaderboardGame1();
    loadLeaderboardGame2();
}

function selectBoard(boardNum) {
    currentBoard = boardNum;
    const radio = document.getElementById(`game${boardNum}-radio`);
    if (radio) {
        radio.checked = true;
    }

    // Highlight the active button
    document.querySelectorAll('#leaderboard-switch-button-container button').forEach(btn => {
        btn.classList.remove('active-btn');
    });
    const activeBtn = document.getElementById(`leaderboard-game${boardNum}-switch`);
    if (activeBtn) {
        activeBtn.classList.add('active-btn');
    }

    AudioManager.playButtonPress();
}

function selectDifficulty(diff) {
    currentDifficulty = diff;
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.classList.remove('active-diff');
    });
    const activeDiff = document.querySelector(`.diff-btn[data-diff="${diff}"]`);
    if (activeDiff) activeDiff.classList.add('active-diff');

    AudioManager.playButtonPress();

    // Reload the current board
    if (currentBoard === 1) loadLeaderboardGame1();
    else loadLeaderboardGame2();
}

async function loadLeaderboardGame1() {
    try {
        let query = supabaseClient
            .from('leaderboard_game1')
            .select('*');

        if (currentDifficulty !== "ALL") {
            query = query.eq('rating', currentDifficulty);
        }

        const { data, error } = await query
            .order('score', { ascending: false })
            .limit(10);

        if (error) throw error;

        renderLeaderboard('leaderboard-game1-body', data, 'score');
    } catch (error) {
        document.getElementById("leaderboard-game1-body").innerHTML =
            `<tr><td colspan='3' class='error-message'>⚠️ Failed to load leaderboard (${error.message || "connection error"})</td></tr>`;
    }
}

async function loadLeaderboardGame2() {
    try {
        let query = supabaseClient
            .from('leaderboard_game2')
            .select('*');

        if (currentDifficulty !== "ALL") {
            query = query.eq('rating', currentDifficulty);
        }

        const { data, error } = await query
            .order('score', { ascending: false })
            .limit(10);

        if (error) throw error;

        renderLeaderboard('leaderboard-game2-body', data, 'score');
    } catch (error) {
        document.getElementById("leaderboard-game2-body").innerHTML =
            `<tr><td colspan='3' class='error-message'>⚠️ Failed to load leaderboard (${error.message || "connection error"})</td></tr>`;
    }
}

function renderLeaderboard(tbodyId, data, scoreField) {
    const tbody = document.getElementById(tbodyId);
    tbody.innerHTML = "";

    if (!data || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan='3' class='empty-message'>No leaders yet... Play your way to the top!</td></tr>`;
        return;
    }

    let currentRank = 0;
    let previousScore = null;
    const activeUsername = getPlayerName();
    let matchedRow = null;
    let matchedRank = null;

    data.forEach((row, index) => {
        const score = row[scoreField] ?? row.score ?? row.MG_highest_score ?? row.CB_highest_score ?? 0;

        // Dense rank: same score = same rank
        if (score !== previousScore) {
            currentRank = index + 1;
            previousScore = score;
        }

        const rank = currentRank;
        let rankClass = "";
        if (rank === 1) rankClass = "rank-gold";
        else if (rank === 2) rankClass = "rank-silver";
        else if (rank === 3) rankClass = "rank-bronze";

        const name = row.player_name || row.user_name || "Unknown";

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="rank-cell ${rankClass}">${rank}</td>
            <td class="name-cell">${escapeHtml(name)}</td>
            <td class="score-cell">${score}</td>
        `;
        tbody.appendChild(tr);

        if (name.toLowerCase() === activeUsername.toLowerCase()) {
            matchedRow = tr;
            matchedRank = rank;
        }
    });

    // Top 10 celebration — only fires once, only for the board matching the
    // pending celebration left by the game just finished.
    if (pendingCelebration && !hasAnimatedTopTen &&
        tbodyId === `leaderboard-game${pendingCelebration.game}-body` && matchedRow) {
        hasAnimatedTopTen = true;
        animateTopTenEntry(matchedRow, activeUsername, matchedRank);
        AudioManager.playFinish(matchedRank);
        triggerCelebration(matchedRank);
        celebrationTimer = setTimeout(() => {
            stopCelebration();
            celebrationTimer = null;
        }, 8000);
    }
}

// ============================================================
// TOP 10 ENTRY ANIMATION
// Zooms the player's username from a large centered badge down
// into its actual row position in the leaderboard.
// ============================================================
function animateTopTenEntry(rowEl, username, rank) {
    rowEl.classList.add('top10-target-row');

    const badge = document.createElement('div');
    badge.className = 'top10-zoom-badge';
    badge.innerHTML = `
        <span class="top10-zoom-medal">&#127942;</span>
        <span class="top10-zoom-name">${escapeHtml(username)}</span>
        <span class="top10-zoom-rank">Rank #${rank} &mdash; TOP 10!</span>
    `;
    document.body.appendChild(badge);

    requestAnimationFrame(() => {
        const rowRect = rowEl.getBoundingClientRect();
        badge.style.setProperty('--target-top', `${rowRect.top}px`);
        badge.style.setProperty('--target-left', `${rowRect.left}px`);
        badge.classList.add('animate-in');
    });

    AudioManager.playFinish(rank);

    setTimeout(() => {
        badge.remove();
        rowEl.classList.remove('top10-target-row');
        rowEl.classList.add('top10-settled-row');
        setTimeout(() => rowEl.classList.remove('top10-settled-row'), 800);
    }, 1400);
}

window.addEventListener('beforeunload', () => {
    if (celebrationTimer) {
        clearTimeout(celebrationTimer);
        celebrationTimer = null;
    }
    stopCelebration();
});

// Helper: escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}