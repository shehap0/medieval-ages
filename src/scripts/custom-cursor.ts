import gsap from 'gsap';

const TRAIL_POOL_SIZE = 6;
const IDLE_SIZE = 9;
const DOT_HOVER_SCALE = 0.72;
const RING_HOVER_SIZE = 36;
const RING_ROTATION_DURATION = 5;

let dot: HTMLDivElement | null = null;
let ring: HTMLDivElement | null = null;
let trailPool: HTMLDivElement[] = [];
let trailIdx = 0;

let mx = 0;
let my = 0;
let prevMx = 0;
let prevMy = 0;
let prevTime = 0;
let isHovering = false;
let isPressed = false;
let reducedMotion = false;

let xTo: (v: number) => void;
let yTo: (v: number) => void;
let rxTo: (v: number) => void;
let ryTo: (v: number) => void;
let ringRotate: gsap.core.Tween | null = null;

function createTrailElement(): HTMLDivElement {
  const el = document.createElement('div');
  el.style.cssText = `
    position:fixed;top:0;left:0;pointer-events:none;
    width:4px;height:4px;border-radius:50%;
    background:oklch(0.76 0.092 85);
    opacity:0;
    will-change:transform,opacity;
    box-shadow:0 0 4px oklch(0.76 0.092 85 / 0.6),0 0 8px oklch(0.84 0.075 82 / 0.3);
  `;
  document.body.appendChild(el);
  gsap.set(el, { xPercent: -50, yPercent: -50 });
  return el;
}

function spawnTrail(x: number, y: number): void {
  if (reducedMotion) return;
  const el = trailPool[trailIdx];
  trailIdx = (trailIdx + 1) % TRAIL_POOL_SIZE;

  gsap.killTweensOf(el);

  const dx = x - prevMx;
  const dy = y - prevMy;
  const offsetX = -dx * 0.15 + (Math.random() - 0.5) * 6;
  const offsetY = -dy * 0.15 + (Math.random() - 0.5) * 6;

  gsap.set(el, {
    x: x + offsetX,
    y: y + offsetY,
    scale: 0.6 + Math.random() * 0.6,
    opacity: 0.35 + Math.random() * 0.25,
  });

  gsap.to(el, {
    opacity: 0,
    scale: 0.1,
    x: x + offsetX + (Math.random() - 0.5) * 20,
    y: y + offsetY + 6 + Math.random() * 8,
    duration: 0.35 + Math.random() * 0.2,
    ease: 'power2.out',
  });
}

function onMouseMove(e: MouseEvent): void {
  const now = performance.now();
  mx = e.clientX;
  my = e.clientY;

  xTo(mx);
  yTo(my);
  rxTo(mx);
  ryTo(my);

  if (!isHovering && !isPressed) {
    const dt = now - prevTime;
    const dx = mx - prevMx;
    const dy = my - prevMy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const velocity = dt > 0 && prevTime > 0 ? dist / dt : 0;

    if (velocity > 0.15 && Math.random() < 0.5) {
      spawnTrail(mx, my);
    }
  }

  prevMx = mx;
  prevMy = my;
  prevTime = now;
}

function enterHover(): void {
  if (isHovering) return;
  isHovering = true;

  if (!reducedMotion) {
    gsap.to(dot, { scale: DOT_HOVER_SCALE, duration: 0.2, ease: 'power2.out' });
    gsap.to(ring, {
      width: RING_HOVER_SIZE,
      height: RING_HOVER_SIZE,
      borderWidth: 1,
      opacity: 1,
      duration: 0.25,
      ease: 'back.out(1.3)',
    });
  } else {
    gsap.set(dot, { scale: DOT_HOVER_SCALE });
    gsap.set(ring, { width: RING_HOVER_SIZE, height: RING_HOVER_SIZE, borderWidth: 1, opacity: 1 });
  }
}

function leaveHover(): void {
  if (!isHovering) return;
  isHovering = false;

  if (!reducedMotion) {
    gsap.to(dot, { scale: 1, duration: 0.2, ease: 'power2.out' });
    gsap.to(ring, {
      width: 0,
      height: 0,
      borderWidth: 0,
      opacity: 0,
      duration: 0.2,
      ease: 'power2.in',
    });
  } else {
    gsap.set(dot, { scale: 1 });
    gsap.set(ring, { width: 0, height: 0, borderWidth: 0, opacity: 0 });
  }
}

