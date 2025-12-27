// Game Data
const questions = [
    { id: 1, image: "assets/mecburi_yaya.png", text: "Bu levha ne anlama gelir?", options: ["Mecburi Yaya Yolu", "Okul Geçidi"], answer: "Mecburi Yaya Yolu" },
    { id: 2, image: "assets/sign_school.png", text: "Bu levha ne anlama gelir?", options: ["Okul Geçidi", "Park Yeri"], answer: "Okul Geçidi" },
    { id: 3, image: "assets/sign_pedestrian.png", text: "Bu levha ne anlama gelir?", options: ["Yaya Geçidi", "Yaya Giremez"], answer: "Yaya Geçidi" },
    { id: 4, image: "assets/ust_gecit.png", text: "Bu levha ne anlama gelir?", options: ["Üst Geçit", "Alt Geçit"], answer: "Üst Geçit" },
    { id: 5, image: "assets/yaya_giremez.png", text: "Bu levha ne anlama gelir?", options: ["Yaya Giremez", "Yaya Geçebilir"], answer: "Yaya Giremez" },
    { id: 6, image: "assets/alt_gecit.png", text: "Bu levha ne anlama gelir?", options: ["Alt Geçit", "Üst Geçit"], answer: "Alt Geçit" },
    { id: 7, image: "assets/isikli.png", text: "Bu levha ne anlama gelir?", options: ["Işıklı İşaret Cihazı", "Bisiklet geçebilir"], answer: "Işıklı İşaret Cihazı" },
    { id: 8, image: "assets/mecburi_bisiklet.png", text: "Bu levha ne anlama gelir?", options: ["Mecburi Bisiklet Yolu", "Park Yeri"], answer: "Mecburi Bisiklet Yolu" },
    { id: 9, image: "assets/bisikletgiremez.png", text: "Bu levha ne anlama gelir?", options: ["Bisiklet Giremez", "Bisiklet Geçebilir"], answer: "Bisiklet Giremez" },
    { id: 10, image: "assets/uyari_okul.png", text: "Bu levha ne anlama gelir?", options: ["Okul Geçidi Var", "Yaya Geçidi Var"], answer: "Okul Geçidi Var" },
    { id: 11, image: "assets/uyari_yaya_gecidi.png", text: "Bu levha ne anlama gelir?", options: ["Yaya Geçidi Var", "Okul Geçidi Var"], answer: "Yaya Geçidi Var" },
];

// Positions corresponding to 0 to 100 points
// Zebra Crossings are at approx: 25%, 55%, 82%
// We ensure cars stop BEFORE or AFTER, not ON them.
const carVisualPositions = [
    12, // 0 pts (Start after intro)
    22, // 10 pts (Before 25% Zebra)
    35, // 20 pts (Jump over Zebra)
    44, // 30 pts
    52, // 40 pts (Before 55% Zebra)
    64, // 50 pts (Jump over Zebra)
    72, // 60 pts
    79, // 70 pts (Before 82% Zebra)
    88, // 80 pts (Jump over Zebra)
    94, // 90 pts
    98  // 100 pts (Finish)
];

let state = {
    mode: 1,
    players: [],
    gameActive: false,
    questions: { p1: null, p2: null }
};

// Elements
const startScreen = document.getElementById('start-screen');
const endScreen = document.getElementById('end-screen');

function startGame(mode) {
    state.mode = mode;
    state.gameActive = true;
    startScreen.classList.add('hidden');
    endScreen.classList.add('hidden');

    // Reveal Game World
    document.getElementById('game-area').classList.remove('hidden');
    document.getElementById('main-traffic-light-1').classList.remove('hidden');
    if (mode === 2) document.getElementById('main-traffic-light-2').classList.remove('hidden');

    // Init Players
    state.players = [
        { id: 1, score: 0, position: 0, finished: false, askedIndices: [] }
    ];

    // Reset UI P1
    updateScore(1, 0);
    resetCar(1);
    setLaneLights(1, 'red');

    // UI Layout Adjustment
    const p1Board = document.getElementById('p1-quiz-board');
    if (mode === 1) {
        document.getElementById('lane-2').classList.add('d-none');
        document.getElementById('score-board-2').style.display = 'none';
        document.getElementById('p2-quiz-board').style.display = 'none';

        // Center P1 Board for Single Player
        p1Board.classList.add('centered');
    } else {
        // Multi Player Setup
        state.players.push({ id: 2, score: 0, position: 0, finished: false, askedIndices: [] });

        document.getElementById('lane-2').classList.remove('d-none');
        document.getElementById('score-board-2').style.display = 'block';
        document.getElementById('p2-quiz-board').style.display = 'block';

        // Reset specific styling
        p1Board.classList.remove('centered');

        updateScore(2, 0);
        resetCar(2);
        setLaneLights(2, 'red');
    }

    // Hide boards initially until intro drive
    p1Board.classList.add('hidden');
    if (mode === 2) document.getElementById('p2-quiz-board').classList.add('hidden');

    // Start Sequence
    startCountdown();
}

