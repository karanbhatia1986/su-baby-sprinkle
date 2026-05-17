// Game State
let currentPlayer = null;
let currentQuestionIndex = 0;
let playerAnswers = [];
let gameSession = 'game_' + Date.now();

// Screen Navigation
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function showWelcome() {
    showScreen('welcome-screen');
}

function showPlayerJoin() {
    showScreen('player-join-screen');
    document.getElementById('player-name').focus();
}

function showHostLogin() {
    showScreen('host-login-screen');
    document.getElementById('host-password').focus();
}

// Player Functions
function startPlayerGame() {
    const playerName = document.getElementById('player-name').value.trim();

    if (!playerName) {
        alert('Please enter your name!');
        return;
    }

    currentPlayer = {
        name: playerName,
        id: 'player_' + Date.now(),
        timestamp: Date.now()
    };

    playerAnswers = [];
    currentQuestionIndex = 0;

    showScreen('player-game-screen');
    displayQuestion();
}

function displayQuestion() {
    if (currentQuestionIndex >= questions.length) {
        submitPlayerAnswers();
        return;
    }

    const question = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex) / questions.length) * 100;

    document.getElementById('progress-fill').style.width = progress + '%';
    document.getElementById('question-number').textContent =
        `Question ${currentQuestionIndex + 1} of ${questions.length}`;
    document.getElementById('question-text').textContent = question.question;

    const choicesContainer = document.getElementById('choices');
    choicesContainer.innerHTML = '';

    question.choices.forEach((choice, index) => {
        const button = document.createElement('button');
        const colorClass = index === 0 ? 'pink' : 'blue';
        button.className = `choice-btn ${colorClass}`;

        // Create heart icon
        const heartIcon = document.createElement('div');
        heartIcon.className = 'heart-icon';
        heartIcon.textContent = '💖';

        // Create choice text
        const choiceText = document.createElement('div');
        choiceText.className = 'choice-text';
        choiceText.textContent = choice;

        button.appendChild(heartIcon);
        button.appendChild(choiceText);
        button.onclick = () => selectAnswer(index);
        choicesContainer.appendChild(button);
    });
}

function selectAnswer(answerIndex) {
    const question = questions[currentQuestionIndex];

    playerAnswers.push({
        questionId: question.id,
        selectedAnswer: answerIndex,
        correctAnswer: question.correctAnswer,
        isCorrect: answerIndex === question.correctAnswer
    });

    currentQuestionIndex++;
    displayQuestion();
}

function submitPlayerAnswers() {
    const correctCount = playerAnswers.filter(a => a.isCorrect).length;
    const score = correctCount * 10;

    const playerData = {
        name: currentPlayer.name,
        score: score,
        correctAnswers: correctCount,
        totalQuestions: questions.length,
        answers: playerAnswers,
        timestamp: Date.now()
    };

    // Save to Firebase
    database.ref('players/' + currentPlayer.id).set(playerData)
        .then(() => {
            showScreen('thank-you-screen');
            confetti.continuous(3000);
            listenForScoreReveal();
        })
        .catch(error => {
            console.error('Error saving player data:', error);
            alert('Error submitting answers. Please try again.');
        });
}

function listenForScoreReveal() {
    database.ref('gameState/scoresRevealed').on('value', (snapshot) => {
        if (snapshot.val() === true) {
            displayPlayerScore();
        }
    });
}

function displayPlayerScore() {
    const correctCount = playerAnswers.filter(a => a.isCorrect).length;
    const score = correctCount * 10;

    const scoreDisplay = document.getElementById('player-score-display');
    scoreDisplay.innerHTML = `
        <h3>Your Score</h3>
        <div class="score">${score} points</div>
        <p>You got ${correctCount} out of ${questions.length} correct!</p>
    `;
    scoreDisplay.classList.remove('hidden');

    confetti.burst(200, window.innerWidth / 2, window.innerHeight / 2);
}

