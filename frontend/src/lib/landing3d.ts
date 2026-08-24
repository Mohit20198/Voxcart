/**
 * landing3d.ts – All Three.js code for the LandingPage.
 * Dynamically imported so it never ships with other routes.
 */
import * as THREE from 'three';

/* ─── tiny organic-noise helper (sin-based, no extra deps) ─── */
function organicNoise(x: number, y: number, z: number, t: number): number {
  return (
    Math.sin(x * 2.1 + t * 0.7) *
    Math.sin(y * 1.9 + t * 0.5) *
    Math.sin(z * 2.3 + t * 0.9)
  );
}

/* ═══════════════════════════════════════════════════════
   1. VOICE-REACTIVE ORB
   Low-poly icosahedron with vertex displacement + rim-light
═══════════════════════════════════════════════════════ */
export function initOrbScene(
  canvas: HTMLCanvasElement,
  reducedMotion: boolean,
): () => void {
  const w = canvas.clientWidth || 200;
  const h = canvas.clientHeight || 200;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(w, h);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 50);
  camera.position.z = 3.2;

  /* Lighting – ambient + key + rim from behind */
  scene.add(new THREE.AmbientLight(0xffffff, 0.45));
  const key = new THREE.DirectionalLight(0x51e081, 1.2);
  key.position.set(2, 3, 3);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x006d34, 1.0);
  rim.position.set(-3, -2, -3);
  scene.add(rim);

  /* Geometry – subdivision-2 icosahedron */
  const geo = new THREE.IcosahedronGeometry(1, 2);
  const origPos = Float32Array.from(geo.attributes.position.array);

  const mat = new THREE.MeshPhongMaterial({
    color: 0x006d34,
    emissive: 0x004d24,
    emissiveIntensity: 0.3,
    shininess: 80,
    transparent: true,
    opacity: 0.92,
  });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);

  /* Subtle wireframe overlay */
  const wGeo = new THREE.IcosahedronGeometry(1.015, 2);
  const wMat = new THREE.MeshBasicMaterial({
    color: 0x51e081, wireframe: true, transparent: true, opacity: 0.12,
  });
  scene.add(new THREE.Mesh(wGeo, wMat));

  let raf = 0;

  function animate(ts: number) {
    raf = requestAnimationFrame(animate);
    const t = ts * 0.001;
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const ox = origPos[i * 3], oy = origPos[i * 3 + 1], oz = origPos[i * 3 + 2];
      const len = Math.sqrt(ox * ox + oy * oy + oz * oz);
      const d = organicNoise(ox, oy, oz, t) * 0.16;
      pos.setXYZ(i, ox + (ox / len) * d, oy + (oy / len) * d, oz + (oz / len) * d);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    mesh.rotation.y = t * 0.22;
    mesh.rotation.x = Math.sin(t * 0.13) * 0.25;
    renderer.render(scene, camera);
  }

  const ro = new ResizeObserver(() => {
    const rw = canvas.clientWidth, rh = canvas.clientHeight;
    camera.aspect = rw / rh;
    camera.updateProjectionMatrix();
    renderer.setSize(rw, rh);
  });
  ro.observe(canvas);

  if (reducedMotion) {
    renderer.render(scene, camera);
  } else {
    raf = requestAnimationFrame(animate);
  }

  return () => { cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); geo.dispose(); mat.dispose(); };
}

