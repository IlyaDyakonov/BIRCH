// Конфигурация Telegram бота @TESTing_the_code_bot
const TELEGRAM_BOT_TOKEN = 'YOUR_BOT_TOKEN';
const TELEGRAM_CHAT_ID = 'YOUR_CHAT_ID';

// Состояние игры
let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X'; // X - игрок, O - компьютер
let gameActive = true;
let playerSymbol = 'X';
let computerSymbol = 'O';

// Элементы DOM
const cells = document.querySelectorAll('.cell');
const resetBtn = document.getElementById('resetBtn');
const winModal = document.getElementById('winModal');
const loseModal = document.getElementById('loseModal');
const drawModal = document.getElementById('drawModal');
const promoCodeElement = document.getElementById('promoCode');
const currentTurnElement = document.getElementById('current-turn');

// Инициализация игры
function initGame() {
    cells.forEach((cell, index) => {
        cell.addEventListener('click', () => handleCellClick(index));
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'disabled');
    });
    resetBtn.addEventListener('click', resetGame);
    document.getElementById('playAgainWin').addEventListener('click', resetGame);
    document.getElementById('playAgainLose').addEventListener('click', resetGame);
    document.getElementById('playAgainDraw').addEventListener('click', resetGame);
    
    resetGame();
}

// Сброс игры
function resetGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;
    updateDisplay();
    closeAllModals();
    
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'disabled');
    });
}

// Обработка клика по ячейке
function handleCellClick(index) {
    if (board[index] !== '' || !gameActive || currentPlayer !== 'X') {
        return;
    }

    makeMove(index, playerSymbol);
    
    if (checkGameOver()) {
        return;
    }

    // Ход компьютера
    setTimeout(() => {
        if (gameActive) {
            computerMove();
            checkGameOver();
        }
    }, 500);
}

// Сделать ход
function makeMove(index, symbol) {
    board[index] = symbol;
    cells[index].textContent = symbol;
    cells[index].classList.add(symbol.toLowerCase());
    cells[index].classList.add('disabled');
    currentPlayer = symbol === 'X' ? 'O' : 'X';
    updateDisplay();
}

// Ход компьютера (простой AI)
function computerMove() {
    // Сначала проверяем, может ли компьютер выиграть
    let move = findWinningMove(computerSymbol);
    
    // Если нет, проверяем, нужно ли блокировать игрока
    if (move === -1) {
        move = findWinningMove(playerSymbol);
    }
    
    // Если нет, выбираем лучший ход
    if (move === -1) {
        move = findBestMove();
    }
    
    if (move !== -1) {
        makeMove(move, computerSymbol);
    }
}

// Поиск выигрышного хода
function findWinningMove(symbol) {
    for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
            board[i] = symbol;
            if (checkWinner(symbol)) {
                board[i] = '';
                return i;
            }
            board[i] = '';
        }
    }
    return -1;
}

// Поиск лучшего хода
function findBestMove() {
    // Приоритет: центр, углы, стороны
    const priorities = [4, 0, 2, 6, 8, 1, 3, 5, 7];
    
    for (let i of priorities) {
        if (board[i] === '') {
            return i;
        }
    }
    return -1;
}

// Проверка выигрыша
function checkWinner(symbol) {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Горизонтали
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Вертикали
        [0, 4, 8], [2, 4, 6]             // Диагонали
    ];

    return winPatterns.some(pattern => {
        return pattern.every(index => board[index] === symbol);
    });
}

// Проверка ничьей
function checkDraw() {
    return board.every(cell => cell !== '');
}

// Проверка окончания игры
function checkGameOver() {
    if (checkWinner(playerSymbol)) {
        gameActive = false;
        handleWin();
        return true;
    }
    
    if (checkWinner(computerSymbol)) {
        gameActive = false;
        handleLose();
        return true;
    }
    
    if (checkDraw()) {
        gameActive = false;
        handleDraw();
        return true;
    }
    
    return false;
}

// Обработка победы
function handleWin() {
    const promoCode = generatePromoCode();
    promoCodeElement.textContent = promoCode;
    showModal(winModal);
    sendTelegramMessage(`Победа! Промокод выдан: ${promoCode}`);
}

// Обработка проигрыша
function handleLose() {
    showModal(loseModal);
    sendTelegramMessage('Проигрыш! :(');
}

// Обработка ничьей
function handleDraw() {
    showModal(drawModal);
    sendTelegramMessage('Ничья это маленькая победа...)');
}

// Генерация промокода
function generatePromoCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Исключаем похожие символы
    let code = '';
    for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Показать модальное окно
function showModal(modal) {
    modal.classList.add('show');
}

// Закрыть все модальные окна
function closeAllModals() {
    winModal.classList.remove('show');
    loseModal.classList.remove('show');
    drawModal.classList.remove('show');
}

// Обновить отображение
function updateDisplay() {
    if (currentPlayer === 'X') {
        currentTurnElement.textContent = 'Ваш ход';
    } else {
        currentTurnElement.textContent = 'Ход компьютера...';
    }
}

// Отправка сообщения в Telegram
async function sendTelegramMessage(message) {
    // Проверяем, настроен ли бот
    if (TELEGRAM_BOT_TOKEN === 'YOUR_BOT_TOKEN' || TELEGRAM_CHAT_ID === 'YOUR_CHAT_ID') {
        console.log('Telegram бот не настроен. Сообщение:', message);
        return;
    }

    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message
            })
        });

        if (!response.ok) {
            console.error('Ошибка отправки сообщения в Telegram');
        }
    } catch (error) {
        console.error('Ошибка при отправке сообщения:', error);
    }
}

// Запуск игры при загрузке страницы
initGame();

