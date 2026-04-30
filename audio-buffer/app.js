const slides = Array.from(document.querySelectorAll('.slide'));
const slideCounterEl = document.getElementById('slideCounter');
const slideIdEl = document.getElementById('slideId');
const consoleOutputEl = document.getElementById('consoleOutput');
const consoleInputEl = document.getElementById('consoleInput');
const slideMenuEl = document.getElementById('slideMenu');
const slidesWrapEl = document.querySelector('.slides-wrap');

let currentSlideIndex = 0;
let commandHistory = [];
let historyIndex = -1;
let menuButtons = [];
let manifestoTickerEl = null;
let manifestoTickerTimeoutId = null;
let manifestoTransitionTimeoutId = null;
let manifestoTypingIntervalId = null;
let lastManifestoIndex = -1;

const MAX_CONSOLE_LINES = 80;
const MANIFESTO_MIN_DELAY_MS = 4800;
const MANIFESTO_RANDOM_DELAY_MS = 3200;
const MANIFESTO_FADE_OUT_MS = 220;
const MANIFESTO_TYPE_SPEED_MS = 26;
const slideLookup = new Map();
const MANIFESTO_PHRASES = [
  'Obscurantism is dangerous. Show us your screens.',
  "Give us access to the performer's mind, to the whole human instrument.",
  'Programs are instruments that can change themselves.',
  'The program is to be transcended - Artificial language is the way.',
  'Code should be seen as well as heard.',
  "Live coding is not about tools. Algorithms are thoughts."
];

function clampIndex(index) {
  return Math.max(0, Math.min(index, slides.length - 1));
}

function normalizeAlias(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/_/g, '-')
    .replace(/\s+/g, ' ');
}

function getMenuLabel(slide) {
  return (slide.dataset.menu || slide.id)
    .toLowerCase()
    .trim()
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ');
}

function registerAlias(alias, index) {
  if (!alias) {
    return;
  }

  const normalized = normalizeAlias(alias);
  if (!normalized) {
    return;
  }

  slideLookup.set(normalized, index);
  slideLookup.set(normalized.replace(/\s+/g, '-'), index);
  slideLookup.set(normalized.replace(/-/g, ' '), index);
}

function buildSlideLookup() {
  slides.forEach((slide, index) => {
    registerAlias(slide.id, index);
    registerAlias(slide.dataset.menu, index);
    registerAlias(slide.dataset.title, index);
    registerAlias(String(index + 1), index);
  });
}

function buildSlideMenu() {
  slideMenuEl.innerHTML = '';

  slides.forEach((slide, index) => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'menu-item';
    item.dataset.index = String(index);
    item.textContent = `- ${getMenuLabel(slide)}`;
    item.addEventListener('click', () => {
      setSlide(index);
    });
    slideMenuEl.appendChild(item);
  });

  menuButtons = Array.from(slideMenuEl.querySelectorAll('.menu-item'));
}

function updateActiveMenu() {
  menuButtons.forEach((button, index) => {
    button.classList.toggle('active', index === currentSlideIndex);
  });
}

function scrollConsoleToBottom() {
  consoleOutputEl.scrollTop = consoleOutputEl.scrollHeight;
}

function logLine(text, type = 'ok') {
  while (consoleOutputEl.querySelectorAll('.console-line:not(.manifesto)').length >= MAX_CONSOLE_LINES) {
    const firstNonManifesto = consoleOutputEl.querySelector('.console-line:not(.manifesto)');
    if (!firstNonManifesto) {
      break;
    }
    firstNonManifesto.remove();
  }

  const line = document.createElement('div');
  line.className = `console-line ${type}`;
  line.textContent = text;
  consoleOutputEl.appendChild(line);
  scrollConsoleToBottom();
}

function pickRandomManifestoPhrase() {
  let nextIndex = Math.floor(Math.random() * MANIFESTO_PHRASES.length);
  if (MANIFESTO_PHRASES.length > 1 && nextIndex === lastManifestoIndex) {
    nextIndex = (nextIndex + 1) % MANIFESTO_PHRASES.length;
  }
  lastManifestoIndex = nextIndex;
  return MANIFESTO_PHRASES[nextIndex];
}

