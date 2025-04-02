// Variables globales del juego
let currentLevel = null;
let board = [];
let selectedCandy = null;
let score = 0;
let movesLeft = 0;
let objectives = {};
let gameActive = false;
let highestUnlockedLevel = 1;
let playerProgress = {};

// Colores disponibles para los caramelos
const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

// Elementos DOM
const mainMenu = document.getElementById('main-menu');
const levelSelect = document.getElementById('level-select');
const instructionsScreen = document.getElementById('instructions');
const gameScreen = document.getElementById('game-screen');
const victoryScreen = document.getElementById('victory-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const gameBoard = document.getElementById('game-board');
const currentLevelDisplay = document.getElementById('current-level');
const currentScoreDisplay = document.getElementById('current-score');
const movesLeftDisplay = document.getElementById('moves-left');
const objectivesContainer = document.getElementById('objectives-container');
const levelsContainer = document.getElementById('levels-container');
const finalScoreDisplay = document.getElementById('final-score');
const starsEarnedDisplay = document.getElementById('stars-earned');

// Función para mostrar una pantalla y ocultar las demás
function showScreen(screenToShow) {
    console.log("Mostrando pantalla:", screenToShow.id);
    
    // Ocultar todas las pantallas
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    
    // Mostrar la pantalla solicitada
    screenToShow.classList.remove('hidden');
}

// Inicializar los event listeners cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM cargado, inicializando event listeners");
    
    // Event listeners para la navegación entre pantallas
    document.getElementById('play-button').addEventListener('click', function() {
        console.log("Botón Jugar clickeado");
        showScreen(levelSelect);
        renderLevelSelect();
    });
    
    document.getElementById('instructions-button').addEventListener('click', function() {
        console.log("Botón Instrucciones clickeado");
        showScreen(instructionsScreen);
    });
    
    document.getElementById('back-to-menu').addEventListener('click', function() {
        console.log("Botón Volver al Menú clickeado");
        showScreen(mainMenu);
    });
    
    document.getElementById('back-from-instructions').addEventListener('click', function() {
        console.log("Botón Volver desde Instrucciones clickeado");
        showScreen(mainMenu);
    });
    
    document.getElementById('back-from-game').addEventListener('click', function() {
        console.log("Botón Salir del Nivel clickeado");
        if (confirm('¿Estás seguro de que quieres salir? Perderás tu progreso en este nivel.')) {
            gameActive = false;
            showScreen(levelSelect);
        }
    });
    
    document.getElementById('next-level-button').addEventListener('click', function() {
        console.log("Botón Siguiente Nivel clickeado");
        const nextLevelId = currentLevel.id + 1;
        if (nextLevelId <= LEVELS.length) {
            showScreen(gameScreen);
            startLevel(nextLevelId);
        } else {
            showScreen(levelSelect);
            renderLevelSelect();
        }
    });
    
    document.getElementById('level-select-button').addEventListener('click', function() {
        console.log("Botón Selección de Niveles clickeado");
        showScreen(levelSelect);
        renderLevelSelect();
    });
    
    document.getElementById('retry-button').addEventListener('click', function() {
        console.log("Botón Reintentar clickeado");
        startLevel(currentLevel.id);
    });
    
    document.getElementById('menu-button').addEventListener('click', function() {
        console.log("Botón Menú Principal clickeado");
        showScreen(mainMenu);
    });
    
    // Inicializar el juego
    initGame();
});

