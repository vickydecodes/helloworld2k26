import React, { useEffect, useRef, useState } from 'react';
import { useEvents } from '../context/EventContext';

export default function BinaryBackground() {
  const canvasRef = useRef(null);
  const { theme } = useEvents();
  const mouseRef = useRef({ x: null, y: null });
  const [isMobile, setIsMobile] = useState(false);

  // Monitor viewport width to disable canvas rendering on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let particles = [];
    let globalAngle = 0;

    const gridSpacing = 64; 
    const fontSize = 11;

    // Structured concentric slime-blob configurations
    const slimeConfigs = [
      {
        radius: 150, 
        direction: 1,
        freq1: 3,
        freq2: 2,
        amp1: 15,
        amp2: 10,
        layers: [
          { fraction: 0.35, count: 10 }, 
          { fraction: 0.65, count: 18 }, 
          { fraction: 0.95, count: 26 }  
        ]
      },
      {
        radius: 300, 
        direction: -1,
        freq1: 4,
        freq2: 3,
        amp1: 25,
        amp2: 15,
        layers: [
          { fraction: 0.40, count: 20 }, 
          { fraction: 0.70, count: 32 }, 
          { fraction: 0.95, count: 44 }  
        ]
      }
    ];

    class SlimeParticle {
      constructor(radiusBase, radiusFraction, baseAngle, direction, char, freq1, freq2, amp1, amp2) {
        this.radiusBase = radiusBase;
        this.radiusFraction = radiusFraction; 
        this.baseAngle = baseAngle;
        this.direction = direction;
        this.char = char;
        this.freq1 = freq1;
        this.freq2 = freq2;
        this.amp1 = amp1;
        this.amp2 = amp2;
        
        this.size = 11; 
        this.opacity = 0.25 + Math.random() * 0.45;
        this.pulseSpeed = 0.003;
        this.pulseDir = Math.random() > 0.5 ? 1 : -1;

        this.offsetX = 0;
        this.offsetY = 0;
        this.x = 0;
        this.y = 0;
      }

      update(centerX, centerY, time) {
        const currentAngle = this.baseAngle + (globalAngle * this.direction);
        const wave1 = Math.sin(currentAngle * this.freq1 + time * 1.6) * this.amp1;
        const wave2 = Math.cos(currentAngle * this.freq2 - time * 2.0) * this.amp2;
        const boundaryRadius = this.radiusBase + wave1 + wave2;

        const currentRadius = boundaryRadius * this.radiusFraction;
        const targetX = centerX + currentRadius * Math.cos(currentAngle);
        const targetY = centerY + currentRadius * Math.sin(currentAngle);

        const mx = mouseRef.current.x;
        const my = mouseRef.current.y;
        
        if (mx !== null && my !== null) {
          const dx = targetX - mx;
          const dy = targetY - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const activeRadius = 160;
          const clearRadius = 45; 

          if (dist < activeRadius) {
            const force = (activeRadius - dist) / activeRadius;
            
            // Calculate base attraction offset
            this.offsetX += (mx - (targetX + this.offsetX)) * force * 0.12;
            this.offsetY += (my - (targetY + this.offsetY)) * force * 0.12;
            
            // Enforce clearing boundary
            const currentPosX = targetX + this.offsetX;
            const currentPosY = targetY + this.offsetY;
            const currentDx = currentPosX - mx;
            const currentDy = currentPosY - my;
            const currentDist = Math.sqrt(currentDx * currentDx + currentDy * currentDy);

            if (currentDist < clearRadius) {
              const snapRatio = clearRadius / (currentDist || 1);
              this.offsetX = currentDx * snapRatio + mx - targetX;
              this.offsetY = currentDy * snapRatio + my - targetY;
            }
          } else {
            this.offsetX *= 0.93;
            this.offsetY *= 0.93;
          }
        } else {
          this.offsetX *= 0.9;
          this.offsetY *= 0.9;
        }

        this.x = targetX + this.offsetX;
        this.y = targetY + this.offsetY;

        this.opacity += this.pulseSpeed * this.pulseDir;
        if (this.opacity > 0.75 || this.opacity < 0.25) {
          this.pulseDir *= -1;
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        const currentAngle = this.baseAngle + (globalAngle * this.direction);
        ctx.rotate(currentAngle);

        const alpha = this.opacity * (theme === 'dark' ? 0.55 : 0.65);
        ctx.fillStyle = `rgba(184, 144, 71, ${alpha})`;
        ctx.font = `bold ${this.size}px monospace`;
        
        const textWidth = ctx.measureText(this.char).width;
        ctx.fillText(this.char, -textWidth / 2, this.size / 2);
        ctx.restore();
      }
    }

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      // Populate particles systematically
      particles = [];
      slimeConfigs.forEach((config) => {
        config.layers.forEach((layer) => {
          for (let i = 0; i < layer.count; i++) {
            const baseAngle = (i / layer.count) * Math.PI * 2;
            const charPool = [
              '0', '1', '</>', '{', '}', '[', ']', '$', '%', '&', '|', '+', '-', '*', '=', '!', '?', ';', '#', '()', '<', '>', '=>'
            ];
            const char = charPool[Math.floor(Math.random() * charPool.length)];
            
            particles.push(new SlimeParticle(
              config.radius,
              layer.fraction,
              baseAngle,
              config.direction,
              char,
              config.freq1,
              config.freq2,
              config.amp1,
              config.amp2
            ));
          }
        });
      });
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const draw = () => {
      ctx.fillStyle = theme === 'dark' ? '#000000' : '#FAFAFA';
      ctx.fillRect(0, 0, width, height);

      const time = Date.now() * 0.0006;
      const centerX = width / 2 + Math.sin(time) * (width * 0.22);
      const centerY = height / 2 + Math.cos(time * 0.8) * (height * 0.18);

      globalAngle += 0.0045;

      for (const p of particles) {
        p.update(centerX, centerY, time);
      }

      const paddingDist = 42;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < paddingDist && dist > 0.1) {
            const overlap = paddingDist - dist;
            const forceX = (dx / dist) * overlap * 0.25;
            const forceY = (dy / dist) * overlap * 0.25;
            
            p1.x += forceX;
            p1.y += forceY;
            p2.x -= forceX;
            p2.y -= forceY;
          }
        }
      }

      for (const p of particles) {
        p.draw();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme, isMobile]);

  if (isMobile) {
    return null; // Do not render HTML5 Canvas on mobile viewports
  }

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none -z-10"
      aria-hidden="true"
    />
  );
}
