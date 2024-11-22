import { BaseCreep } from './BaseCreep.js';

export class TankCreep extends BaseCreep {
    constructor(pathSystem, gameState) {
        super('TANK', pathSystem, gameState);

        // Additional properties specific to TankCreep
        this.armor = 0.3; // 30% damage reduction
        this.shieldHealth = this.maxHealth * 0.5; // Additional shield
        this.maxShieldHealth = this.shieldHealth;
        this.shieldRegenRate = 5; // Shield points per second
        this.shieldRegenDelay = 3; // Seconds before shield starts regenerating
        this.lastDamageTime = 0;
    }

    takeDamage(amount) {
        this.lastDamageTime = this.gameState.getCurrentTime();

        // Handle shield damage first
        if (this.shieldHealth > 0) {
            const shieldDamage = Math.min(this.shieldHealth, amount);
            this.shieldHealth -= shieldDamage;
            amount -= shieldDamage;

            this.gameState.emit('creepShieldDamaged', {
                creep: this,
                damage: shieldDamage
            });

            // If there's no remaining damage, return early
            if (amount <= 0) return shieldDamage;
        }

        // Apply armor reduction to remaining damage
        const reducedDamage = amount * (1 - this.armor);

        // Emit armor reduction effect
        this.gameState.emit('creepArmorReduced', {
            creep: this,
            originalDamage: amount,
            reducedDamage: reducedDamage
        });

        return super.takeDamage(reducedDamage);
    }

    update(deltaTime) {
        super.update(deltaTime);

        // Handle shield regeneration
        const timeSinceLastDamage = this.gameState.getCurrentTime() - this.lastDamageTime;
        if (timeSinceLastDamage >= this.shieldRegenDelay && this.shieldHealth < this.maxShieldHealth) {
            const regenAmount = this.shieldRegenRate * deltaTime;
            this.shieldHealth = Math.min(this.maxShieldHealth, this.shieldHealth + regenAmount);

            this.gameState.emit('creepShieldRegenerated', {
                creep: this,
                amount: regenAmount
            });
        }

        // Slow nearby enemies (tank's special ability)
        if (this.health < this.maxHealth * 0.5) { // Activate when below 50% health
            this.applyAreaSlow();
        }
    }

    applyAreaSlow() {
        const slowRadius = 2; // Grid cells
        const slowAmount = 0.3; // 30% slow
        const creeps = this.gameState.getActiveCreeps();

        for (const creep of creeps) {
            if (creep === this) continue;

            const distance = Math.sqrt(
                Math.pow(creep.x - this.x, 2) +
                Math.pow(creep.y - this.y, 2)
            );

            if (distance <= slowRadius) {
                creep.addEffect('slow', 0.5, { // 0.5 second slow
                    multiplier: 1 - slowAmount,
                    source: this
                });
            }
        }
    }

    draw(p5, cellSize) {
        const screenX = this.x * cellSize + cellSize / 2;
        const screenY = this.y * cellSize + cellSize / 2;

        // Draw shield if active
        if (this.shieldHealth > 0) {
            const shieldPercentage = this.shieldHealth / this.maxShieldHealth;

            // Shield background
            p5.noFill();
            p5.stroke(100, 150, 255, 100);
            p5.strokeWeight(2);
            p5.circle(screenX, screenY, cellSize * 1.2);

            // Shield arc
            p5.stroke(100, 150, 255);
            p5.arc(
                screenX,
                screenY,
                cellSize * 1.2,
                cellSize * 1.2,
                -Math.PI / 2,
                -Math.PI / 2 + (Math.PI * 2 * shieldPercentage)
            );
        }

        // Draw base creep
        super.draw(p5, cellSize);

        // Draw armor indicator
        if (this.armor > 0) {
            p5.textSize(cellSize * 0.3);
            p5.text('🛡️', screenX, screenY - cellSize * 0.6);
        }

        // Draw area slow effect when active
        if (this.health < this.maxHealth * 0.5) {
            p5.noFill();
            p5.stroke(100, 100, 255, 50);
            p5.circle(screenX, screenY, cellSize * 4); // 2 cell radius * 2
        }
    }

    getHealthPercentage() {
        // Include shield in health calculation
        const totalHealth = this.maxHealth + this.maxShieldHealth;
        const currentHealth = this.health + this.shieldHealth;
        return currentHealth / totalHealth;
    }
}