function startCountdown() {
    const overlay = document.getElementById('countdown-overlay');
    const text = document.getElementById('countdown-text');
    overlay.classList.remove('hidden');

    // Ensure lights are hidden/revealed correctly based on mode is already handled in startGame
    // But we need to ensure they are VISIBLE here if startGame used hidden
    // Actually startGame already did remove('hidden')

    let count = 3;
    text.textContent = count;

    const interval = setInterval(() => {
        count--;
        if (count > 0) {
            text.textContent = count;
        } else {
            clearInterval(interval);
            text.textContent = "BAŞLA!";
            setTimeout(() => {
                overlay.classList.add('hidden');
                startIntroDrive();
            }, 1000);
        }
    }, 1000);
}

function startIntroDrive() {
    // Green lights for drive
    setLaneLights(1, 'green');
    if (state.mode === 2) setLaneLights(2, 'green');

    // Animate Cars to starting question position (approx 12%)
    const car1 = document.getElementById('car-1');
    car1.style.bottom = '12%';

    if (state.mode === 2) {
        document.getElementById('car-2').style.bottom = '12%';
    }

    // Wait for drive (1.5s) then stop and ask questions
    setTimeout(() => {
        setLaneLights(1, 'red');
        if (state.mode === 2) setLaneLights(2, 'red');

        // Show Boards
        document.getElementById('p1-quiz-board').classList.remove('hidden');
        if (state.mode === 2) document.getElementById('p2-quiz-board').classList.remove('hidden');

        // Start independent loops
        askQuestion(1);
        if (state.mode === 2) askQuestion(2);

    }, 1500);
}


function resetCar(playerId) {
    const car = document.getElementById(`car-${playerId}`);
    if (car) car.style.bottom = '5%';
}

function askQuestion(playerId) {
    if (!state.gameActive) return;
    const player = state.players[playerId - 1];
    if (player.finished) return;

    // Filter unasked questions
    let availableIndices = [];
    for (let i = 0; i < questions.length; i++) {
        if (!player.askedIndices.includes(i)) {
            availableIndices.push(i);
        }
    }

    // Reset if all questions used
    if (availableIndices.length === 0) {
        player.askedIndices = [];
        for (let i = 0; i < questions.length; i++) {
            availableIndices.push(i);
        }
    }

    // Pick random from available
    const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    player.askedIndices.push(randomIndex);

    const q = questions[randomIndex];
    state.questions[`p${playerId}`] = q;

    updateQuizUI(playerId, q);
    setLaneLights(playerId, 'red'); // Lights red while thinking
}

function updateQuizUI(playerId, question) {
    const prefix = `p${playerId}`;
    document.getElementById(`${prefix}-image`).src = question.image;
    document.getElementById(`${prefix}-text`).textContent = question.text;

    const fb = document.getElementById(`${prefix}-feedback`);
    fb.classList.add('hidden');
    fb.innerHTML = "";

    const optsDiv = document.getElementById(`${prefix}-options`);
    optsDiv.innerHTML = '';
    optsDiv.classList.remove('hidden'); // Show options

    // Shuffle options
    const shuffledOptions = [...question.options].sort(() => Math.random() - 0.5);

    shuffledOptions.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'btn';
        btn.textContent = opt;
        btn.onclick = () => handleInput(playerId, opt);
        optsDiv.appendChild(btn);
    });

    // Reset Header status
    const title = document.querySelector(`#${prefix}-quiz-board .q-title`);
    if (title) title.textContent = "Cevap Bekleniyor...";
    const icon = document.querySelector(`#${prefix}-quiz-board .traffic-light-icon`);
    if (icon) icon.textContent = "🔴";
}

