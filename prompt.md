# Tower Defense Game Requirements

## Overview

Create a web-based tower defense game using P5.js where players defend against waves of enemies (creeps) using upgradeable towers. The game will feature emoji-based graphics for a unique and playful aesthetic.

## Modern JavaScript Development Guidelines

### Project Structure

```
src/
├── components/
│   ├── Tower/
│   │   ├── BaseTower.js
│   │   ├── FireTower.js
│   │   └── IceTower.js
│   ├── Creep/
│   │   ├── BaseCreep.js
│   │   ├── FastCreep.js
│   │   └── TankCreep.js
│   └── UI/
│       ├── GameMenu.js
│       └── UpgradeMenu.js
├── systems/
│   ├── PathSystem.js
│   ├── WaveManager.js
│   └── EconomyManager.js
├── utils/
│   ├── collision.js
│   └── pathfinding.js
├── config/
│   ├── levels.js
│   ├── towers.js
│   └── creeps.js
└── game.js
```

### Code Standards

- Use ES6+ features:

  ```javascript
  // Class-based components
  class Tower {
    #privateField;  // Private fields
    static defaults = {};  // Static fields

    constructor() {
      this.state = {
        level: 1,
        upgrades: new Set()
      };
    }
  }

  // Arrow functions
  const handleUpgrade = (tower) => {
    if (!tower.canUpgrade) return;
    // ...
  };

  // Async/await for animations
  async function animateProjectile(start, target) {
    // ...
  }
  ```

- Use modules for better organization:

  ```javascript
  // towers.js
  export class BaseTower {
    // ...
  }

  // game.js
  import { BaseTower } from './components/Tower/BaseTower.js';
  ```

### Development Best Practices

1. State Management

   ```javascript
   class GameState {
     #state;
     #subscribers = new Set();

     constructor() {
       this.#state = {
         lives: 100,
         currency: 300,
         wave: 1,
         towers: new Map()
       };
     }

     subscribe(callback) {
       this.#subscribers.add(callback);
     }

     update(newState) {
       this.#state = { ...this.#state, ...newState };
       this.#notify();
     }
   }
   ```

2. Event System

   ```javascript
   const EventEmitter = {
     events: new Map(),

     on(event, callback) {
       if (!this.events.has(event)) {
         this.events.set(event, new Set());
       }
       this.events.get(event).add(callback);
     },

     emit(event, data) {
       if (this.events.has(event)) {
         this.events.get(event).forEach(cb => cb(data));
       }
     }
   };
   ```

3. Component-Based Architecture

   ```javascript
   class GameObject {
     components = new Map();

     addComponent(component) {
       this.components.set(component.constructor.name, component);
     }

     getComponent(componentClass) {
       return this.components.get(componentClass.name);
     }
   }
   ```

## Core Mechanics

### Graphics & UI

- Use emojis for all game elements:
  - Towers: 🗼 (basic), 🏰 (upgraded)
  - Creeps: 👾 (basic), 👻 (fast), 🤖 (tank)
  - Projectiles: ⚡ (basic), 🔥 (fire), ❄️ (ice)
  - Health/Lives: ❤️
  - Currency: 💰
  - Path markers: ⬜
  - Background tiles: 🟩
  - Start point: 🟦
  - End point: 🟥

### Tower Types

1. Basic Tower (🗼)
   - Cost: 100 coins
   - Upgrades:
     - Level 1: Increased damage
     - Level 2: Faster firing rate
     - Level 3: Extended range

2. Fire Tower (🏰)
   - Cost: 200 coins
   - Upgrades:
     - Level 1: Area damage
     - Level 2: Burning effect
     - Level 3: Explosion radius

3. Ice Tower (🏰)
   - Cost: 200 coins
   - Upgrades:
     - Level 1: Slow effect
     - Level 2: Freeze duration
     - Level 3: Chain freeze

### Creep Types

1. Basic Creep (👾)
   - Medium speed
   - Medium health
   - Worth: 10 coins

2. Fast Creep (👻)
   - High speed
   - Low health
   - Worth: 15 coins

3. Tank Creep (🤖)
   - Slow speed
   - High health
   - Worth: 25 coins

### Level Design

- Multiple levels with increasing difficulty
- Each level features:
  - Unique path layout
  - Designated tower placement spots
  - Wave composition
  - Starting resources
  - Required score to advance

### Path System

- Pre-defined paths using coordinate system
- Clear visual indicators for:
  - Path tiles (⬜)
  - Tower placement spots (⭕)
  - Start and end points

## Technical Implementation

### P5.js Integration

```javascript
class GameRenderer {
  constructor(p5Instance) {
    this.p5 = p5Instance;
    this.layers = new Map();
  }

  addToLayer(layerName, drawable) {
    if (!this.layers.has(layerName)) {
      this.layers.set(layerName, new Set());
    }
    this.layers.get(layerName).add(drawable);
  }

  draw() {
    for (const [_, layer] of this.layers) {
      layer.forEach(drawable => drawable.draw(this.p5));
    }
  }
}
```

### Performance Optimization

1. Object Pooling

   ```javascript
   class ProjectilePool {
     #pool = [];
     #active = new Set();

     acquire() {
       let projectile = this.#pool.pop() || new Projectile();
       this.#active.add(projectile);
       return projectile;
     }

     release(projectile) {
       this.#active.delete(projectile);
       this.#pool.push(projectile);
     }
   }
   ```

2. Spatial Partitioning

   ```javascript
   class Grid {
     constructor(width, height, cellSize) {
       this.cells = new Map();
       this.cellSize = cellSize;
     }

     getCell(x, y) {
       const key = `${Math.floor(x/this.cellSize)},${Math.floor(y/this.cellSize)}`;
       return this.cells.get(key);
     }

     insert(entity) {
       // Add entity to appropriate cell
     }
   }
   ```

### Testing Strategy

1. Unit Tests (Using Jest)

   ```javascript
   describe('Tower', () => {
     test('should properly upgrade', () => {
       const tower = new Tower();
       tower.upgrade();
       expect(tower.level).toBe(2);
     });
   });
   ```

2. Integration Tests

   ```javascript
   describe('Game Systems', () => {
     test('should properly handle wave completion', async () => {
       const game = new Game();
       await game.startWave();
       // Assert game state after wave
     });
   });
   ```

### Development Tools

- Webpack for bundling
- ESLint for code quality
- Prettier for code formatting
- Jest for testing
- GitHub Actions for CI/CD

## Game States

1. Main Menu
2. Game Play
3. Level Complete

## Economy System

- Starting currency: 300 coins
- Earn coins by:
  - Defeating creeps
  - Completing waves
  - Level bonuses
- Spend coins on:
  - New towers
  - Tower upgrades
  - Special abilities

## Victory/Defeat Conditions

- Victory:
  - Complete all waves
  - Maintain at least one life
- Defeat:
  - Lose all lives
  - Too many creeps reach end point

## Future Enhancements

- Additional tower types
- Special abilities
- Boss creeps
- Environmental hazards
- Achievements system
