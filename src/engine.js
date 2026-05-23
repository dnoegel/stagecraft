'use strict';

/**
 * Stagecraft — Engine (Layer 0).
 *
 * The runtime: slide registry, navigation, step model, storyboard,
 * transitions, deck loader, edit-mode WebSocket hook.
 *
 * Loads via plain <script> in index.html. Exposes `Stage.*` globals.
 */

(function (root) {
  const Stage = root.Stage = root.Stage || {};

  // ---------------------------------------------------------------------------
  // Slide registry
  // ---------------------------------------------------------------------------
  Stage.slides = Stage.slides || [];

  // Stage.register(slide [, meta])
  //   slide — { section, title, render, init?, replay?, steps?, onStep?, transition? }
  //   meta  — optional: { notes, ... } merged onto the slide.
  //           This is the home for fields that belong to the *deck* rather than
  //           the *component* — most importantly `notes` (speaker notes shown
  //           in presenter view).
  Stage.register = function (slide, meta) {
    if (!slide || typeof slide.render !== 'function') {
      throw new Error('Stage.register: slide must have a render(el) function');
    }
    if (meta && typeof meta === 'object') Object.assign(slide, meta);
    Stage.slides.push(slide);
  };

  // ---------------------------------------------------------------------------
  // Transition registry
  // Built-in transitions live in src/transitions.js. Themes may override or
  // register new ones via Stage.registerTransition.
  // ---------------------------------------------------------------------------
  Stage.transitions = Stage.transitions || {};

  Stage.registerTransition = function (name, config) {
    Stage.transitions[name] = config;
  };

  function applyTransition(el, name, phase /* 'enter' | 'exit' */) {
    const t = Stage.transitions[name] || Stage.transitions.fade;
    if (!t) return;
    if (phase === 'enter') t.enter?.(el);
    else t.exit?.(el);
  }

  // ---------------------------------------------------------------------------
  // Deck loader — Stage.deck({ theme, slides: [{src, transition?}, ...] })
  // Sets the theme, fetches each slide script in order, starts the runtime.
  // ---------------------------------------------------------------------------
  Stage.deck = function (config) {
    Stage._config = config;
    if (config.theme) document.documentElement.setAttribute('data-theme', config.theme);
    // Slides list with transitions; engine reads .transition on enter.
    Stage._manifestSlides = config.slides || [];

    const sources = (config.slides || []).map(s => s.src);
    loadScripts(sources).then(() => {
      // After all slide scripts loaded, each has called Stage.register().
      // Pair manifest transitions with registered slides by order.
      Stage.slides.forEach((slide, i) => {
        const m = Stage._manifestSlides[i];
        if (m) slide.transition = m.transition || slide.transition || 'fade';
      });
      initRuntime();
    });
  };

  function loadScripts(srcs) {
    return srcs.reduce((p, src) => p.then(() => loadScript(src)), Promise.resolve());
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.async = false;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Failed to load ' + src));
      document.head.appendChild(s);
    });
  }

  // ---------------------------------------------------------------------------
  // Runtime — navigation, step model, storyboard, edit-mode hook
  // ---------------------------------------------------------------------------
  let stage, welcome, uiTitle, curSec, dotsEl, hint;
  let current = -1;
  let currentStep = 0;
  let activeCleanup = null;
  let hintTimer = null;
  let editMode = false;
  let ws = null;
  let presenterMode = false;            // this window is rendering the presenter view
  let bc = null;                        // BroadcastChannel for window sync
  let suppressBroadcast = false;        // re-entrancy guard for sync
  let presenterEls = null;              // { currentPane, nextPane, notesPane, timer, clock }
  let talkStartTime = null;             // for the elapsed timer

  function initRuntime() {
    if (Stage._inited) return;
    Stage._inited = true;

    // Are we the presenter window? Detected at init from ?mode=presenter.
    const params = new URLSearchParams(location.search);
    presenterMode = params.get('mode') === 'presenter';
    if (presenterMode) {
      document.body.classList.add('presenter-mode');
      buildPresenterChrome();
    } else {
      buildChrome();
    }

    bindKeyboard();
    bindMouse();
    bindHash();
    bindResize();
    tryConnectEditServer();
    setupBroadcastChannel();

    const initial = parseHash();
    if (initial !== null) {
      go(initial);
      showHint();
    }

    // If the storyboard was open before a reload (e.g. drag-drop triggered
    // a manifest write → reload), restore it. We wait briefly so the
    // current slide has rendered and the edit-mode WS has had a chance
    // to attach (so connectors + drag handles are wired up).
    try {
      if (sessionStorage.getItem('stagecraft:overview') === '1') {
        if (initial === null) go(0); // need a current slide so storyboard has context
        const restore = () => {
          if (overviewActive) return;
          openOverview();
        };
        // Two-stage: try fast (edit mode already on), then again after WS
        // has had time to upgrade.
        setTimeout(restore, 50);
        setTimeout(restore, 400);
      }
    } catch (e) {}
  }

  function buildChrome() {
    stage = document.getElementById('stage');
    if (!stage) {
      stage = document.createElement('main');
      stage.id = 'stage';
      document.body.appendChild(stage);
    }

    welcome = document.getElementById('welcome');
    uiTitle = document.getElementById('uiTitle');
    curSec = document.getElementById('curSec');
    dotsEl = document.getElementById('uiDots');
    hint = document.getElementById('uiHint');

    // build progress dots from unique section numbers
    if (dotsEl) {
      const sections = [...new Set(Stage.slides.map(s => s.section).filter(Boolean))].sort((a, b) => a - b);
      const totalEl = document.querySelector('.ui-counter .total');
      if (totalEl) totalEl.textContent = String(sections.length).padStart(2, '0');
      sections.forEach(sec => {
        const d = document.createElement('div');
        d.className = 'dot';
        d.dataset.sec = sec;
        dotsEl.appendChild(d);
      });
    }

    if (welcome) {
      welcome.addEventListener('click', () => start(), { once: true });
    }
  }

  function start() {
    if (current === -1) go(0);
    showHint();
  }

  // ---------------------------------------------------------------------------
  // Presenter view chrome
  // ---------------------------------------------------------------------------
  function buildPresenterChrome() {
    // Remove any normal-mode chrome the HTML happens to have inlined.
    document.querySelectorAll('.welcome, .ui').forEach(n => n.remove());
    const existingStage = document.getElementById('stage');
    if (existingStage) existingStage.remove();

    document.title = 'Stagecraft Presenter';
    document.body.innerHTML = `
      <div class="presenter-shell">
        <div class="presenter-top">
          <div class="presenter-pane presenter-current" id="presenterCurrent">
            <div class="presenter-pane-label">NOW · slide <span id="presenterCurrentIdx">00</span></div>
            <div class="presenter-pane-stage" id="presenterCurrentStage"></div>
          </div>
          <div class="presenter-pane presenter-next" id="presenterNext">
            <div class="presenter-pane-label">NEXT</div>
            <div class="presenter-pane-stage" id="presenterNextStage"></div>
          </div>
        </div>
        <div class="presenter-meta">
          <div class="presenter-timer" id="presenterTimer">00:00</div>
          <div class="presenter-clock" id="presenterClock">--:--</div>
          <button class="presenter-timer-reset" id="presenterTimerReset" title="Reset elapsed timer">↻ reset</button>
        </div>
        <div class="presenter-notes" id="presenterNotes">
          <div class="presenter-notes-label">SPEAKER NOTES</div>
          <div class="presenter-notes-body" id="presenterNotesBody"></div>
        </div>
      </div>
    `;

    presenterEls = {
      currentStage: document.getElementById('presenterCurrentStage'),
      currentIdx:   document.getElementById('presenterCurrentIdx'),
      nextStage:    document.getElementById('presenterNextStage'),
      notesBody:    document.getElementById('presenterNotesBody'),
      timer:        document.getElementById('presenterTimer'),
      clock:        document.getElementById('presenterClock')
    };

    // Engine's "stage" reference now points to the current-slide container.
    // The pane-stage is the inner scaler; we render slides into a wrapper
    // inside the pane that lets us position child .slide elements normally.
    stage = presenterEls.currentStage;
    stage.classList.add('presenter-stage');

    startTalkTimer();
    document.getElementById('presenterTimerReset')?.addEventListener('click', () => {
      talkStartTime = Date.now();
      updatePresenterMeta();
    });

    document.body.classList.add('armed');
  }

  function startTalkTimer() {
    talkStartTime = Date.now();
    updatePresenterMeta();
    setInterval(updatePresenterMeta, 1000);
  }

  function updatePresenterMeta() {
    if (!presenterEls) return;
    const elapsed = Date.now() - (talkStartTime || Date.now());
    const total = Math.floor(elapsed / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const pad = n => String(n).padStart(2, '0');
    presenterEls.timer.textContent = h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
    const now = new Date();
    presenterEls.clock.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }

  function renderPresenterNext(idx) {
    if (!presenterEls) return;
    presenterEls.nextStage.innerHTML = '';
    const nextIdx = idx + 1;
    if (nextIdx >= Stage.slides.length) {
      presenterEls.nextStage.innerHTML = '<div class="presenter-end">— end of deck —</div>';
      return;
    }
    const next = Stage.slides[nextIdx];
    const el = document.createElement('div');
    el.className = 'slide current';
    try { next.render(el); } catch (e) { console.warn('next render', e); }
    presenterEls.nextStage.appendChild(el);
  }

  function renderPresenterNotes(slide) {
    if (!presenterEls) return;
    const notes = (slide && slide.notes) || '';
    presenterEls.notesBody.textContent = notes || '(no notes for this slide)';
    presenterEls.notesBody.classList.toggle('empty', !notes);
  }

  // ---------------------------------------------------------------------------
  // BroadcastChannel — sync nav events across presenter + presentation windows
  // ---------------------------------------------------------------------------
  function setupBroadcastChannel() {
    if (typeof BroadcastChannel === 'undefined') return;
    bc = new BroadcastChannel('stagecraft:nav');
    bc.addEventListener('message', (e) => {
      const msg = e.data;
      if (!msg || typeof msg !== 'object') return;
      suppressBroadcast = true;
      try {
        switch (msg.type) {
          case 'go':       go(msg.idx); break;
          case 'step':     applyRemoteStep(msg.step); break;
          case 'replay':   replay(); break;
          case 'overview': msg.open ? openOverview() : closeOverview(); break;
        }
      } finally {
        suppressBroadcast = false;
      }
    });
  }

  function broadcast(msg) {
    if (!bc) return;
    if (suppressBroadcast) return;
    try { bc.postMessage(msg); } catch (e) { /* ignore */ }
  }

  function applyRemoteStep(step) {
    const slide = Stage.slides[current];
    if (!slide || !slide.steps) return;
    currentStep = Math.max(0, Math.min(slide.steps - 1, step));
    const el = stage.querySelector('.slide.current');
    if (el && slide.onStep) {
      try { slide.onStep(el, currentStep); } catch (e) { /* ignore */ }
    }
  }

  function openPresenterWindow() {
    const url = new URL(location.href);
    url.searchParams.set('mode', 'presenter');
    // Preserve hash so presenter opens on the current slide
    window.open(url.toString(), 'stagecraft-presenter',
      'width=1200,height=800,toolbar=no,menubar=no,location=no');
  }

  // ---------------------------------------------------------------------------
  // Slide navigation
  // ---------------------------------------------------------------------------
  function go(idx) {
    if (idx < 0 || idx >= Stage.slides.length) return;
    if (activeCleanup) { try { activeCleanup(); } catch (e) { console.warn(e); } activeCleanup = null; }

    const old = stage.querySelector('.slide.current');
    const oldSlide = Stage.slides[current];
    if (old && oldSlide) {
      old.classList.remove('current');
      old.classList.add('exiting');
      applyTransition(old, oldSlide.transition || 'fade', 'exit');
      setTimeout(() => old.remove(), 700);
    }

    const slide = Stage.slides[idx];
    const el = document.createElement('div');
    el.className = 'slide';
    el.dataset.idx = idx;
    el.dataset.transition = slide.transition || 'fade';
    try { slide.render(el); } catch (e) { console.error('render error', e); }
    stage.appendChild(el);

    // Assign data-stage-key after render for edit mode
    if (Stage.assignStageKeys) Stage.assignStageKeys(el);

    // Force reflow before adding .current so transitions run
    void el.offsetHeight;
    el.classList.add('current');
    applyTransition(el, slide.transition || 'fade', 'enter');

    current = idx;
    currentStep = 0;
    updateChrome(slide);
    syncHash(idx);

    // Presenter view extras
    if (presenterMode && presenterEls) {
      if (presenterEls.currentIdx) presenterEls.currentIdx.textContent = String(idx).padStart(2, '0');
      renderPresenterNext(idx);
      renderPresenterNotes(slide);
    }

    // Broadcast nav to the other window (if any), unless this go() was
    // itself triggered by a remote message.
    broadcast({ type: 'go', idx });

    setTimeout(() => {
      if (current !== idx) return;
      try {
        activeCleanup = slide.init ? slide.init(el) : null;
        if (slide.steps && slide.onStep) {
          try { slide.onStep(el, 0); } catch (e) { console.error('onStep error', e); }
        }
      } catch (e) { console.error('init error', e); }
    }, 80);

    if (welcome && !welcome.classList.contains('hidden')) {
      welcome.classList.add('hidden');
      document.body.classList.add('armed');
      setTimeout(() => welcome.remove(), 600);
    }
  }

  function updateChrome(slide) {
    if (uiTitle) uiTitle.textContent = slide.title || '';
    const sec = slide.section;
    if (curSec) curSec.textContent = String(sec).padStart(2, '0');
    if (dotsEl) {
      const dots = dotsEl.querySelectorAll('.dot');
      dots.forEach(d => {
        const s = Number(d.dataset.sec);
        d.classList.remove('active', 'past');
        if (s === sec) d.classList.add('active');
        else if (s < sec) d.classList.add('past');
      });
    }
  }

  function next() {
    const slide = Stage.slides[current];
    if (slide && slide.steps && currentStep < slide.steps - 1) {
      currentStep++;
      const el = stage.querySelector('.slide.current');
      if (el && slide.onStep) {
        try { slide.onStep(el, currentStep); } catch (e) { console.error('onStep error', e); }
      }
      broadcast({ type: 'step', step: currentStep });
      return;
    }
    if (current < Stage.slides.length - 1) go(current + 1);
  }

  function prev() {
    const slide = Stage.slides[current];
    if (slide && slide.steps && currentStep > 0) {
      currentStep--;
      const el = stage.querySelector('.slide.current');
      if (el && slide.onStep) {
        try { slide.onStep(el, currentStep); } catch (e) { console.error('onStep error', e); }
      }
      broadcast({ type: 'step', step: currentStep });
      return;
    }
    if (current > 0) go(current - 1);
  }

  function jumpToSection(secNum) {
    const idx = Stage.slides.findIndex(s => s.section === secNum);
    if (idx >= 0) go(idx);
  }

  function replay() {
    const el = stage.querySelector('.slide.current');
    const slide = Stage.slides[current];
    if (!el || !slide) return;
    if (activeCleanup) { try { activeCleanup(); } catch (e) {} activeCleanup = null; }
    const fn = slide.replay || slide.init;
    if (fn) {
      try {
        activeCleanup = fn(el) || null;
        currentStep = 0;
        if (slide.steps && slide.onStep) slide.onStep(el, 0);
      } catch (e) { console.error('replay error', e); }
    }
    broadcast({ type: 'replay' });
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  }

  // ---------------------------------------------------------------------------
  // Storyboard
  // ---------------------------------------------------------------------------
  let overviewActive = false;
  let overviewCleanups = [];

  function openOverview() {
    if (overviewActive) return;
    overviewActive = true;
    // Persist state across reloads (e.g. when a drag-drop triggers a manifest
    // reload, we want the storyboard to come back open).
    try { sessionStorage.setItem('stagecraft:overview', '1'); } catch (e) {}

    const ov = document.createElement('div');
    ov.id = 'overview';
    ov.className = 'overview';
    const sectionCount = new Set(Stage.slides.map(s => s.section).filter(Boolean)).size;

    ov.innerHTML = `
      <div class="overview-header">
        <div class="left"><strong>Storyboard</strong>&nbsp;&nbsp;·&nbsp;&nbsp;${Stage.slides.length} slides&nbsp;&nbsp;·&nbsp;&nbsp;${sectionCount} sections${editMode ? '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="accent">EDIT MODE</span>' : ''}</div>
        <div class="right"><span class="accent">click</span> to jump&nbsp;&nbsp;·&nbsp;&nbsp;<span class="accent">S</span> or <span class="accent">Esc</span> to close</div>
      </div>
      <div class="overview-grid" id="overviewGrid"></div>
    `;
    const grid = ov.querySelector('#overviewGrid');

    Stage.slides.forEach((slide, i) => {
      const tile = document.createElement('div');
      tile.className = 'tile';
      if (i === current) tile.classList.add('current');
      tile.dataset.idx = i;
      if (editMode) tile.setAttribute('draggable', 'true');

      const scaler = document.createElement('div');
      scaler.className = 'tile-scaler';
      const slideEl = document.createElement('div');
      slideEl.className = 'slide current';
      try { slide.render(slideEl); } catch (e) { console.warn('tile render', e); }
      scaler.appendChild(slideEl);
      tile.appendChild(scaler);

      const num = document.createElement('div');
      num.className = 'tile-num';
      num.textContent = String(i).padStart(2, '0');
      tile.appendChild(num);

      const label = document.createElement('div');
      label.className = 'tile-label';
      label.textContent = slide.title || '';
      tile.appendChild(label);

      // Edit-mode affordances per tile
      if (editMode && Stage._editUI) {
        Stage._editUI.decorateTile?.(tile, slide, i);
      }

      tile.addEventListener('click', (e) => {
        if (e.target.closest('.tile-edit-ui')) return; // ignore clicks on edit UI
        // Suppress the synthetic click that fires after a drag-drop sequence.
        if (Stage._editUI?.justFinishedDrag?.()) return;
        closeOverview();
        go(i);
      });

      grid.appendChild(tile);

      // run slide init for storyboard preview
      if (slide.init) {
        setTimeout(() => {
          if (!overviewActive) return;
          try {
            const cleanup = slide.init(slideEl);
            if (cleanup) overviewCleanups.push(cleanup);
          } catch (e) { console.warn('tile init', e); }
        }, 80);
      }
    });

    document.body.appendChild(ov);

    scaleTiles();
    // Edit-mode decorations (connectors, transition icons) need geometry, so
    // they run AFTER scaleTiles. Re-run on every resize.
    if (editMode && Stage._editUI) Stage._editUI.afterOverviewBuilt?.(ov);

    requestAnimationFrame(() => ov.classList.add('in'));
    requestAnimationFrame(() => {
      const cur = ov.querySelector('.tile.current');
      if (cur) cur.scrollIntoView({ block: 'center', behavior: 'instant' });
    });
  }

  function scaleTiles() {
    const ov = document.getElementById('overview');
    if (!ov) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const aspect = vh / vw;
    ov.querySelectorAll('.tile').forEach(tile => {
      const tw = tile.clientWidth;
      const th = tw * aspect;
      tile.style.height = th + 'px';
      const scaler = tile.querySelector('.tile-scaler');
      if (scaler) {
        scaler.style.width = vw + 'px';
        scaler.style.height = vh + 'px';
        scaler.style.transform = `scale(${tw / vw})`;
      }
    });
  }

  function closeOverview() {
    if (!overviewActive) return;
    overviewActive = false;
    try { sessionStorage.removeItem('stagecraft:overview'); } catch (e) {}
    overviewCleanups.forEach(c => { try { c(); } catch (e) {} });
    overviewCleanups = [];
    const ov = document.getElementById('overview');
    if (ov) {
      ov.classList.remove('in');
      setTimeout(() => ov.remove(), 280);
    }
  }

  function toggleOverview() {
    if (overviewActive) closeOverview();
    else openOverview();
  }

  // ---------------------------------------------------------------------------
  // Keyboard / mouse / touch
  // ---------------------------------------------------------------------------
  function bindKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      // Don't capture keys while user is editing text in edit mode
      if (e.target && e.target.isContentEditable) return;
      if (e.target && (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT')) return;

      if (overviewActive) {
        if (e.key === 's' || e.key === 'S' || e.key === 'Escape') {
          e.preventDefault();
          closeOverview();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
        case ' ':
        case 'Enter':
          e.preventDefault(); next(); break;
        case 'ArrowLeft':
        case 'PageUp':
        case 'Backspace':
          e.preventDefault(); prev(); break;
        case 'f': case 'F':
          e.preventDefault(); toggleFullscreen(); break;
        case 'r': case 'R':
          e.preventDefault(); replay(); break;
        case 's': case 'S':
          e.preventDefault(); toggleOverview(); break;
        case 'p': case 'P':
          if (presenterMode) break;
          e.preventDefault(); openPresenterWindow(); break;
        case '?': case 'h': case 'H':
          showHint(); break;
        default:
          if (/^[1-9]$/.test(e.key)) {
            e.preventDefault();
            jumpToSection(parseInt(e.key, 10));
          }
      }
    });
  }

  function bindMouse() {
    let touchStartX = null;
    window.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    window.addEventListener('touchend', (e) => {
      if (touchStartX == null) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      // Swipe always navigates. Tap only navigates outside edit mode.
      if (Math.abs(dx) > 50) {
        if (dx < 0) next(); else prev();
      } else if (!editMode) {
        next();
      }
      touchStartX = null;
    });

    window.addEventListener('click', (e) => {
      if (overviewActive) return;
      if (e.target.closest('#overview')) return;
      if (e.target.closest('.qr-frame')) return;
      // In edit mode, the slide surface is for editing — never advance
      // on a free-space click. Navigation happens via keyboard (←/→/Space),
      // swipe, or the storyboard. This is essential so single-click of a
      // potential double-click target doesn't skip the slide.
      if (editMode) return;
      if (current === -1) { go(0); return; }
      const w = window.innerWidth;
      if (e.clientX < w / 3) prev(); else next();
    });
  }

  function bindHash() {
    window.addEventListener('hashchange', () => {
      const idx = parseHash();
      if (idx !== null && idx !== current) go(idx);
    });
  }

  function bindResize() {
    window.addEventListener('resize', () => {
      if (!overviewActive) return;
      scaleTiles();
      const ov = document.getElementById('overview');
      if (editMode && Stage._editUI && ov) Stage._editUI.afterOverviewBuilt?.(ov);
    });
  }

  function parseHash() {
    const m = location.hash.match(/^#(\d+)$/);
    if (!m) return null;
    const n = parseInt(m[1], 10);
    return (n >= 0 && n < Stage.slides.length) ? n : null;
  }

  function syncHash(idx) {
    const target = '#' + idx;
    if (location.hash !== target) {
      try { history.replaceState(null, '', target); }
      catch (e) { location.hash = target; }
    }
  }

  function showHint() {
    if (!hint) return;
    hint.classList.add('visible');
    clearTimeout(hintTimer);
    hintTimer = setTimeout(() => hint.classList.remove('visible'), 2500);
  }

  // ---------------------------------------------------------------------------
  // Edit-mode WebSocket hook
  // ---------------------------------------------------------------------------
  function tryConnectEditServer() {
    try {
      ws = new WebSocket(`ws://${location.hostname || 'localhost'}:${location.port || 3000}/stagecraft`);
      ws.addEventListener('open', () => {
        editMode = true;
        document.body.classList.add('edit-mode');
        console.log('[stagecraft] edit mode ON — connected to dev server');
        if (Stage._editUI) Stage._editUI.activate(ws);
      });
      ws.addEventListener('message', handleServerMessage);
      ws.addEventListener('error', () => { /* silent */ });
      ws.addEventListener('close', () => {
        if (editMode) {
          editMode = false;
          document.body.classList.remove('edit-mode');
          console.log('[stagecraft] edit mode OFF — server disconnected');
        }
      });
    } catch (e) {
      // No server — silent
    }
  }

  function handleServerMessage(ev) {
    let msg;
    try { msg = JSON.parse(ev.data); } catch (e) { return; }
    if (msg.type === 'reload') {
      handleReload(msg);
    } else if (msg.type === 'reload-all') {
      location.reload();
    }
  }

  function handleReload(msg) {
    const target = msg.target;
    if (target === 'theme-css') {
      // Reload stylesheets in place
      document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        const u = new URL(link.href);
        u.searchParams.set('_r', Date.now());
        link.href = u.toString();
      });
      return;
    }
    if (target === 'manifest' || target === 'slide' || target === 'theme-js') {
      // Reload the whole page; preserve current slide via hash.
      location.reload();
    }
  }

  // ---------------------------------------------------------------------------
  // Expose internal API for edit-mode UI module
  // ---------------------------------------------------------------------------
  Stage._engine = {
    go, next, prev, replay, toggleOverview, openOverview, closeOverview,
    currentIndex: () => current,
    currentStep: () => currentStep,
    isEditMode: () => editMode,
    getWs: () => ws,
    getStageEl: () => stage,
  };

})(typeof window !== 'undefined' ? window : globalThis);
