import { TOWER_TYPES } from '../../config/towers.js';
import { GRID_CELL_SIZE } from '../../config/levels.js';

export class BaseTower {
    constructor(type, x, y, gameState) {
        const config = TOWER_TYPES[type];
        if (!config) throw new Error(`Invalid tower type: ${type}`);

        this.type = type;
        this.x = x;
        this.y = y;
        this.gameState = gameState;

        // Tower properties
        this.level = 0;
        this.range = config.range;
        this.damage = config.damage;
        this.fireRate = config.fireRate;
        this.emoji = config.emoji;

        // Operational state
        this.target = null;
        this.cooldown = 0;
        this.totalDamageDealt = 0;
        this.kills = 0;
    }

    upgrade() {
        if (this.level >= 3) return false;

        const config = TOWER_TYPES[this.type];
        const upgrade = config.upgrades[this.level];

        if (!upgrade) return false;

        // Apply upgrade effects
        Object.entries(upgrade).forEach(([key, value]) => {
            if (key !== 'cost' && key !== 'description') {
                this[key] = value;
            }
        });

        this.level++;
        return true;
    }

    update(deltaTime) {
        // Update cooldown
        if (this.cooldown > 0) {
            this.cooldown -= deltaTime;
        }

        // Find and attack target
        if (this.cooldown <= 0) {
            this.findAndAttackTarget();
        }
    }

    findAndAttackTarget() {
        const creeps = this.gameState.getActiveCreeps();
        let nearestCreep = null;
        let nearestDistance = Infinity;

        // Find nearest creep in range
        for (const creep of creeps) {
            const distance = this.getDistanceTo(creep);
            if (distance <= this.range && distance < nearestDistance) {
                nearestCreep = creep;
                nearestDistance = distance;
            }
        }

        if (nearestCreep) {
            this.attack(nearestCreep);
        }
    }

    attack(creep) {
        // Reset cooldown
        this.cooldown = 1 / this.fireRate;

        // Apply damage
        const damageDealt = creep.takeDamage(this.damage);
        this.totalDamageDealt += damageDealt;

        // Check for kill
        if (creep.health <= 0) {
            this.kills++;
        }

        // Create projectile effect
        this.gameState.emit('towerAttack', {
            from: { x: this.x, y: this.y },
            to: { x: creep.x, y: creep.y },
            tower: this,
            target: creep
        });
    }

    getDistanceTo(target) {
        // Convert tower grid position to pixel coordinates
        const towerPixelX = (this.x + 0.5) * GRID_CELL_SIZE;
        const towerPixelY = (this.y + 0.5) * GRID_CELL_SIZE;

        // Creep coordinates are already in grid units, just need to convert to pixels
        const targetPixelX = target.x * GRID_CELL_SIZE;
        const targetPixelY = target.y * GRID_CELL_SIZE;

        // Calculate distance in pixels
        const dx = targetPixelX - towerPixelX;
        const dy = targetPixelY - towerPixelY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    getUpgradeInfo() {
        if (this.level >= 3) return null;

        const config = TOWER_TYPES[this.type];
        return config.upgrades[this.level];
    }

    // Stats and info methods
    getStats() {
        return {
            type: this.type,
            level: this.level,
            damage: this.damage,
            range: this.range,
            fireRate: this.fireRate,
            totalDamageDealt: this.totalDamageDealt,
            kills: this.kills
        };
    }

    getPosition() {
        return { x: this.x, y: this.y };
    }

    draw(p5, cellSize) {
        // Draw range indicator if selected
        if (this.gameState.selectedTower === this) {
            p5.noFill();
            p5.stroke(255, 255, 255, 100);
            p5.circle(
                this.x * cellSize + cellSize / 2,
                this.y * cellSize + cellSize / 2,
                this.range * 2
            );
        }

        // Draw tower emoji
        p5.textAlign(p5.CENTER, p5.CENTER);
        p5.textSize(cellSize * 0.8);
        p5.text(
            this.emoji,
            this.x * cellSize + cellSize / 2,
            this.y * cellSize + cellSize / 2
        );

        // Draw level indicator
        if (this.level > 0) {
            p5.textSize(cellSize * 0.3);
            p5.text(
                '⭐'.repeat(this.level),
                this.x * cellSize + cellSize / 2,
                this.y * cellSize + cellSize * 0.8
            );
        }
    }
}
