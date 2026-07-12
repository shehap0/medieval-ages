import gsap from 'gsap';

/* ---------------------------------------------------------------------------
   Dialogue content — 9 pages, linear click-to-advance
   ------------------------------------------------------------------------- */
const DIALOGUE: string[] = [
  'I guard the letters that were never meant to be read. Choose a broken seal, traveler, and I shall whisper its contents.',

  'Ah, the King of the Salt Reach. He wrote this on parchment damp with sea spray, the very night the tide turned black. He was a proud man, but fear is clear in the uneven stroke of his quill.',

  'To the Inner Circle. The watchtowers are empty. The guards fled before the first bell, leaving only their cloaks behind. If the garrison does not arrive by dawn, we shall burn the records ourselves and abandon the harbor to the dark.',

  'The Iron Sovereign. A ruler who spoke only in cold decrees. This letter was found folded three times and hidden behind the altar of the ruined stone chapel.',

  'Our vow remains unbroken. We have buried the gilded relics beneath the threshold of the second gate. Let the ash cover them; they must not be found by the vanguard, even if our names are erased from the ledgers.',

  'A monarch of whispers. She ruled not with steel, but with secrets written on the thinnest vellum. Notice how the wax seal was broken in haste, tearing the margins.',

  'Do not trust the gold-tongued. They speak of peace to the court while the silent captain marches on the eastern road. The letters have been intercepted. Burn this upon reading, or we are both forfeit.',

  'The Last King. He held the crown for only three days before the gates crumbled. His hand was shaking so terribly that the ink pooled at the bottom of the page.',

  'The banners are gone. There is no one left to hold the line. May the hand-written archive record our names in the silence, so we are not entirely forgotten when the winter takes the citadel.',
];

/* ---------------------------------------------------------------------------
   Asset paths
   ------------------------------------------------------------------------- */
const SPRITE_FRAMES = [
  '/cat/mini-wizard-cat-start.png',
  '/cat/mini-wizard-cat-mid.png',
  '/cat/mini-wizard-cat-final.png',
];
const PORTRAIT_SRC = '/cat/wizard-cat-portrait.png';

const TYPING_SPEED = 35; // ms per character
const SPRITE_INTERVAL = 1000; // ms between sprite frames

/* ---------------------------------------------------------------------------
   Module-level mutable state
   ------------------------------------------------------------------------- */
let initialized = false;
let reducedMotion = false;

// Dialogue state
let isOpen = false;
let currentLineIdx = 0;
let isTyping = false;
let typingTimer: ReturnType<typeof setInterval> | null = null;
let charIdx = 0;
let currentLineText = '';

// GSAP tweens
let shakeTween: gsap.core.Tween | null = null;
let openTimeline: gsap.core.Timeline | null = null;
let closeTimeline: gsap.core.Timeline | null = null;

// Sprite state
let spriteIdx = 0;
let spriteDir = 1; // 1 = forward, -1 = backward
let spriteTimer: ReturnType<typeof setInterval> | null = null;

/* ---------------------------------------------------------------------------
   DOM query helpers
   ------------------------------------------------------------------------- */
function q<T extends HTMLElement>(sel: string, parent: ParentNode = document): T {
  const el = parent.querySelector<T>(sel);
  if (!el) throw new Error(`Element not found: ${sel}`);
  return el;
}

/* ---------------------------------------------------------------------------
   Preloading
   ------------------------------------------------------------------------- */
function preloadAssets(): void {
  SPRITE_FRAMES.forEach((src) => {
    const img = new Image();
    img.src = src;
  });
  const portrait = new Image();
  portrait.src = PORTRAIT_SRC;
}

/* ---------------------------------------------------------------------------
   Font loading (Pixelify Sans — scoped to dialogue bar)
   ------------------------------------------------------------------------- */