// Renderizar la selección de niveles
function renderLevelSelect() {
    console.log("Renderizando selección de niveles");
    levelsContainer.innerHTML = '';
    
    for (let i = 0; i < LEVELS.length; i++) {
        const level = LEVELS[i];
        const isUnlocked = i + 1 <= highestUnlockedLevel;
        
        const levelButton = document.createElement('div');
        levelButton.className = `level-button ${isUnlocked ? '' : 'locked'}`;
        
        const levelNumber = document.createElement('div');
        levelNumber.textContent = level.id;
        
        const levelStars = document.createElement('div');
        levelStars.className = 'level-stars';
        
        // Mostrar estrellas ganadas si el nivel ha sido completado
        if (playerProgress[level.id]) {
            const starsEarned = playerProgress[level.id].stars;
            for (let j = 0; j < 3; j++) {
                const star = document.createElement('span');
                star.className = j < starsEarned ? 'star' : 'empty-star';
                levelStars.appendChild(star);
            }
        } else {
            // Mostrar estrellas vacías para niveles no completados
            for (let j = 0; j < 3; j++) {
                const star = document.createElement('span');
                star.className = 'empty-star';
                levelStars.appendChild(star);
            }
        }
        
        levelButton.appendChild(levelNumber);
        levelButton.appendChild(levelStars);
        levelsContainer.appendChild(levelButton);
        
        if (isUnlocked) {
            levelButton.addEventListener('click', function() {
                console.log("Nivel seleccionado:", level.id);
                startLevel(level.id);
            });
        }
    }
}

// Iniciar un nivel
function startLevel(levelId) {
    console.log("Iniciando nivel:", levelId);
    const level = LEVELS.find(l => l.id === levelId);
    if (!level) return;
    
    currentLevel = level;
    board = [];
    selectedCandy = null;
    score = 0;
    movesLeft = level.moves;
    
    // Copiar objetivos
    objectives = {};
    for (const [color, count] of Object.entries(level.objectives)) {
        objectives[color] = count;
    }
    
    // Actualizar la interfaz
    currentLevelDisplay.textContent = level.id;
    currentScoreDisplay.textContent = score;
    movesLeftDisplay.textContent = movesLeft;
    updateObjectivesDisplay();
    
    // Crear el tablero
    createBoard();
    renderBoard();
    
    // Mostrar la pantalla de juego
    showScreen(gameScreen);
    
    // Activar el juego
    gameActive = true;
}

// Crear el tablero de juego
function createBoard() {
    console.log("Creando tablero:", currentLevel.rows, "x", currentLevel.cols);
    board = [];
    
    // Inicializar el tablero vacío
    for (let row = 0; row < currentLevel.rows; row++) {
        board[row] = [];
        for (let col = 0; col < currentLevel.cols; col++) {
            board[row][col] = null;
        }
    }
    
    // Llenar el tablero con colores aleatorios
    fillBoardRandomly();
    
    // Asegurarse de que no haya coincidencias iniciales
    while (checkForMatches()) {
        fillBoardRandomly();
    }
    
    // Asegurarse de que haya al menos un movimiento posible
    if (!hasPossibleMoves()) {
        fillBoardRandomly();
    }
}

// Llenar el tablero con colores aleatorios
function fillBoardRandomly() {
    for (let row = 0; row < currentLevel.rows; row++) {
        for (let col = 0; col < currentLevel.cols; col++) {
            board[row][col] = getRandomColor();
        }
    }
}

// Obtener un color aleatorio (con preferencia por los colores objetivo)
function getRandomColor() {
    // Lista de colores posibles, con duplicados para los que están en los objetivos
    // para aumentar la probabilidad de que aparezcan
    const possibleColors = [...COLORS];
    
    // Agregar duplicados para los colores que están en los objetivos
    for (const color in objectives) {
        if (objectives[color] > 0) {
            // Añadir una copia extra del color para aumentar su probabilidad
            possibleColors.push(color);
        }
    }
    
    return possibleColors[Math.floor(Math.random() * possibleColors.length)];
}

