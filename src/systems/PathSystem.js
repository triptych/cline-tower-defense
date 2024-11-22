export class PathSystem {
    constructor(path) {
        this.path = path;
        this.pathLength = this.calculatePathLength();
    }

    calculatePathLength() {
        let length = 0;
        for (let i = 1; i < this.path.length; i++) {
            const prev = this.path[i - 1];
            const curr = this.path[i];
            length += Math.sqrt(
                Math.pow(curr.x - prev.x, 2) +
                Math.pow(curr.y - prev.y, 2)
            );
        }
        return length;
    }

    // Get position along path based on progress (0-1)
    getPositionAtProgress(progress) {
        if (progress <= 0) return { ...this.path[0] };
        if (progress >= 1) return { ...this.path[this.path.length - 1] };

        const targetDistance = progress * this.pathLength;
        let currentDistance = 0;

        for (let i = 1; i < this.path.length; i++) {
            const prev = this.path[i - 1];
            const curr = this.path[i];
            const segmentLength = Math.sqrt(
                Math.pow(curr.x - prev.x, 2) +
                Math.pow(curr.y - prev.y, 2)
            );

            if (currentDistance + segmentLength >= targetDistance) {
                const remainingDistance = targetDistance - currentDistance;
                const segmentProgress = remainingDistance / segmentLength;

                return {
                    x: prev.x + (curr.x - prev.x) * segmentProgress,
                    y: prev.y + (curr.y - prev.y) * segmentProgress
                };
            }

            currentDistance += segmentLength;
        }

        return { ...this.path[this.path.length - 1] };
    }

    // Get direction at a specific point on the path
    getDirectionAtProgress(progress) {
        const currentPos = this.getPositionAtProgress(progress);
        const nextPos = this.getPositionAtProgress(progress + 0.01);

        return {
            x: nextPos.x - currentPos.x,
            y: nextPos.y - currentPos.y
        };
    }

    // Check if a point is near the path
    isNearPath(point, threshold = 0.5) {
        for (let i = 1; i < this.path.length; i++) {
            const prev = this.path[i - 1];
            const curr = this.path[i];

            const distance = this.pointToLineDistance(
                point,
                prev,
                curr
            );

            if (distance <= threshold) return true;
        }
        return false;
    }

    // Helper function to calculate point to line segment distance
    pointToLineDistance(point, lineStart, lineEnd) {
        const A = point.x - lineStart.x;
        const B = point.y - lineStart.y;
        const C = lineEnd.x - lineStart.x;
        const D = lineEnd.y - lineStart.y;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;

        if (lenSq !== 0) param = dot / lenSq;

        let xx, yy;

        if (param < 0) {
            xx = lineStart.x;
            yy = lineStart.y;
        } else if (param > 1) {
            xx = lineEnd.x;
            yy = lineEnd.y;
        } else {
            xx = lineStart.x + param * C;
            yy = lineStart.y + param * D;
        }

        const dx = point.x - xx;
        const dy = point.y - yy;

        return Math.sqrt(dx * dx + dy * dy);
    }
}
