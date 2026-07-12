import gsap from 'gsap';
import { letters, type Letter } from '../data/letters';

let initialized = false;
let observer: IntersectionObserver | null = null;
let isOpen = false;
let isAnimating = false;
let activeSeal: HTMLButtonElement | null = null;
let closeTl: gsap.core.Timeline | null = null;
let reducedMotion = false;

function query<T extends HTMLElement>(selector: string, parent: ParentNode = document): T {
  const el = parent.querySelector<T>(selector);
  if (!el) throw new Error(`Element not found: ${selector}`);
  return el;
}

function queryAll<T extends HTMLElement>(selector: string, parent: ParentNode = document): NodeListOf<T> {
  return parent.querySelectorAll<T>(selector);
}

function setupCracks(seal: HTMLElement): void {
  const cracks = seal.querySelectorAll<SVGPathElement>('.seal-crack');
  cracks.forEach((crack) => {
    const length = crack.getTotalLength();
    crack.style.strokeDasharray = String(length);
    crack.style.strokeDashoffset = String(length);
  });
}

function populateParchment(letter: Letter): void {
  const overlay = query<HTMLElement>('#corr-overlay');
  const plateLabel = query<HTMLElement>('.corr-plate-label', overlay);
  const dateLine = query<HTMLElement>('.corr-date-line', overlay);
  const title = query<HTMLElement>('.corr-title', overlay);
  const body = query<HTMLElement>('.corr-body', overlay);
  const stain = query<HTMLElement>('.corr-stain', overlay);
  const closeBtn = query<HTMLElement>('.corr-close', overlay);

  plateLabel.textContent = letter.plateLabel;
  dateLine.textContent = letter.dateLine;
  title.textContent = letter.title;
  body.innerHTML = letter.body.map((p) => `<p>${p}</p>`).join('');

  stain.className = 'corr-stain';
  if (letter.stain !== 'none') {
    stain.classList.add(`corr-stain--${letter.stain}`);
  }

  closeBtn.setAttribute('aria-label', `Close letter from ${letter.author}`);

  overlay.setAttribute('aria-labelledby', 'corr-title');
}

let focusTrapHandler: ((e: KeyboardEvent) => void) | null = null;

function getFocusableElements(parent: HTMLElement): HTMLElement[] {
  const selectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ];
  const elements = parent.querySelectorAll<HTMLElement>(selectors.join(','));
  return Array.from(elements).filter(
    (el) => !el.hasAttribute('disabled') && el.offsetParent !== null,
  );
}

function trapFocus(container: HTMLElement): void {
  const focusable = getFocusableElements(container);
  if (focusable.length === 0) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  first.focus();

  if (focusTrapHandler) {
    container.removeEventListener('keydown', focusTrapHandler);
  }

  focusTrapHandler = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  container.addEventListener('keydown', focusTrapHandler);
}

function closeDialog(): void {
  if (!isOpen || !activeSeal || isAnimating) return;

  isAnimating = true;
  const overlay = query<HTMLElement>('#corr-overlay');
  const parchment = query<HTMLElement>('.corr-parchment', overlay);
  const textEls = parchment.querySelectorAll<HTMLElement>(
    '.corr-plate-label, .corr-date-line, .corr-title, .corr-body p, .corr-stain',
  );
  const backdrop = query<HTMLElement>('.corr-backdrop', overlay);

  if (closeTl) {
    closeTl.kill();
    closeTl = null;
  }

  if (reducedMotion) {
    gsap.set(backdrop, { opacity: 0 });
    gsap.set([overlay, parchment], { opacity: 0 });
    finishClose();
    return;
  }

  closeTl = gsap.timeline({
    onComplete: finishClose,
  });

  closeTl.to(
    textEls,
    {
      opacity: 0,
      y: -5,
      duration: 0.15,
      stagger: 0.03,
      ease: 'power2.in',
    },
    0,
  );

  closeTl.to(
    parchment,
    {
      scaleY: 0.04,
      duration: 0.35,
      ease: 'power2.in',
    },
    0.05,
  );

  closeTl.to(
    backdrop,
    {
      opacity: 0,
      duration: 0.25,
      ease: 'power2.in',
    },
    '<',
  );

  closeTl.to(
    overlay,
    {
      opacity: 0,
      duration: 0.2,
      ease: 'power2.in',
    },
    '<+=0.1',
  );

  function finishClose(): void {
    overlay.setAttribute('aria-hidden', 'true');
    gsap.set(overlay, { display: 'none' });
    gsap.set(parchment, { clearProps: 'all' });
    gsap.set(backdrop, { clearProps: 'all' });
    gsap.set(textEls, { clearProps: 'all' });

    document.body.style.overflow = '';

    if (activeSeal) {
      const wax = activeSeal.querySelector<SVGCircleElement>('.seal-wax');
      const cracks = activeSeal.querySelectorAll<SVGPathElement>('.seal-crack');
      const shards = activeSeal.querySelectorAll<SVGPathElement>('.seal-shard');

      if (wax) gsap.set(wax, { opacity: 1 });
      cracks.forEach((c) => gsap.set(c, { strokeDashoffset: c.getTotalLength() }));
      gsap.set(shards, { opacity: 1, x: 0, y: 0, rotation: 0 });
      gsap.set(activeSeal, { scale: 1 });

      activeSeal.focus();
      activeSeal = null;
    }

    isOpen = false;
    isAnimating = false;
    closeTl = null;
  }
}

