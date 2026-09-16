import { Point, Segment } from './spatial-grid';

export class MapMatcher {
  // Historial corto por bus para evaluar la ventana de movimiento (Requisito RF-2)
  private lastPositions: Map<number, Point> = new Map();

  public matchPosition(busId: number, currentGps: Point, candidates: Segment[]): Point {
    const last = this.lastPositions.get(busId);
    
    if (!last || candidates.length === 0) {
      this.lastPositions.set(busId, currentGps);
      return currentGps; // Sin historial previo, aceptamos el punto inicial
    }

    // Calculamos la distancia euclidiana simple respecto al último punto válido
    const deltaLat = currentGps.lat - last.lat;
    const deltaLng = currentGps.lng - last.lng;
    const jumpDistance = Math.sqrt(deltaLat * deltaLat + deltaLng * deltaLng);

    // Si el salto es mayor a un umbral anómalo por rebote en edificios (> 0.0006 aprox 60m),
    // aplicamos factor de amortiguación (Smoothing) usando la posición anterior.
    if (jumpDistance > 0.0006) {
      const smoothedPoint: Point = {
        lat: last.lat + (deltaLat * 0.3), // Amortiguamos el salto un 30%
        lng: last.lng + (deltaLng * 0.3)
      };
      this.lastPositions.set(busId, smoothedPoint);
      return smoothedPoint;
    }

    // Si el movimiento es coherente, actualizamos la posición real
    this.lastPositions.set(busId, currentGps);
    return currentGps;
  }
}