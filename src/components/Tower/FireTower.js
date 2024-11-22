import { BaseTower } from './BaseTower.js';

export class FireTower extends BaseTower {
    constructor(x, y, gameState) {
        super('FIRE', x, y, gameState);
        this.areaEffect = false;
        this.burnDuration = 0;
        this.explosionRadius = 0;
    }

    attack(creep) {
        // Reset cooldown
        this.cooldown = 1 / this.fireRate;

        // Apply direct damage
        const damageDealt = creep.takeDamage(this.damage);
        this.totalDamageDealt += damageDealt;

        // Apply burn effect if upgraded
        if (this.burnDuration > 0) {
            creep.addEffect('burn', this.burnDuration, {
                damage: this.damage * 0.2, // 20% of base damage per second
                source: this
            });
        }

        // Area damage if upgraded
        if (this.areaEffect) {
            const radius = this.explosionRadius || this.range * 0.3;
            const creeps = this.gameState.getActiveCreeps();

            for (const nearbyCreep of creeps) {
                if (nearbyCreep === creep) continue;

                const distance = this.getDistanceTo(nearbyCreep);
                if (distance <= radius) {
                    // Damage falls off with distance
                    const falloff = 1 - (distance / radius);
                    const areaDamage = Math.floor(this.damage * 0.5 * falloff);
                    const splashDamageDealt = nearbyCreep.takeDamage(areaDamage);
                    this.totalDamageDealt += splashDamageDealt;
                }
            }
        }

        // Check for kill
        if (creep.health <= 0) {
            this.kills++;
        }

        // Create fire attack effect
        this.gameState.emit('towerAttack', {
            from: { x: this.x, y: this.y },
            to: { x: creep.x, y: creep.y },
            tower: this,
            target: creep,
            type: 'fire',
            areaEffect: this.areaEffect,
            radius: this.explosionRadius
        });
    }

    upgrade() {
        const upgraded = super.upgrade();
        if (!upgraded) return false;

        // Apply fire-specific upgrade effects
        switch (this.level) {
            case 1:
                this.areaEffect = true;
                break;
            case 2:
                this.burnDuration = 3;
                break;
            case 3:
                this.explosionRadius = 50;
                break;
        }

        return true;
    }

    draw(p5, cellSize) {
        // Draw base tower
        super.draw(p5, cellSize);

        // Draw fire effects
        if (this.areaEffect || this.burnDuration > 0) {
            const screenX = this.x * cellSize + cellSize / 2;
            const screenY = this.y * cellSize + cellSize / 2;

            // Draw fire particles
            p5.push();
            p5.translate(screenX, screenY);

            for (let i = 0; i < 5; i++) {
                const angle = (i / 5) * Math.PI * 2 +
                            (p5.frameCount * 0.05);
                const x = Math.cos(angle) * (cellSize * 0.3);
                const y = Math.sin(angle) * (cellSize * 0.3);

                p5.textSize(cellSize * 0.3);
                p5.text('🔥', x, y);
            }

            p5.pop();
        }
    }
}