/* ═══════════════════════════════════════════════════════
   2. HERO 3-D PRODUCT MODELS
   Milk box, bread capsule, broccoli sphere-cluster in one scene.
   Camera drifts subtly on mouse move.
═══════════════════════════════════════════════════════ */
export function initHeroScene(
  canvas: HTMLCanvasElement,
  reducedMotion: boolean,
): { cleanup: () => void; onMouseMove: (nx: number, ny: number) => void } {
  const cw = canvas.clientWidth || 500;
  const ch = canvas.clientHeight || 500;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(cw, ch);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, cw / ch, 0.1, 80);
  camera.position.set(0, 0, 9);
  camera.lookAt(0, 0, 0);

  /* Lights */
  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const sun = new THREE.DirectionalLight(0xffffff, 0.9);
  sun.position.set(4, 6, 5);
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0x00b259, 0.4);
  fill.position.set(-5, -3, -3);
  scene.add(fill);

  /* ── Milk carton ── */
  const milkMat = new THREE.MeshPhongMaterial({ color: 0xe8f5ee, shininess: 100, emissive: 0x006d34, emissiveIntensity: 0.06 });
  const milkGeo = new THREE.BoxGeometry(0.9, 1.5, 0.55);
  const milk = new THREE.Mesh(milkGeo, milkMat);
  milk.position.set(2.8, 1.0, 0);
  scene.add(milk);
  /* Lid accent */
  const lidGeo = new THREE.BoxGeometry(0.92, 0.18, 0.57);
  const lidMat = new THREE.MeshPhongMaterial({ color: 0x006d34, shininess: 60 });
  const lid = new THREE.Mesh(lidGeo, lidMat);
  lid.position.set(0, 0.83, 0);
  milk.add(lid);

  /* ── Bread (capsule) ── */
  const breadMat = new THREE.MeshPhongMaterial({ color: 0xd4956a, shininess: 25, emissive: 0x8b4513, emissiveIntensity: 0.05 });
  const breadGeo = new THREE.CapsuleGeometry(0.5, 0.75, 4, 12);
  const bread = new THREE.Mesh(breadGeo, breadMat);
  bread.position.set(-2.6, -1.4, -0.3);
  bread.rotation.z = 0.35;
  scene.add(bread);
  /* Scoring lines */
  const scoreGeo = new THREE.CylinderGeometry(0.51, 0.51, 0.04, 12);
  const scoreMat = new THREE.MeshPhongMaterial({ color: 0xb07040, shininess: 10 });
  [-0.25, 0, 0.25].forEach((y) => {
    const s = new THREE.Mesh(scoreGeo, scoreMat);
    s.position.y = y;
    bread.add(s);
  });

  /* ── Broccoli cluster ── */
  const brocMat = new THREE.MeshPhongMaterial({ color: 0x2d9e5f, shininess: 35 });
  const brocGrp = new THREE.Group();
  brocGrp.position.set(0.2, -0.3, 1.2);
  const headGeo = new THREE.SphereGeometry(0.62, 8, 7);
  brocGrp.add(new THREE.Mesh(headGeo, brocMat));
  ([ [-0.44, 0.28, 0.18, 0.38], [0.42, 0.3, -0.12, 0.36], [0.0, 0.62, 0.0, 0.34], [-0.22, -0.04, 0.42, 0.3] ] as [number,number,number,number][]).forEach(([x, y, z, r]) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 7, 6), brocMat);
    m.position.set(x, y, z);
    brocGrp.add(m);
  });
  const stemGeo = new THREE.CylinderGeometry(0.1, 0.15, 0.65, 7);
  const stemMat = new THREE.MeshPhongMaterial({ color: 0x3d7a4e });
  const stem = new THREE.Mesh(stemGeo, stemMat);
  stem.position.y = -0.75;
  brocGrp.add(stem);
  scene.add(brocGrp);

  /* Camera target (mouse-driven) */
  let tCamX = 0, tCamY = 0;

  let raf = 0;
  const t0 = performance.now();

  function animate() {
    raf = requestAnimationFrame(animate);
    const t = (performance.now() - t0) * 0.001;

    /* ~20 s per full rotation = 2π/20 ≈ 0.314 rad/s */
    milk.rotation.y = t * 0.314;
    bread.rotation.y = -t * 0.282;
    brocGrp.rotation.y = t * 0.333;

    /* Gentle float bob */
    milk.position.y = 1.0 + Math.sin(t * 0.55) * 0.14;
    bread.position.y = -1.4 + Math.sin(t * 0.42 + 1.2) * 0.12;
    brocGrp.position.y = -0.3 + Math.sin(t * 0.67 + 2.4) * 0.10;

    /* Smooth camera parallax */
    camera.position.x += (tCamX - camera.position.x) * 0.04;
    camera.position.y += (tCamY - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  const ro = new ResizeObserver(() => {
    const rw = canvas.clientWidth, rh = canvas.clientHeight;
    camera.aspect = rw / rh;
    camera.updateProjectionMatrix();
    renderer.setSize(rw, rh);
  });
  ro.observe(canvas);

  if (reducedMotion) {
    renderer.render(scene, camera);
  } else {
    raf = requestAnimationFrame(animate);
  }

  return {
    cleanup: () => { cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); },
    onMouseMove: (nx, ny) => { tCamX = nx * 1.4; tCamY = ny * 0.7; },
  };
}