function handleInput(playerId, selection) {
    if (!state.gameActive) return;

    const prefix = `p${playerId}`;
    const question = state.questions[prefix];
    const isCorrect = selection === question.answer;

    // Disable buttons
    const optsDiv = document.getElementById(`${prefix}-options`);
    const buttons = optsDiv.querySelectorAll('button');
    buttons.forEach(b => b.disabled = true);

    const fb = document.getElementById(`${prefix}-feedback`);
    fb.classList.remove('hidden');

    if (isCorrect) {
        fb.innerHTML = "<span style='color:#2ed573'>Doğru! 🟢</span>";
        processSuccess(playerId);

        // Visuals
        document.querySelector(`#${prefix}-quiz-board .traffic-light-icon`).textContent = "🟢";
        document.querySelector(`#${prefix}-quiz-board .q-title`).textContent = "Harika!";
    } else {
        fb.innerHTML = "<span style='color:#ff7675'>Yanlış! 🔴</span>";
        document.querySelector(`#${prefix}-quiz-board .q-title`).textContent = "Tekrar Dene!";
        // No penalty, just wait
    }

    // Delay next question
    setTimeout(() => {
        // Hide Board while moving
        document.getElementById(`${prefix}-quiz-board`).classList.add('hidden');

        // Wait another 1.5s for movement then show next question
        setTimeout(() => {
            if (state.gameActive) {
                document.getElementById(`${prefix}-quiz-board`).classList.remove('hidden');
                askQuestion(playerId);
            }
        }, 1500);
    }, 1000); // 1s to read feedback
}

function processSuccess(playerId) {
    const player = state.players[playerId - 1];
    player.score += 10;
    player.position++;

    updateScore(playerId, player.score);
    updateCarPosition(playerId, player.position);

    setLaneLights(playerId, 'green'); // Flash green for movement

    checkWinCondition(playerId);
}

function updateScore(playerId, score) {
    const el = document.querySelector(`#score-board-${playerId} .score-value`);
    if (el) el.textContent = `${score} Puan`;
}

function updateCarPosition(playerId, pos) {
    const car = document.getElementById(`car-${playerId}`);
    if (car && pos < carVisualPositions.length) {
        car.style.bottom = `${carVisualPositions[pos]}%`;
    } else if (car) {
        // Finished visual
        car.style.bottom = '95%';
    }
}

function setLaneLights(playerId, color) {
    // Select lights specific to this lane
    const lane = document.getElementById(`lane-${playerId}`);
    const lights = lane.querySelectorAll('.light-box');
    const mainLight = document.getElementById(`main-traffic-light-${playerId}`);

    const clsAdd = color === 'green' ? ['can-go', 'stop'] : ['stop', 'can-go'];

    // Update lane lights
    lights.forEach(l => {
        l.classList.add(clsAdd[0]);
        l.classList.remove(clsAdd[1]);
    });

    // Update main light (at the top of the lane)
    if (mainLight) {
        mainLight.classList.add(clsAdd[0]);
        mainLight.classList.remove(clsAdd[1]);
    }
}

function checkWinCondition(playerId) {
    const player = state.players[playerId - 1];

    // Win at 100 points
    if (player.score >= 100) {
        player.finished = true;
        endGame(playerId);
    }
}

function endGame(winnerId) {
    state.gameActive = false;

    // Force Hide Quiz Boards & Traffic Lights
    document.getElementById('p1-quiz-board').classList.add('hidden');
    document.getElementById('p2-quiz-board').classList.add('hidden');
    document.getElementById('main-traffic-light-1').classList.add('hidden');
    document.getElementById('main-traffic-light-2').classList.add('hidden');

    endScreen.classList.remove('hidden');

    const winnerText = document.getElementById('winner-text');
    if (state.mode === 1) {
        winnerText.textContent = "Tebrikler! Yolu Tamamladın! 🎉";
    } else {
        winnerText.textContent = `Oyuncu ${winnerId} Kazandı! 🏆`;
    }

    let sub = `Oyuncu 1: ${state.players[0].score}`;
    if (state.mode === 2) sub += ` | Oyuncu 2: ${state.players[1].score}`;
    document.getElementById('final-score').textContent = sub;
}
