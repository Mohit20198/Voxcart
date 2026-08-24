import React, { useEffect, useRef } from 'react';

export default function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Sync the WebGL drawing-buffer size with the CSS-driven layout size.
    function syncSize() {
      const w = canvas?.clientWidth || 1280;
      const h = canvas?.clientHeight || 720;
      if (canvas && (canvas.width !== w || canvas.height !== h)) {
        canvas.width = w;
        canvas.height = h;
      }
    }
    let resizeObserver: ResizeObserver;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(syncSize);
      resizeObserver.observe(canvas);
    }
    syncSize();

    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) return;
    const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;
    const fs = `precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

void main() {
    vec2 fragCoord = gl_FragCoord.xy;
    vec2 mouseCoord = u_mouse.xy;
    
    // Repulsion logic
    float dist = distance(fragCoord, mouseCoord);
    float repelRadius = 200.0;
    vec2 offset = vec2(0.0);
    
    if (dist < repelRadius) {
        float force = smoothstep(repelRadius, 0.0, dist);
        // Direction from mouse to current pixel
        vec2 dir = normalize(fragCoord - mouseCoord);
        // To make the dot look like it moves AWAY, we sample the grid closer to the mouse
        offset = dir * force * 40.0; // max displacement
    }
    
    vec2 gridCoord = fragCoord - offset;
    
    float spacing = 24.0;
    // local coordinates within the cell, centered
    vec2 gridPos = mod(gridCoord, spacing) - (spacing * 0.5);
    
    // Dot radius
    float dotRadius = 2.0;
    // Anti-aliased dot drawing
    float dotAlpha = smoothstep(dotRadius + 0.5, dotRadius - 0.5, length(gridPos));
    
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
      if (!gl) return null;
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    }
    
    const vShader = cs(gl.VERTEX_SHADER, vs);
    const fShader = cs(gl.FRAGMENT_SHADER, fs);
    if (!vShader || !fShader) return;

    const prog = gl.createProgram();
    if (!prog) return;
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

    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    
    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width && rect.height) {
        const nx = (event.clientX - rect.left) / rect.width;
        const ny = 1.0 - (event.clientY - rect.top) / rect.height;
        mouse.x = nx * canvas.width;
        mouse.y = ny * canvas.height;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);

    let animationFrameId: number;
    function render(t: number) {
      if (!gl || !canvas) return;
      if (typeof ResizeObserver === 'undefined') syncSize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    }
    animationFrameId = requestAnimationFrame(render);

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full -z-10 pointer-events-none" style={{ display: 'block' }} />;
}
