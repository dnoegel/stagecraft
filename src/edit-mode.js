'use strict';

/**
 * Stagecraft — Edit Mode UI (browser-side).
 *
 * Loaded after engine.js. When the engine connects to the dev server,
 * it calls Stage._editUI.activate(ws). This module then attaches all
 * the affordances:
 *
 *   - Level 1: slide-level note via Storyboard tile or 'N' key in present mode
 *   - Level 2: element pin notes via click on hovered element
 *   - Level 3: inline text edit via single click on [data-stage-edit] elements
 *   - Drag-to-reorder in Storyboard
 *   - Transition picker between Storyboard tiles
 */

(function (root) {
  const Stage = root.Stage = root.Stage || {};

  const EditUI = {
    ws: null,
    active: false,

    activate(ws) {
      this.ws = ws;
      this.active = true;
      injectStyles();
      bindPresentMode();
    },

    // Called by engine after a storyboard tile is built
    decorateTile(tile, slide, idx) {
      // Reorder drag handle
      attachDragHandles(tile, idx);

      // Slide-level note icon (top-right)
      const noteBtn = document.createElement('button');
      noteBtn.className = 'tile-edit-ui tile-note-btn';
      noteBtn.textContent = '💬';
      noteBtn.title = 'Add slide-level note';
      noteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openSlideNoteDialog(idx, slide);
      });
      tile.appendChild(noteBtn);
    },

    // Called after storyboard is fully built — add inter-tile transition controls
    afterOverviewBuilt(ov) {
      attachTransitionConnectors(ov);
      attachDropZones(ov);
    }
  };

  Stage._editUI = EditUI;

  // ---------------------------------------------------------------------------
  // Present-mode bindings: element hover, click-to-edit, shift-click-to-pin
  // ---------------------------------------------------------------------------
  function bindPresentMode() {
    let hoverEl = null;
    let outline = null;

    window.addEventListener('mousemove', (e) => {
      if (!EditUI.active) return;
      if (Stage._engine.isEditMode() === false) return;
      if (document.getElementById('overview')) return; // skip in storyboard
      const el = e.target;
      if (!el || el === outline) return;
      // Only target elements inside the current slide
      const slideEl = el.closest('.slide.current');
      if (!slideEl) {
        if (hoverEl) clearHover();
        return;
      }
      // Don't outline the slide itself
      if (el === slideEl) {
        if (hoverEl) clearHover();
        return;
      }
      // Don't outline elements in edit-affordance overlays
      if (el.closest('.edit-affordance, .note-overlay')) return;

      if (hoverEl !== el) {
        hoverEl = el;
        showHover(el);
      }
    });

    window.addEventListener('click', (e) => {
      if (!EditUI.active) return;
      if (Stage._engine.isEditMode() === false) return;
      if (document.getElementById('overview')) return;
      const el = e.target;
      const slideEl = el.closest('.slide.current');
      if (!slideEl) return;
      if (el === slideEl) return;
      if (el.closest('.edit-affordance, .note-overlay')) return;
      // Already editing this element? Leave it alone (cursor placement).
      if (el.contentEditable === 'true') return;

      // Shift+click → pin note
      if (e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        const stageKey = el.dataset.stageKey || el.closest('[data-stage-key]')?.dataset.stageKey;
        if (!stageKey) {
          toast('No stage-key on this element', 'warn');
          return;
        }
        openElementNoteDialog(el, stageKey);
        return;
      }

      // Plain click on an editable element → inline edit immediately
      if (el.dataset?.stageEdit) {
        e.preventDefault();
        e.stopPropagation();
        makeEditable(el);
      }
    }, true);

    // Keyboard: 'N' opens slide-level note for current slide
    window.addEventListener('keydown', (e) => {
      if (!EditUI.active) return;
      if (Stage._engine.isEditMode() === false) return;
      if (e.target.isContentEditable) return;
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
      if (e.key === 'n' || e.key === 'N') {
        if (document.getElementById('overview')) return;
        const idx = Stage._engine.currentIndex();
        const slide = Stage.slides[idx];
        if (slide) openSlideNoteDialog(idx, slide);
      }
    });

    function showHover(el) {
      clearHover();
      const r = el.getBoundingClientRect();
      outline = document.createElement('div');
      outline.className = 'edit-affordance hover-outline';
      Object.assign(outline.style, {
        left: r.left + 'px',
        top: r.top + 'px',
        width: r.width + 'px',
        height: r.height + 'px'
      });
      document.body.appendChild(outline);
      hoverEl = el;
    }
    function clearHover() {
      if (outline) outline.remove();
      outline = null;
      hoverEl = null;
    }
  }

  // ---------------------------------------------------------------------------
  // Level 3: inline edit
  // ---------------------------------------------------------------------------
  function makeEditable(el) {
    if (el.contentEditable === 'true') return; // already editing
    const original = el.textContent;
    el.contentEditable = 'true';
    el.classList.add('inline-editing');
    el.focus();
    // Select all
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    function commit() {
      el.removeEventListener('blur', commit);
      el.removeEventListener('keydown', onKey);
      el.contentEditable = 'false';
      el.classList.remove('inline-editing');
      const newVal = el.textContent;
      if (newVal === original) return;
      const propPath = el.dataset.stageEdit;
      const file = currentSlideFile();
      if (!file) {
        el.textContent = original;
        toast('Cannot determine slide file', 'error');
        return;
      }
      apiPost('/api/edit/inline', { file, propPath, value: newVal })
        .then(r => {
          if (!r.ok) {
            el.textContent = original;
            toast('Edit rejected: ' + r.error, 'error');
          } else {
            toast('saved', 'ok');
          }
        })
        .catch(e => {
          el.textContent = original;
          toast('Edit failed: ' + e.message, 'error');
        });
    }

    function onKey(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        el.textContent = original;
        commit();
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        el.blur();
      }
    }

    el.addEventListener('blur', commit);
    el.addEventListener('keydown', onKey);
  }

  // ---------------------------------------------------------------------------
  // Note dialogs
  // ---------------------------------------------------------------------------
  function openSlideNoteDialog(idx, slide) {
    const file = slideFileForIdx(idx);
    openNoteOverlay({
      title: `Note on slide ${idx} — ${slide.title || ''}`,
      onSubmit: (text) => {
        return apiPost('/api/note/slide', { file, text });
      }
    });
  }

  function openElementNoteDialog(el, stageKey) {
    const file = currentSlideFile();
    if (!file) {
      toast('Cannot determine slide file', 'error');
      return;
    }
    const r = el.getBoundingClientRect();
    openNoteOverlay({
      title: `Pin note on ${stageKey}`,
      anchor: { left: r.left + r.width + 12, top: r.top },
      onSubmit: (text) => apiPost('/api/note/element', { file, stageKey, text })
    });
  }

  function openNoteOverlay({ title, anchor, onSubmit }) {
    // Close any existing
    document.querySelectorAll('.note-overlay').forEach(n => n.remove());
    const ov = document.createElement('div');
    ov.className = 'note-overlay edit-affordance';
    ov.innerHTML = `
      <div class="note-title">${title}</div>
      <textarea class="note-text" placeholder="Note for the agent..."></textarea>
      <div class="note-actions">
        <button class="note-cancel">Cancel</button>
        <button class="note-save">Save (⌘↵)</button>
      </div>
    `;
    if (anchor) {
      ov.style.position = 'fixed';
      ov.style.left = Math.min(anchor.left, window.innerWidth - 380) + 'px';
      ov.style.top = Math.min(anchor.top, window.innerHeight - 200) + 'px';
    }
    document.body.appendChild(ov);
    const ta = ov.querySelector('textarea');
    ta.focus();

    function close() { ov.remove(); }
    function save() {
      const text = ta.value.trim();
      if (!text) { close(); return; }
      onSubmit(text).then(r => {
        if (r.ok) toast('note saved', 'ok');
        else toast('save failed: ' + r.error, 'error');
        close();
      }).catch(e => { toast('save failed: ' + e.message, 'error'); close(); });
    }
    ov.querySelector('.note-cancel').addEventListener('click', close);
    ov.querySelector('.note-save').addEventListener('click', save);
    ta.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); save(); }
      else if (e.key === 'Escape') { close(); }
    });
  }

  // ---------------------------------------------------------------------------
  // Drag-to-reorder in Storyboard
  // ---------------------------------------------------------------------------
  function attachDragHandles(tile, idx) {
    tile.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/x-stagecraft-idx', String(idx));
      tile.classList.add('dragging');
    });
    tile.addEventListener('dragend', () => tile.classList.remove('dragging'));
  }

  function attachDropZones(ov) {
    const tiles = ov.querySelectorAll('.tile');
    tiles.forEach((tile, idx) => {
      tile.addEventListener('dragover', (e) => {
        e.preventDefault();
        tile.classList.add('drop-target');
      });
      tile.addEventListener('dragleave', () => tile.classList.remove('drop-target'));
      tile.addEventListener('drop', (e) => {
        e.preventDefault();
        tile.classList.remove('drop-target');
        const from = parseInt(e.dataTransfer.getData('text/x-stagecraft-idx'), 10);
        if (Number.isNaN(from) || from === idx) return;
        const newOrder = [];
        const total = Stage.slides.length;
        const orig = Array.from({ length: total }, (_, i) => i);
        const moved = orig.splice(from, 1)[0];
        orig.splice(idx, 0, moved);
        apiPost('/api/manifest/reorder', { newOrder: orig })
          .then(r => { if (r.ok) toast('Reordered — reloading', 'ok'); });
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Transition picker between storyboard tiles
  // ---------------------------------------------------------------------------
  const TRANSITION_ICONS = {
    cut: '━', fade: '◇', slide: '▶', dissolve: '◌', glitch: '⚡', wipe: '╱'
  };

  function attachTransitionConnectors(ov) {
    const grid = ov.querySelector('.overview-grid');
    if (!grid) return;
    const tiles = ov.querySelectorAll('.tile');
    tiles.forEach((tile, i) => {
      if (i === 0) return;
      const slide = Stage.slides[i];
      const trans = slide?.transition || 'fade';
      const conn = document.createElement('div');
      conn.className = 'transition-connector tile-edit-ui';
      conn.title = `Transition: ${trans}`;
      conn.innerHTML = `<span class="tx-icon">${TRANSITION_ICONS[trans] || '◇'}</span><span class="tx-name">${trans}</span>`;
      conn.addEventListener('click', (e) => {
        e.stopPropagation();
        openTransitionPicker(i, slide);
      });
      tile.appendChild(conn);
    });
  }

  function openTransitionPicker(idx, slide) {
    document.querySelectorAll('.transition-picker').forEach(n => n.remove());
    const pick = document.createElement('div');
    pick.className = 'transition-picker edit-affordance';
    pick.innerHTML = `
      <div class="tp-title">How does slide ${idx} enter?</div>
      <div class="tp-grid">
        ${Object.keys(TRANSITION_ICONS).map(n => `
          <div class="tp-option" data-tx="${n}">
            <div class="tp-preview"><div class="tp-preview-slide tx-${n}-preview"></div></div>
            <div class="tp-icon">${TRANSITION_ICONS[n]}</div>
            <div class="tp-name">${n}</div>
          </div>
        `).join('')}
      </div>
      <button class="tp-close">Cancel</button>
    `;
    document.body.appendChild(pick);
    pick.querySelectorAll('.tp-option').forEach(opt => {
      opt.addEventListener('click', () => {
        const tx = opt.dataset.tx;
        apiPost('/api/manifest/transition', { idx, transition: tx })
          .then(r => {
            if (r.ok) {
              toast(`Transition → ${tx}`, 'ok');
              pick.remove();
            } else {
              toast('Failed: ' + r.error, 'error');
            }
          });
      });
    });
    pick.querySelector('.tp-close').addEventListener('click', () => pick.remove());
    // Trigger looping previews
    pick.querySelectorAll('.tp-preview-slide').forEach(el => {
      const cls = Array.from(el.classList).find(c => c.startsWith('tx-'));
      const txName = cls?.replace('tx-', '').replace('-preview', '');
      if (txName) startLoopingPreview(el, txName);
    });
  }

  function startLoopingPreview(el, name) {
    const inner = document.createElement('div');
    inner.className = 'tp-preview-content';
    inner.textContent = name;
    el.appendChild(inner);
    function loop() {
      inner.classList.remove(`tx-${name}-enter`);
      void inner.offsetWidth;
      inner.classList.add(`tx-${name}-enter`);
    }
    loop();
    const id = setInterval(loop, 1500);
    el._previewLoop = id;
  }

  // ---------------------------------------------------------------------------
  // API + helpers
  // ---------------------------------------------------------------------------
  function apiPost(path, data) {
    return fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json());
  }

  function slideFileForIdx(idx) {
    const m = Stage._manifestSlides?.[idx];
    return m?.src || null;
  }

  function currentSlideFile() {
    return slideFileForIdx(Stage._engine.currentIndex());
  }

  function toast(msg, kind = 'ok') {
    const t = document.createElement('div');
    t.className = `edit-toast edit-toast-${kind}`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('in'), 10);
    setTimeout(() => { t.classList.remove('in'); setTimeout(() => t.remove(), 300); }, 1800);
  }

  function injectStyles() {
    if (document.getElementById('stagecraft-edit-styles')) return;
    const s = document.createElement('style');
    s.id = 'stagecraft-edit-styles';
    s.textContent = `
      body.edit-mode { cursor: default; }

      .edit-affordance { font-family: var(--mono, monospace); font-size: 0.85rem; }

      .hover-outline {
        position: fixed;
        border: 1px dashed var(--accent, #00FF9C);
        background: rgba(0, 255, 156, 0.05);
        pointer-events: none;
        z-index: 9000;
        transition: all 80ms ease-out;
      }

      .inline-editing {
        outline: 2px solid var(--accent, #00FF9C);
        outline-offset: 2px;
        background: rgba(0, 255, 156, 0.06);
        cursor: text;
      }
      [data-stage-edit]:hover {
        text-decoration: underline dotted var(--accent, #00FF9C);
        text-underline-offset: 4px;
        cursor: text;
      }

      .note-overlay {
        position: fixed;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        width: 380px;
        background: var(--bg-elevated, #121212);
        border: 1px solid var(--accent, #00FF9C);
        box-shadow: 0 20px 60px rgba(0,0,0,0.6);
        padding: 1rem;
        z-index: 9100;
      }
      .note-overlay .note-title {
        color: var(--dim, #666);
        font-size: 0.72rem;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        margin-bottom: 0.7rem;
      }
      .note-overlay textarea {
        width: 100%;
        min-height: 100px;
        background: var(--bg, #0a0a0a);
        color: var(--fg, #e6e6e6);
        border: 1px solid var(--dim-2, #2a2a2a);
        padding: 0.6rem;
        font-family: inherit;
        font-size: 0.95rem;
        resize: vertical;
      }
      .note-overlay .note-actions {
        margin-top: 0.7rem;
        display: flex;
        gap: 0.5rem;
        justify-content: flex-end;
      }
      .note-overlay button {
        background: transparent;
        color: var(--fg, #e6e6e6);
        border: 1px solid var(--dim-2, #2a2a2a);
        padding: 0.4rem 0.9rem;
        font-family: inherit;
        font-size: 0.8rem;
        cursor: pointer;
        letter-spacing: 0.08em;
      }
      .note-overlay button.note-save {
        border-color: var(--accent, #00FF9C);
        color: var(--accent, #00FF9C);
      }

      .tile-note-btn {
        position: absolute;
        top: 0.5rem; right: 0.5rem;
        z-index: 6;
        background: rgba(10, 10, 10, 0.7);
        border: 1px solid var(--dim-2, #2a2a2a);
        color: var(--fg, #e6e6e6);
        width: 28px; height: 28px;
        padding: 0;
        cursor: pointer;
        font-size: 0.85rem;
      }
      .tile-note-btn:hover { border-color: var(--accent, #00FF9C); }

      .transition-connector {
        position: absolute;
        bottom: 0.4rem; left: 50%;
        transform: translateX(-50%);
        background: rgba(10, 10, 10, 0.85);
        border: 1px solid var(--dim-2, #2a2a2a);
        padding: 0.2rem 0.6rem;
        font-size: 0.65rem;
        letter-spacing: 0.15em;
        color: var(--dim, #666);
        cursor: pointer;
        display: flex;
        gap: 0.4rem;
        align-items: center;
        z-index: 6;
      }
      .transition-connector:hover {
        color: var(--accent, #00FF9C);
        border-color: var(--accent, #00FF9C);
      }
      .transition-connector .tx-icon { font-size: 0.85rem; }

      .transition-picker {
        position: fixed;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        background: var(--bg-elevated, #121212);
        border: 1px solid var(--accent, #00FF9C);
        padding: 1.4rem;
        z-index: 9200;
        min-width: 600px;
      }
      .transition-picker .tp-title {
        color: var(--fg, #e6e6e6);
        font-size: 0.85rem;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        margin-bottom: 1rem;
      }
      .transition-picker .tp-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.8rem;
      }
      .transition-picker .tp-option {
        border: 1px solid var(--dim-2, #2a2a2a);
        padding: 0.6rem;
        cursor: pointer;
        text-align: center;
      }
      .transition-picker .tp-option:hover {
        border-color: var(--accent, #00FF9C);
      }
      .transition-picker .tp-preview {
        height: 80px;
        background: var(--bg, #0a0a0a);
        margin-bottom: 0.4rem;
        position: relative;
        overflow: hidden;
      }
      .transition-picker .tp-preview-content {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
        color: var(--accent, #00FF9C);
        background: var(--bg-elevated, #121212);
      }
      .transition-picker .tp-icon { font-size: 1.2rem; color: var(--accent, #00FF9C); }
      .transition-picker .tp-name {
        font-size: 0.7rem;
        letter-spacing: 0.15em;
        color: var(--dim, #666);
        margin-top: 0.2rem;
      }
      .transition-picker .tp-close {
        margin-top: 1rem;
        background: transparent;
        border: 1px solid var(--dim-2, #2a2a2a);
        color: var(--dim, #666);
        padding: 0.4rem 0.9rem;
        cursor: pointer;
        font-family: inherit;
      }

      .tile.dragging { opacity: 0.4; }
      .tile.drop-target { border-color: var(--accent, #00FF9C) !important; box-shadow: 0 0 0 2px var(--accent, #00FF9C); }

      .edit-toast {
        position: fixed;
        top: 2rem;
        right: 2rem;
        background: var(--bg-elevated, #121212);
        color: var(--fg, #e6e6e6);
        border: 1px solid var(--dim-2, #2a2a2a);
        padding: 0.7rem 1.2rem;
        font-family: var(--mono, monospace);
        font-size: 0.78rem;
        letter-spacing: 0.1em;
        z-index: 9999;
        opacity: 0;
        transform: translateY(-10px);
        transition: all 250ms ease-out;
      }
      .edit-toast.in { opacity: 1; transform: translateY(0); }
      .edit-toast-ok { border-color: var(--accent, #00FF9C); }
      .edit-toast-warn { border-color: var(--amber, #FFB454); }
      .edit-toast-error { border-color: var(--red, #FF5C5C); color: var(--red, #FF5C5C); }
    `;
    document.head.appendChild(s);
  }

})(typeof window !== 'undefined' ? window : globalThis);
