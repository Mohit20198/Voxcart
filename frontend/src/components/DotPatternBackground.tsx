import React, { useEffect, useRef, useState } from 'react';

interface Dot {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export default function DotPatternBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Interaction variables
  const mouse = useRef({ x: -1000, y: -1000, active: false });
  const dots = useRef<Dot[]>([]);
  const animationRef = useRef<number>();

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Settings
  const DOT_SPACING = 28;
  const DOT_RADIUS = 1.5;
  const REPEL_RADIUS = 150;
  const MAX_DISPLACEMENT = 15;
  const SPRING_K = 0.05; // Spring constant (higher = stiffer)
  const DAMPING = 0.8;  // Friction (lower = more damping)
  const DOT_COLOR = 'rgba(188, 202, 186, 0.8)'; // outline-variant approx

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const initGrid = (width: number, height: number) => {
    const newDots: Dot[] = [];
    const cols = Math.ceil(width / DOT_SPACING) + 1;
    const rows = Math.ceil(height / DOT_SPACING) + 1;
    
    // Center the grid slightly based on remainder
    const offsetX = (width % DOT_SPACING) / 2;
    const offsetY = (height % DOT_SPACING) / 2;

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = i * DOT_SPACING + offsetX;
        const y = j * DOT_SPACING + offsetY;
        newDots.push({
          baseX: x,
          baseY: y,
          x,
          y,
          vx: 0,
          vy: 0
        });
      }
    }
    dots.current = newDots;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;

    const handleResize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      // High DPI support
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      
      initGrid(width, height);
      if (prefersReducedMotion) {
        drawFrame(); // Draw once statically if reduced motion
      }
    };

    const drawFrame = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = DOT_COLOR;
      
      for (let i = 0; i < dots.current.length; i++) {
        const p = dots.current[i];
        
        if (!prefersReducedMotion) {
          // Calculate distance to mouse
          const dxMouse = mouse.current.x - p.baseX;
          const dyMouse = mouse.current.y - p.baseY;
          const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
          
          let targetX = p.baseX;
          let targetY = p.baseY;

          // If within repel radius, push away
          if (mouse.current.active && distMouse < REPEL_RADIUS) {
            const force = (REPEL_RADIUS - distMouse) / REPEL_RADIUS;
            // Displacement amount
            const displacement = force * MAX_DISPLACEMENT;
            
            // Vector from mouse to dot
            const angle = Math.atan2(dyMouse, dxMouse);
            targetX = p.baseX - Math.cos(angle) * displacement;
            targetY = p.baseY - Math.sin(angle) * displacement;
          }

          // Spring physics to move toward target
          const ax = (targetX - p.x) * SPRING_K;
          const ay = (targetY - p.y) * SPRING_K;
          
          p.vx = (p.vx + ax) * DAMPING;
          p.vy = (p.vy + ay) * DAMPING;
          
          p.x += p.vx;
          p.y += p.vy;

          // Performance: Snap exactly to base if very close and not moving to prevent micro-calculations forever
          if (Math.abs(p.vx) < 0.01 && Math.abs(p.vy) < 0.01 && 
              Math.abs(p.x - p.baseX) < 0.05 && Math.abs(p.y - p.baseY) < 0.05) {
            p.x = p.baseX;
            p.y = p.baseY;
            p.vx = 0;
            p.vy = 0;
          }
        }

        // Draw dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, DOT_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!prefersReducedMotion) {
        animationRef.current = requestAnimationFrame(drawFrame);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    if (!prefersReducedMotion) {
      drawFrame();
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [prefersReducedMotion]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || prefersReducedMotion) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouse.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true
    };
  };

  const handleMouseLeave = () => {
    mouse.current.active = false;
  };

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <canvas ref={canvasRef} className="block pointer-events-none" />
    </div>
  );
}
