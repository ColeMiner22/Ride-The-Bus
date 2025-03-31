// Game state variables
let coins = 2000;
let currentBet = 0;
let potentialWinnings = 0; // Track potential winnings
let round = 1;
let gameActive = false;
let timeLeft = 15;
let timer = null;
let currentPlayer = 1;
let totalPlayers = 1;
let currentCard = null;
let nextCard = null;
let cardHistory = []; // Array to store all cards drawn

// DOM elements
const bettingArea = document.getElementById('betting');
const gameArea = document.getElementById('game-area');
const betAmountInput = document.getElementById('bet-amount');
const placeBetBtn = document.getElementById('place-bet');
const coinsSpan = document.getElementById('coins');
const currentBetSpan = document.getElementById('current-bet');
const roundInfo = document.getElementById('round-info');
const timerElement = document.getElementById('timer');
const messageElement = document.getElementById('message');
const cardDisplay = document.getElementById('card-display');
const nextCardDisplay = document.getElementById('next-card-display');
const cardHistoryDisplay = document.getElementById('card-history-display');
const cashoutBtn = document.getElementById('cashout-btn');
const restartBtn = document.getElementById('restart-btn');
const playerInfo = document.getElementById('player-info');

// Player statistics
const playerStats = [
    { totalWins: 0, totalLosses: 0, totalEarnings: 0, bestWin: 0 }
];

// Sound effects
const sounds = {
    win: new Audio('assets/win.mp3'),
    lose: new Audio('assets/lose.mp3'),
    click: new Audio('assets/click.mp3'),
    timer: new Audio('assets/timer.mp3')
};

// Generate a random card
function generateCard() {
    const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const suit = suits[Math.floor(Math.random() * suits.length)];
    const value = values[Math.floor(Math.random() * values.length)];
    const color = (suit === 'Hearts' || suit === 'Diamonds') ? 'red' : 'black';
    
    return {
        suit,
        value,
        color,
        numericValue: getNumericValue(value)
    };
}

// Get numeric value for card comparison
function getNumericValue(value) {
    const values = {
        '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
        'J': 11, 'Q': 12, 'K': 13, 'A': 14
    };
    return values[value];
}

// Display a card in the UI
function displayCard(card, displayElement) {
    displayElement.innerHTML = `
        <div class="card ${card.color}">
            <div class="card-value">${card.value}</div>
            <div class="card-suit">${getSuitSymbol(card.suit)}</div>
        </div>
    `;
}

// Get suit symbol for display
function getSuitSymbol(suit) {
    const symbols = {
        'Hearts': '♥',
        'Diamonds': '♦',
        'Clubs': '♣',
        'Spades': '♠'
    };
    return symbols[suit];
}

// Add a card to history
function addToHistory(card) {
    cardHistory.push(card);
    updateCardHistory();
}

// Update the card history display
function updateCardHistory() {
    cardHistoryDisplay.innerHTML = cardHistory.map(card => `
        <div class="card ${card.color}">
            <div class="card-value">${card.value}</div>
            <div class="card-suit">${getSuitSymbol(card.suit)}</div>
        </div>
    `).join('');
}

// Place a bet and start the game
function placeBet() {
    const betAmount = parseInt(betAmountInput.value);
    
    if (isNaN(betAmount) || betAmount < 10 || betAmount > 500) {
        messageElement.textContent = 'Please enter a valid bet amount between $10 and $500';
        messageElement.className = 'message error';
        return;
    }
    
    if (betAmount > coins) {
        messageElement.textContent = 'You don\'t have enough coins!';
        messageElement.className = 'message error';
        return;
    }
    
    currentBet = betAmount;
    coins -= betAmount;
    updateUI();
    
    // Hide betting area and show game area
    bettingArea.style.display = 'none';
    gameArea.style.display = 'block';
    
    // Start the game
    startGame();
}

// Start the game by showing the first round
function startGame() {
    console.log('Setting up game...');
    gameActive = true;
    cardHistory = []; // Reset card history
    
    // Show game area and its elements
    gameArea.style.display = 'block';
    gameArea.style.visibility = 'visible';
    gameArea.style.opacity = '1';
    
    // Show/hide appropriate buttons
    cashoutBtn.style.display = 'block';
    restartBtn.style.display = 'none';
    
    // Reset round and start game
    round = 1;
    console.log('Starting first round...');
    nextRound();
}

