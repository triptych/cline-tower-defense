import { WAVE_TEMPLATES } from '../config/creeps.js';

export class WaveManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.currentWave = 0;
        this.waveInProgress = false;
        this.creepsToSpawn = [];
        this.spawnTimer = 0;
        this.activeCreeps = new Set();
    }

    startNextWave() {
        if (this.waveInProgress) return false;

        this.currentWave++;
        const waveConfig = WAVE_TEMPLATES[this.currentWave - 1];

        if (!waveConfig) {
            // No more waves - game won!
            this.gameState.emit('gameWon');
            return false;
        }

        this.waveInProgress = true;
        this.creepsToSpawn = [];

        // Prepare creeps for the wave
        waveConfig.creeps.forEach(creepGroup => {
            for (let i = 0; i < creepGroup.count; i++) {
                this.creepsToSpawn.push({
                    type: creepGroup.type,
                    interval: creepGroup.interval,
                    spawnTime: i * creepGroup.interval
                });
            }
        });

        // Sort by spawn time
        this.creepsToSpawn.sort((a, b) => a.spawnTime - b.spawnTime);

        this.spawnTimer = 0;
        this.gameState.emit('waveStarted', this.currentWave);

        return true;
    }

    update(deltaTime) {
        if (!this.waveInProgress) return;

        // Update spawn timer and spawn creeps
        this.spawnTimer += deltaTime;

        while (this.creepsToSpawn.length > 0 &&
               this.creepsToSpawn[0].spawnTime <= this.spawnTimer) {
            const creepConfig = this.creepsToSpawn.shift();
            this.spawnCreep(creepConfig.type);
        }

        // Update active creeps
        for (const creep of this.activeCreeps) {
            creep.update(deltaTime);

            // Remove creeps that have reached the end or died
            if (creep.reachedEnd || creep.health <= 0) {
                if (creep.reachedEnd) {
                    this.gameState.takeDamage(creep.damage);
                } else {
                    this.gameState.addCurrency(creep.reward);
                }
                this.activeCreeps.delete(creep);
            }
        }

        // Check if wave is complete
        if (this.creepsToSpawn.length === 0 && this.activeCreeps.size === 0) {
            this.waveInProgress = false;
            const waveConfig = WAVE_TEMPLATES[this.currentWave - 1];
            this.gameState.addCurrency(waveConfig.reward);
            this.gameState.emit('waveCompleted', this.currentWave);
        }
    }

    spawnCreep(type) {
        const creep = this.gameState.createCreep(type);
        this.activeCreeps.add(creep);
        this.gameState.emit('creepSpawned', creep);
    }

    getActiveCreeps() {
        return Array.from(this.activeCreeps);
    }

    getCurrentWave() {
        return this.currentWave;
    }

    isWaveInProgress() {
        return this.waveInProgress;
    }

    getRemainingCreeps() {
        return this.creepsToSpawn.length + this.activeCreeps.size;
    }
}
