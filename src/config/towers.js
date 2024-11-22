export const TOWER_TYPES = {
    BASIC: {
        name: 'Basic Tower',
        emoji: '🗼',
        cost: 100,
        range: 100,
        damage: 20,
        fireRate: 1, // shots per second
        upgrades: [
            { level: 1, cost: 50, damage: 30, description: 'Increased damage' },
            { level: 2, cost: 100, fireRate: 1.5, description: 'Faster firing rate' },
            { level: 3, cost: 150, range: 150, description: 'Extended range' }
        ]
    },
    FIRE: {
        name: 'Fire Tower',
        emoji: '🏰',
        cost: 200,
        range: 80,
        damage: 30,
        fireRate: 0.8,
        upgrades: [
            { level: 1, cost: 100, areaEffect: true, description: 'Area damage' },
            { level: 2, cost: 150, burnDuration: 3, description: 'Burning effect' },
            { level: 3, cost: 200, explosionRadius: 50, description: 'Explosion radius' }
        ]
    },
    ICE: {
        name: 'Ice Tower',
        emoji: '🏰',
        cost: 200,
        range: 90,
        damage: 15,
        fireRate: 1,
        upgrades: [
            { level: 1, cost: 100, slowEffect: 0.5, description: 'Slow effect' },
            { level: 2, cost: 150, freezeDuration: 2, description: 'Freeze duration' },
            { level: 3, cost: 200, chainFreeze: true, description: 'Chain freeze' }
        ]
    }
};
