export const CREEP_TYPES = {
    BASIC: {
        name: 'Basic Creep',
        emoji: '👾',
        health: 100,
        speed: 0.8,
        reward: 20,
        damage: 1, // damage to player's lives when reaching end
    },
    FAST: {
        name: 'Fast Creep',
        emoji: '👻',
        health: 60,
        speed: 1.2,
        reward: 30,
        damage: 1,
    },
    TANK: {
        name: 'Tank Creep',
        emoji: '🤖',
        health: 200,
        speed: 0.4,
        reward: 50,
        damage: 2,
    }
};

export const WAVE_TEMPLATES = [
    // Wave 1
    {
        creeps: [
            { type: 'BASIC', count: 10, interval: 2.5 }
        ],
        reward: 200
    },
    // Wave 2
    {
        creeps: [
            { type: 'BASIC', count: 12, interval: 2.2 },
            { type: 'FAST', count: 5, interval: 3 }
        ],
        reward: 300
    },
    // Wave 3
    {
        creeps: [
            { type: 'BASIC', count: 15, interval: 2 },
            { type: 'FAST', count: 8, interval: 2.5 },
            { type: 'TANK', count: 2, interval: 6 }
        ],
        reward: 400
    },
    // Wave 4
    {
        creeps: [
            { type: 'BASIC', count: 18, interval: 1.8 },
            { type: 'FAST', count: 10, interval: 2 },
            { type: 'TANK', count: 4, interval: 5 }
        ],
        reward: 500
    },
    // Wave 5
    {
        creeps: [
            { type: 'BASIC', count: 20, interval: 1.5 },
            { type: 'FAST', count: 15, interval: 1.8 },
            { type: 'TANK', count: 6, interval: 4 }
        ],
        reward: 600
    },
    // Wave 6
    {
        creeps: [
            { type: 'BASIC', count: 25, interval: 1.2 },
            { type: 'FAST', count: 18, interval: 1.5 },
            { type: 'TANK', count: 8, interval: 3.5 }
        ],
        reward: 700
    },
    // Wave 7
    {
        creeps: [
            { type: 'BASIC', count: 30, interval: 1 },
            { type: 'FAST', count: 22, interval: 1.2 },
            { type: 'TANK', count: 10, interval: 3 }
        ],
        reward: 800
    },
    // Wave 8 (Final Wave)
    {
        creeps: [
            { type: 'BASIC', count: 35, interval: 0.8 },
            { type: 'FAST', count: 25, interval: 1 },
            { type: 'TANK', count: 15, interval: 2.5 }
        ],
        reward: 1000
    }
];