// Renderizar el tablero en la interfaz
function renderBoard() {
    console.log("Renderizando tablero");
    
    // Configurar el estilo de la cuadrícula basado en el tamaño del nivel
    gameBoard.style.gridTemplateColumns = `repeat(${currentLevel.cols}, 1fr)`;
    gameBoard.style.gridTemplateRows = `repeat(${currentLevel.rows}, 1fr)`;
    
    // Limpiar el tablero actual
    gameBoard.innerHTML = '';
    
    // Crear los elementos visuales para cada caramelo
    for (let row = 0; row < currentLevel.rows; row++) {
        for (let col = 0; col < currentLevel.cols; col++) {
            const candyElement = document.createElement('div');
            candyElement.className = `candy ${board[row][col]}`;
            candyElement.dataset.row = row;
            candyElement.dataset.col = col;
            
            // Agregar evento de click
            candyElement.addEventListener('click', function() {
                if (gameActive) {
                    selectCandy(row, col);
                }
            });
            
            gameBoard.appendChild(candyElement);
        }
    }
}

// Inicializar el juego
function initGame() {
    console.log("Inicializando juego");
    
    // Cargar progreso guardado (si existe)
    const savedProgress = localStorage.getItem('candyMatchProgress');
    if (savedProgress) {
        try {
            const parsed = JSON.parse(savedProgress);
            playerProgress = parsed.playerProgress || {};
            highestUnlockedLevel = parsed.highestUnlockedLevel || 1;
        } catch (e) {
            console.error("Error al cargar el progreso guardado:", e);
            playerProgress = {};
            highestUnlockedLevel = 1;
        }
    }
    
    // Mostrar la pantalla principal
    showScreen(mainMenu);
}

// Mejorar la función de selección de caramelos
function selectCandy(row, col) {
    if (!gameActive) return;
    
    // Si no hay caramelo seleccionado previamente, seleccionar este
    if (selectedCandy === null) {
        selectedCandy = { row, col };
        const candyElement = document.querySelector(`.candy[data-row="${row}"][data-col="${col}"]`);
        candyElement.classList.add('selected');
    } 
    // Si se selecciona el mismo caramelo, deseleccionarlo
    else if (selectedCandy.row === row && selectedCandy.col === col) {
        const candyElement = document.querySelector(`.candy[data-row="${selectedCandy.row}"][data-col="${selectedCandy.col}"]`);
        candyElement.classList.remove('selected');
        selectedCandy = null;
    } 
    // Si ya hay un caramelo seleccionado, intentar intercambio
    else {
        // Verificar si el caramelo seleccionado es adyacente al actual
        const isAdjacent = 
            (Math.abs(selectedCandy.row - row) === 1 && selectedCandy.col === col) ||
            (Math.abs(selectedCandy.col - col) === 1 && selectedCandy.row === row);
        
        if (isAdjacent) {
            // Intentar intercambio
            swapCandies(selectedCandy.row, selectedCandy.col, row, col);
        } else {
            // Deseleccionar el caramelo anterior y seleccionar el nuevo
            const previousCandy = document.querySelector(`.candy[data-row="${selectedCandy.row}"][data-col="${selectedCandy.col}"]`);
            previousCandy.classList.remove('selected');
            
            selectedCandy = { row, col };
            const newCandy = document.querySelector(`.candy[data-row="${row}"][data-col="${col}"]`);
            newCandy.classList.add('selected');
        }
    }
}