// Move to the next round
function nextRound() {
    console.log('Setting up round', round);
    
    // Generate only the current card
    currentCard = generateCard();
    nextCard = null; // Reset next card
    
    // Display only one face-down card
    cardDisplay.innerHTML = '<div class="card face-down"><div class="card-value">?</div></div>';
    nextCardDisplay.innerHTML = ''; // Clear the next card display
    
    // Update round info
    roundInfo.textContent = `Round ${round}`;
    
    // Show appropriate buttons
    showRoundButtons();
    
    // Start timer
    startTimer();
}

// Show only the buttons relevant to the current round
function showRoundButtons() {
    console.log('Showing buttons for round', round);
    
    // Hide all button groups first
    const allButtonGroups = document.querySelectorAll('.round-1-buttons, .round-2-buttons, .round-3-buttons, .round-4-buttons');
    allButtonGroups.forEach(group => {
        group.style.display = 'none';
        console.log('Hiding button group:', group.className);
    });

    // Show only the relevant button group
    const currentButtonGroup = document.querySelector(`.round-${round}-buttons`);
    if (currentButtonGroup) {
        currentButtonGroup.style.display = 'flex';
        currentButtonGroup.style.justifyContent = 'center';
        currentButtonGroup.style.gap = '10px';
        console.log('Showing button group:', currentButtonGroup.className);
    } else {
        console.error('Button group not found:', `round-${round}-buttons`);
    }
}

// Make a choice for the current round
function makeChoice(choice) {
    if (!gameActive) return;
    
    stopTimer();
    let correct = false;
    
    // Play click sound
    sounds.click.play();
    
    switch (round) {
        case 1:
            // For round 1, reveal current card
            displayCard(currentCard, cardDisplay);
            addToHistory(currentCard);
            correct = (choice === currentCard.color);
            if (correct) {
                handleWin();
            } else {
                handleLoss();
            }
            break;
            
        case 2:
            // For round 2, generate and reveal new card
            const newCard = generateCard();
            displayCard(newCard, cardDisplay);
            addToHistory(newCard);
            
            // Compare with round 1 card from history
            const round1Card = cardHistory[0];
            correct = (choice === 'higher' && newCard.numericValue > round1Card.numericValue) ||
                     (choice === 'lower' && newCard.numericValue < round1Card.numericValue);
            
            if (correct) {
                handleWin();
            } else {
                handleLoss();
            }
            break;
            
        case 3:
            // For round 3, generate and reveal new card
            const round3Card = generateCard();
            displayCard(round3Card, cardDisplay);
            addToHistory(round3Card);
            
            // Compare with round 1 and 2 cards from history
            const round1Value = cardHistory[0].numericValue;
            const round2Value = cardHistory[1].numericValue;
            const minValue = Math.min(round1Value, round2Value);
            const maxValue = Math.max(round1Value, round2Value);
            
            correct = (choice === 'inside' && round3Card.numericValue > minValue && round3Card.numericValue < maxValue) ||
                     (choice === 'outside' && (round3Card.numericValue < minValue || round3Card.numericValue > maxValue));
            
            if (correct) {
                handleWin();
            } else {
                handleLoss();
            }
            break;
            
        case 4:
            // For round 4, generate and reveal new card
            const round4Card = generateCard();
            displayCard(round4Card, cardDisplay);
            addToHistory(round4Card);
            
            correct = (choice === round4Card.suit);
            if (correct) {
                handleWin();
            } else {
                handleLoss();
            }
            break;
    }
}

// Handle a win
function handleWin() {
    console.log('Handling win for round', round);
    sounds.win.play();
    
    // Calculate potential winnings based on round
    let roundWinnings = currentBet;
    switch (round) {
        case 1:
            roundWinnings *= 2;
            break;
        case 2:
            roundWinnings *= 3;
            break;
        case 3:
            roundWinnings *= 4;
            break;
        case 4:
            roundWinnings *= 20;
            break;
    }
    
    // Update potential winnings and current bet
    potentialWinnings = roundWinnings;
    currentBet = roundWinnings;
    
    // Update UI
    currentBetSpan.textContent = currentBet;
    
    // Show success message with potential winnings
    messageElement.textContent = `Correct! Potential winnings: $${potentialWinnings}!`;
    messageElement.className = 'message success';
    
    // Move to next round or end game
    if (round < 4) {
        round++;
        setTimeout(() => {
            // Clear displays for next round
            cardDisplay.innerHTML = '<div class="card face-down"><div class="card-value">?</div></div>';
            nextCardDisplay.innerHTML = '';
            nextRound();
        }, 2000);
    } else {
        // Game completed successfully - show big winning screen and add winnings
        setTimeout(() => {
            coins += potentialWinnings;
            coinsSpan.textContent = coins;
            messageElement.textContent = `🎉 CONGRATULATIONS! 🎉\nYou completed all rounds and won $${potentialWinnings}!`;
            messageElement.className = 'message success big-win';
            endGame(true);
        }, 2000);
    }
}

