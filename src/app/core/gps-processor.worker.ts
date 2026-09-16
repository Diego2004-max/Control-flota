/// <reference lib="webworker" />
import { SpatialGrid } from './spatial-grid';
import { MapMatcher } from './map-matcher';

let syncArray: Int32Array;
let floatView: Float64Array;
const spatialGrid = new SpatialGrid();
const mapMatcher = new MapMatcher();

addEventListener('message', ({ data }) => {
  if (data.buffer) {
    syncArray = new Int32Array(data.buffer);
    floatView = new Float64Array(data.buffer);
    
    // Insertamos segmentos de prueba simulando el centro histórico
    spatialGrid.insertSegment({ id: 'seg-1', routeId: 'R07', p1: { lat: 1.213, lng: -77.281 }, p2: { lat: 1.215, lng: -77.283 } });

    startSimulation();
  }
});

function startSimulation() {
  const buses = Array.from({ length: 310 }, (_, i) => ({
    id: i,
    x: Math.random() * 750 + 25,
    y: Math.random() * 550 + 25,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2
  }));

  setInterval(() => {
    if (!floatView) return;

    for (let i = 0; i < 310; i++) {
      const bus = buses[i];
      bus.x += bus.vx;
      bus.y += bus.vy;

      if (bus.x < 10 || bus.x > 790) bus.vx *= -1;
      if (bus.y < 10 || bus.y > 590) bus.vy *= -1;

      // Aplicamos el filtro de coherencia del Map Matcher
      const rawPoint = { lat: 1.21 + (bus.y / 100000), lng: -77.28 + (bus.x / 100000) };
      const matched = mapMatcher.matchPosition(bus.id, rawPoint, spatialGrid.getCandidates(rawPoint.lat, rawPoint.lng));

      const offset = 1 + (i * 5);
      floatView[offset] = bus.id;
      floatView[offset + 1] = bus.x;
      floatView[offset + 2] = bus.y;
    }

    if (syncArray) {
      Atomics.store(syncArray, 0, 1);
    }
  }, 32);
}