/* ═══════════════════════════════════════════════════════
   3. SHOWCASE – textured plane with scroll rotation
   Perspective camera, soft directional shadow, scroll-driven tilt.
═══════════════════════════════════════════════════════ */
export function initShowcaseScene(
  canvas: HTMLCanvasElement,
  textureUrl: string,
  reducedMotion: boolean,
): { cleanup: () => void; onScroll: (progress: number) => void } {
  const cw = canvas.clientWidth || 900;
  const ch = canvas.clientHeight || 500;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.shadowMap.enabled = true;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(cw, ch);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, cw / ch, 0.1, 100);
  camera.position.set(0, 2.2, 7);
  camera.lookAt(0, 0, 0);

  /* Lights */
  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const sun = new THREE.DirectionalLight(0xffffff, 0.9);
  sun.position.set(5, 8, 6);
  sun.castShadow = true;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0x00b259, 0.25);
  fill.position.set(-4, -2, 3);
  scene.add(fill);

  /* Screen plane – 16:10 aspect */
  const planeGeo = new THREE.PlaneGeometry(8, 5);
  const planeMat = new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.05, color: 0xffffff });
  const plane = new THREE.Mesh(planeGeo, planeMat);
  plane.rotation.x = -0.28;
  plane.rotation.y = -0.08;
  plane.receiveShadow = true;
  scene.add(plane);

  /* Thin bezel frame */
  const bezelGeo = new THREE.BoxGeometry(8.3, 5.3, 0.08);
  const bezelMat = new THREE.MeshPhongMaterial({ color: 0xdce3eb, shininess: 40 });
  const bezel = new THREE.Mesh(bezelGeo, bezelMat);
  bezel.position.z = -0.05;
  plane.add(bezel);

  /* Shadow-casting plane behind screen */
  const shadowGeo = new THREE.PlaneGeometry(10, 6);
  const shadowMat = new THREE.ShadowMaterial({ opacity: 0.12 });
  const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
  shadowPlane.position.z = -0.1;
  shadowPlane.rotation.x = -0.28;
  shadowPlane.receiveShadow = true;
  scene.add(shadowPlane);

  /* Load texture */
  const loader = new THREE.TextureLoader();
  loader.load(textureUrl, (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    planeMat.map = tex;
    planeMat.needsUpdate = true;
  });

  let scrollProg = 0;
  let raf = 0;
  let rafRunning = false;

  function render() {
    raf = requestAnimationFrame(render);
    const t = performance.now() * 0.001;
    if (!reducedMotion) {
      /* scroll drives extra rotation */
      plane.rotation.y = -0.08 + scrollProg * 0.18;
      plane.rotation.x = -0.28 + Math.sin(t * 0.15) * 0.015;
    }
    renderer.render(scene, camera);
  }

  const ro = new ResizeObserver(() => {
    const rw = canvas.clientWidth, rh = canvas.clientHeight;
    camera.aspect = rw / rh;
    camera.updateProjectionMatrix();
    renderer.setSize(rw, rh);
  });
  ro.observe(canvas);

  if (reducedMotion) {
    renderer.render(scene, camera);
  } else {
    rafRunning = true;
    raf = requestAnimationFrame(render);
  }

  return {
    cleanup: () => { cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); },
    onScroll: (p) => { scrollProg = p; },
  };
}

