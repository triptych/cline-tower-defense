# Tower Defense Game

A web-based tower defense game where players strategically place towers to defend against waves of enemies.

## Features

- Multiple tower types:
  - Fire Tower
  - Ice Tower
  - Base Tower
- Different enemy types:
  - Base Creep
  - Fast Creep
  - Tank Creep
- Wave-based gameplay
- Economy system
- Tower upgrade system
- Path finding system
- Collision detection

## Project Structure

```
src/
├── components/
│   ├── Creep/         # Enemy unit implementations
│   ├── Tower/         # Tower defense unit implementations
│   └── UI/            # Game interface components
├── config/            # Game configuration files
├── systems/           # Core game systems
└── utils/             # Utility functions
```

## Systems

- **Economy Manager**: Handles in-game currency and resources
- **Path System**: Manages enemy movement paths
- **Wave Manager**: Controls enemy wave spawning and progression

## Getting Started

1. Clone the repository
2. Open `index.html` in a web browser
3. Start playing!

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