function onMouseOver(e: MouseEvent): void {
  const target = e.target as Element;
  if (!target || target === document.documentElement || target === document.body) return;
  const interactive = target.closest('a, button, [role="button"], [data-cursor-hover]');
  if (interactive) {
    enterHover();
  } else if (!isHovering) {
    return;
  }
}

function onMouseOut(e: MouseEvent): void {
  const related = e.relatedTarget as Element;
  const stillInteractive =
    related &&
    related !== document.documentElement &&
    related !== document.body &&
    related.closest('a, button, [role="button"], [data-cursor-hover]');

  if (!stillInteractive && isHovering) {
    leaveHover();
  }
}

function onMouseDown(_e: MouseEvent): void {
  if (isPressed) return;
  isPressed = true;
  gsap.to(dot, { scale: 0.55, duration: 0.08, ease: 'power2.in' });
}

function onMouseUp(_e: MouseEvent): void {
  if (!isPressed) return;
  isPressed = false;
  const targetScale = isHovering ? DOT_HOVER_SCALE : 1;
  gsap.to(dot, { scale: targetScale, duration: 0.15, ease: 'back.out(1.4)' });
}

function setupCursor(): void {
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const cursorStyle = document.createElement('style');
  cursorStyle.textContent = `
    html.cc-active { cursor: none; }
    html.cc-active a, html.cc-active button, html.cc-active [role="button"], html.cc-active [data-cursor-hover] {
      cursor: none;
    }
  `;
  document.head.appendChild(cursorStyle);

  document.documentElement.classList.add('cc-active');

  dot = document.createElement('div');
  dot.style.cssText = `
    position:fixed;top:0;left:0;pointer-events:none;z-index:99999;
    width:${IDLE_SIZE}px;height:${IDLE_SIZE}px;border-radius:50%;
    background:oklch(0.76 0.092 85);
    will-change:transform;
    box-shadow:0 0 6px oklch(0.76 0.092 85 / 0.55),0 0 14px oklch(0.84 0.075 82 / 0.25);
  `;

  ring = document.createElement('div');
  ring.style.cssText = `
    position:fixed;top:0;left:0;pointer-events:none;z-index:99998;
    width:0px;height:0px;border-radius:50%;
    border:0px solid oklch(0.76 0.092 85 / 0.7);
    opacity:0;
    will-change:transform;
    box-sizing:border-box;
  `;

  document.body.appendChild(dot);
  document.body.appendChild(ring);

  for (let i = 0; i < TRAIL_POOL_SIZE; i++) {
    trailPool.push(createTrailElement());
  }

  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;

  gsap.set(dot, { xPercent: -50, yPercent: -50, x: cx, y: cy, opacity: 0 });
  gsap.set(ring, { xPercent: -50, yPercent: -50, x: cx, y: cy });

  if (!reducedMotion) {
    ringRotate = gsap.to(ring, {
      rotation: 360,
      duration: RING_ROTATION_DURATION,
      repeat: -1,
      ease: 'none',
    });
  }

  mx = cx;
  my = cy;
  prevMx = cx;
  prevMy = cy;

  xTo = gsap.quickTo(dot, 'x', { duration: 0.15, ease: 'power2.out' });
  yTo = gsap.quickTo(dot, 'y', { duration: 0.15, ease: 'power2.out' });
  rxTo = gsap.quickTo(ring, 'x', { duration: 0.3, ease: 'power2.out' });
  ryTo = gsap.quickTo(ring, 'y', { duration: 0.3, ease: 'power2.out' });

  gsap.to(dot, { opacity: 1, duration: 0.3, ease: 'power2.out', delay: 0.15 });

  document.addEventListener('mousemove', onMouseMove, { passive: true });
  document.addEventListener('mousedown', onMouseDown, { passive: true });
  document.addEventListener('mouseup', onMouseUp, { passive: true });
  document.addEventListener('mouseover', onMouseOver, { passive: true });
  document.addEventListener('mouseout', onMouseOut, { passive: true });
}

function teardown(): void {
  document.documentElement.classList.remove('cc-active');

  if (ringRotate) { ringRotate.kill(); ringRotate = null; }

  if (dot) { dot.remove(); dot = null; }
  if (ring) { ring.remove(); ring = null; }
  trailPool.forEach((el) => el.remove());
  trailPool = [];

  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mousedown', onMouseDown);
  document.removeEventListener('mouseup', onMouseUp);
  document.removeEventListener('mouseover', onMouseOver);
  document.removeEventListener('mouseout', onMouseOut);
}

export function initCustomCursor(): void {
  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  if (isTouch) return;

  setupCursor();
}

export { teardown as destroyCursor };
