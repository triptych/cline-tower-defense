export class GameMenu {
    constructor(gameState) {
        this.gameState = gameState;
        this.selectedTower = null;
        this.hoveredCell = null;
        this.isPlacingTower = false;
        this.towerType = null;
        this.p5 = null; // Will be set in draw
    }

    draw(p5, cellSize) {
        this.p5 = p5; // Store p5 instance
        const gameWidth = cellSize * 12; // Assuming 12x12 game grid

        // Draw game area border
        p5.stroke(34, 73, 94);
        p5.strokeWeight(2);
        p5.noFill();
        p5.rect(0, 0, gameWidth, gameWidth);
        p5.strokeWeight(1);

        this.drawTopBar(p5, cellSize, gameWidth);
        this.drawTowerMenu(p5, cellSize, gameWidth);

        if (this.selectedTower) {
            this.drawTowerInfo(p5, cellSize, gameWidth);
        }

        if (this.isPlacingTower) {
            this.drawTowerPlacement(p5, cellSize);
        }

        this.drawWaveInfo(p5, cellSize, gameWidth);
    }

    drawTopBar(p5, cellSize, gameWidth) {
        const padding = 10;
        const height = cellSize;
        const barWidth = cellSize * 8;
        const x = gameWidth + padding;

        // Background
        p5.fill(0, 0, 0, 200);
        p5.noStroke();
        p5.rect(x, 0, barWidth, height * 2);

        // Lives
        p5.textAlign(p5.LEFT, p5.CENTER);
        p5.textSize(cellSize * 0.5);
        p5.fill(255);
        p5.text(
            `❤️ ${this.gameState.getLives()}`,
            x + padding,
            height / 2
        );

        // Currency
        p5.text(
            `💰 ${this.gameState.getCurrency()}`,
            x + padding,
            height * 1.5
        );

        // Wave
        p5.textAlign(p5.RIGHT, p5.CENTER);
        p5.text(
            `Wave ${this.gameState.getCurrentWave()}`,
            x + barWidth - padding,
            height / 2
        );
    }

    drawTowerMenu(p5, cellSize, gameWidth) {
        const menuWidth = cellSize * 8;
        const padding = 10;
        const buttonSize = cellSize * 0.8;
        const x = gameWidth + padding;
        const startY = cellSize * 2.5;

        // Background
        p5.fill(0, 0, 0, 200);
        p5.noStroke();
        p5.rect(x, startY, menuWidth, cellSize * 4);

        // Get tower configs from gameState
        const towerTypes = ['BASIC', 'FIRE', 'ICE'];
        const towers = towerTypes.map(type => {
            const config = this.gameState.getTowerConfig(type);
            return {
                type,
                emoji: config.emoji,
                cost: config.cost
            };
        });

        towers.forEach((tower, index) => {
            const buttonX = x + padding;
            const y = startY + padding + index * (buttonSize + padding);

            // Button background
            const canAfford = this.gameState.canAffordTower(tower.type);
            p5.fill(canAfford ? 50 : 30);
            p5.rect(buttonX, y, menuWidth - padding * 2, buttonSize);

            // Tower icon
            p5.textAlign(p5.LEFT, p5.CENTER);
            p5.textSize(buttonSize * 0.6);
            p5.fill(255);
            p5.text(tower.emoji, buttonX + padding, y + buttonSize / 2);

            // Cost
            p5.textAlign(p5.RIGHT, p5.CENTER);
            p5.textSize(buttonSize * 0.4);
            p5.text(
                `💰 ${tower.cost}`,
                buttonX + menuWidth - padding * 3,
                y + buttonSize / 2
            );
        });
    }

    drawTowerInfo(p5, cellSize, gameWidth) {
        const padding = 10;
        const infoWidth = cellSize * 8;
        const infoHeight = cellSize * 5;
        const x = gameWidth + padding;
        const y = cellSize * 7;

        // Background
        p5.fill(0, 0, 0, 200);
        p5.noStroke();
        p5.rect(x, y, infoWidth, infoHeight);

        // Tower stats
        const stats = this.selectedTower.getStats();
        p5.textAlign(p5.LEFT, p5.TOP);
        p5.textSize(cellSize * 0.4);
        p5.fill(255);

        const labels = [
            `Type: ${stats.type}`,
            `Level: ${stats.level}/3`,
            `Damage: ${stats.damage}`,
            `Range: ${stats.range}`,
            `Fire Rate: ${stats.fireRate.toFixed(1)}/s`,
            `Kills: ${stats.kills}`,
            `Damage Dealt: ${stats.totalDamageDealt}`
        ];

        labels.forEach((label, index) => {
            p5.text(
                label,
                x + padding,
                y + padding + index * cellSize * 0.5
            );
        });

        // Upgrade info
        const upgradeInfo = this.selectedTower.getUpgradeInfo();
        if (upgradeInfo) {
            const canAfford = this.gameState.canAffordUpgrade(this.selectedTower);
            p5.fill(canAfford ? 50 : 30);
            p5.rect(
                x + padding,
                y + infoHeight - cellSize - padding,
                infoWidth - padding * 2,
                cellSize
            );

            p5.fill(255);
            p5.textAlign(p5.CENTER, p5.CENTER);
            p5.text(
                `Upgrade (💰 ${upgradeInfo.cost}): ${upgradeInfo.description}`,
                x + infoWidth / 2,
                y + infoHeight - cellSize / 2 - padding
            );
        }

        // Sell button
        const sellValue = this.gameState.calculateSellValue(this.selectedTower);
        p5.fill(100, 0, 0);
        p5.rect(
            x + padding,
            y + infoHeight - padding * 2,
            infoWidth - padding * 2,
            cellSize * 0.8
        );

        p5.fill(255);
        p5.textAlign(p5.CENTER, p5.CENTER);
        p5.text(
            `Sell for 💰 ${sellValue}`,
            x + infoWidth / 2,
            y + infoHeight - padding * 2 + cellSize * 0.4
        );
    }

    drawTowerPlacement(p5, cellSize) {
        if (!this.hoveredCell) return;

        const { x, y } = this.hoveredCell;
        const canPlace = this.gameState.canPlaceTower(x, y);

        // Draw placement preview
        p5.fill(canPlace ? 0 : 255, canPlace ? 255 : 0, 0, 100);
        p5.rect(
            x * cellSize,
            y * cellSize,
            cellSize,
            cellSize
        );

        // Draw range preview
        const towerConfig = this.gameState.getTowerConfig(this.towerType);
        if (towerConfig) {
            p5.noFill();
            p5.stroke(255, 255, 255, 50);
            p5.circle(
                x * cellSize + cellSize / 2,
                y * cellSize + cellSize / 2,
                towerConfig.range * 2
            );
        }
    }

    drawWaveInfo(p5, cellSize, gameWidth) {
        const padding = 10;
        const x = gameWidth + padding;
        const buttonWidth = cellSize * 8;
        const buttonHeight = cellSize;

        if (!this.gameState.isWaveInProgress()) {
            // Next wave button
            const y = p5.height - buttonHeight - padding;
            p5.fill(0, 100, 0);
            p5.rect(x, y, buttonWidth, buttonHeight);

            p5.fill(255);
            p5.textAlign(p5.CENTER, p5.CENTER);
            p5.textSize(cellSize * 0.4);
            p5.text(
                `Start Wave ${this.gameState.getCurrentWave() + 1}`,
                x + buttonWidth / 2,
                y + buttonHeight / 2
            );
        } else {
            // Wave progress
            p5.textAlign(p5.LEFT, p5.CENTER);
            p5.textSize(cellSize * 0.4);
            p5.fill(255);
            p5.text(
                `Remaining Creeps: ${this.gameState.getRemainingCreeps()}`,
                x,
                cellSize * 2
            );
        }
    }

    handleClick(x, y) {
        if (!this.p5) return false;

        const cellSize = this.gameState.getCellSize();
        const gameWidth = cellSize * 12;
        const menuX = gameWidth + 10;

        // Check tower menu clicks
        if (x > menuX && x < menuX + cellSize * 8) {
            const menuY = Math.floor((y - cellSize * 2.5) / cellSize);
            if (menuY >= 0 && menuY < 3) {
                const towerTypes = ['BASIC', 'FIRE', 'ICE'];
                this.startTowerPlacement(towerTypes[menuY]);
                return true;
            }
        }

        // Handle tower placement
        if (this.isPlacingTower && this.hoveredCell) {
            const success = this.gameState.placeTower(
                this.towerType,
                this.hoveredCell.x,
                this.hoveredCell.y
            );
            this.isPlacingTower = !success;
            return true;
        }

        // Handle tower selection
        const gridX = Math.floor(x / cellSize);
        const gridY = Math.floor(y / cellSize);
        if (gridX < 12 && gridY < 12) { // Only select towers within game area
            const tower = this.gameState.getTowerAt(gridX, gridY);
            if (tower) {
                this.selectedTower = tower;
                return true;
            }
        }

        // Handle wave start button
        if (!this.gameState.isWaveInProgress()) {
            const buttonX = menuX;
            const buttonY = this.p5.height - cellSize - 10;

            if (x >= buttonX && x <= buttonX + cellSize * 8 &&
                y >= buttonY && y <= buttonY + cellSize) {
                this.gameState.startNextWave();
                return true;
            }
        }

        this.selectedTower = null;
        return false;
    }

    handleHover(x, y) {
        if (!this.p5) return;

        const cellSize = this.gameState.getCellSize();
        const gridX = Math.floor(x / cellSize);
        const gridY = Math.floor(y / cellSize);

        // Only allow tower placement within game area
        if (gridX < 12 && gridY < 12) {
            this.hoveredCell = { x: gridX, y: gridY };
        } else {
            this.hoveredCell = null;
        }
    }

    startTowerPlacement(type) {
        if (this.gameState.canAffordTower(type)) {
            this.isPlacingTower = true;
            this.towerType = type;
            this.selectedTower = null;
        }
    }

    cancelTowerPlacement() {
        this.isPlacingTower = false;
        this.towerType = null;
    }
}
