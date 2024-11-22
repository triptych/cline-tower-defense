export const collision = {
    // Check if a point is within a circle
    pointInCircle(point, circle, radius) {
        const dx = point.x - circle.x;
        const dy = point.y - circle.y;
        return dx * dx + dy * dy <= radius * radius;
    },

    // Check if two circles overlap
    circleOverlap(circle1, radius1, circle2, radius2) {
        const dx = circle2.x - circle1.x;
        const dy = circle2.y - circle1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= radius1 + radius2;
    },

    // Check if a point is within a rectangle
    pointInRect(point, rect) {
        return point.x >= rect.x &&
               point.x <= rect.x + rect.width &&
               point.y >= rect.y &&
               point.y <= rect.y + rect.height;
    },

    // Get distance between two points
    distance(point1, point2) {
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        return Math.sqrt(dx * dx + dy * dy);
    },

    // Get squared distance between two points (faster than distance for comparisons)
    distanceSquared(point1, point2) {
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        return dx * dx + dy * dy;
    },

    // Check if a point is within a polygon
    pointInPolygon(point, vertices) {
        let inside = false;

        for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
            const xi = vertices[i].x;
            const yi = vertices[i].y;
            const xj = vertices[j].x;
            const yj = vertices[j].y;

            const intersect = ((yi > point.y) !== (yj > point.y)) &&
                (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);

            if (intersect) inside = !inside;
        }

        return inside;
    },

    // Get intersection point of two lines
    lineIntersection(line1Start, line1End, line2Start, line2End) {
        const x1 = line1Start.x;
        const y1 = line1Start.y;
        const x2 = line1End.x;
        const y2 = line1End.y;
        const x3 = line2Start.x;
        const y3 = line2Start.y;
        const x4 = line2End.x;
        const y4 = line2End.y;

        const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (denominator === 0) return null;

        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator;
        const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denominator;

        if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
            return {
                x: x1 + t * (x2 - x1),
                y: y1 + t * (y2 - y1)
            };
        }

        return null;
    },

    // Check if a moving circle collides with a line segment
    movingCircleLineCollision(circleStart, circleEnd, radius, lineStart, lineEnd) {
        // Get closest point on line to circle's path
        const closestPoint = this.closestPointOnLine(
            circleStart,
            circleEnd,
            lineStart,
            lineEnd
        );

        if (!closestPoint) return false;

        // Check if closest point is within circle's radius
        return this.distance(closestPoint, circleStart) <= radius ||
               this.distance(closestPoint, circleEnd) <= radius;
    },

    // Get closest point on a line segment to a point
    closestPointOnLine(point, lineStart, lineEnd) {
        const dx = lineEnd.x - lineStart.x;
        const dy = lineEnd.y - lineStart.y;
        const lengthSquared = dx * dx + dy * dy;

        if (lengthSquared === 0) {
            return { x: lineStart.x, y: lineStart.y };
        }

        let t = ((point.x - lineStart.x) * dx +
                 (point.y - lineStart.y) * dy) / lengthSquared;

        t = Math.max(0, Math.min(1, t));

        return {
            x: lineStart.x + t * dx,
            y: lineStart.y + t * dy
        };
    },

    // Check if a circle intersects with a rectangle
    circleRectCollision(circle, radius, rect) {
        const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
        const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));

        const distanceX = circle.x - closestX;
        const distanceY = circle.y - closestY;

        return (distanceX * distanceX + distanceY * distanceY) <= (radius * radius);
    }
};
