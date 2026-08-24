import React, { useEffect, useRef } from 'react';

interface ShaderCanvasProps {
  className?: string;
}

export default function ShaderCanvas({ className = '' }: ShaderCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function syncSize() {
      const w = canvas!.clientWidth || 1280;
      const h = canvas!.clientHeight || 720;
      if (canvas!.width !== w || canvas!.height !== h) {
        canvas!.width = w;
        canvas!.height = h;
      }
    }
    
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(syncSize);
      resizeObserver.observe(canvas);
    }
    syncSize();

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
    if (!gl) return;

    const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

    const fs = `precision highp float;
varying vec2 v_texCoord;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

void main() {
    vec2 fragCoord = gl_FragCoord.xy;
    vec2 mouseCoord = u_mouse.xy;
    
    float spacing = 30.0;
    vec2 baseCell = floor(fragCoord / spacing);
    
    float dotAlpha = 0.0;
    float repelRadius = 200.0;
    
    // Check the current cell and 8 neighbors to allow dots to cross boundaries without clipping
    for (float i = -1.0; i <= 1.0; i++) {
        for (float j = -1.0; j <= 1.0; j++) {
            vec2 cellCoord = baseCell + vec2(i, j);
            vec2 cellCenter = (cellCoord + 0.5) * spacing;
            
            float dist = distance(cellCenter, mouseCoord);
            vec2 offset = vec2(0.0);
            
            if (dist < repelRadius && dist > 0.1) {
                float force = smoothstep(repelRadius, 0.0, dist);
                force = force * force; // Softer falloff
                vec2 dir = normalize(cellCenter - mouseCoord);
                offset = dir * force * 22.0; // Push dot away
            }
            
            vec2 movedCenter = cellCenter + offset;
            float d = distance(fragCoord, movedCenter);
            
            float dotRadius = 1.5;
            float alpha = smoothstep(dotRadius + 0.8, dotRadius - 0.8, d);
            dotAlpha = max(dotAlpha, alpha);
        }
    }
    
    // Background color (very soft mint/blue)
    vec3 bgColor = vec3(0.96, 0.98, 0.97); 
    // Brand Green dot
    vec3 dotColor = vec3(0.0, 0.698, 0.349); 
    
    // Slowly drift the background slightly
    vec2 uv = fragCoord / u_resolution;
    float n1 = sin(uv.x * 2.0 + u_time * 0.2) * 0.5 + 0.5;
    vec3 bgVariant = vec3(0.93, 0.97, 0.95);
    vec3 finalBg = mix(bgColor, bgVariant, n1 * 0.5);
    vec3 finalColor = mix(finalBg, dotColor, dotAlpha);
    
    gl_FragColor = vec4(finalColor, 1.0);
}`;

    function cs(type: number, src: string) {
      const s = gl!.createShader(type);
      if (!s) return null;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl!.getShaderInfoLog(s));
      }
      return s;
    }

    const prog = gl.createProgram();
    if (!prog) return;
    
    const vShader = cs(gl.VERTEX_SHADER, vs);
    const fShader = cs(gl.FRAGMENT_SHADER, fs);
    if (!vShader || !fShader) return;

    gl.attachShader(prog, vShader);
    gl.attachShader(prog, fShader);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    
    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
    
    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_resolution');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');

    const targetMouse = { x: canvas.width / 2, y: canvas.height / 2 };
    const currentMouse = { x: canvas.width / 2, y: canvas.height / 2 };
    
    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width && rect.height) {
        const nx = (event.clientX - rect.left) / rect.width;
        const ny = 1.0 - (event.clientY - rect.top) / rect.height;
        targetMouse.x = nx * canvas.width;
        targetMouse.y = ny * canvas.height;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);

    let animationFrameId: number;
    let startTime = performance.now();

    function render(time: number) {
      if (typeof ResizeObserver === 'undefined') syncSize();
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
      const t = time - startTime;
      
      // Smoothly interpolate the mouse position for a fluid repel effect
      currentMouse.x += (targetMouse.x - currentMouse.x) * 0.08;
      currentMouse.y += (targetMouse.y - currentMouse.y) * 0.08;

      if (uTime) gl!.uniform1f(uTime, t * 0.001);
      if (uRes) gl!.uniform2f(uRes, canvas!.width, canvas!.height);
      if (uMouse) gl!.uniform2f(uMouse, currentMouse.x, currentMouse.y);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    }
    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className={className} 
      style={{ display: 'block', width: '100%', height: '100%' }} 
    />
  );
}
