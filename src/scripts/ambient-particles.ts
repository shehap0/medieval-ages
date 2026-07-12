import * as THREE from 'three';

const BRASS_HEX = 0xc9a44b;
const EMBER_COLOR = new THREE.Color('#f0c040');
const HOTSPOT_COLOR = new THREE.Color('#f07030');

const EMBER_COUNT = 80;
const MOTE_COUNT = 12;
const PARTICLE_SIZE = 3;

export interface HotspotBounds {
  xMin: number;
  xMax: number;
  yBottom: number;
  yTop: number;
  biasCenter: number;
}

interface Particle {
  x: number;
  y: number;
  life: number;
  speed: number;
  maxLife: number;
  size: number;
  wobblePhase: number;
  wobbleAmp: number;
  isMote: boolean;
  moteDir: number;
  opacity: number;
  isHotspot: boolean;
}

let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.OrthographicCamera | null = null;
let points: THREE.Points | null = null;
let geometry: THREE.BufferGeometry | null = null;
let material: THREE.ShaderMaterial | null = null;
let canvas: HTMLCanvasElement | null = null;
let animFrameId = 0;
let lastTime = 0;
let pool: Particle[] = [];
let running = false;
let reducedMotion = false;

let hotspot: HotspotBounds | null = null;

function hotspotRandomX(): number {
  if (!hotspot) return (Math.random() - 0.5) * 2.2;
  const t = Math.random();
  const biased = t < 0.6
    ? hotspot.xMin + Math.random() * (hotspot.biasCenter - hotspot.xMin)
    : hotspot.xMin + Math.random() * (hotspot.xMax - hotspot.xMin);
  return biased;
}

function hotspotRandomY(): number {
  if (!hotspot) return -1.1 - Math.random() * 0.2;
  return hotspot.yBottom - Math.random() * 0.15;
}

function spawn(p: Particle): void {
  p.life = 0;
  p.isHotspot = false;
  p.maxLife = 3 + Math.random() * 7;
  p.x = (Math.random() - 0.5) * 2.2;
  p.y = -1.1 - Math.random() * 0.2;
  p.speed = 0.08 + Math.random() * 0.14;
  p.size = 0.6 + Math.random() * 1.8;
  p.wobblePhase = Math.random() * Math.PI * 2;
  p.wobbleAmp = 0.01 + Math.random() * 0.04;
  p.opacity = 0;
}

function spawnHotspot(p: Particle): void {
  p.life = 0;
  p.isHotspot = true;
  p.maxLife = 1.8 + Math.random() * 3.5;
  p.x = hotspotRandomX();
  p.y = hotspotRandomY();
  p.speed = 0.14 + Math.random() * 0.22;
  p.size = 0.9 + Math.random() * 2.6;
  p.wobblePhase = Math.random() * Math.PI * 2;
  p.wobbleAmp = 0.015 + Math.random() * 0.06;
  p.opacity = 0;
}

function spawnMote(p: Particle): void {
  p.life = 0;
  p.isHotspot = false;
  p.maxLife = 6 + Math.random() * 10;
  p.x = (Math.random() - 0.5) * 2.4;
  p.y = (Math.random() - 0.5) * 2;
  p.speed = 0.015 + Math.random() * 0.03;
  p.size = 1 + Math.random() * 2;
  p.wobblePhase = Math.random() * Math.PI * 2;
  p.wobbleAmp = 0.02 + Math.random() * 0.06;
  p.moteDir = Math.random() > 0.5 ? 1 : -1;
  p.opacity = 0;
}

