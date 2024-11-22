// Tile types for the game grid
export const TILE_TYPES = {
    EMPTY: '🟩',    // Grass/empty space
    PATH: '⬜',     // Path for creeps
    START: '🟦',    // Starting point
    END: '🟥',      // Ending point
    TOWER_SPOT: '⭕' // Valid tower placement spot
};

export const LEVELS = [
    // Level 1 - Winding path
    {
        id: 1,
        name: "Beginner's Path",
        startingCurrency: 300,
        startingLives: 100,
        gridSize: { width: 12, height: 8 },
        waves: 3,
        layout: [
            ['🟦', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '🟩'],
            ['🟩', '🟩', '🟩', '🟩', '🟩', '🟩', '🟩', '🟩', '🟩', '🟩', '⬜', '🟩'],
            ['🟩', '⭕', '⭕', '⭕', '🟩', '⭕', '⭕', '⭕', '🟩', '🟩', '⬜', '🟩'],
            ['🟩', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '🟩'],
            ['🟩', '⬜', '🟩', '🟩', '🟩', '⭕', '⭕', '⭕', '🟩', '🟩', '🟩', '🟩'],
            ['🟩', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '🟥', '🟩'],
            ['🟩', '🟩', '🟩', '⭕', '🟩', '⭕', '⭕', '⭕', '🟩', '🟩', '🟩', '🟩'],
            ['🟩', '🟩', '🟩', '🟩', '🟩', '🟩', '🟩', '🟩', '🟩', '🟩', '🟩', '🟩']
        ],
        path: [
            {x: 0, y: 0},  // Start
            {x: 1, y: 0},
            {x: 2, y: 0},
            {x: 3, y: 0},
            {x: 4, y: 0},
            {x: 5, y: 0},
            {x: 6, y: 0},
            {x: 7, y: 0},
            {x: 8, y: 0},
            {x: 9, y: 0},
            {x: 10, y: 0},
            {x: 10, y: 1},
            {x: 10, y: 2},
            {x: 10, y: 3},
            {x: 9, y: 3},
            {x: 8, y: 3},
            {x: 7, y: 3},
            {x: 6, y: 3},
            {x: 5, y: 3},
            {x: 4, y: 3},
            {x: 3, y: 3},
            {x: 2, y: 3},
            {x: 1, y: 3},
            {x: 1, y: 4},
            {x: 1, y: 5},
            {x: 2, y: 5},
            {x: 3, y: 5},
            {x: 4, y: 5},
            {x: 5, y: 5},
            {x: 6, y: 5},
            {x: 7, y: 5},
            {x: 8, y: 5},
            {x: 9, y: 5},
            {x: 10, y: 5}  // End
        ]
    },
    // Level 2 - Curved path
    {
        id: 2,
        name: "Winding Road",
        startingCurrency: 400,
        startingLives: 100,
        gridSize: { width: 12, height: 8 },
        waves: 4,
        layout: [
            ['🟩', '🟩', '🟩', '🟩', '🟩', '🟩', '🟩', '🟩', '🟩', '🟩', '🟩', '🟩'],
            ['🟦', '⬜', '⬜', '⬜', '⬜', '⬜', '🟩', '⭕', '🟩', '⭕', '🟩', '🟩'],
            ['🟩', '🟩', '🟩', '🟩', '🟩', '⬜', '🟩', '🟩', '🟩', '🟩', '🟩', '🟩'],
            ['🟩', '⭕', '🟩', '⭕', '🟩', '⬜', '🟩', '⭕', '🟩', '⭕', '🟩', '🟩'],
            ['🟩', '🟩', '🟩', '🟩', '🟩', '⬜', '🟩', '🟩', '🟩', '🟩', '🟩', '🟩'],
            ['🟩', '⭕', '🟩', '⭕', '🟩', '⬜', '⬜', '⬜', '⬜', '⬜', '🟥', '🟩'],
            ['🟩', '🟩', '🟩', '🟩', '🟩', '🟩', '🟩', '🟩', '🟩', '🟩', '🟩', '🟩'],
            ['🟩', '🟩', '🟩', '🟩', '🟩', '🟩', '🟩', '🟩', '🟩', '🟩', '🟩', '🟩']
        ],
        path: [
            {x: 0, y: 1},
            {x: 1, y: 1},
            {x: 2, y: 1},
            {x: 3, y: 1},
            {x: 4, y: 1},
            {x: 5, y: 1},
            {x: 5, y: 2},
            {x: 5, y: 3},
            {x: 5, y: 4},
            {x: 5, y: 5},
            {x: 6, y: 5},
            {x: 7, y: 5},
            {x: 8, y: 5},
            {x: 9, y: 5},
            {x: 10, y: 5}
        ]
    }
];

// Game constants
export const GRID_CELL_SIZE = 50; // pixels
export const GAME_SPEED = 1; // Default game speed multiplier