// Mejorar la función de intercambio de caramelos
function swapCandies(row1, col1, row2, col2) {
    // Desactivar interacción durante la animación
    gameActive = false;
    
    // Deseleccionar el caramelo
    const selectedCandyElement = document.querySelector(`.candy[data-row="${row1}"][data-col="${col1}"]`);
    selectedCandyElement.classList.remove('selected');
    selectedCandy = null;
    
    // Intercambiar en el modelo de datos
    const tempColor = board[row1][col1];
    board[row1][col1] = board[row2][col2];
    board[row2][col2] = tempColor;
    
    // Animar visualmente el intercambio
    const candy1 = document.querySelector(`.candy[data-row="${row1}"][data-col="${col1}"]`);
    const candy2 = document.querySelector(`.candy[data-row="${row2}"][data-col="${col2}"]`);
    
    // Intercambiar clases de color
    const candy1Classes = [...candy1.classList].filter(c => COLORS.includes(c));
    const candy2Classes = [...candy2.classList].filter(c => COLORS.includes(c));
    
    candy1Classes.forEach(cls => candy1.classList.remove(cls));
    candy2Classes.forEach(cls => candy2.classList.remove(cls));
    
    candy1.classList.add(board[row1][col1]);
    candy2.classList.add(board[row2][col2]);
    
    // Verificar si el intercambio creó coincidencias
    const matchesFound = checkForMatches();
    
    // Si no se encontraron coincidencias, revertir el intercambio
    if (!matchesFound) {
        setTimeout(() => {
            // Revertir el modelo de datos
            board[row1][col1] = board[row2][col2];
            board[row2][col2] = tempColor;
            
            // Revertir clases visuales
            candy1.classList.remove(board[row2][col2]);
            candy2.classList.remove(board[row1][col1]);
            
            candy1.classList.add(tempColor);
            candy2.classList.add(board[row1][col1]);
            
            // Mostrar efecto de error
            flashError(row1, col1, row2, col2);
            
            // Reactivar interacción
            gameActive = true;
        }, 300);
    } else {
        // Si hubo coincidencias, reducir movimientos
        movesLeft--;
        movesLeftDisplay.textContent = movesLeft;
        
        // Procesar coincidencias con un ligero retraso para que el usuario pueda ver el intercambio
        setTimeout(() => {
            processMatches();
        }, 300);
    }
}

// Verificar si hay coincidencias en el tablero
function checkForMatches() {
    let matchesFound = false;
    
    // Verificar coincidencias horizontales
    for (let row = 0; row < currentLevel.rows; row++) {
        for (let col = 0; col < currentLevel.cols - 2; col++) {
            if (
                board[row][col] !== null &&
                board[row][col] === board[row][col + 1] &&
                board[row][col] === board[row][col + 2]
            ) {
                matchesFound = true;
                // No salimos del bucle para poder encontrar todas las coincidencias
            }
        }
    }
    
    // Verificar coincidencias verticales
    for (let row = 0; row < currentLevel.rows - 2; row++) {
        for (let col = 0; col < currentLevel.cols; col++) {
            if (
                board[row][col] !== null &&
                board[row][col] === board[row + 1][col] &&
                board[row][col] === board[row + 2][col]
            ) {
                matchesFound = true;
                // No salimos del bucle para poder encontrar todas las coincidencias
            }
        }
    }
    
    return matchesFound;
}

