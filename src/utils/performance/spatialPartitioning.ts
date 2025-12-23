/**
 * Spatial Partitioning - Quadtree implementation for efficient collision detection
 * Reduces collision checks from O(n²) to O(n log n)
 */

export interface Point {
  x: number;
  y: number;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SpatialEntity {
  id: string;
  x: number;
  y: number;
}

/**
 * Quadtree node for spatial partitioning
 */
class QuadTreeNode<T extends SpatialEntity> {
  private boundary: Rectangle;
  private capacity: number;
  private entities: T[] = [];
  private divided = false;
  private northeast?: QuadTreeNode<T> | undefined;
  private northwest?: QuadTreeNode<T> | undefined;
  private southeast?: QuadTreeNode<T> | undefined;
  private southwest?: QuadTreeNode<T> | undefined;

  constructor(boundary: Rectangle, capacity = 4) {
    this.boundary = boundary;
    this.capacity = capacity;
  }

  /**
   * Check if a point is within this node's boundary
   */
  private contains(point: Point): boolean {
    return (
      point.x >= this.boundary.x - this.boundary.width &&
      point.x < this.boundary.x + this.boundary.width &&
      point.y >= this.boundary.y - this.boundary.height &&
      point.y < this.boundary.y + this.boundary.height
    );
  }

  /**
   * Check if a rectangle intersects with this node's boundary
   */
  private intersects(range: Rectangle): boolean {
    return !(
      range.x - range.width > this.boundary.x + this.boundary.width ||
      range.x + range.width < this.boundary.x - this.boundary.width ||
      range.y - range.height > this.boundary.y + this.boundary.height ||
      range.y + range.height < this.boundary.y - this.boundary.height
    );
  }

  /**
   * Subdivide this node into four children
   */
  private subdivide(): void {
    const x = this.boundary.x;
    const y = this.boundary.y;
    const w = this.boundary.width / 2;
    const h = this.boundary.height / 2;

    this.northeast = new QuadTreeNode<T>(
      { x: x + w, y: y - h, width: w, height: h },
      this.capacity
    );
    this.northwest = new QuadTreeNode<T>(
      { x: x - w, y: y - h, width: w, height: h },
      this.capacity
    );
    this.southeast = new QuadTreeNode<T>(
      { x: x + w, y: y + h, width: w, height: h },
      this.capacity
    );
    this.southwest = new QuadTreeNode<T>(
      { x: x - w, y: y + h, width: w, height: h },
      this.capacity
    );

    this.divided = true;
  }

  /**
   * Insert an entity into the quadtree
   */
  insert(entity: T): boolean {
    if (!this.contains(entity)) {
      return false;
    }

    if (this.entities.length < this.capacity) {
      this.entities.push(entity);
      return true;
    }

    if (!this.divided) {
      this.subdivide();
    }

    // Try to insert into children
    if (this.northeast?.insert(entity)) return true;
    if (this.northwest?.insert(entity)) return true;
    if (this.southeast?.insert(entity)) return true;
    if (this.southwest?.insert(entity)) return true;

    // If children are full, keep in this node
    this.entities.push(entity);
    return true;
  }

  /**
   * Query entities within a rectangular range
   */
  query(range: Rectangle, found: T[] = []): T[] {
    if (!this.intersects(range)) {
      return found;
    }

    for (const entity of this.entities) {
      if (
        entity.x >= range.x - range.width &&
        entity.x < range.x + range.width &&
        entity.y >= range.y - range.height &&
        entity.y < range.y + range.height
      ) {
        found.push(entity);
      }
    }

    if (this.divided) {
      this.northeast?.query(range, found);
      this.northwest?.query(range, found);
      this.southeast?.query(range, found);
      this.southwest?.query(range, found);
    }

    return found;
  }

