import React, { useEffect, useRef } from 'react';
import { useEvents } from '../context/EventContext';

export default function GridBinaryOverlay() {
  const canvasRef = useRef(null);
  const { theme } = useEvents();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = window.innerWidth;
    let height = window.innerHeight;
    const cellSize = 40; // Matches .bg-grid-pattern 40px cube size
    let cols;
    let rows;

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      
      ctx.resetTransform();
      ctx.scale(dpr, dpr);
      
      cols = Math.ceil(width / cellSize);
      rows = Math.ceil(height / cellSize);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      const themeAlphaMultiplier = theme === 'dark' ? 0.35 : 0.45;
      const time = Date.now() * 0.0022; // Control wave animation speed

      ctx.lineWidth = 1;

      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const d = c + r; // Distance parameter from top-left (0,0)
          
          // Continuous sine wave phase calculation
          const wavePhase = Math.sin(d * 0.35 - time);
          
          // Alternates binary values in parallel wave bands
          const val = wavePhase > 0 ? '1' : '0';
          const xStart = c * cellSize;
          const yStart = r * cellSize;

          if (wavePhase > 0.8) {
            // Draw square borders on multiple wavefront peak lines
            ctx.strokeStyle = theme === 'dark'
              ? `rgba(255, 255, 255, ${0.16 * themeAlphaMultiplier})`
              : `rgba(142, 110, 50, ${0.19 * themeAlphaMultiplier})`;
            ctx.strokeRect(xStart + 3, yStart + 3, cellSize - 6, cellSize - 6);

            // Draw glowing peak characters
            ctx.font = 'bold 9.5px monospace';
            ctx.fillStyle = theme === 'dark'
              ? `rgba(255, 255, 255, ${0.48 * themeAlphaMultiplier})`
              : `rgba(142, 110, 50, ${0.58 * themeAlphaMultiplier})`;
          } else {
            // Draw ambient background characters
            ctx.font = 'bold 8px monospace';
            ctx.fillStyle = theme === 'dark'
              ? `rgba(255, 255, 255, ${0.12 * themeAlphaMultiplier})`
              : `rgba(142, 110, 50, ${0.15 * themeAlphaMultiplier})`;
          }

          const x = xStart + cellSize / 2;
          const y = yStart + cellSize / 2;
          ctx.fillText(val, x - 2.5, y + 3);
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none -z-10"
      aria-hidden="true"
    />
  );
}
