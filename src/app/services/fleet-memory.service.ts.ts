import { Injectable } from '@angular/core';

// 5 datos por bus: ID, Latitud, Longitud, Rumbo, Estado
const ATTRS_PER_BUS = 5; 
const MAX_BUSES = 310;
// +1 para el flag de Atomics al inicio
const BUFFER_SIZE = (1 + (MAX_BUSES * ATTRS_PER_BUS)) * Float64Array.BYTES_PER_ELEMENT;

@Injectable({
  providedIn: 'root'
})
export class FleetMemoryService {
  private sharedBuffer: SharedArrayBuffer;
  public syncArray: Int32Array; 
  public floatView: Float64Array; 
  private worker!: Worker;

  constructor() {
    this.sharedBuffer = new SharedArrayBuffer(BUFFER_SIZE);
    this.syncArray = new Int32Array(this.sharedBuffer);
    this.floatView = new Float64Array(this.sharedBuffer);

    this.initWorker();
  }

  private initWorker() {
    if (typeof Worker !== 'undefined') {
      // Cargamos el worker que acabas de generar
      this.worker = new Worker(new URL('../core/gps-processor.worker', import.meta.url), {
        type: 'module'
      });
      // Le pasamos el puntero de memoria compartida
      this.worker.postMessage({ buffer: this.sharedBuffer });
    }
  }
}