import { setHotspot, type HotspotBounds } from './ambient-particles';

let observer: IntersectionObserver | null = null;
let glowEl: HTMLDivElement | null = null;
let flickerId = 0;
let resizeTimer = 0;
let active = false;
let reducedMotion = false;
let section: HTMLElement | null = null;

function pxToNdcX(px: number, vpW: number): number {
  return (px / vpW) * 2 - 1;
}

function pxToNdcY(px: number, vpH: number): number {
  return 1 - (px / vpH) * 2;
}

function calcAspect(): number {
  return window.innerWidth / window.innerHeight;
}

function calcBounds(): HotspotBounds | null {
  if (!section) return null;
  const rect = section.getBoundingClientRect();
  const vpW = window.innerWidth;
  const vpH = window.innerHeight;
  const aspect = calcAspect();

  if (rect.bottom < 0 || rect.top > vpH) return null;

  const sectionBottomPx = rect.bottom;
  const sectionHeight = rect.height;
  const zoneHeight = sectionHeight * 0.65;
  const zoneTopPx = sectionBottomPx - zoneHeight;

  const yBottom = pxToNdcY(sectionBottomPx, vpH);
  const yTop = pxToNdcY(zoneTopPx, vpH);

  const xMin = pxToNdcX(rect.left, vpW) * aspect;
  const xMax = pxToNdcX(rect.right, vpW) * aspect;

  const portraitRight = rect.left + rect.width * 0.58;
  const biasCenter = pxToNdcX(portraitRight, vpW) * aspect;

  return { xMin, xMax, yBottom, yTop, biasCenter };
}

function createGlow(): void {
  if (!section || reducedMotion) return;

  if (glowEl) {
    glowEl.remove();
    glowEl = null;
  }

  glowEl = document.createElement('div');
  
  // Changes made here:
  // 1. Height increased to 65% for a larger footprint.
  // 2. Added 'mix-blend-mode: plus-lighter' (or 'screen') to make the glow interact vividly with background content.
  // 3. Pushed the OKLCH values to near-maximum brightness and higher color chroma (saturation).
  glowEl.style.cssText = `
    position:absolute;bottom:0;left:0;right:0;height:65%;
    pointer-events:none;z-index:0;
    mix-blend-mode: plus-lighter;
    background:radial-gradient(ellipse 90% 95% at 50% 100%,
      oklch(0.85 0.24 45 / 0.85),
      oklch(0.70 0.18 38 / 0.55) 35%,
      oklch(0.55 0.12 30 / 0.25) 65%,
      transparent 100%
    );
    opacity:0;
    will-change:opacity;
  `;
  section.style.position = 'relative';
  section.insertBefore(glowEl, section.firstChild);
}

function removeGlow(): void {
  if (glowEl) {
    glowEl.remove();
    glowEl = null;
  }
  if (flickerId) {
    cancelAnimationFrame(flickerId);
    flickerId = 0;
  }
}

function noise(t: number, freq: number, phase: number): number {
  return Math.sin(t * freq + phase);
}

function flickerStep(): void {
  if (!glowEl || !active || reducedMotion) return;

  const t = performance.now() / 1000;
  
  // Baseline shifted higher (0.65) to maintain constant high luminosity.
  const v =
    0.65 +
    0.20 * noise(t, 3.7, 0) * noise(t, 2.1, 1.4) * noise(t, 1.3, 2.8) +
    0.12 * noise(t, 5.3, 0.7) +
    0.05 * noise(t, 8.1, 3.5);

  // The glow will now fluctuate between 0.45 (highly visible) and 1.0 (fully active).
  const opacity = Math.max(0.45, Math.min(1.0, v));
  glowEl.style.opacity = String(opacity);

  flickerId = requestAnimationFrame(flickerStep);
}

function onEnter(): void {
  if (reducedMotion) return;
  active = true;
  const bounds = calcBounds();
  if (bounds) setHotspot(bounds);
  createGlow();
  flickerStep();
}

function onLeave(): void {
  active = false;
  setHotspot(null);
  removeGlow();
}

function onScrollResize(): void {
  clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(() => {
    if (active) {
      const bounds = calcBounds();
      setHotspot(bounds);
    }
  }, 120);
}

export function initSectionFire(): void {
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  section = document.getElementById('council');
  if (!section) return;

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        onEnter();
      } else {
        onLeave();
      }
    },
    { rootMargin: '200px 0px', threshold: 0 },
  );

  observer.observe(section);

  window.addEventListener('scroll', onScrollResize, { passive: true });
  window.addEventListener('resize', onScrollResize, { passive: true });
}