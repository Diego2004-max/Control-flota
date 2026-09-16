/// <reference lib="webworker" />

let syncArray: Int32Array;
let floatView: Float64Array;

addEventListener('message', ({ data }) => {
  if (data.buffer) {
    syncArray = new Int32Array(data.buffer);
    floatView = new Float64Array(data.buffer);
    console.log("Worker: Memoria compartida vinculada correctamente.");
    startSimulation();
  }
});

function startSimulation() {
  // Simulamos 31 mensajes por segundo (32ms) según el RF-1
  setInterval(() => {
    for (let i = 0; i < 310; i++) {
      const offset = 1 + (i * 5);
      floatView[offset] = i; // ID
      floatView[offset + 1] = 1.21384 + (Math.random() * 0.01); // Latitud falsa
      floatView[offset + 2] = -77.28122 + (Math.random() * 0.01); // Longitud falsa
    }
    // Escribimos atómicamente el flag 1 para avisar que el frame está listo
    Atomics.store(syncArray, 0, 1);
  }, 32);
}