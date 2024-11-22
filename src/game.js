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

        // Set up canvas
        p5.createCanvas(
            this.level.gridSize.width * this.cellSize,
            this.level.gridSize.height * this.cellSize
        );
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

        // Draw UI
        this.gameMenu.draw(p5, this.cellSize);
        this.upgradeMenu.draw(p5, this.cellSize);
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