function clearManifestoTimers() {
  if (manifestoTickerTimeoutId !== null) {
    window.clearTimeout(manifestoTickerTimeoutId);
    manifestoTickerTimeoutId = null;
  }

  if (manifestoTransitionTimeoutId !== null) {
    window.clearTimeout(manifestoTransitionTimeoutId);
    manifestoTransitionTimeoutId = null;
  }

  if (manifestoTypingIntervalId !== null) {
    window.clearInterval(manifestoTypingIntervalId);
    manifestoTypingIntervalId = null;
  }
}

function scheduleNextManifestoPhrase() {
  if (manifestoTickerTimeoutId !== null) {
    window.clearTimeout(manifestoTickerTimeoutId);
  }

  const delayMs = MANIFESTO_MIN_DELAY_MS + Math.floor(Math.random() * MANIFESTO_RANDOM_DELAY_MS);
  manifestoTickerTimeoutId = window.setTimeout(() => {
    manifestoTickerTimeoutId = null;
    showNextManifestoPhrase();
  }, delayMs);
}

function typeManifestoPhrase(phrase, onDone) {
  if (!manifestoTickerEl) {
    return;
  }

  if (manifestoTypingIntervalId !== null) {
    window.clearInterval(manifestoTypingIntervalId);
    manifestoTypingIntervalId = null;
  }

  let cursor = 0;
  manifestoTickerEl.textContent = '';
  manifestoTickerEl.classList.add('typing');
  scrollConsoleToBottom();

  manifestoTypingIntervalId = window.setInterval(() => {
    if (!manifestoTickerEl) {
      window.clearInterval(manifestoTypingIntervalId);
      manifestoTypingIntervalId = null;
      return;
    }

    cursor += 1;
    manifestoTickerEl.textContent = phrase.slice(0, cursor);
    scrollConsoleToBottom();

    if (cursor >= phrase.length) {
      window.clearInterval(manifestoTypingIntervalId);
      manifestoTypingIntervalId = null;
      manifestoTickerEl.classList.remove('typing');
      if (onDone) {
        onDone();
      }
    }
  }, MANIFESTO_TYPE_SPEED_MS);
}

function showNextManifestoPhrase() {
  if (!manifestoTickerEl) {
    return;
  }

  if (manifestoTransitionTimeoutId !== null) {
    window.clearTimeout(manifestoTransitionTimeoutId);
    manifestoTransitionTimeoutId = null;
  }

  if (manifestoTypingIntervalId !== null) {
    window.clearInterval(manifestoTypingIntervalId);
    manifestoTypingIntervalId = null;
  }

  const nextPhrase = pickRandomManifestoPhrase();
  manifestoTickerEl.classList.remove('typing');
  manifestoTickerEl.classList.remove('visible');

  manifestoTransitionTimeoutId = window.setTimeout(() => {
    manifestoTransitionTimeoutId = null;
    if (!manifestoTickerEl) {
      return;
    }
    manifestoTickerEl.classList.add('visible');
    typeManifestoPhrase(nextPhrase, scheduleNextManifestoPhrase);
  }, MANIFESTO_FADE_OUT_MS);
}

function startManifestoTicker() {
  clearManifestoTimers();

  if (!manifestoTickerEl) {
    manifestoTickerEl = document.createElement('div');
    manifestoTickerEl.className = 'console-line manifesto';
    consoleOutputEl.insertBefore(manifestoTickerEl, consoleOutputEl.firstChild);
  }

  showNextManifestoPhrase();
}

function updateTopBar() {
  const slide = slides[currentSlideIndex];
  slideCounterEl.textContent = `${currentSlideIndex + 1} / ${slides.length}`;
  slideIdEl.textContent = getMenuLabel(slide);
  updateActiveMenu();
}

function stopEventsVideos() {
  const eventsSlideEl = document.getElementById('events');
  if (!eventsSlideEl) {
    return;
  }

  const eventVideos = eventsSlideEl.querySelectorAll('video');
  eventVideos.forEach((videoEl) => {
    videoEl.pause();
    try {
      videoEl.currentTime = 0;
    } catch (error) {
      // Some formats may not be seekable immediately.
    }
  });
}

