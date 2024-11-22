export const pathfinding = {
    // A* pathfinding algorithm
    findPath(start, end, grid, options = {}) {
        const openSet = new Set([start]);
        const closedSet = new Set();
        const cameFrom = new Map();

        const gScore = new Map();
        gScore.set(this.pointToKey(start), 0);

        const fScore = new Map();
        fScore.set(this.pointToKey(start), this.heuristic(start, end));

        while (openSet.size > 0) {
            const current = this.getLowestFScore(openSet, fScore);
            if (this.pointsEqual(current, end)) {
                return this.reconstructPath(cameFrom, current);
            }

            openSet.delete(current);
            closedSet.add(this.pointToKey(current));

            for (const neighbor of this.getNeighbors(current, grid, options)) {
                if (closedSet.has(this.pointToKey(neighbor))) continue;

                const tentativeGScore = gScore.get(this.pointToKey(current)) +
                                      this.distance(current, neighbor);

                if (!openSet.has(neighbor)) {
                    openSet.add(neighbor);
                } else if (tentativeGScore >= gScore.get(this.pointToKey(neighbor))) {
                    continue;
                }

                cameFrom.set(this.pointToKey(neighbor), current);
                gScore.set(this.pointToKey(neighbor), tentativeGScore);
                fScore.set(
                    this.pointToKey(neighbor),
                    gScore.get(this.pointToKey(neighbor)) + this.heuristic(neighbor, end)
                );
            }
        }

        return null; // No path found
    },

    // Get valid neighboring cells
    getNeighbors(point, grid, options = {}) {
        const neighbors = [];
        const { allowDiagonal = false } = options;

        // Orthogonal directions
        const directions = [
            { x: 0, y: -1 },  // Up
            { x: 1, y: 0 },   // Right
            { x: 0, y: 1 },   // Down
            { x: -1, y: 0 }   // Left
        ];

        // Add diagonal directions if allowed
        if (allowDiagonal) {
            directions.push(
                { x: 1, y: -1 },  // Up-Right
                { x: 1, y: 1 },   // Down-Right
                { x: -1, y: 1 },  // Down-Left
                { x: -1, y: -1 }  // Up-Left
            );
        }

        for (const dir of directions) {
            const newX = point.x + dir.x;
            const newY = point.y + dir.y;

            if (this.isValidCell(newX, newY, grid)) {
                neighbors.push({ x: newX, y: newY });
            }
        }

        return neighbors;
    },

    // Check if a cell is valid (within grid bounds and walkable)
    isValidCell(x, y, grid) {
        return y >= 0 && y < grid.length &&
               x >= 0 && x < grid[y].length &&
               this.isWalkable(grid[y][x]);
    },

    // Check if a tile is walkable
    isWalkable(tile) {
        return tile === '⬜' || tile === '🟦' || tile === '🟥';
    },

    // Manhattan distance heuristic
    heuristic(a, b) {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    },

    // Euclidean distance
    distance(a, b) {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        return Math.sqrt(dx * dx + dy * dy);
    },

    // Get point with lowest f-score from open set
    getLowestFScore(openSet, fScore) {
        let lowest = null;
        let lowestScore = Infinity;

        for (const point of openSet) {
            const score = fScore.get(this.pointToKey(point));
            if (score < lowestScore) {
                lowest = point;
                lowestScore = score;
            }
        }

        return lowest;
    },

    // Convert point to string key for Map/Set
    pointToKey(point) {
        return `${point.x},${point.y}`;
    },

    // Check if two points are equal
    pointsEqual(a, b) {
        return a.x === b.x && a.y === b.y;
    },

    // Reconstruct path from came-from map
    reconstructPath(cameFrom, current) {
        const path = [current];
        let currentKey = this.pointToKey(current);

        while (cameFrom.has(currentKey)) {
            current = cameFrom.get(currentKey);
            currentKey = this.pointToKey(current);
            path.unshift(current);
        }

        return path;
    },

    // Find all reachable cells from a starting point
    findReachableCells(start, grid, maxDistance) {
        const reachable = new Set();
        const queue = [{ point: start, distance: 0 }];
        const visited = new Set([this.pointToKey(start)]);

        while (queue.length > 0) {
            const { point, distance } = queue.shift();

            if (distance <= maxDistance) {
                reachable.add(this.pointToKey(point));

                for (const neighbor of this.getNeighbors(point, grid)) {
                    const neighborKey = this.pointToKey(neighbor);
                    if (!visited.has(neighborKey)) {
                        visited.add(neighborKey);
                        queue.push({
                            point: neighbor,
                            distance: distance + 1
                        });
                    }
                }
            }
        }

        return reachable;
    },

    // Get path length
    getPathLength(path) {
        let length = 0;
        for (let i = 1; i < path.length; i++) {
            length += this.distance(path[i - 1], path[i]);
        }
        return length;
    },

    // Smooth path by removing unnecessary points
    smoothPath(path, grid) {
        if (path.length <= 2) return path;

        const smoothed = [path[0]];
        let current = 0;

        while (current < path.length - 1) {
            let furthest = current + 1;

            for (let i = current + 2; i < path.length; i++) {
                if (this.hasLineOfSight(path[current], path[i], grid)) {
                    furthest = i;
                }
            }

            smoothed.push(path[furthest]);
            current = furthest;
        }

        return smoothed;
    },

    // Check if there's a clear line of sight between two points
    hasLineOfSight(start, end, grid) {
        const points = this.getLinePoints(start, end);

        for (const point of points) {
            if (!this.isValidCell(Math.floor(point.x), Math.floor(point.y), grid)) {
                return false;
            }
        }

        return true;
    },

    // Get points along a line using Bresenham's algorithm
    getLinePoints(start, end) {
        const points = [];
        let x1 = start.x;
        let y1 = start.y;
        const x2 = end.x;
        const y2 = end.y;

        const dx = Math.abs(x2 - x1);
        const dy = Math.abs(y2 - y1);
        const sx = x1 < x2 ? 1 : -1;
        const sy = y1 < y2 ? 1 : -1;
        let err = dx - dy;

        while (true) {
            points.push({ x: x1, y: y1 });

            if (x1 === x2 && y1 === y2) break;

            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x1 += sx;
            }
            if (e2 < dx) {
                err += dx;
                y1 += sy;
            }
        }

        return points;
    }
};
