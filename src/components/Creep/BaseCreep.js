import { CREEP_TYPES } from '../../config/creeps.js';

export class BaseCreep {
    constructor(type, pathSystem, gameState) {
        const config = CREEP_TYPES[type];
        if (!config) throw new Error(`Invalid creep type: ${type}`);

        this.type = type;
        this.pathSystem = pathSystem;
        this.gameState = gameState;

        // Basic properties from config
        this.maxHealth = config.health;
        this.health = config.health;
        this.speed = config.speed;
        this.reward = config.reward;
        this.damage = config.damage;
        this.emoji = config.emoji;

        // Movement properties
        this.progress = 0;
        this.position = pathSystem.getPositionAtProgress(0);
        this.x = this.position.x;
        this.y = this.position.y;

        // Status effects
        this.effects = new Map();
        this.reachedEnd = false;
    }

    update(deltaTime) {
        // Update status effects
        this.updateEffects(deltaTime);

        // Calculate effective speed considering effects
        let effectiveSpeed = this.speed;
        if (this.effects.has('slow')) {
            effectiveSpeed *= this.effects.get('slow').multiplier;
        }

        // Update position along path
        this.progress += (effectiveSpeed * deltaTime) / this.pathSystem.pathLength;

        if (this.progress >= 1) {
            this.reachedEnd = true;
            return;
        }

        // Update position
        this.position = this.pathSystem.getPositionAtProgress(this.progress);
        this.x = this.position.x;
        this.y = this.position.y;

        // Get direction for rotation
        const direction = this.pathSystem.getDirectionAtProgress(this.progress);
        this.rotation = Math.atan2(direction.y, direction.x);
    }

    takeDamage(amount) {
        const actualDamage = Math.min(this.health, amount);
        this.health -= actualDamage;

        // Emit damage taken event
        this.gameState.emit('creepDamaged', {
            creep: this,
            damage: actualDamage
        });

        return actualDamage;
    }

    addEffect(effectType, duration, params = {}) {
        this.effects.set(effectType, {
            duration,
            ...params
        });
    }

    updateEffects(deltaTime) {
        for (const [effect, data] of this.effects.entries()) {
            data.duration -= deltaTime;
            if (data.duration <= 0) {
                this.effects.delete(effect);
            }
        }
    }

    getHealthPercentage() {
        return this.health / this.maxHealth;
    }

    draw(p5, cellSize) {
        const screenX = this.x * cellSize + cellSize / 2;
        const screenY = this.y * cellSize + cellSize / 2;

        // Draw health bar
        const healthBarWidth = cellSize * 0.8;
        const healthBarHeight = cellSize * 0.1;
        const healthPercentage = this.getHealthPercentage();

        p5.noStroke();
        // Health bar background
        p5.fill(255, 0, 0);
        p5.rect(
            screenX - healthBarWidth / 2,
            screenY - cellSize / 2 - healthBarHeight * 2,
            healthBarWidth,
            healthBarHeight
        );
        // Current health
        p5.fill(0, 255, 0);
        p5.rect(
            screenX - healthBarWidth / 2,
            screenY - cellSize / 2 - healthBarHeight * 2,
            healthBarWidth * healthPercentage,
            healthBarHeight
        );

        // Draw status effects
        let effectOffset = 0;
        for (const effect of this.effects.keys()) {
            p5.textSize(cellSize * 0.3);
            p5.text(
                this.getEffectEmoji(effect),
                screenX - cellSize * 0.3 + effectOffset,
                screenY - cellSize * 0.4
            );
            effectOffset += cellSize * 0.3;
        }

        // Draw creep emoji
        p5.push();
        p5.translate(screenX, screenY);
        p5.rotate(this.rotation);
        p5.textAlign(p5.CENTER, p5.CENTER);
        p5.textSize(cellSize * 0.8);
        p5.text(this.emoji, 0, 0);
        p5.pop();
    }

    getEffectEmoji(effect) {
        switch (effect) {
            case 'slow':
                return '❄️';
            case 'burn':
                return '🔥';
            case 'freeze':
                return '🧊';
            default:
                return '✨';
        }
    }
}
