import { BaseCreep } from './BaseCreep.js';

export class FastCreep extends BaseCreep {
    constructor(pathSystem, gameState) {
        super('FAST', pathSystem, gameState);

        // Additional properties specific to FastCreep
        this.dodgeChance = 0.2; // 20% chance to dodge attacks
        this.speedBoostCooldown = 0;
        this.speedBoostDuration = 0;
        this.baseSpeed = this.speed;
    }

    takeDamage(amount) {
        // Check for dodge
        if (Math.random() < this.dodgeChance) {
            this.gameState.emit('creepDodged', {
                creep: this,
                amount: amount
            });
            return 0;
        }

        return super.takeDamage(amount);
    }

    update(deltaTime) {
        // Handle speed boost cooldown
        if (this.speedBoostCooldown > 0) {
            this.speedBoostCooldown -= deltaTime;
        }

        // Handle active speed boost
        if (this.speedBoostDuration > 0) {
            this.speedBoostDuration -= deltaTime;
            if (this.speedBoostDuration <= 0) {
                this.speed = this.baseSpeed;
            }
        }

        // Try to activate speed boost when under attack
        if (this.health < this.maxHealth &&
            this.speedBoostCooldown <= 0 &&
            this.speedBoostDuration <= 0) {
            this.activateSpeedBoost();
        }

        super.update(deltaTime);
    }

    activateSpeedBoost() {
        this.speed = this.baseSpeed * 1.5; // 50% speed boost
        this.speedBoostDuration = 2; // 2 seconds of boost
        this.speedBoostCooldown = 8; // 8 seconds cooldown

        this.gameState.emit('creepSpeedBoost', {
            creep: this,
            multiplier: 1.5
        });
    }

    draw(p5, cellSize) {
        super.draw(p5, cellSize);

        // Draw speed boost effect
        if (this.speedBoostDuration > 0) {
            const screenX = this.x * cellSize + cellSize / 2;
            const screenY = this.y * cellSize + cellSize / 2;

            p5.push();
            p5.translate(screenX, screenY);

            // Draw speed lines
            p5.stroke(255, 255, 0, 150);
            p5.strokeWeight(2);
            const angle = Math.atan2(this.y - this.lastY, this.x - this.lastX);
            for (let i = 0; i < 3; i++) {
                const offset = (i - 1) * cellSize * 0.2;
                p5.line(
                    -Math.cos(angle) * cellSize * 0.4,
                    offset,
                    -Math.cos(angle) * cellSize * 0.2,
                    offset
                );
            }

            p5.pop();
        }

        // Store position for next frame's speed lines
        this.lastX = this.x;
        this.lastY = this.y;
    }
}