// Procesar coincidencias (eliminar, actualizar puntuación y objetivos)
function processMatches() {
    // Matriz para marcar qué caramelos se eliminarán
    let matched = Array(currentLevel.rows).fill().map(() => Array(currentLevel.cols).fill(false));
    
    // Verificar coincidencias horizontales y marcarlas
    for (let row = 0; row < currentLevel.rows; row++) {
        let col = 0;
        while (col < currentLevel.cols - 2) {
            if (
                board[row][col] !== null &&
                board[row][col] === board[row][col + 1] &&
                board[row][col] === board[row][col + 2]
            ) {
                // Encontramos al menos 3 caramelos iguales
                const matchColor = board[row][col];
                let matchLength = 3;
                
                // Verificar si hay más de 3 caramelos iguales
                while (col + matchLength < currentLevel.cols && board[row][col + matchLength] === matchColor) {
                    matchLength++;
                }
                
                // Marcar todos los caramelos de este grupo
                for (let i = 0; i < matchLength; i++) {
                    matched[row][col + i] = true;
                }
                
                // Prepararse para buscar el siguiente grupo
                col += matchLength;
            } else {
                col++;
            }
        }
    }
    
    // Verificar coincidencias verticales y marcarlas
    for (let col = 0; col < currentLevel.cols; col++) {
        let row = 0;
        while (row < currentLevel.rows - 2) {
            if (
                board[row][col] !== null &&
                board[row][col] === board[row + 1][col] &&
                board[row][col] === board[row + 2][col]
            ) {
                // Encontramos al menos 3 caramelos iguales
                const matchColor = board[row][col];
                let matchLength = 3;
                
                // Verificar si hay más de 3 caramelos iguales
                while (row + matchLength < currentLevel.rows && board[row + matchLength][col] === matchColor) {
                    matchLength++;
                }
                
                // Marcar todos los caramelos de este grupo
                for (let i = 0; i < matchLength; i++) {
                    matched[row + i][col] = true;
                }
                
                // Prepararse para buscar el siguiente grupo
                row += matchLength;
            } else {
                row++;
            }
        }
    }
    
    // Eliminar los caramelos marcados y actualizar puntuación y objetivos
    let removedCount = 0;
    
    for (let row = 0; row < currentLevel.rows; row++) {
        for (let col = 0; col < currentLevel.cols; col++) {
            if (matched[row][col]) {
                const color = board[row][col];
                
                // Actualizar objetivos si este color está en los objetivos
                if (objectives[color] && objectives[color] > 0) {
                    objectives[color]--;
                    
                    // Actualizar visualización de objetivos
                    updateObjectivesDisplay();
                }
                
                // Añadir puntuación por cada caramelo eliminado
                score += 10;
                currentScoreDisplay.textContent = score;
                
                // Marcar el caramelo para animación de eliminación
                const candyElement = document.querySelector(`.candy[data-row="${row}"][data-col="${col}"]`);
                candyElement.classList.add('removing');
                
                // Establecer el color de este caramelo a null para indicar que debe ser reemplazado
                board[row][col] = null;
                
                removedCount++;
            }
        }
    }
    
    // Si no se eliminó ningún caramelo, reactivar el juego
    if (removedCount === 0) {
        gameActive = true;
        checkGameState();
        return;
    }
    
    // Esperar a que termine la animación de eliminación antes de llenar los espacios vacíos
    setTimeout(() => {
        // Eliminar la clase 'removing' de los elementos
        document.querySelectorAll('.removing').forEach(el => {
            el.classList.remove('removing');
            el.classList.remove(...COLORS.filter(c => el.classList.contains(c)));
        });
        
        // Hacer que los caramelos caigan para llenar los espacios vacíos
        fillBoard();
        
        // Verificar si hay nuevas coincidencias después de llenar el tablero
        setTimeout(() => {
            const hasMatches = checkForMatches();
            
            if (hasMatches) {
                // Si hay nuevas coincidencias, procesarlas
                processMatches();
            } else {
                // Si no hay nuevas coincidencias, reactivar el juego
                gameActive = true;
                
                // Verificar si el jugador ganó o perdió
                checkGameState();
            }
        }, 500);
    }, 500);
}

