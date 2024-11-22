import { BaseTower } from './BaseTower.js';

export class IceTower extends BaseTower {
    constructor(x, y, gameState) {
        super('ICE', x, y, gameState);
        this.slowEffect = 0;
        this.freezeDuration = 0;
        this.chainFreeze = false;
        this.maxChainTargets = 3;
    }

    attack(creep) {
        // Reset cooldown
        this.cooldown = 1 / this.fireRate;

        // Apply direct damage and effects
        this.applyDamageAndEffects(creep);

        // Handle chain freeze if upgraded
        if (this.chainFreeze) {
            this.applyChainFreeze(creep);
        }

        // Create ice attack effect
        this.gameState.emit('towerAttack', {
            from: { x: this.x, y: this.y },
            to: { x: creep.x, y: creep.y },
            tower: this,
            target: creep,
            type: 'ice',
            chainFreeze: this.chainFreeze
        });
    }

    applyDamageAndEffects(creep) {
        // Apply direct damage
        const damageDealt = creep.takeDamage(this.damage);
        this.totalDamageDealt += damageDealt;

        // Apply slow effect if upgraded
        if (this.slowEffect > 0) {
            creep.addEffect('slow', 2, {
                multiplier: 1 - this.slowEffect,
                source: this
            });
        }

        // Apply freeze effect if upgraded
        if (this.freezeDuration > 0) {
            creep.addEffect('freeze', this.freezeDuration, {
                multiplier: 0, // Complete stop
                source: this
            });
        }

        // Check for kill
        if (creep.health <= 0) {
            this.kills++;
        }
    }

    applyChainFreeze(initialCreep) {
        const creeps = this.gameState.getActiveCreeps();
        const affectedCreeps = new Set([initialCreep]);
        let lastCreep = initialCreep;

        // Find chain targets
        while (affectedCreeps.size < this.maxChainTargets) {
            let nearestCreep = null;
            let nearestDistance = this.range * 0.5; // Chain range is half the normal range

            for (const creep of creeps) {
                if (affectedCreeps.has(creep)) continue;

                const distance = this.getDistanceBetweenCreeps(lastCreep, creep);
                if (distance <= nearestDistance) {
                    nearestCreep = creep;
                    nearestDistance = distance;
                }
            }

            if (!nearestCreep) break;

            // Apply effects to chain target
            this.applyDamageAndEffects(nearestCreep);
            affectedCreeps.add(nearestCreep);
            lastCreep = nearestCreep;

            // Create chain lightning effect
            this.gameState.emit('chainFreeze', {
                from: { x: lastCreep.x, y: lastCreep.y },
                to: { x: nearestCreep.x, y: nearestCreep.y }
            });
        }
    }

    getDistanceBetweenCreeps(creep1, creep2) {
        const dx = creep2.x - creep1.x;
        const dy = creep2.y - creep1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    upgrade() {
        const upgraded = super.upgrade();
        if (!upgraded) return false;

        // Apply ice-specific upgrade effects
        switch (this.level) {
            case 1:
                this.slowEffect = 0.5; // 50% speed reduction
                break;
            case 2:
                this.freezeDuration = 2; // 2 second freeze
                break;
            case 3:
                this.chainFreeze = true;
                break;
        }

        return true;
    }

    draw(p5, cellSize) {
        // Draw base tower
        super.draw(p5, cellSize);

        // Draw ice effects
        if (this.slowEffect > 0 || this.freezeDuration > 0) {
            const screenX = this.x * cellSize + cellSize / 2;
            const screenY = this.y * cellSize + cellSize / 2;

            // Draw ice crystals
            p5.push();
            p5.translate(screenX, screenY);

            for (let i = 0; i < 4; i++) {
                const angle = (i / 4) * Math.PI * 2 +
                            (p5.frameCount * 0.03);
                const x = Math.cos(angle) * (cellSize * 0.3);
                const y = Math.sin(angle) * (cellSize * 0.3);

                p5.textSize(cellSize * 0.3);
                p5.text('❄️', x, y);
            }

            p5.pop();
        }
    }
}
