const LEVELS = [
    {
        id: 1,
        rows: 6,
        cols: 6,
        moves: 15,
        objectives: {
            red: 5,
            blue: 5,
            green: 5
        },
        scoreTarget: 1000
    },
    {
        id: 2,
        rows: 6,
        cols: 6,
        moves: 17,
        objectives: {
            red: 7,
            yellow: 7
        },
        scoreTarget: 1500
    },
    {
        id: 3,
        rows: 7,
        cols: 7,
        moves: 20,
        objectives: {
            blue: 8,
            purple: 8,
            green: 8
        },
        scoreTarget: 2000
    },
    {
        id: 4,
        rows: 7,
        cols: 7,
        moves: 22,
        objectives: {
            red: 10,
            orange: 10,
            yellow: 10
        },
        scoreTarget: 2500
    },
    {
        id: 5,
        rows: 8,
        cols: 8,
        moves: 25,
        objectives: {
            red: 12,
            blue: 12,
            green: 12,
            purple: 12
        },
        scoreTarget: 3000
    },
    {
        id: 6,
        rows: 8,
        cols: 8,
        moves: 30,
        objectives: {
            yellow: 15,
            orange: 15,
            purple: 15
        },
        scoreTarget: 3500
    },
    {
        id: 7,
        rows: 8,
        cols: 8,
        moves: 25,
        objectives: {
            red: 18,
            blue: 18
        },
        scoreTarget: 4000
    },
    {
        id: 8,
        rows: 8,
        cols: 8,
        moves: 28,
        objectives: {
            green: 20,
            orange: 20
        },
        scoreTarget: 4500
    },
    {
        id: 9,
        rows: 9,
        cols: 9,
        moves: 30,
        objectives: {
            purple: 25,
            yellow: 25
        },
        scoreTarget: 5000
    },
    {
        id: 10,
        rows: 9,
        cols: 9,
        moves: 35,
        objectives: {
            red: 15,
            blue: 15,
            green: 15,
            yellow: 15,
            purple: 15,
            orange: 15
        },
        scoreTarget: 6000
    }
];

// Traducciones de colores para mostrar en español
const COLOR_NAMES = {
    red: 'Rojo',
    blue: 'Azul',
    green: 'Verde',
    yellow: 'Amarillo',
    purple: 'Morado',
    orange: 'Naranja'
};

// Mensajes románticos para mostrar al completar niveles
const LOVE_MESSAGES = [
    "Nuestro primer encuentro fue tan dulce como estos caramelos",
    "Cada día contigo es como ganar un nivel más de felicidad",
    "Tu sonrisa ilumina mi día como estas combinaciones iluminan el tablero",
    "Nuestros recuerdos juntos son más valiosos que todos estos puntos",
    "Eres la combinación perfecta para mi vida",
    "Cada momento a tu lado es un nuevo nivel de amor",
    "Mi corazón se acelera por ti como cuando haces una gran combinación",
    "Nuestro amor es como este juego: emocionante y lleno de color",
    "Juntos somos imparables, como la mejor estrategia en este juego",
    "Te amo más que a mil partidas perfectas, Chloe"
]; 