// Llenar los espacios vacíos en el tablero
function fillBoard() {
    // Primero, hacer que los caramelos caigan
    for (let col = 0; col < currentLevel.cols; col++) {
        // Comenzar desde la parte inferior del tablero
        for (let row = currentLevel.rows - 1; row > 0; row--) {
            if (board[row][col] === null) {
                // Buscar el primer caramelo no nulo por encima
                let sourceRow = row - 1;
                while (sourceRow >= 0 && board[sourceRow][col] === null) {
                    sourceRow--;
                }
                
                if (sourceRow >= 0) {
                    // Mover este caramelo hacia abajo
                    board[row][col] = board[sourceRow][col];
                    board[sourceRow][col] = null;
                    
                    // Actualizar la vista
                    const targetElement = document.querySelector(`.candy[data-row="${row}"][data-col="${col}"]`);
                    const sourceElement = document.querySelector(`.candy[data-row="${sourceRow}"][data-col="${col}"]`);
                    
                    targetElement.classList.add(board[row][col]);
                    sourceElement.classList.remove(board[row][col]);
                    
                    // Agregar clase para animación de caída
                    targetElement.classList.add('falling');
                    setTimeout(() => {
                        targetElement.classList.remove('falling');
                    }, 500);
                }
            }
        }
    }
    
    // Luego, generar nuevos caramelos en las posiciones vacías
    for (let row = 0; row < currentLevel.rows; row++) {
        for (let col = 0; col < currentLevel.cols; col++) {
            if (board[row][col] === null) {
                // Generar un nuevo color aleatorio
                const newColor = getRandomColor();
                board[row][col] = newColor;
                
                // Actualizar la vista
                const candyElement = document.querySelector(`.candy[data-row="${row}"][data-col="${col}"]`);
                candyElement.classList.add(newColor);
                
                // Agregar animación de aparición
                candyElement.style.transform = 'scale(0)';
                setTimeout(() => {
                    candyElement.style.transition = 'transform 0.3s';
                    candyElement.style.transform = 'scale(1)';
                }, 50);
                setTimeout(() => {
                    candyElement.style.transition = '';
                }, 350);
            }
        }
    }
}

// Mostrar un efecto de error cuando un movimiento no es válido
function flashError(row1, col1, row2, col2) {
    const candy1 = document.querySelector(`.candy[data-row="${row1}"][data-col="${col1}"]`);
    const candy2 = document.querySelector(`.candy[data-row="${row2}"][data-col="${col2}"]`);
    
    candy1.style.border = '2px solid red';
    candy2.style.border = '2px solid red';
    
    setTimeout(() => {
        candy1.style.border = '';
        candy2.style.border = '';
    }, 500);
}

// Actualizar la visualización de los objetivos
function updateObjectivesDisplay() {
    objectivesContainer.innerHTML = '';
    
    for (const [color, count] of Object.entries(objectives)) {
        if (count > 0) {
            const objectiveElement = document.createElement('div');
            objectiveElement.className = 'objective';
            
            const iconElement = document.createElement('div');
            iconElement.className = `objective-icon ${color}`;
            
            const countElement = document.createElement('span');
            countElement.textContent = count;
            
            objectiveElement.appendChild(iconElement);
            objectiveElement.appendChild(countElement);
            objectivesContainer.appendChild(objectiveElement);
        }
    }
}

// Verificar si hay posibles movimientos en el tablero actual
function hasPossibleMoves() {
    // Verificar horizontalmente
    for (let row = 0; row < currentLevel.rows; row++) {
        for (let col = 0; col < currentLevel.cols - 1; col++) {
            // Intercambiar temporalmente
            const temp = board[row][col];
            board[row][col] = board[row][col + 1];
            board[row][col + 1] = temp;
            
            // Verificar si este intercambio crea una coincidencia
            const hasMatch = checkForMatches();
            
            // Revertir el intercambio
            board[row][col + 1] = board[row][col];
            board[row][col] = temp;
            
            if (hasMatch) {
                return true;
            }
        }
    }
    
    // Verificar verticalmente
    for (let row = 0; row < currentLevel.rows - 1; row++) {
        for (let col = 0; col < currentLevel.cols; col++) {
            // Intercambiar temporalmente
            const temp = board[row][col];
            board[row][col] = board[row + 1][col];
            board[row + 1][col] = temp;
            
            // Verificar si este intercambio crea una coincidencia
            const hasMatch = checkForMatches();
            
            // Revertir el intercambio
            board[row + 1][col] = board[row][col];
            board[row][col] = temp;
            
            if (hasMatch) {
                return true;
            }
        }
    }
    
    return false;
}

