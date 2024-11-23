export class UpgradeMenu {
    constructor(gameState) {
        this.gameState = gameState;
        this.visible = false;
        this.tower = null;
        this.position = { x: 0, y: 0 };
    }

    show(tower, x, y) {
        this.visible = true;
        this.tower = tower;
        this.position = { x, y };
    }

    hide() {
        this.visible = false;
        this.tower = null;
    }

    draw(p5, cellSize) {
        if (!this.visible || !this.tower) return;

        const menuWidth = cellSize * 5;
        const menuHeight = cellSize * 6;
        const padding = cellSize * 0.2;

        // Ensure menu stays within screen bounds
        let x = this.position.x;
        let y = this.position.y;

        if (x + menuWidth > p5.width) {
            x = p5.width - menuWidth;
        }
        if (y + menuHeight > p5.height) {
            y = p5.height - menuHeight;
        }

        // Save current drawing state
        p5.push();

        // Move tooltip to top layer
        p5.translate(0, 0, 1);

        // Draw menu background with higher opacity for better visibility
        p5.fill(0, 0, 0, 250);
        p5.stroke(255, 255, 255, 100);
        p5.rect(x, y, menuWidth, menuHeight);

        // Draw tower info
        this.drawTowerInfo(p5, x, y, menuWidth, padding, cellSize);

        // Draw upgrade options
        this.drawUpgradeOptions(p5, x, y, menuWidth, padding, cellSize);

        // Draw sell button
        this.drawSellButton(p5, x, y, menuWidth, menuHeight, padding, cellSize);

        // Restore drawing state
        p5.pop();
    }

    drawTowerInfo(p5, x, y, menuWidth, padding, cellSize) {
        const stats = this.tower.getStats();

        // Tower type and level
        p5.textAlign(p5.CENTER, p5.TOP);
        p5.textSize(cellSize * 0.4);
        p5.fill(255);
        p5.text(
            `${stats.type} Tower ${stats.level > 0 ? '⭐'.repeat(stats.level) : ''}`,
            x + menuWidth / 2,
            y + padding
        );

        // Stats
        p5.textAlign(p5.LEFT, p5.TOP);
        p5.textSize(cellSize * 0.35);
        const statLabels = [
            `Damage: ${stats.damage}`,
            `Range: ${stats.range}`,
            `Fire Rate: ${stats.fireRate.toFixed(1)}/s`,
            `Kills: ${stats.kills}`,
            `Total Damage: ${stats.totalDamageDealt}`
        ];

        statLabels.forEach((label, index) => {
            p5.text(
                label,
                x + padding,
                y + padding * 2 + cellSize * 0.5 * index
            );
        });
    }

    drawUpgradeOptions(p5, x, y, menuWidth, padding, cellSize) {
        const upgradeInfo = this.tower.getUpgradeInfo();
        if (!upgradeInfo) {
            p5.textAlign(p5.CENTER, p5.CENTER);
            p5.fill(150);
            p5.text(
                'Max Level Reached',
                x + menuWidth / 2,
                y + cellSize * 3.5
            );
            return;
        }

        // Draw upgrade button
        const buttonY = y + cellSize * 3;
        const canAfford = this.gameState.canAffordUpgrade(this.tower);

        p5.fill(canAfford ? 0 : 50, canAfford ? 100 : 30, 0);
        p5.rect(
            x + padding,
            buttonY,
            menuWidth - padding * 2,
            cellSize
        );

        // Upgrade info
        p5.fill(255);
        p5.textAlign(p5.CENTER, p5.CENTER);
        p5.textSize(cellSize * 0.35);
        p5.text(
            `Upgrade (💰 ${upgradeInfo.cost})`,
            x + menuWidth / 2,
            buttonY + cellSize * 0.3
        );
        p5.textSize(cellSize * 0.3);
        p5.text(
            upgradeInfo.description,
            x + menuWidth / 2,
            buttonY + cellSize * 0.7
        );
    }

    drawSellButton(p5, x, y, menuWidth, menuHeight, padding, cellSize) {
        const sellValue = this.gameState.calculateSellValue(this.tower);
        const buttonY = y + menuHeight - cellSize - padding;

        // Button background
        p5.fill(100, 0, 0);
        p5.rect(
            x + padding,
            buttonY,
            menuWidth - padding * 2,
            cellSize
        );

        // Sell text
        p5.fill(255);
        p5.textAlign(p5.CENTER, p5.CENTER);
        p5.textSize(cellSize * 0.4);
        p5.text(
            `Sell for 💰 ${sellValue}`,
            x + menuWidth / 2,
            buttonY + cellSize / 2
        );
    }

    handleClick(mouseX, mouseY, cellSize) {
        if (!this.visible || !this.tower) return false;

        const menuWidth = cellSize * 5;
        const menuHeight = cellSize * 6;
        const padding = cellSize * 0.2;
        const x = this.position.x;
        const y = this.position.y;

        // Check if click is within menu bounds
        if (mouseX < x || mouseX > x + menuWidth ||
            mouseY < y || mouseY > y + menuHeight) {
            this.hide();
            return false;
        }

        // Check upgrade button click
        const upgradeInfo = this.tower.getUpgradeInfo();
        if (upgradeInfo) {
            const buttonY = y + cellSize * 3;
            if (mouseY >= buttonY && mouseY <= buttonY + cellSize &&
                mouseX >= x + padding && mouseX <= x + menuWidth - padding) {
                if (this.gameState.upgradeTower(this.tower)) {
                    // If max level reached after upgrade, hide menu
                    if (!this.tower.getUpgradeInfo()) {
                        this.hide();
                    }
                    return true;
                }
            }
        }

        // Check sell button click
        const sellButtonY = y + menuHeight - cellSize - padding;
        if (mouseY >= sellButtonY && mouseY <= sellButtonY + cellSize &&
            mouseX >= x + padding && mouseX <= x + menuWidth - padding) {
            if (this.gameState.sellTower(this.tower)) {
                this.hide();
                return true;
            }
        }

        return true; // Click was handled by menu
    }

    isVisible() {
        return this.visible;
    }
}