function createGlowTexture(): THREE.Texture {
  const size = 32;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d')!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.12, 'rgba(255,255,255,0.88)');
  gradient.addColorStop(0.3, 'rgba(255,255,255,0.45)');
  gradient.addColorStop(0.55, 'rgba(255,255,255,0.1)');
  gradient.addColorStop(0.8, 'rgba(255,255,255,0.02)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

function buildPool(): void {
  pool = [];
  for (let i = 0; i < EMBER_COUNT; i++) {
    const p: Particle = {
      x: 0, y: 0, life: 1, speed: 0, maxLife: 0,
      size: 0, wobblePhase: 0, wobbleAmp: 0,
      isMote: false, moteDir: 0, opacity: 0,
      isHotspot: false,
    };
    spawn(p);
    p.life = Math.random();
    pool.push(p);
  }
  for (let i = 0; i < MOTE_COUNT; i++) {
    const p: Particle = {
      x: 0, y: 0, life: 1, speed: 0, maxLife: 0,
      size: 0, wobblePhase: 0, wobbleAmp: 0,
      isMote: true, moteDir: 0, opacity: 0,
      isHotspot: false,
    };
    spawnMote(p);
    p.life = Math.random();
    pool.push(p);
  }
}

function onResize(): void {
  if (!renderer || !camera || !canvas) return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h);
  const aspect = w / h;
  camera.left = -1 * aspect;
  camera.right = 1 * aspect;
  camera.top = 1;
  camera.bottom = -1;
  camera.updateProjectionMatrix();
}

function setup(): void {
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  canvas = document.createElement('canvas');
  canvas.style.cssText =
    'position:fixed;inset:0;z-index:-1;pointer-events:none;';
  document.body.prepend(canvas);

  scene = new THREE.Scene();
  const aspect = window.innerWidth / window.innerHeight;
  camera = new THREE.OrthographicCamera(
    -1 * aspect, 1 * aspect, 1, -1, 0.1, 10,
  );
  camera.position.z = 1;

  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  buildPool();

  const total = EMBER_COUNT + MOTE_COUNT;
  const positions = new Float32Array(total * 3);
  const sizes = new Float32Array(total);
  const opacities = new Float32Array(total);
  const colors = new Float32Array(total * 3);

  geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const glowTex = createGlowTexture();

  material = new THREE.ShaderMaterial({
    uniforms: {
      uTexture: { value: glowTex },
    },
    vertexShader: /* glsl */ `
      attribute float size;
      attribute float opacity;
      attribute vec3 color;
      varying float vOpacity;
      varying vec3 vColor;
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size;
        gl_Position = projectionMatrix * mvPosition;
        vOpacity = opacity;
        vColor = color;
      }
    `,
    fragmentShader: /* glsl */ `
      varying float vOpacity;
      varying vec3 vColor;
      uniform sampler2D uTexture;
      void main() {
        vec4 tex = texture2D(uTexture, gl_PointCoord);
        float alpha = tex.a * vOpacity;
        gl_FragColor = vec4(vColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });

  points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  scene.add(points);

  window.addEventListener('resize', onResize, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);
}

function shouldSpawnHotspot(): boolean {
  if (!hotspot) return false;
  return Math.random() < 0.45;
}

function isInHotspotBounds(x: number, y: number): boolean {
  if (!hotspot) return false;
  return x >= hotspot.xMin && x <= hotspot.xMax &&
         y >= hotspot.yBottom && y <= hotspot.yTop;
}

function updateParticles(dt: number): void {
  if (!geometry) return;

  const posArr = geometry.attributes.position.array as Float32Array;
  const sizeArr = geometry.attributes.size.array as Float32Array;
  const opArr = geometry.attributes.opacity.array as Float32Array;
  const colArr = geometry.attributes.color.array as Float32Array;

  for (let i = 0; i < pool.length; i++) {
    const p = pool[i];
    p.life += dt / p.maxLife;

    if (p.life >= 1) {
      if (p.isMote) {
        spawnMote(p);
      } else if (shouldSpawnHotspot()) {
        spawnHotspot(p);
      } else {
        spawn(p);
      }
    }

    const fadeIn = Math.min(p.life / 0.12, 1);
    const fadeOut = p.life > 0.75 ? 1 - (p.life - 0.75) / 0.25 : 1;
    p.opacity = fadeIn * fadeOut * (p.isMote ? 0.25 : 0.55);

    if (p.isMote) {
      p.x += p.moteDir * p.speed * 0.3 * dt;
      p.y += Math.sin(p.life * Math.PI * 2 + p.wobblePhase) * p.wobbleAmp * dt;
      p.opacity *= 0.5;
    } else {
      if (p.isHotspot) {
        const progress = p.life;
        const speedFade = 1 - progress * 1.1;
        p.y += p.speed * Math.max(speedFade, 0.05) * dt;
        p.x += Math.sin(p.life * 8 + p.wobblePhase) * p.wobbleAmp * dt;
        p.opacity *= 1.25;

        if (p.y > (hotspot?.yTop ?? 0.95) * 0.85) {
          p.opacity *= 0.7;
        }
      } else {
        p.y += p.speed * dt;
        p.x += Math.sin(p.life * 8 + p.wobblePhase) * p.wobbleAmp * dt;
      }
    }

    const idx = i * 3;
    posArr[idx] = p.x;
    posArr[idx + 1] = p.y;
    posArr[idx + 2] = 0;
    sizeArr[i] = p.size * PARTICLE_SIZE * 0.6;
    opArr[i] = p.opacity;

    const color = p.isHotspot ? HOTSPOT_COLOR : EMBER_COLOR;
    colArr[idx] = color.r;
    colArr[idx + 1] = color.g;
    colArr[idx + 2] = color.b;
  }

  geometry.attributes.position.needsUpdate = true;
  geometry.attributes.size.needsUpdate = true;
  geometry.attributes.opacity.needsUpdate = true;
  geometry.attributes.color.needsUpdate = true;
}

function onVisibility(): void {
  if (document.hidden) {
    running = false;
    if (animFrameId) cancelAnimationFrame(animFrameId);
  } else {
    if (!reducedMotion) {
      running = true;
      lastTime = performance.now();
      tick();
    }
  }
}

function tick(): void {
  if (!running) return;

  animFrameId = requestAnimationFrame(tick);
  const now = performance.now();
  const dt = Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;

  if (!reducedMotion) {
    updateParticles(dt);
  }

  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}

function start(): void {
  if (reducedMotion) {
    buildPool();
    updateParticles(0.016);
    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
    return;
  }
  running = true;
  lastTime = performance.now();
  tick();
}

function destroy(): void {
  running = false;
  if (animFrameId) cancelAnimationFrame(animFrameId);
  window.removeEventListener('resize', onResize);
  document.removeEventListener('visibilitychange', onVisibility);

  if (points && scene) scene.remove(points);
  if (geometry) geometry.dispose();
  if (material) material.dispose();
  if (renderer) {
    renderer.dispose();
    renderer.forceContextLoss();
  }
  if (canvas && canvas.parentNode) {
    canvas.parentNode.removeChild(canvas);
  }
  points = null;
  geometry = null;
  material = null;
  renderer = null;
  scene = null;
  camera = null;
  canvas = null;
  pool = [];
  hotspot = null;
}

export function setHotspot(bounds: HotspotBounds | null): void {
  hotspot = bounds;
}

export function initAmbientParticles(): void {
  setup();
  start();
}

export { destroy };
