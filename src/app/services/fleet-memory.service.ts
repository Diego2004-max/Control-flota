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
  // Permitimos ambos tipos para que soporte fallback si el navegador se pone restrictivo
  private sharedBuffer!: SharedArrayBuffer | ArrayBuffer;
  public syncArray!: Int32Array; 
  public floatView!: Float64Array; 
  private worker!: Worker;

  constructor() {
    try {
      // Intentamos usar SharedArrayBuffer si el navegador lo permite
      if (typeof SharedArrayBuffer !== 'undefined') {
        this.sharedBuffer = new SharedArrayBuffer(BUFFER_SIZE);
        console.log("Arquitectura con SharedArrayBuffer activa 🚀");
      } else {
        throw new Error("SharedArrayBuffer no soportado en este contexto.");
      }
    } catch (e) {
      // Fallback defensivo: Si hay restricciones de seguridad, usamos un ArrayBuffer normal
      this.sharedBuffer = new ArrayBuffer(BUFFER_SIZE);
      console.warn("Aviso: Usando ArrayBuffer estándar como respaldo local.");
    }

    this.syncArray = new Int32Array(this.sharedBuffer);
    this.floatView = new Float64Array(this.sharedBuffer);

    this.initWorker();
  }

  private initWorker() {
    if (typeof Worker !== 'undefined') {
      // Cargamos el worker que generaste
      this.worker = new Worker(new URL('../core/gps-processor.worker', import.meta.url), {
        type: 'module'
      });
      // Le pasamos el puntero de memoria
      this.worker.postMessage({ buffer: this.sharedBuffer });
    }
  }
}