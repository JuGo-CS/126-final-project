// ============================================================
// GITLOG GOURMET - Supabase Helper
// ============================================================
// Shared Supabase client and score submission functions.
// ============================================================

// ============================================================
// CELEBRATION EFFECTS (confetti + rank reveal)
// ============================================================
function triggerCelebration(rank) {
    // Create confetti container
    const container = document.createElement('div');
    container.className = 'celebration-container';
    container.id = 'celebration-container';
    document.body.appendChild(container);

    const colors = ['#FFD700', '#FF6B6B', '#4CAF50', '#2196F3', '#FF9800', '#E040FB', '#FF4081', '#00E5FF'];

    // Spawn confetti in waves for continuous effect
    let confettiInterval;
    function spawnConfettiWave() {
        for (let i = 0; i < 12; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.width = (Math.random() * 10 + 4) + 'px';
            confetti.style.height = (Math.random() * 10 + 4) + 'px';
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
            confetti.style.animationDuration = (Math.random() * 2 + 2.5) + 's';
            confetti.style.animationDelay = '0s';
            container.appendChild(confetti);

            // Remove each piece after its animation ends
            setTimeout(() => {
                if (confetti.parentNode) confetti.parentNode.removeChild(confetti);
            }, 4500);
        }
    }

    // Spawn waves every 300ms for continuous confetti
    spawnConfettiWave();
    confettiInterval = setInterval(spawnConfettiWave, 300);

    // Create big rank reveal
    const reveal = document.createElement('div');
    reveal.className = 'rank-reveal';
    let rankText = '';
    let medalEmoji = '';
    if (rank === 1) { medalEmoji = '&#129351;'; rankText = '1st'; }
    else if (rank === 2) { medalEmoji = '&#129352;'; rankText = '2nd'; }
    else if (rank === 3) { medalEmoji = '&#129353;'; rankText = '3rd'; }
    else { medalEmoji = '&#127775;'; rankText = rank + 'th'; }

    reveal.innerHTML = `
        <div class="big-rank">
            ${medalEmoji} #${rankText}
            <span class="big-rank-label">TOP 10!</span>
        </div>
    `;
    document.body.appendChild(reveal);

    // Clean up the reveal after animation, but keep confetti going
    setTimeout(() => {
        if (reveal.parentNode) reveal.parentNode.removeChild(reveal);
    }, 3500);

    // Store the interval so it can be stopped later
    window._confettiInterval = confettiInterval;
}

// Call this when user clicks home, restart, or leaderboard
function stopCelebration() {
    if (window._confettiInterval) {
        clearInterval(window._confettiInterval);
        window._confettiInterval = null;
    }
    const container = document.getElementById('celebration-container');
    if (container && container.parentNode) {
        container.parentNode.removeChild(container);
    }
}

// ============================================================
// SUPABASE CONFIGURATION
// ============================================================
const SUPABASE_URL = "https://jfvhcgloqrpjfdzuxusd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmdmhjZ2xvcXJwamZkenV4dXNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NzEyMDAsImV4cCI6MjA5ODM0NzIwMH0.YUem8NqBAySlw5tOKba_LoEvyatPw9mjr2PxO3HVFfY";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================================
// CHECK IF USERNAME EXISTS IN DATABASE
// Checks both leaderboard tables for the given username.
// ============================================================
async function checkUsernameExistsInDB(username) {
    if (!username) return false;
    try {
        const { data: data1, error: error1 } = await supabaseClient
            .from('leaderboard_game1')
            .select('player_name')
            .ilike('player_name', username)
            .maybeSingle();

        if (data1) return true;

        const { data: data2, error: error2 } = await supabaseClient
            .from('leaderboard_game2')
            .select('player_name')
            .ilike('player_name', username)
            .maybeSingle();

        if (data2) return true;

        return false;
    } catch (error) {
        console.error("Error checking username in DB:", error);
        return false; // Fail open — allow if DB check fails
    }
}

// ============================================================
// GET CURRENT PLAYER NAME
// ============================================================
function getPlayerName() {
    return localStorage.getItem("gitlog_active_username") || "Anonymous";
}

function saveLastPlayed(game, difficulty) {
    try {
        localStorage.setItem("gitlog_last_played", JSON.stringify({ game, difficulty }));
    } catch (e) { /* ignore */ }
}

function getLastPlayed() {
    try {
        const data = localStorage.getItem("gitlog_last_played");
        return data ? JSON.parse(data) : null;
    } catch (e) {
        return null;
    }
}

function savePendingCelebration(game, difficulty, rank) {
    try {
        localStorage.setItem("gitlog_pending_celebration", JSON.stringify({ game, difficulty, rank }));
    } catch (e) { /* ignore */ }
}

function consumePendingCelebration() {
    try {
        const data = localStorage.getItem("gitlog_pending_celebration");
        if (!data) return null;
        localStorage.removeItem("gitlog_pending_celebration");
        return JSON.parse(data);
    } catch (e) {
        return null;
    }
}

function getLastPlayed() {
    try {
        const data = localStorage.getItem("gitlog_last_played");
        return data ? JSON.parse(data) : null;
    } catch (e) {
        return null;
    }
}

