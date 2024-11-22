import { TOWER_TYPES } from '../config/towers.js';

export class EconomyManager {
    constructor(startingCurrency = 300) {
        this.currency = startingCurrency;
        this.subscribers = new Set();
    }

    subscribe(callback) {
        this.subscribers.add(callback);
        // Immediately notify the new subscriber of current state
        callback(this.currency);
        return () => this.subscribers.delete(callback);
    }

    notify() {
        this.subscribers.forEach(callback => callback(this.currency));
    }

    getCurrency() {
        return this.currency;
    }

    addCurrency(amount) {
        if (amount <= 0) return false;
        this.currency += amount;
        this.notify();
        return true;
    }

    spendCurrency(amount) {
        if (amount <= 0 || amount > this.currency) return false;
        this.currency -= amount;
        this.notify();
        return true;
    }

    canAfford(amount) {
        return this.currency >= amount;
    }

    // Tower-specific methods
    canPurchaseTower(towerType) {
        const tower = TOWER_TYPES[towerType];
        return tower && this.canAfford(tower.cost);
    }

    purchaseTower(towerType) {
        const tower = TOWER_TYPES[towerType];
        if (!tower || !this.canAfford(tower.cost)) return false;

        return this.spendCurrency(tower.cost);
    }

    canUpgradeTower(tower) {
        if (!tower || tower.level >= 3) return false;

        const towerConfig = TOWER_TYPES[tower.type];
        if (!towerConfig) return false;

        const nextUpgrade = towerConfig.upgrades[tower.level];
        return nextUpgrade && this.canAfford(nextUpgrade.cost);
    }

    upgradeTower(tower) {
        if (!this.canUpgradeTower(tower)) return false;

        const towerConfig = TOWER_TYPES[tower.type];
        const upgradeCost = towerConfig.upgrades[tower.level].cost;

        return this.spendCurrency(upgradeCost);
    }

    // Calculate sell value for a tower (50% of total investment)
    calculateSellValue(tower) {
        if (!tower) return 0;

        const towerConfig = TOWER_TYPES[tower.type];
        if (!towerConfig) return 0;

        let totalInvestment = towerConfig.cost;

        // Add upgrade costs
        for (let i = 0; i < tower.level; i++) {
            totalInvestment += towerConfig.upgrades[i].cost;
        }

        return Math.floor(totalInvestment * 0.5); // 50% return on investment
    }

    sellTower(tower) {
        const sellValue = this.calculateSellValue(tower);
        if (sellValue <= 0) return false;

        this.addCurrency(sellValue);
        return true;
    }

    // Reset economy to starting amount
    reset(startingCurrency = 300) {
        this.currency = startingCurrency;
        this.notify();
    }
}
