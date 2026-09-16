/// <reference lib="webworker" />

let syncArray: Int32Array;
let floatView: Float64Array;

addEventListener('message', ({ data }) => {
  if (data.buffer) {
    syncArray = new Int32Array(data.buffer);
    floatView = new Float64Array(data.buffer);
    console.log("Worker: Búfer de datos vinculado correctamente.");
    startSimulation();
  }
});

function startSimulation() {
  // Inicializamos posiciones aleatorias dentro del canvas (800x600)
  const buses = Array.from({ length: 310 }, (_, i) => ({
    id: i,
    x: Math.random() * 750 + 25,
    y: Math.random() * 550 + 25,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2
  }));

  // Actualizamos a ~31 mensajes por segundo (32ms)
  setInterval(() => {
    if (!floatView) return;

    for (let i = 0; i < 310; i++) {
      const bus = buses[i];
      
      // Movimiento fluido simulado
      bus.x += bus.vx;
      bus.y += bus.vy;

      // Rebote en los bordes del canvas (800x600)
      if (bus.x < 10 || bus.x > 790) bus.vx *= -1;
      if (bus.y < 10 || bus.y > 590) bus.vy *= -1;

      const offset = 1 + (i * 5);
      floatView[offset] = bus.id;
      floatView[offset + 1] = bus.x; // Guardamos X directamente
      floatView[offset + 2] = bus.y; // Guardamos Y directamente
    }

    if (syncArray) {
      Atomics.store(syncArray, 0, 1);
    }
  }, 32);
}