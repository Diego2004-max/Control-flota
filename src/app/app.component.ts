import { Component, ElementRef, ViewChild, AfterViewInit, inject } from '@angular/core';
import { FleetMemoryService } from './services/fleet-memory.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
  title = 'flota-control';

  @ViewChild('mapCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private fleetMemory = inject(FleetMemoryService);
  private ctx!: CanvasRenderingContext2D;

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    const context = canvas.getContext('2d');
    if (!context) return;
    this.ctx = context;

    // Arrancamos el loop inmediatamente
    this.renderLoop();
  }

  private renderLoop = () => {
    // 1. Limpiamos el canvas completo
    this.ctx.clearRect(0, 0, 800, 600);

    // 2. Dibujamos el fondo oscuro del mapa
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(0, 0, 800, 600);

    // 3. Dibujamos texto estático de comprobación para verificar que el Canvas pinta
    this.ctx.fillStyle = '#38bdf8';
    this.ctx.font = 'bold 14px sans-serif';
    this.ctx.fillText('⚡ CANVAS ACTIVO: Renderizando Flota en Vivo', 20, 30);

    // 4. Obtenemos la vista de memoria del servicio
    const data = this.fleetMemory.floatView;

    if (data) {
      // Dibujamos cada uno de los buses
      for (let i = 0; i < 310; i++) {
        const offset = 1 + (i * 5);
        const x = data[offset + 1];
        const y = data[offset + 2];

        // Si el worker ya escribió coordenadas, las pintamos; si no, ponemos una posición por defecto
        const posX = (x && x > 0) ? x : (i * 15) % 780 + 10;
        const posY = (y && y > 0) ? y : (Math.floor(i / 50) * 80) + 60;

        this.ctx.fillStyle = '#10b981'; // Verde esmeralda brillante
        this.ctx.beginPath();
        this.ctx.arc(posX, posY, 5, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    // 5. Ciclo de animación a 60fps
    requestAnimationFrame(this.renderLoop);
  };
}