// ============================================================
// SUBMIT SCORE — Game 1 (Matching Pairs)
// Only saves if the player won. Updates only if new score is higher.
// ============================================================
async function submitScoreGame1(playerName, score, difficulty) {
    if (!playerName || score <= 0) return false;
    // Normalize for case-insensitive matching
    const normalizedName = playerName.trim();
    try {
        // Fetch all rows for this player to find matching name + difficulty
        const { data: allRows, error: fetchError } = await supabaseClient
            .from('leaderboard_game1')
            .select('score, player_name, rating');

        if (fetchError) {
            console.error("Error checking existing score:", fetchError);
        }

        // Find existing entry with same name AND same difficulty (case-insensitive)
        const existing = allRows ? allRows.find(r => 
            r.player_name.toLowerCase() === normalizedName.toLowerCase() &&
            r.rating === difficulty
        ) : null;

        if (existing && score <= existing.score) {
            console.log(`Score not submitted — ${normalizedName}'s existing ${difficulty} score (${existing.score}) is higher or equal.`);
            return { submitted: false, reason: 'existing_higher' };
        }

        if (existing) {
            // Delete old lower score for this specific difficulty
            const { error: deleteError } = await supabaseClient
                .from('leaderboard_game1')
                .delete()
                .eq('player_name', existing.player_name)
                .eq('rating', difficulty);
            
            if (deleteError) {
                console.error("Error deleting old score:", deleteError);
            }
        }

        // Insert new score
        const { data, error } = await supabaseClient
            .from('leaderboard_game1')
            .insert([
                {
                    player_name: playerName,
                    score: score,
                    rating: difficulty
                }
            ]);

        if (error) {
            console.error("Failed to submit Game 1 score:", error);
            return { submitted: false, reason: 'error' };
        }

        console.log("Game 1 score submitted successfully!", score);
        return { submitted: true };
    } catch (error) {
        console.error("Error submitting Game 1 score:", error);
        return { submitted: false, reason: 'error' };
    }
}

// ============================================================
// SUBMIT SCORE — Game 2 (Code Breaker)
// Only saves if the player won. Updates only if new score is higher.
// ============================================================
async function submitScoreGame2(playerName, score, difficulty) {
    if (!playerName || score <= 0) return false;
    // Normalize to lowercase for case-insensitive matching
    const normalizedName = playerName.trim();
    try {
        // Check existing score for this player (case-insensitive via JS)
        const { data: allRows, error: fetchError } = await supabaseClient
            .from('leaderboard_game2')
            .select('score, player_name, rating');

        if (fetchError) {
            console.error("Error checking existing score:", fetchError);
        }

        // Find existing entry with same name AND same difficulty (case-insensitive)
        const existing = allRows ? allRows.find(r => 
            r.player_name.toLowerCase() === normalizedName.toLowerCase() &&
            r.rating === difficulty
        ) : null;

        if (existing && score <= existing.score) {
            console.log(`Score not submitted — ${normalizedName}'s existing ${difficulty} score (${existing.score}) is higher or equal.`);
            return { submitted: false, reason: 'existing_higher' };
        }

        if (existing) {
            // Delete old lower score for this specific difficulty
            const { error: deleteError } = await supabaseClient
                .from('leaderboard_game2')
                .delete()
                .eq('player_name', existing.player_name)
                .eq('rating', difficulty);
            
            if (deleteError) {
                console.error("Error deleting old score:", deleteError);
            }
        }

        // Insert new score
        const { data, error } = await supabaseClient
            .from('leaderboard_game2')
            .insert([
                {
                    player_name: playerName,
                    score: score,
                    rating: difficulty
                }
            ]);

        if (error) {
            console.error("Failed to submit Game 2 score:", error);
            return { submitted: false, reason: 'error' };
        }

        console.log("Game 2 score submitted successfully!", score);
        return { submitted: true };
    } catch (error) {
        console.error("Error submitting Game 2 score:", error);
        return { submitted: false, reason: 'error' };
    }
}

// ============================================================
// CHECK LEADERBOARD RANK (for end-card display)
// Optionally filter by difficulty for difficulty-specific rankings.
// ============================================================
async function getPlayerRank(tableName, playerName, difficulty) {
    try {
        let query = supabaseClient
            .from(tableName)
            .select('player_name, score');

        if (difficulty) {
            query = query.eq('rating', difficulty);
        }

        const { data, error } = await query
            .order('score', { ascending: false })
            .limit(50);

        if (error || !data) return null;

        // Dense rank: players with same score share the same rank
        let currentRank = 0;
        let previousScore = null;

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            if (row.score !== previousScore) {
                currentRank = i + 1;
                previousScore = row.score;
            }
            if (row.player_name.toLowerCase() === playerName.toLowerCase()) {
                return currentRank;
            }
        }

        return null;
    } catch {
        return null;
    }
}

// ============================================================
// GET PERSONAL BEST SCORES for a player
// ============================================================
async function getPersonalBest(playerName) {
    if (!playerName) return null;
    const result = { game1: [], game2: [] };
    try {
        const { data: data1 } = await supabaseClient
            .from('leaderboard_game1')
            .select('score, rating')
            .eq('player_name', playerName)
            .order('score', { ascending: false });

        if (data1) {
            result.game1 = data1;
        }

        const { data: data2 } = await supabaseClient
            .from('leaderboard_game2')
            .select('score, rating')
            .eq('player_name', playerName)
            .order('score', { ascending: false });

        if (data2) {
            result.game2 = data2;
        }

        return result;
    } catch {
        return result;
    }
}