// Reorganizar el tablero si no hay movimientos posibles
function reshuffleBoard() {
    // Guardar los colores actuales
    const colors = [];
    for (let row = 0; row < currentLevel.rows; row++) {
        for (let col = 0; col < currentLevel.cols; col++) {
            colors.push(board[row][col]);
        }
    }
    
    // Mezclar los colores
    for (let i = colors.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [colors[i], colors[j]] = [colors[j], colors[i]];
    }
    
    // Reasignar los colores mezclados al tablero
    let index = 0;
    for (let row = 0; row < currentLevel.rows; row++) {
        for (let col = 0; col < currentLevel.cols; col++) {
            board[row][col] = colors[index++];
            
            // Actualizar la vista
            const candyElement = document.querySelector(`.candy[data-row="${row}"][data-col="${col}"]`);
            candyElement.classList.remove(...COLORS);
            candyElement.classList.add(board[row][col]);
        }
    }
    
    // Verificar si el nuevo tablero tiene posibles movimientos
    if (!hasPossibleMoves()) {
        // Si todavía no hay movimientos posibles, intentar de nuevo
        reshuffleBoard();
    }
}

// Verificar el estado actual del juego (victoria, derrota o continuar)
function checkGameState() {
    console.log("Verificando estado del juego...");
    
    // Verificar si se han completado todos los objetivos
    let allObjectivesCompleted = true;
    for (const color in objectives) {
        if (objectives[color] > 0) {
            allObjectivesCompleted = false;
            break;
        }
    }
    
    // Victoria - Todos los objetivos completados
    if (allObjectivesCompleted) {
        console.log("¡Victoria! Todos los objetivos completados");
        levelComplete();
        return;
    }
    
    // Derrota - Sin movimientos disponibles
    if (movesLeft <= 0) {
        console.log("¡Derrota! Sin movimientos restantes");
        gameOver();
        return;
    }
    
    // Verificar si hay movimientos posibles en el tablero
    if (!hasPossibleMoves()) {
        console.log("No hay movimientos posibles, reorganizando tablero");
        
        // Mostrar mensaje al usuario
        const messageElement = document.createElement('div');
        messageElement.textContent = '¡No hay movimientos posibles! Reorganizando...';
        messageElement.className = 'game-message';
        gameScreen.appendChild(messageElement);
        
        // Temporalmente desactivar el juego
        gameActive = false;
        
        // Reorganizar después de un breve retraso
        setTimeout(() => {
            gameScreen.removeChild(messageElement);
            reshuffleBoard();
            gameActive = true;
        }, 2000);
    }
}

// Verificar cuando un jugador ha completado un nivel
function levelComplete() {
    gameActive = false;
    
    // Calcular las estrellas ganadas (1-3)
    const movesRatio = movesLeft / currentLevel.moves;
    const scoreRatio = score / currentLevel.scoreTarget;
    
    let stars = 1; // Mínimo una estrella por completar
    
    if (scoreRatio >= 1.5 || movesRatio >= 0.4) {
        stars++;
    }
    
    if (scoreRatio >= 2 || movesRatio >= 0.7) {
        stars++;
    }
    
    // Guardar el progreso
    playerProgress[currentLevel.id] = {
        completed: true,
        score: score,
        stars: stars
    };
    
    // Desbloquear el siguiente nivel
    if (currentLevel.id === highestUnlockedLevel) {
        highestUnlockedLevel++;
    }
    
    // Mostrar mensaje de amor
    const messageIndex = (currentLevel.id - 1) % LOVE_MESSAGES.length;
    document.getElementById('love-message').textContent = LOVE_MESSAGES[messageIndex];
    
    // Mostrar la pantalla de victoria
    finalScoreDisplay.textContent = score;
    starsEarnedDisplay.textContent = stars;
    showScreen(victoryScreen);
    
    // Guardar el progreso inmediatamente después de completar un nivel
    saveProgress();
    
    console.log("Nivel completado:", currentLevel.id, "Siguiente nivel desbloqueado:", highestUnlockedLevel);
}

// Cuando el jugador pierde
function gameOver() {
    gameActive = false;
    showScreen(gameOverScreen);
}