function openDialog(seal: HTMLButtonElement, letter: Letter): void {
  if (isAnimating || isOpen) return;

  isAnimating = true;
  activeSeal = seal;

  const overlay = query<HTMLElement>('#corr-overlay');
  const parchment = query<HTMLElement>('.corr-parchment', overlay);
  const backdrop = query<HTMLElement>('.corr-backdrop', overlay);
  const textEls = parchment.querySelectorAll<HTMLElement>(
    '.corr-plate-label, .corr-date-line, .corr-title, .corr-body p, .corr-stain',
  );
  const cracks = seal.querySelectorAll<SVGPathElement>('.seal-crack');
  const shards = seal.querySelectorAll<SVGPathElement>('.seal-shard');
  const wax = seal.querySelector<SVGCircleElement>('.seal-wax');

  populateParchment(letter);

  overlay.setAttribute('aria-hidden', 'false');
  gsap.set(overlay, { display: 'flex', opacity: 1 });
  gsap.set(parchment, { scaleY: 0.04 });
  gsap.set(backdrop, { opacity: 0 });
  gsap.set(textEls, { opacity: 0, y: 10 });
  gsap.set(cracks, { strokeDashoffset: (i) => cracks[i].getTotalLength() });
  gsap.set(shards, { opacity: 1, x: 0, y: 0, rotation: 0, transformOrigin: '50% 50%' });

  document.body.style.overflow = 'hidden';

  if (reducedMotion) {
    gsap.set(backdrop, { opacity: 0.85 });
    gsap.set(parchment, { scaleY: 1 });
    gsap.set(textEls, { opacity: 1, y: 0 });
    finishOpen();
    return;
  }

  const tl = gsap.timeline({
    onComplete: finishOpen,
  });

  tl.to(
    seal,
    {
      scale: 0.92,
      duration: 0.15,
      ease: 'power2.in',
    },
    0,
  );

  tl.to(
    cracks,
    {
      strokeDashoffset: 0,
      duration: 0.2,
      stagger: 0.05,
      ease: 'power2.out',
    },
    '>',
  );

  tl.to(
    backdrop,
    {
      opacity: 0.85,
      duration: 0.3,
      ease: 'power2.out',
    },
    '<',
  );

  if (wax) {
    tl.to(wax, { opacity: 0, duration: 0.1 }, '<+=0.15');
  }

  tl.to(
    shards,
    {
      opacity: 0,
      x: (i) => [22, -24, -18, 20][i],
      y: (i) => [-20, 22, 35, -18][i],
      rotation: (i) => [12, -14, 16, -10][i],
      duration: 0.4,
      stagger: 0.04,
      ease: 'power2.in',
    },
    '>-=0.1',
  );

  tl.fromTo(
    parchment,
    { scaleY: 0.04 },
    {
      scaleY: 1,
      duration: 0.55,
      ease: 'back.out(1.2)',
    },
    '>',
  );

  tl.to(
    textEls,
    {
      opacity: 1,
      y: 0,
      duration: 0.3,
      stagger: 0.08,
      ease: 'power2.out',
    },
    '>',
  );

  const stainEl = parchment.querySelector('.corr-stain');
  if (stainEl && letter.stain !== 'none') {
    tl.to(
      stainEl,
      {
        opacity: 1,
        duration: 0.4,
        ease: 'power2.out',
      },
      '>-=0.2',
    );
  }

  function finishOpen(): void {
    isOpen = true;
    isAnimating = false;
    trapFocus(overlay);
  }
}

function onSealClick(seal: HTMLButtonElement): void {
  if (isAnimating || isOpen) return;

  const letterId = seal.getAttribute('data-letter');
  if (!letterId) return;

  const letter = letters.find((l) => l.id === letterId);
  if (!letter) return;

  openDialog(seal, letter);
}

function onKeyDown(e: KeyboardEvent): void {
  if (e.key === 'Escape' && isOpen) {
    e.preventDefault();
    closeDialog();
  }
}

function onBackdropClick(e: MouseEvent): void {
  const target = e.target as HTMLElement;
  if (target.classList.contains('corr-backdrop') && isOpen) {
    closeDialog();
  }
}

function bindEvents(): void {
  const section = document.getElementById('correspondence');
  if (!section) return;

  const sealButtons = section.querySelectorAll<HTMLButtonElement>('.corr-seal');
  const overlay = document.getElementById('corr-overlay');
  const closeBtn = overlay?.querySelector<HTMLButtonElement>('.corr-close');
  const backdrop = overlay?.querySelector<HTMLElement>('.corr-backdrop');

  sealButtons.forEach((btn) => {
    setupCracks(btn);
    btn.addEventListener('click', () => onSealClick(btn));
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeDialog);
  }

  if (backdrop) {
    backdrop.addEventListener('click', onBackdropClick);
  }

  document.addEventListener('keydown', onKeyDown);
}

function initialise(): void {
  if (initialized) return;

  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  bindEvents();
  initialized = true;
}

export function initSealedCorrespondence(): void {
  const section = document.getElementById('correspondence');
  if (!section) return;

  if (observer) {
    observer.disconnect();
    observer = null;
  }

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        initialise();
        observer?.disconnect();
        observer = null;
      }
    },
    { rootMargin: '200px', threshold: 0 },
  );

  observer.observe(section);
}
