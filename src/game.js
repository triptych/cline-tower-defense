import { LEVELS, GRID_CELL_SIZE } from './config/levels.js';
import { TOWER_TYPES } from './config/towers.js';
import { PathSystem } from './systems/PathSystem.js';
import { WaveManager } from './systems/WaveManager.js';
import { EconomyManager } from './systems/EconomyManager.js';
import { BaseTower } from './components/Tower/BaseTower.js';
import { FireTower } from './components/Tower/FireTower.js';
import { IceTower } from './components/Tower/IceTower.js';
import { BaseCreep } from './components/Creep/BaseCreep.js';
import { FastCreep } from './components/Creep/FastCreep.js';
import { TankCreep } from './components/Creep/TankCreep.js';
import { GameMenu } from './components/UI/GameMenu.js';
import { UpgradeMenu } from './components/UI/UpgradeMenu.js';

class Game {
    constructor() {
        this.currentLevel = 0;
        this.towers = new Set();
        this.events = new Map();
        this.cellSize = GRID_CELL_SIZE;
        this.lastUpdateTime = 0;
        this.paused = false;
        this.selectedTower = null;
        this.projectiles = new Set(); // Track active projectiles
    }

    init(p5) {
        this.p5 = p5;
        this.loadLevel(0);

        this.economyManager = new EconomyManager(this.level.startingCurrency);
        this.pathSystem = new PathSystem(this.level.path);
        this.waveManager = new WaveManager(this);
        this.gameMenu = new GameMenu(this);
        this.upgradeMenu = new UpgradeMenu(this);

        this.lives = this.level.startingLives;

        // Set up canvas with additional width for UI
        const gameWidth = this.level.gridSize.width * this.cellSize;
        const gameHeight = this.level.gridSize.height * this.cellSize;
        const uiWidth = 8 * this.cellSize; // 8 cells for UI
        p5.createCanvas(gameWidth + uiWidth, gameHeight);

        // Listen for tower attacks to create projectiles
        this.on('towerAttack', ({ from, to, tower }) => {
            const projectile = {
                from: { x: from.x * this.cellSize + this.cellSize / 2, y: from.y * this.cellSize + this.cellSize / 2 },
                to: { x: to.x * this.cellSize + this.cellSize / 2, y: to.y * this.cellSize + this.cellSize / 2 },
                progress: 0,
                speed: 2, // Projectile speed in grid cells per second
                tower
            };
            this.projectiles.add(projectile);
        });
    }

    loadLevel(levelIndex) {
        this.currentLevel = levelIndex;
        this.level = LEVELS[levelIndex];
        if (!this.level) {
            throw new Error(`Invalid level index: ${levelIndex}`);
        }
    }

    update() {
        if (this.paused) return;

        const currentTime = this.p5.millis() / 1000;
        const deltaTime = currentTime - this.lastUpdateTime;
        this.lastUpdateTime = currentTime;

        // Update game systems
        this.waveManager.update(deltaTime);

        // Update towers
        for (const tower of this.towers) {
            tower.update(deltaTime);
        }

        // Update projectiles
        for (const projectile of this.projectiles) {
            projectile.progress += projectile.speed * deltaTime;
            if (projectile.progress >= 1) {
                this.projectiles.delete(projectile);
            }
        }
    }

    draw() {
        const p5 = this.p5;

        // Clear background
        p5.background(50);

        // Draw grid
        this.drawGrid();

        // Draw towers
        for (const tower of this.towers) {
            tower.draw(p5, this.cellSize);
        }

        // Draw creeps
        for (const creep of this.waveManager.getActiveCreeps()) {
            creep.draw(p5, this.cellSize);
        }

        // Draw projectiles
        this.drawProjectiles();

        // Draw UI
        this.gameMenu.draw(p5, this.cellSize);
        this.upgradeMenu.draw(p5, this.cellSize);
    }

    drawProjectiles() {
        const p5 = this.p5;

        for (const projectile of this.projectiles) {
            const x = p5.lerp(projectile.from.x, projectile.to.x, projectile.progress);
            const y = p5.lerp(projectile.from.y, projectile.to.y, projectile.progress);

            // Draw projectile based on tower type
            p5.push();
            if (projectile.tower instanceof FireTower) {
                p5.fill(255, 100, 0);
                p5.noStroke();
                p5.circle(x, y, 8);

                // Add flame trail effect
                for (let i = 0; i < 3; i++) {
                    const trailProgress = projectile.progress - (i * 0.1);
                    if (trailProgress > 0) {
                        const trailX = p5.lerp(projectile.from.x, projectile.to.x, trailProgress);
                        const trailY = p5.lerp(projectile.from.y, projectile.to.y, trailProgress);
                        p5.fill(255, 100, 0, 100 - (i * 30));
                        p5.circle(trailX, trailY, 6 - (i * 2));
                    }
                }
            } else if (projectile.tower instanceof IceTower) {
                p5.fill(100, 200, 255);
                p5.noStroke();
                p5.circle(x, y, 8);

                // Add ice trail effect
                for (let i = 0; i < 3; i++) {
                    const trailProgress = projectile.progress - (i * 0.1);
                    if (trailProgress > 0) {
                        const trailX = p5.lerp(projectile.from.x, projectile.to.x, trailProgress);
                        const trailY = p5.lerp(projectile.from.y, projectile.to.y, trailProgress);
                        p5.fill(100, 200, 255, 100 - (i * 30));
                        p5.circle(trailX, trailY, 6 - (i * 2));
                    }
                }
            } else {
                // Default projectile
                p5.fill(255);
                p5.noStroke();
                p5.circle(x, y, 6);
            }
            p5.pop();
        }
    }