function setSlide(index, pushHash = true) {
  const nextIndex = clampIndex(index);
  const previousSlideEl = slides[currentSlideIndex];
  const nextSlideEl = slides[nextIndex];

  if (previousSlideEl && previousSlideEl.id === 'events' && previousSlideEl !== nextSlideEl) {
    stopEventsVideos();
  }

  currentSlideIndex = nextIndex;

  slides.forEach((slide, idx) => {
    slide.classList.toggle('active', idx === currentSlideIndex);
  });

  updateTopBar();

  if (slidesWrapEl) {
    slidesWrapEl.scrollTop = 0;
  }
  window.scrollTo(0, 0);

  if (pushHash) {
    const targetHash = `#${slides[currentSlideIndex].id}`;
    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    }
  }
}

function nextSlide() {
  if (currentSlideIndex < slides.length - 1) {
    setSlide(currentSlideIndex + 1);
  }
}

function prevSlide() {
  if (currentSlideIndex > 0) {
    setSlide(currentSlideIndex - 1);
  }
}

function gotoSlide(target) {
  if (!target) {
    logLine('Usage: goto <slide-id|number|name>', 'err');
    return;
  }

  const normalizedTarget = normalizeAlias(target);
  const matchedIndex = slideLookup.get(normalizedTarget);

  if (matchedIndex === undefined) {
    logLine(`Unknown slide: ${target}`, 'err');
    return;
  }

  setSlide(matchedIndex);
  logLine(`Moved to ${matchedIndex + 1}. ${getMenuLabel(slides[matchedIndex])}`);
}

function listSlides() {
  slides.forEach((slide, index) => {
    logLine(`${index + 1}. ${getMenuLabel(slide)}`);
  });
}

function help() {
  logLine('Commands: help, next, prev, goto <id|number|name>, list, where, clear');
}

function clearConsole() {
  consoleOutputEl.innerHTML = '';
  manifestoTickerEl = null;
  startManifestoTicker();
}

function where() {
  const slide = slides[currentSlideIndex];
  logLine(`Current: ${currentSlideIndex + 1}/${slides.length} (${getMenuLabel(slide)})`);
}

function executeCommand(rawInput) {
  const input = rawInput.trim();
  if (!input) {
    return;
  }

  logLine(`> ${input}`, 'cmd');
  commandHistory.push(input);
  historyIndex = commandHistory.length;

  const [command, ...args] = input.split(/\s+/);
  const normalizedCommand = command.toLowerCase();

  switch (normalizedCommand) {
    case 'help':
      help();
      break;
    case 'next':
    case 'n':
      nextSlide();
      break;
    case 'prev':
    case 'p':
      prevSlide();
      break;
    case 'goto':
    case 'g':
      gotoSlide(args.join(' '));
      break;
    case 'list':
      listSlides();
      break;
    case 'where':
      where();
      break;
    case 'clear':
      clearConsole();
      break;
    default:
      logLine(`Unknown command: ${command}. Type "help".`, 'err');
  }
}

function setSlideFromHash() {
  const hash = normalizeAlias(window.location.hash.replace('#', ''));
  if (!hash) {
    setSlide(0, false);
    return;
  }

  const index = slideLookup.get(hash);
  if (index === undefined) {
    setSlide(0, false);
    return;
  }

  setSlide(index, false);
}

consoleInputEl.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    executeCommand(consoleInputEl.value);
    consoleInputEl.value = '';
    return;
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault();
    if (historyIndex > 0) {
      historyIndex -= 1;
      consoleInputEl.value = commandHistory[historyIndex] || '';
    }
    return;
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    if (historyIndex < commandHistory.length - 1) {
      historyIndex += 1;
      consoleInputEl.value = commandHistory[historyIndex] || '';
    } else {
      historyIndex = commandHistory.length;
      consoleInputEl.value = '';
    }
  }
});

document.addEventListener('keydown', (event) => {
  const activeTag = document.activeElement?.tagName.toLowerCase();
  const isTyping = activeTag === 'input' || activeTag === 'textarea';

  if (isTyping && event.key !== 'Escape') {
    return;
  }

  if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') {
    event.preventDefault();
    nextSlide();
    return;
  }

  if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
    event.preventDefault();
    prevSlide();
    return;
  }

  if (event.key.toLowerCase() === 'c') {
    consoleInputEl.focus();
  }

  if (event.key === 'Escape') {
    consoleInputEl.blur();
  }
});

window.addEventListener('hashchange', setSlideFromHash);

buildSlideLookup();
buildSlideMenu();
setSlideFromHash();
startManifestoTicker();