// Host Functions
function hostLogin() {
    const password = document.getElementById('host-password').value;

    if (password === HOST_PASSWORD) {
        showScreen('host-dashboard-screen');
        loadHostDashboard();
        setupRealtimeUpdates();
    } else {
        alert('Incorrect password!');
    }
}

function loadHostDashboard() {
    database.ref('players').once('value')
        .then(snapshot => {
            const players = [];
            snapshot.forEach(childSnapshot => {
                players.push(childSnapshot.val());
            });
            displayLeaderboard(players);
            displayGameStats(players);
        })
        .catch(error => {
            console.error('Error loading players:', error);
        });
}

function setupRealtimeUpdates() {
    database.ref('players').on('value', (snapshot) => {
        const players = [];
        snapshot.forEach(childSnapshot => {
            players.push(childSnapshot.val());
        });
        displayLeaderboard(players);
        displayGameStats(players);
    });
}

function displayLeaderboard(players) {
    const leaderboard = document.getElementById('leaderboard');

    if (players.length === 0) {
        leaderboard.innerHTML = '<p style="text-align: center; color: #999;">No players yet...</p>';
        return;
    }

    const sortedPlayers = players.sort((a, b) => b.score - a.score);

    leaderboard.innerHTML = sortedPlayers.map((player, index) => {
        const rankClass = index < 3 ? `rank-${index + 1}` : '';
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : (index + 1);

        return `
            <div class="leaderboard-item" style="animation-delay: ${index * 0.1}s">
                <div class="rank ${rankClass}">${medal}</div>
                <div class="player-name">${player.name}</div>
                <div class="player-score">${player.score} pts</div>
            </div>
        `;
    }).join('');
}

function displayGameStats(players) {
    const stats = document.getElementById('game-stats');

    if (players.length === 0) {
        stats.innerHTML = '<p style="text-align: center; color: #999;">No statistics available yet...</p>';
        return;
    }

    const totalPlayers = players.length;
    const avgScore = Math.round(players.reduce((sum, p) => sum + p.score, 0) / totalPlayers);
    const highestScore = Math.max(...players.map(p => p.score));
    const perfectScores = players.filter(p => p.score === 100).length;

    stats.innerHTML = `
        <div class="stat-item">
            <div class="stat-value">${totalPlayers}</div>
            <div class="stat-label">Total Players</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${avgScore}</div>
            <div class="stat-label">Average Score</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${highestScore}</div>
            <div class="stat-label">Highest Score</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${perfectScores}</div>
            <div class="stat-label">Perfect Scores</div>
        </div>
    `;
}

function revealScores() {
    database.ref('gameState/scoresRevealed').set(true)
        .then(() => {
            confetti.continuous(5000);
            alert('Scores revealed to all players! 🎉');
        })
        .catch(error => {
            console.error('Error revealing scores:', error);
            alert('Error revealing scores. Please try again.');
        });
}

function resetGame() {
    if (!confirm('Are you sure you want to reset the game? This will delete all player data.')) {
        return;
    }

    database.ref('players').remove()
        .then(() => {
            return database.ref('gameState/scoresRevealed').set(false);
        })
        .then(() => {
            loadHostDashboard();
            alert('Game reset successfully!');
        })
        .catch(error => {
            console.error('Error resetting game:', error);
            alert('Error resetting game. Please try again.');
        });
}

// Keyboard shortcuts
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const playerNameInput = document.getElementById('player-name');
        const hostPasswordInput = document.getElementById('host-password');

        if (document.getElementById('player-join-screen').classList.contains('active') &&
            document.activeElement === playerNameInput) {
            startPlayerGame();
        } else if (document.getElementById('host-login-screen').classList.contains('active') &&
                   document.activeElement === hostPasswordInput) {
            hostLogin();
        }
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Set initial game state
    database.ref('gameState/scoresRevealed').set(false).catch(err => {
        console.error('Error initializing game state:', err);
    });
});
