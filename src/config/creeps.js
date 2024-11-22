export const CREEP_TYPES = {
    BASIC: {
        name: 'Basic Creep',
        emoji: '👾',
        health: 100,
        speed: 2,
        reward: 10,
        damage: 1, // damage to player's lives when reaching end
    },
    FAST: {
        name: 'Fast Creep',
        emoji: '👻',
        health: 60,
        speed: 3.5,
        reward: 15,
        damage: 1,
    },
    TANK: {
        name: 'Tank Creep',
        emoji: '🤖',
        health: 200,
        speed: 1,
        reward: 25,
        damage: 2,
    }
};

export const WAVE_TEMPLATES = [
    // Wave 1
    {
        creeps: [
            { type: 'BASIC', count: 10, interval: 1.5 }
        ],
        reward: 100
    },
    // Wave 2
    {
        creeps: [
            { type: 'BASIC', count: 12, interval: 1.2 },
            { type: 'FAST', count: 5, interval: 2 }
        ],
        reward: 150
    },
    // Wave 3
    {
        creeps: [
            { type: 'BASIC', count: 15, interval: 1 },
            { type: 'FAST', count: 8, interval: 1.5 },
            { type: 'TANK', count: 2, interval: 5 }
        ],
        reward: 200
    }
];