// Handle a loss
function handleLoss() {
    console.log('Handling loss for round', round);
    sounds.lose.play();
    
    // Reset current bet and potential winnings
    currentBet = 0;
    potentialWinnings = 0;
    
    // Update UI
    currentBetSpan.textContent = currentBet;
    
    // Show failure message
    messageElement.textContent = 'Wrong! Game Over!';
    messageElement.className = 'message error';
    
    // Update player stats
    playerStats[0].totalLosses++;
    
    // End game after delay
    setTimeout(() => {
        endGame(false);
    }, 2000);
}

// End the game
function endGame(won) {
    gameActive = false;
    stopTimer();
    
    // Show restart button and hide cashout
    cashoutBtn.style.display = 'none';
    restartBtn.style.display = 'block';
    
    // Update final message
    if (won) {
        messageElement.textContent = `Congratulations! You completed all rounds and won $${potentialWinnings}!`;
        messageElement.className = 'message success';
    } else {
        messageElement.textContent = `Game Over! You lost your bet of $${currentBet}.`;
        messageElement.className = 'message error';
    }
    
    // Reset round
    round = 1;
}

// Start the timer
function startTimer() {
    timeLeft = 15;
    updateTimer();
    
    timer = setInterval(() => {
        timeLeft--;
        updateTimer();
        
        if (timeLeft <= 0) {
            stopTimer();
            handleLoss();
        } else if (timeLeft <= 5) {
            sounds.timer.play();
            timerElement.classList.add('urgent');
        }
    }, 1000);
}

// Update the timer display
function updateTimer() {
    timerElement.textContent = `Time Left: ${timeLeft}s`;
}

// Stop the timer
function stopTimer() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
    timerElement.classList.remove('urgent');
}

// Update the UI
function updateUI() {
    coinsSpan.textContent = coins;
    currentBetSpan.textContent = currentBet;
    
    // Update player stats display
    const stats = playerStats[0];
    document.querySelector('#player-stats p:nth-child(2)').textContent = 
        `Wins: ${stats.totalWins} | Losses: ${stats.totalLosses}`;
    document.querySelector('#player-stats p:nth-child(3)').textContent = 
        `Total Earnings: $${stats.totalEarnings}`;
    document.querySelector('#player-stats p:nth-child(4)').textContent = 
        `Best Win: $${stats.bestWin}`;
}

// Event Listeners
placeBetBtn.addEventListener('click', placeBet);

// Round 1 buttons
document.getElementById('red-btn').addEventListener('click', () => makeChoice('red'));
document.getElementById('black-btn').addEventListener('click', () => makeChoice('black'));

// Round 2 buttons
document.getElementById('higher-btn').addEventListener('click', () => makeChoice('higher'));
document.getElementById('lower-btn').addEventListener('click', () => makeChoice('lower'));

// Round 3 buttons
document.getElementById('inside-btn').addEventListener('click', () => makeChoice('inside'));
document.getElementById('outside-btn').addEventListener('click', () => makeChoice('outside'));

// Round 4 buttons
document.getElementById('hearts-btn').addEventListener('click', () => makeChoice('Hearts'));
document.getElementById('diamonds-btn').addEventListener('click', () => makeChoice('Diamonds'));
document.getElementById('clubs-btn').addEventListener('click', () => makeChoice('Clubs'));
document.getElementById('spades-btn').addEventListener('click', () => makeChoice('Spades'));

// Action buttons
cashoutBtn.addEventListener('click', () => {
    if (gameActive) {
        // Add potential winnings to coins when cashing out
        coins += potentialWinnings;
        coinsSpan.textContent = coins;
        endGame(true);
    }
});

// Restart the game
function restartGame() {
    // Reset game state
    round = 1;
    gameActive = false;
    currentBet = 0;
    cardHistory = []; // Clear card history
    stopTimer();
    
    // Clear card displays
    cardDisplay.innerHTML = '';
    nextCardDisplay.innerHTML = '';
    cardHistoryDisplay.innerHTML = '';
    
    // Show betting area and hide game area
    bettingArea.style.display = 'block';
    gameArea.style.display = 'none';
    
    // Reset message
    messageElement.textContent = '';
    messageElement.className = 'message';
    
    // Update UI
    updateUI();
}

// Update event listeners
restartBtn.addEventListener('click', restartGame);
