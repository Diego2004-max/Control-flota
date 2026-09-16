export interface Point {
  lat: number;
  lng: number;
}

export interface Segment {
  id: string;
  routeId: string;
  p1: Point;
  p2: Point;
}

export class SpatialGrid {
  private grid: Map<string, Segment[]> = new Map();
  private cellSize: number; 

  constructor(cellSize: number = 0.00045) {
    this.cellSize = cellSize;
  }

  private getCellKey(lat: number, lng: number): string {
    const x = Math.floor(lng / this.cellSize);
    const y = Math.floor(lat / this.cellSize);
    return `${x}_${y}`;
  }

  insertSegment(segment: Segment) {
    const key1 = this.getCellKey(segment.p1.lat, segment.p1.lng);
    const key2 = this.getCellKey(segment.p2.lat, segment.p2.lng);

    this.addSegmentToCell(key1, segment);
    if (key1 !== key2) {
      this.addSegmentToCell(key2, segment);
    }
  }

  private addSegmentToCell(key: string, segment: Segment) {
    if (!this.grid.has(key)) {
      this.grid.set(key, []);
    }
    this.grid.get(key)!.push(segment);
  }

  getCandidates(lat: number, lng: number): Segment[] {
    const key = this.getCellKey(lat, lng);
    return this.grid.get(key) || [];
  }
}