  /**
   * Query entities within a circular range
   */
  queryCircle(center: Point, radius: number, found: T[] = []): T[] {
    // Use bounding box for initial check
    const range: Rectangle = {
      x: center.x,
      y: center.y,
      width: radius,
      height: radius,
    };

    if (!this.intersects(range)) {
      return found;
    }

    const radiusSquared = radius * radius;

    for (const entity of this.entities) {
      const dx = entity.x - center.x;
      const dy = entity.y - center.y;
      const distanceSquared = dx * dx + dy * dy;

      if (distanceSquared <= radiusSquared) {
        found.push(entity);
      }
    }

    if (this.divided) {
      this.northeast?.queryCircle(center, radius, found);
      this.northwest?.queryCircle(center, radius, found);
      this.southeast?.queryCircle(center, radius, found);
      this.southwest?.queryCircle(center, radius, found);
    }

    return found;
  }

  /**
   * Clear all entities from the tree
   */
  clear(): void {
    this.entities = [];
    this.divided = false;
    this.northeast = undefined;
    this.northwest = undefined;
    this.southeast = undefined;
    this.southwest = undefined;
  }
}

/**
 * Quadtree for efficient spatial queries
 */
export class QuadTree<T extends SpatialEntity> {
  private root: QuadTreeNode<T>;
  private boundary: Rectangle;

  constructor(boundary: Rectangle, capacity = 4) {
    this.boundary = boundary;
    this.root = new QuadTreeNode<T>(boundary, capacity);
  }

  /**
   * Insert an entity into the quadtree
   */
  insert(entity: T): boolean {
    return this.root.insert(entity);
  }

  /**
   * Insert multiple entities at once
   */
  insertMany(entities: T[]): void {
    for (const entity of entities) {
      this.root.insert(entity);
    }
  }

  /**
   * Query entities within a rectangular range
   */
  query(range: Rectangle): T[] {
    return this.root.query(range, []);
  }

  /**
   * Query entities within a circular range
   */
  queryCircle(center: Point, radius: number): T[] {
    return this.root.queryCircle(center, radius, []);
  }

  /**
   * Query entities near a point (within radius)
   */
  queryNearby(point: Point, radius: number): T[] {
    return this.queryCircle(point, radius);
  }

  /**
   * Clear and rebuild the tree
   */
  clear(): void {
    this.root.clear();
  }

  /**
   * Rebuild the tree with new entities
   */
  rebuild(entities: T[]): void {
    this.clear();
    this.insertMany(entities);
  }
}

/**
 * Helper function to create a quadtree from game bounds
 */
export function createGameQuadTree<T extends SpatialEntity>({
  centerX = 0,
  centerY = 0,
  width = 100,
  height = 100,
  capacity = 4,
}: {
  centerX?: number;
  centerY?: number;
  width?: number;
  height?: number;
  capacity?: number;
} = {}): QuadTree<T> {
  return new QuadTree<T>(
    {
      x: centerX,
      y: centerY,
      width: width / 2,
      height: height / 2,
    },
    capacity
  );
}

/**
 * Helper to find nearest entity to a point
 */
export function findNearestEntity<T extends SpatialEntity>(
  point: Point,
  entities: T[]
): T | null {
  if (entities.length === 0) return null;

  let nearest: T | null = entities[0] ?? null;
  let minDistanceSquared = Infinity;

  for (const entity of entities) {
    const dx = entity.x - point.x;
    const dy = entity.y - point.y;
    const distanceSquared = dx * dx + dy * dy;

    if (distanceSquared < minDistanceSquared) {
      minDistanceSquared = distanceSquared;
      nearest = entity;
    }
  }

  return nearest;
}

/**
 * Helper to check collision between two circles
 */
export function circleCollision(
  a: Point & { radius: number },
  b: Point & { radius: number }
): boolean {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const distanceSquared = dx * dx + dy * dy;
  const radiusSum = a.radius + b.radius;
  return distanceSquared <= radiusSum * radiusSum;
}