function ensureFont(): void {
  if (document.querySelector('link[href*="Pixelify+Sans"]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Pixelify+Sans&display=swap';
  document.head.appendChild(link);
}

/* ---------------------------------------------------------------------------
   Sprite animation (palindromic: start→mid→final→mid→start→…)
   ------------------------------------------------------------------------- */
function cycleSprite(): void {
  spriteIdx += spriteDir;

  if (spriteIdx === SPRITE_FRAMES.length - 1) {
    spriteDir = -1;
  } else if (spriteIdx === 0) {
    spriteDir = 1;
  }

  const spriteEl = document.querySelector<HTMLImageElement>('.wizard-cat__sprite');
  if (spriteEl) {
    spriteEl.src = SPRITE_FRAMES[spriteIdx];
  }
}

function startSprite(): void {
  if (spriteTimer) clearInterval(spriteTimer);
  spriteIdx = 0;
  spriteDir = 1;
  const spriteEl = document.querySelector<HTMLImageElement>('.wizard-cat__sprite');
  if (spriteEl) {
    spriteEl.src = SPRITE_FRAMES[0];
  }
  spriteTimer = setInterval(cycleSprite, SPRITE_INTERVAL);
}

function stopSprite(): void {
  if (spriteTimer) {
    clearInterval(spriteTimer);
    spriteTimer = null;
  }
}

/* ---------------------------------------------------------------------------
   Typing sound
   ------------------------------------------------------------------------- */
function getTypingAudio(): HTMLAudioElement | null {
  return document.querySelector<HTMLAudioElement>('#wizard-typing-audio');
}

function startTypingSound(): void {
  const audio = getTypingAudio();
  if (!audio) return;
  audio.volume = 0.7;
  audio.currentTime = 0;
  audio.play().catch(() => {
    console.warn('Audio play failed');
  });
}

function stopTypingSound(): void {
  const audio = getTypingAudio();
  if (!audio) return;
  audio.pause();
  audio.currentTime = 0;
}

/* ---------------------------------------------------------------------------
   Portrait shake (while typing)
   ------------------------------------------------------------------------- */
function startShake(): void {
  const portrait = document.querySelector<HTMLElement>('.wizard-dialogue__portrait');
  if (!portrait) return;

  stopShake();

  shakeTween = gsap.to(portrait, {
    x: '+=2',
    rotation: '+=0.5',
    yoyo: true,
    repeat: -1,
    duration: 0.08,
    ease: 'sine.inOut',
  });
}

function stopShake(): void {
  if (shakeTween) {
    shakeTween.kill();
    shakeTween = null;
    gsap.set('.wizard-dialogue__portrait', { x: 0, rotation: 0 });
  }
}

/* ---------------------------------------------------------------------------
   Typewriter engine
   ------------------------------------------------------------------------- */
function startTyping(text: string): void {
  isTyping = true;
  charIdx = 0;
  currentLineText = text;

  const textEl = q<HTMLElement>('.wizard-dialogue__text');
  textEl.textContent = '';

  if (!reducedMotion) {
    startShake();
  }
  startTypingSound();

  typingTimer = setInterval(() => {
    charIdx++;
    textEl.textContent = currentLineText.slice(0, charIdx);

    if (charIdx >= currentLineText.length) {
      completeTyping();
    }
  }, TYPING_SPEED);
}

function completeTyping(): void {
  if (!isTyping) return;

  if (typingTimer) {
    clearInterval(typingTimer);
    typingTimer = null;
  }

  const textEl = q<HTMLElement>('.wizard-dialogue__text');
  textEl.textContent = currentLineText;

  isTyping = false;
  stopShake();
  stopTypingSound();
}

function skipOrAdvance(): void {
  if (isTyping) {
    completeTyping();
    return;
  }

  if (currentLineIdx >= DIALOGUE.length - 1) {
    closeDialogue();
    return;
  }

  currentLineIdx++;
  if (reducedMotion) {
    q<HTMLElement>('.wizard-dialogue__text').textContent = DIALOGUE[currentLineIdx];
    isTyping = false;
  } else {
    startTyping(DIALOGUE[currentLineIdx]);
  }
}

/* ---------------------------------------------------------------------------
   Open / Close the dialogue overlay
   ------------------------------------------------------------------------- */
function openDialogue(): void {
  if (isOpen) return;

  isOpen = true;
  stopSprite();

  // Hide the idle widget
  const widget = document.getElementById('wizard-cat');
  if (widget) widget.style.display = 'none';

  const overlay = q<HTMLElement>('#wizard-dialogue');
  const backdrop = q<HTMLElement>('.wizard-dialogue__backdrop', overlay);
  const bar = q<HTMLElement>('.wizard-dialogue__bar', overlay);
  const portrait = q<HTMLElement>('.wizard-dialogue__portrait', overlay);

  overlay.setAttribute('aria-hidden', 'false');
  overlay.style.display = 'block';
  overlay.style.pointerEvents = 'auto';

  document.body.style.overflow = 'hidden';

  currentLineIdx = 0;
  currentLineText = '';

  /* Kill any lingering timelines */
  if (openTimeline) {
    openTimeline.kill();
    openTimeline = null;
  }
  if (closeTimeline) {
    closeTimeline.kill();
    closeTimeline = null;
  }

  if (reducedMotion) {
    gsap.set(backdrop, { opacity: 1 });
    gsap.set(bar, { opacity: 1, y: 0 });
    gsap.set(portrait, { opacity: 1, scale: 1 });
    q<HTMLElement>('.wizard-dialogue__text').textContent = DIALOGUE[0];
    return;
  }

  /* Initial state */
  gsap.set(backdrop, { opacity: 0 });
  gsap.set(bar, { opacity: 0, y: 40 });
  gsap.set(portrait, { opacity: 0, scale: 0.95 });

  /* Animate in */
  openTimeline = gsap.timeline();

  openTimeline.to(backdrop, {
    opacity: 1,
    duration: 0.25,
    ease: 'power2.out',
  }, 0);

  openTimeline.to(bar, {
    opacity: 1,
    y: 0,
    duration: 0.3,
    ease: 'back.out(1.2)',
  }, '>');

  openTimeline.to(portrait, {
    opacity: 1,
    scale: 1,
    duration: 0.35,
    ease: 'back.out(1.3)',
  }, '<+=0.1');

  /* Start typing immediately (inside user gesture context for audio) */
  startTyping(DIALOGUE[0]);
}

function closeDialogue(): void {
  if (!isOpen) return;

  completeTyping();
  stopShake();
  stopTypingSound();

  const overlay = q<HTMLElement>('#wizard-dialogue');
  const backdrop = q<HTMLElement>('.wizard-dialogue__backdrop', overlay);
  const bar = q<HTMLElement>('.wizard-dialogue__bar', overlay);
  const portrait = q<HTMLElement>('.wizard-dialogue__portrait', overlay);

  /* Kill any open timeline */
  if (openTimeline) {
    openTimeline.kill();
    openTimeline = null;
  }

  if (reducedMotion) {
    finishClose();
    return;
  }

  closeTimeline = gsap.timeline({
    onComplete: finishClose,
  });

  closeTimeline.to(portrait, {
    opacity: 0,
    scale: 0.95,
    duration: 0.2,
    ease: 'power2.in',
  }, 0);

  closeTimeline.to(bar, {
    opacity: 0,
    y: 20,
    duration: 0.25,
    ease: 'power2.in',
  }, '>');

  closeTimeline.to(backdrop, {
    opacity: 0,
    duration: 0.25,
    ease: 'power2.in',
  }, '<');

  function finishClose(): void {
    overlay.setAttribute('aria-hidden', 'true');
    overlay.style.display = 'none';
    overlay.style.pointerEvents = 'none';

    gsap.set(backdrop, { clearProps: 'all' });
    gsap.set(bar, { clearProps: 'all' });
    gsap.set(portrait, { clearProps: 'all' });

    document.body.style.overflow = '';

    const widget = document.getElementById('wizard-cat');
    if (widget) widget.style.display = '';

    currentLineIdx = 0;
    isOpen = false;
    closeTimeline = null;

    startSprite();
  }
}

/* ---------------------------------------------------------------------------
   Event handlers
   ------------------------------------------------------------------------- */
function onWidgetClick(): void {
  openDialogue();
}

function onWidgetKeydown(e: KeyboardEvent): void {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    openDialogue();
  }
}

function onOverlayClick(e: MouseEvent): void {
  if (!isOpen) return;
  const target = e.target as HTMLElement;

  /* Clicking directly on backdrop = close */
  if (target.classList.contains('wizard-dialogue__backdrop')) {
    closeDialogue();
    return;
  }

  /* Clicking on bar or portrait = advance */
  if (target.closest('.wizard-dialogue__bar') || target.closest('.wizard-dialogue__portrait')) {
    skipOrAdvance();
    return;
  }
}

function onKeyDown(e: KeyboardEvent): void {
  if (e.key === 'Escape' && isOpen) {
    e.preventDefault();
    closeDialogue();
  }
}

/* ---------------------------------------------------------------------------
   Bind events once
   ------------------------------------------------------------------------- */
function bindEvents(): void {
  const widget = document.getElementById('wizard-cat');
  widget?.addEventListener('click', onWidgetClick);
  widget?.addEventListener('keydown', onWidgetKeydown);

  const overlay = document.getElementById('wizard-dialogue');
  overlay?.addEventListener('click', onOverlayClick);

  document.addEventListener('keydown', onKeyDown);
}

/* ---------------------------------------------------------------------------
   Public initializer
   ------------------------------------------------------------------------- */
function initWizardCat(): void {
  if (initialized) return;

  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  preloadAssets();
  ensureFont();
  bindEvents();
  startSprite();

  initialized = true;
}

export { initWizardCat };