/* ═══════════════════════════════════════════════════════
   4. HOW IT WORKS – Connecting Thread Background
═══════════════════════════════════════════════════════ */
export function initStepsScene(
  bgCanvas: HTMLCanvasElement,
  reducedMotion: boolean
): { cleanup: () => void; triggerReveal: () => void; onScroll: (progress: number) => void } {
  const bgR = new THREE.WebGLRenderer({ canvas: bgCanvas, alpha: true, antialias: true });
  bgR.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const bgScene = new THREE.Scene();
  const bgCam = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
  bgCam.position.z = 10;

  /* Background Thread */
  const lineMat = new THREE.LineDashedMaterial({ color: 0x00b259, dashSize: 0.3, gapSize: 0.3, transparent: true, opacity: 0.25 });
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-10, 1.5, 0),
    new THREE.Vector3(-5, 0.5, 0),
    new THREE.Vector3(0, 1.5, 0),
    new THREE.Vector3(5, 0.5, 0),
    new THREE.Vector3(10, 1.5, 0),
  ]);
  const curvePts = curve.getPoints(100);
  const curveGeo = new THREE.BufferGeometry().setFromPoints(curvePts);
  const bgLine = new THREE.Line(curveGeo, lineMat);
  bgLine.computeLineDistances();
  curveGeo.setDrawRange(0, 0); // Start hidden for scroll reveal
  bgScene.add(bgLine);

  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(40 * 3);
  for(let i=0; i<40; i++) {
    pPos[i*3] = (Math.random() - 0.5) * 20;
    pPos[i*3+1] = 0.5 + Math.random();
    pPos[i*3+2] = (Math.random() - 0.5) * 2;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0x00b259, size: 0.1, transparent: true, opacity: 0.4 });
  const particles = new THREE.Points(pGeo, pMat);
  bgScene.add(particles);

  let revealed = false;
  let raf = 0;
  const t0 = performance.now();

  function render() {
    raf = requestAnimationFrame(render);

    if (!reducedMotion) {      
      const pos = pGeo.attributes.position.array as Float32Array;
      for(let i=0; i<40; i++) {
        pos[i*3] += 0.015;
        if (pos[i*3] > 10) pos[i*3] = -10;
      }
      pGeo.attributes.position.needsUpdate = true;
    }

    bgR.render(bgScene, bgCam);
  }

  const resize = () => {
    const bw = bgCanvas.clientWidth, bh = bgCanvas.clientHeight;
    if (bw && bh) {
      bgCam.aspect = bw / bh;
      bgCam.updateProjectionMatrix();
      bgR.setSize(bw, bh, false);
    }
  };
  window.addEventListener('resize', resize);
  resize();

  if (!reducedMotion) raf = requestAnimationFrame(render);

  return {
    cleanup: () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      bgR.dispose();
      bgScene.clear();
    },
    triggerReveal: () => {
      if(!revealed) {
        revealed = true;
        if(reducedMotion) {
          curveGeo.setDrawRange(0, curvePts.length);
          bgR.render(bgScene, bgCam);
        }
      }
    },
    onScroll: (p: number) => {
      if (reducedMotion) return;
      // p goes from 0 (enters bottom) to 1 (leaves top).
      // Let's draw from p=0.2 to p=0.8
      let drawP = (p - 0.2) / 0.6;
      drawP = Math.max(0, Math.min(1, drawP));
      curveGeo.setDrawRange(0, Math.floor(curvePts.length * drawP));
    }
  };
}