    drawGrid() {
        const p5 = this.p5;
        const layout = this.level.layout;

        for (let y = 0; y < layout.length; y++) {
            for (let x = 0; x < layout[y].length; x++) {
                const tile = layout[y][x];

                p5.textAlign(p5.CENTER, p5.CENTER);
                p5.textSize(this.cellSize * 0.8);
                p5.text(
                    tile,
                    x * this.cellSize + this.cellSize / 2,
                    y * this.cellSize + this.cellSize / 2
                );
            }
        }
    }

    // Event system
    on(event, callback) {
        if (!this.events.has(event)) {
            this.events.set(event, new Set());
        }
        this.events.get(event).add(callback);
    }

    emit(event, data) {
        if (this.events.has(event)) {
            this.events.get(event).forEach(callback => callback(data));
        }
    }

    // Game state methods
    getLives() {
        return this.lives;
    }

    getCurrency() {
        return this.economyManager.getCurrency();
    }

    getCurrentWave() {
        return this.waveManager.getCurrentWave();
    }

    isWaveInProgress() {
        return this.waveManager.isWaveInProgress();
    }

    getRemainingCreeps() {
        return this.waveManager.getRemainingCreeps();
    }

    getCellSize() {
        return this.cellSize;
    }

    getCurrentTime() {
        return this.p5.millis() / 1000;
    }

    // Tower management
    getTowerConfig(type) {
        return TOWER_TYPES[type];
    }

    canAffordTower(type) {
        return this.economyManager.canPurchaseTower(type);
    }

    canAffordUpgrade(tower) {
        return this.economyManager.canUpgradeTower(tower);
    }

    calculateSellValue(tower) {
        return this.economyManager.calculateSellValue(tower);
    }

    canPlaceTower(x, y) {
        if (x < 0 || y < 0 ||
            y >= this.level.layout.length ||
            x >= this.level.layout[0].length) {
            return false;
        }

        const tile = this.level.layout[y][x];
        if (tile !== '⭕') return false;

        // Check if tower already exists at location
        for (const tower of this.towers) {
            if (tower.x === x && tower.y === y) {
                return false;
            }
        }

        return true;
    }

    placeTower(type, x, y) {
        if (!this.canPlaceTower(x, y) || !this.canAffordTower(type)) {
            return false;
        }

        let tower;
        switch (type) {
            case 'FIRE':
                tower = new FireTower(x, y, this);
                break;
            case 'ICE':
                tower = new IceTower(x, y, this);
                break;
            default:
                tower = new BaseTower(type, x, y, this);
        }

        if (this.economyManager.purchaseTower(type)) {
            this.towers.add(tower);
            this.emit('towerPlaced', tower);
            return true;
        }

        return false;
    }

    getTowerAt(x, y) {
        for (const tower of this.towers) {
            if (tower.x === x && tower.y === y) {
                return tower;
            }
        }
        return null;
    }

    upgradeTower(tower) {
        if (!this.economyManager.canUpgradeTower(tower)) {
            return false;
        }

        if (this.economyManager.upgradeTower(tower)) {
            tower.upgrade();
            this.emit('towerUpgraded', tower);
            return true;
        }

        return false;
    }

    sellTower(tower) {
        if (this.economyManager.sellTower(tower)) {
            this.towers.delete(tower);
            this.emit('towerSold', tower);
            return true;
        }
        return false;
    }

    // Creep management
    createCreep(type) {
        let creep;
        switch (type) {
            case 'FAST':
                creep = new FastCreep(this.pathSystem, this);
                break;
            case 'TANK':
                creep = new TankCreep(this.pathSystem, this);
                break;
            default:
                creep = new BaseCreep(type, this.pathSystem, this);
        }
        return creep;
    }

    getActiveCreeps() {
        return this.waveManager.getActiveCreeps();
    }

    // Game flow control
    startNextWave() {
        return this.waveManager.startNextWave();
    }

    takeDamage(amount) {
        this.lives = Math.max(0, this.lives - amount);
        this.emit('livesChanged', this.lives);

        if (this.lives <= 0) {
            this.gameOver();
        }
    }

    addCurrency(amount) {
        this.economyManager.addCurrency(amount);
    }

    gameOver() {
        this.paused = true;
        this.emit('gameOver');
    }

    // Input handling
    handleClick(event) {
        const mouseX = event.offsetX;
        const mouseY = event.offsetY;

        // Check upgrade menu first
        if (this.upgradeMenu.isVisible()) {
            if (this.upgradeMenu.handleClick(mouseX, mouseY, this.cellSize)) {
                return;
            }
        }

        // Then check game menu
        if (this.gameMenu.handleClick(mouseX, mouseY)) {
            return;
        }

        // Finally check tower selection
        const gridX = Math.floor(mouseX / this.cellSize);
        const gridY = Math.floor(mouseY / this.cellSize);
        const tower = this.getTowerAt(gridX, gridY);

        if (tower) {
            this.upgradeMenu.show(tower, mouseX, mouseY);
        }
    }

    handleMouseMove(event) {
        this.gameMenu.handleHover(event.offsetX, event.offsetY);
    }
}

// Initialize P5.js
new p5(p5 => {
    const game = new Game();

    p5.setup = () => {
        game.init(p5);
    };

    p5.draw = () => {
        game.update();
        game.draw();
    };

    p5.mouseClicked = (event) => {
        game.handleClick(event);
    };

    p5.mouseMoved = (event) => {
        game.handleMouseMove(event);
    };
});
