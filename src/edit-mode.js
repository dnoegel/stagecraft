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

  let dragJustEndedAt = 0;

  const EditUI = {
    ws: null,
    active: false,

    activate(ws) {
      this.ws = ws;
      this.active = true;
      injectStyles();
      bindPresentMode();
    },

    // Engine consults this before treating a tile click as a "jump-to-slide"
    // intent. After a drag-drop, the browser synthesises a click — we want
    // to swallow that so the overview doesn't close.
    justFinishedDrag() {
      return Date.now() - dragJustEndedAt < 300;
    },

    markDragEnded() { dragJustEndedAt = Date.now(); },

    // Called by engine after a storyboard tile is built
    decorateTile(tile, slide, idx) {
      attachDragHandles(tile, idx);

      // Action cluster (top-right) — note · speaker notes · delete
      const cluster = document.createElement('div');
      cluster.className = 'tile-edit-ui tile-actions';

      const noteBtn = document.createElement('button');
      noteBtn.className = 'tile-action';
      noteBtn.textContent = '💬';
      noteBtn.title = 'Feedback note for the agent';
      noteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openSlideNoteDialog(idx, slide);
      });
      cluster.appendChild(noteBtn);

      const speakerBtn = document.createElement('button');
      speakerBtn.className = 'tile-action';
      speakerBtn.textContent = '🎙';
      speakerBtn.title = 'Speaker notes (shown in presenter view)';
      speakerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openSpeakerNotesDialog(idx, slide);
      });
      cluster.appendChild(speakerBtn);

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'tile-action tile-action-danger';
      deleteBtn.textContent = '×';
      deleteBtn.title = 'Delete this slide';
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        confirmDeleteSlide(idx, slide);
      });
      cluster.appendChild(deleteBtn);

      tile.appendChild(cluster);
    },

    // Called after storyboard is fully built AND scaleTiles ran — add the
    // inter-tile transition connectors + storyboard header toolbar.
    afterOverviewBuilt(ov) {
      attachDropZones(ov);
      attachTransitionConnectors(ov);
      attachStoryboardToolbar(ov);
      attachAddSlideTile(ov);
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
      e.dataTransfer.effectAllowed = 'move';
      tile.classList.add('dragging');
    });
    tile.addEventListener('dragend', () => {
      tile.classList.remove('dragging');
      EditUI.markDragEnded();
    });
  }

  // ---------------------------------------------------------------------------
  // Storyboard toolbar — theme picker, process-notes, add-slide
  // ---------------------------------------------------------------------------
  const THEMES = ['phosphor', 'paper', 'neon', 'brand'];

  function attachStoryboardToolbar(ov) {
    if (ov.querySelector('.sb-toolbar')) return;
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'phosphor';
    const toolbar = document.createElement('div');
    toolbar.className = 'sb-toolbar tile-edit-ui';
    toolbar.innerHTML = `
      <div class="sb-toolbar-group">
        <label class="sb-toolbar-label">Theme</label>
        <div class="sb-theme-picker">
          ${THEMES.map(t => `<button class="sb-theme-btn${t === currentTheme ? ' is-current' : ''}" data-theme="${t}">${t}</button>`).join('')}
        </div>
      </div>
      <div class="sb-toolbar-spacer"></div>
      <button class="sb-toolbar-btn" id="sbProcessNotes" title="Copy a ready-made agent prompt for processing notes">
        <span class="sb-toolbar-icon">📋</span> Process notes
      </button>
    `;
    ov.appendChild(toolbar);

    toolbar.querySelectorAll('.sb-theme-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const theme = btn.dataset.theme;
        switchTheme(theme);
      });
    });
    toolbar.querySelector('#sbProcessNotes').addEventListener('click', (e) => {
      e.stopPropagation();
      copyProcessNotesPrompt();
    });
  }

  function switchTheme(theme) {
    // Update DOM immediately for instant feedback.
    document.documentElement.setAttribute('data-theme', theme);
    // Persist via server. The full reload also re-fetches the manifest with the new theme.
    apiPost('/api/manifest/theme', { theme }).then(r => {
      if (r.ok) toast(`Theme → ${theme}`, 'ok');
      else toast('Theme switch failed: ' + r.error, 'error');
    });
    // Update active button
    document.querySelectorAll('.sb-theme-btn').forEach(b =>
      b.classList.toggle('is-current', b.dataset.theme === theme)
    );
  }

  function copyProcessNotesPrompt() {
    const prompt = `Process all notes in this Stagecraft deck.

1. Run: \`grep -rn '@note' slides/\`
2. For each match:
   - Read the note + the surrounding slide code.
   - Apply the requested change to the slide.
   - DELETE the @note: line(s) from the source file.
3. Absence of @note: comments means everything has been addressed.

The user has been working in the browser-based edit mode and left these notes for you. Inline text edits and reorderings have already been applied to disk via the dev server — no action needed for those.`;
    navigator.clipboard.writeText(prompt).then(
      () => toast('Prompt copied to clipboard', 'ok'),
      () => toast('Clipboard access denied', 'error')
    );
  }

  // ---------------------------------------------------------------------------
  // Add-slide tile — appears as the last tile in the storyboard grid
  // ---------------------------------------------------------------------------
  function attachAddSlideTile(ov) {
    const grid = ov.querySelector('.overview-grid');
    if (!grid) return;
    if (grid.querySelector('.tile-add')) return;
    const tile = document.createElement('div');
    tile.className = 'tile tile-add tile-edit-ui';
    tile.innerHTML = `<div class="tile-add-glyph">+</div><div class="tile-add-label">add slide</div>`;
    tile.addEventListener('click', (e) => {
      e.stopPropagation();
      openAddSlideDialog();
    });
    grid.appendChild(tile);

    // Match dimensions of the other tiles
    const sibling = grid.querySelector('.tile:not(.tile-add)');
    if (sibling) {
      tile.style.height = sibling.offsetHeight + 'px';
    }
  }

  function openAddSlideDialog() {
    document.querySelectorAll('.add-slide-dialog').forEach(n => n.remove());
    const dlg = document.createElement('div');
    dlg.className = 'add-slide-dialog edit-affordance';
    dlg.innerHTML = `
      <div class="asd-title">Add a new slide</div>
      <label class="asd-row">
        <span class="asd-label">File path</span>
        <input class="asd-input" id="asdFile" value="slides/new-slide.js" />
      </label>
      <label class="asd-row">
        <span class="asd-label">Template</span>
        <select class="asd-input" id="asdTemplate">
          <option value="kinetic-text">KineticText (default)</option>
          <option value="section-card">SectionCard</option>
          <option value="blank">Blank custom</option>
        </select>
      </label>
      <label class="asd-row">
        <span class="asd-label">Transition</span>
        <select class="asd-input" id="asdTransition">
          <option value="">(default: fade)</option>
          ${Object.keys(TRANSITION_ICONS).map(t => `<option value="${t}">${t}</option>`).join('')}
        </select>
      </label>
      <div class="asd-actions">
        <button class="asd-cancel">Cancel</button>
        <button class="asd-create">Create slide</button>
      </div>
    `;
    document.body.appendChild(dlg);

    const fileInput = dlg.querySelector('#asdFile');
    const templateInput = dlg.querySelector('#asdTemplate');
    const transitionInput = dlg.querySelector('#asdTransition');
    fileInput.focus();
    fileInput.select();

    function close() { dlg.remove(); }
    dlg.querySelector('.asd-cancel').addEventListener('click', close);
    dlg.querySelector('.asd-create').addEventListener('click', () => {
      const file = fileInput.value.trim();
      if (!file) { toast('File path required', 'warn'); return; }
      apiPost('/api/manifest/add-slide', {
        file, template: templateInput.value,
        transition: transitionInput.value || null,
        atIdx: Stage.slides.length
      }).then(r => {
        if (r.ok) {
          toast(`Slide created: ${file}`, 'ok');
          close();
        } else {
          toast('Create failed: ' + r.error, 'error');
        }
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Delete slide confirmation
  // ---------------------------------------------------------------------------
  function confirmDeleteSlide(idx, slide) {
    const file = slideFileForIdx(idx);
    const title = slide?.title || `slide ${idx}`;
    if (!confirm(`Delete "${title}"?\n\nFile: ${file}\n\nThis removes the slide from the manifest. The file itself stays on disk.`)) return;
    apiPost('/api/manifest/remove-slide', { idx, file, deleteFile: false }).then(r => {
      if (r.ok) toast(`Removed ${title}`, 'ok');
      else toast('Delete failed: ' + r.error, 'error');
    });
  }

  // ---------------------------------------------------------------------------
  // Speaker notes — open editor for slide.notes
  // ---------------------------------------------------------------------------
  function openSpeakerNotesDialog(idx, slide) {
    const file = slideFileForIdx(idx);
    if (!file) { toast('Cannot determine slide file', 'error'); return; }
    document.querySelectorAll('.note-overlay').forEach(n => n.remove());
    const ov = document.createElement('div');
    ov.className = 'note-overlay edit-affordance';
    ov.innerHTML = `
      <div class="note-title">Speaker notes for ${slide?.title || `slide ${idx}`}</div>
      <div class="note-hint">Shown in the presenter view (the laptop window). Not visible to the audience.</div>
      <textarea class="note-text" placeholder="What you want to say. Bullet points, pauses, callouts..."></textarea>
      <div class="note-actions">
        <button class="note-cancel">Cancel</button>
        <button class="note-save">Save (⌘↵)</button>
      </div>
    `;
    document.body.appendChild(ov);
    const ta = ov.querySelector('textarea');
    if (slide?.notes) ta.value = slide.notes;
    ta.focus();

    function close() { ov.remove(); }
    function save() {
      const notes = ta.value;
      apiPost('/api/edit/notes', { file, notes }).then(r => {
        if (r.ok) { toast('Speaker notes saved', 'ok'); close(); }
        else { toast('Save failed: ' + r.error, 'error'); }
      });
    }
    ov.querySelector('.note-cancel').addEventListener('click', close);
    ov.querySelector('.note-save').addEventListener('click', save);
    ta.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); save(); }
      else if (e.key === 'Escape') close();
    });
  }

  function attachDropZones(ov) {
    const tiles = ov.querySelectorAll('.tile');
    tiles.forEach((tile, idx) => {
      tile.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        tile.classList.add('drop-target');
      });
      tile.addEventListener('dragleave', () => tile.classList.remove('drop-target'));
      tile.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        tile.classList.remove('drop-target');
        EditUI.markDragEnded();        // suppress the post-drop synthetic click
        const from = parseInt(e.dataTransfer.getData('text/x-stagecraft-idx'), 10);
        if (Number.isNaN(from) || from === idx) return;
        const orig = Array.from({ length: Stage.slides.length }, (_, i) => i);
        const moved = orig.splice(from, 1)[0];
        orig.splice(idx, 0, moved);
        apiPost('/api/manifest/reorder', { newOrder: orig })
          .then(r => { if (r.ok) toast('Reordered — reloading', 'ok'); });
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Transition connectors — lines + icons drawn between adjacent storyboard tiles
  // ---------------------------------------------------------------------------
  const TRANSITION_ICONS = {
    cut: '━',
    fade: '◇',
    slide: '▶',
    dissolve: '◌',
    glitch: '⚡',
    wipe: '╱',
    'zoom-in': '⊙',
    'zoom-out': '⊚',
    flip: '⟲',
    iris: '◉',
    shutter: '☰',
    push: '⇉',
    typewriter: '⎯',
    shatter: '✦'
  };

  function attachTransitionConnectors(ov) {
    // Clear any previous connectors (handles resize re-run)
    ov.querySelectorAll('.tx-connector-line, .tx-connector-icon').forEach(n => n.remove());

    const tiles = Array.from(ov.querySelectorAll('.tile'));
    if (tiles.length < 2) return;

    for (let i = 1; i < tiles.length; i++) {
      const prev = tiles[i - 1];
      const cur = tiles[i];
      const slide = Stage.slides[i];
      const trans = slide?.transition || 'fade';

      const prevTop = prev.offsetTop;
      const prevLeft = prev.offsetLeft;
      const prevRight = prevLeft + prev.offsetWidth;
      const prevH = prev.offsetHeight;
      const curTop = cur.offsetTop;
      const curLeft = cur.offsetLeft;

      // Same row? Tolerance for sub-pixel drift.
      const sameRow = Math.abs(prevTop - curTop) < 6;

      const icon = document.createElement('div');
      icon.className = 'tx-connector-icon tile-edit-ui';
      icon.dataset.idx = String(i);
      icon.title = `Transition into slide ${i}: ${trans} — click to change`;
      icon.innerHTML = `
        <span class="tx-connector-glyph">${TRANSITION_ICONS[trans] || '◇'}</span>
        <span class="tx-connector-label">${trans}</span>
      `;
      icon.addEventListener('click', (e) => {
        e.stopPropagation();
        openTransitionPicker(i, slide);
      });

      if (sameRow) {
        const midY = prevTop + prevH / 2;
        const lineLeft = prevRight;
        const lineRight = curLeft;
        const lineWidth = lineRight - lineLeft;

        const line = document.createElement('div');
        line.className = 'tx-connector-line tile-edit-ui';
        line.style.left = lineLeft + 'px';
        line.style.top = (midY - 1) + 'px';
        line.style.width = lineWidth + 'px';
        ov.appendChild(line);

        // Icon centered on the line
        icon.style.left = (lineLeft + lineWidth / 2 - 16) + 'px';
        icon.style.top = (midY - 16) + 'px';
      } else {
        // Row break: small icon on the top-left edge of the new-row tile,
        // with a tiny arc-line hint above it.
        icon.classList.add('row-break');
        icon.style.left = (curLeft + 8) + 'px';
        icon.style.top = (curTop - 16) + 'px';
      }

      ov.appendChild(icon);
    }
  }

  function openTransitionPicker(idx, slide) {
    document.querySelectorAll('.transition-picker').forEach(n => n.remove());
    const currentTx = slide?.transition || 'fade';
    const pick = document.createElement('div');
    pick.className = 'transition-picker edit-affordance';
    pick.innerHTML = `
      <div class="tp-title">How does slide ${idx} enter? <span class="tp-current">currently: <strong>${currentTx}</strong></span></div>
      <div class="tp-hint">Hover an option to preview · click to apply</div>
      <div class="tp-grid">
        ${Object.keys(TRANSITION_ICONS).map(n => `
          <div class="tp-option${n === currentTx ? ' is-current' : ''}" data-tx="${n}">
            <div class="tp-stage"><div class="tp-stage-content">${TRANSITION_ICONS[n]} ${n}</div></div>
            <div class="tp-meta">
              <span class="tp-glyph">${TRANSITION_ICONS[n]}</span>
              <span class="tp-name">${n}</span>
            </div>
          </div>
        `).join('')}
      </div>
      <button class="tp-close">Cancel · esc</button>
    `;
    document.body.appendChild(pick);

    // Hover → play the transition once on the option's preview stage.
    pick.querySelectorAll('.tp-option').forEach(opt => {
      const tx = opt.dataset.tx;
      const stageContent = opt.querySelector('.tp-stage-content');
      opt.addEventListener('mouseenter', () => playPreviewOnce(stageContent, tx));
      opt.addEventListener('mouseleave', () => resetPreview(stageContent, tx));
      opt.addEventListener('click', () => {
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

    // Esc to close
    function onEsc(e) { if (e.key === 'Escape') { pick.remove(); window.removeEventListener('keydown', onEsc); } }
    window.addEventListener('keydown', onEsc);
  }

  function playPreviewOnce(el, name) {
    if (!el) return;
    // Restart the animation by removing + forcing reflow + adding.
    el.classList.remove(`tx-${name}-enter`);
    if (name === 'glitch') {
      // Extra: spawn the scanline overlay used in glitch
      el.parentElement?.querySelectorAll('.tx-glitch-overlay').forEach(n => n.remove());
      const ov = document.createElement('div');
      ov.className = 'tx-glitch-overlay';
      el.parentElement?.appendChild(ov);
      setTimeout(() => ov.remove(), 700);
    }
    void el.offsetWidth;
    el.classList.add(`tx-${name}-enter`);
  }

  function resetPreview(el, name) {
    if (!el) return;
    el.classList.remove(`tx-${name}-enter`);
    el.parentElement?.querySelectorAll('.tx-glitch-overlay').forEach(n => n.remove());
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

      .tile-actions {
        position: absolute;
        top: 0.5rem; right: 0.5rem;
        z-index: 6;
        display: flex;
        gap: 0.25rem;
      }
      .tile-action {
        background: rgba(10, 10, 10, 0.78);
        border: 1px solid var(--dim-2, #2a2a2a);
        color: var(--fg, #e6e6e6);
        width: 26px; height: 26px;
        padding: 0;
        cursor: pointer;
        font-size: 0.78rem;
        line-height: 1;
        backdrop-filter: blur(4px);
      }
      .tile-action:hover {
        border-color: var(--accent, #00FF9C);
        color: var(--accent, #00FF9C);
      }
      .tile-action-danger:hover {
        border-color: var(--red, #FF5C5C);
        color: var(--red, #FF5C5C);
      }

      /* Storyboard toolbar — theme picker + process notes */
      .sb-toolbar {
        position: fixed;
        top: 4rem; left: 50%;
        transform: translateX(-50%);
        z-index: 320;
        background: rgba(10, 10, 10, 0.92);
        backdrop-filter: blur(8px);
        border: 1px solid var(--dim-2, #2a2a2a);
        padding: 0.5rem 0.7rem;
        display: flex;
        align-items: center;
        gap: 0.8rem;
        font-family: var(--mono, monospace);
        font-size: 0.7rem;
        letter-spacing: 0.15em;
      }
      .sb-toolbar-group {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .sb-toolbar-label {
        color: var(--dim, #666);
        text-transform: uppercase;
      }
      .sb-theme-picker {
        display: flex;
        gap: 0.2rem;
      }
      .sb-theme-btn {
        background: transparent;
        border: 1px solid var(--dim-2, #2a2a2a);
        color: var(--fg, #e6e6e6);
        font-family: inherit;
        font-size: 0.68rem;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        padding: 0.3rem 0.6rem;
        cursor: pointer;
      }
      .sb-theme-btn:hover { border-color: var(--accent, #00FF9C); }
      .sb-theme-btn.is-current {
        border-color: var(--accent, #00FF9C);
        color: var(--accent, #00FF9C);
        background: rgba(0, 255, 156, 0.06);
      }
      .sb-toolbar-spacer { width: 1px; height: 1.4rem; background: var(--dim-2, #2a2a2a); }
      .sb-toolbar-btn {
        background: transparent;
        border: 1px solid var(--dim-2, #2a2a2a);
        color: var(--fg, #e6e6e6);
        font-family: inherit;
        font-size: 0.7rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        padding: 0.3rem 0.7rem;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
      }
      .sb-toolbar-btn:hover {
        border-color: var(--accent, #00FF9C);
        color: var(--accent, #00FF9C);
      }
      .sb-toolbar-icon { font-size: 0.95rem; }

      /* Add-slide tile */
      .tile-add {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        border-style: dashed;
        background: transparent;
      }
      .tile-add:hover {
        border-color: var(--accent, #00FF9C);
        background: rgba(0, 255, 156, 0.04);
      }
      .tile-add-glyph {
        font-size: 3rem;
        color: var(--dim, #666);
        font-weight: 300;
      }
      .tile-add:hover .tile-add-glyph { color: var(--accent, #00FF9C); }
      .tile-add-label {
        font-size: 0.7rem;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: var(--dim, #666);
        font-family: var(--mono, monospace);
      }

      /* Add-slide dialog */
      .add-slide-dialog {
        position: fixed;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        background: var(--bg-elevated, #121212);
        border: 1px solid var(--accent, #00FF9C);
        padding: 1.4rem;
        z-index: 9300;
        min-width: 460px;
        box-shadow: 0 30px 80px rgba(0,0,0,0.7);
      }
      .add-slide-dialog .asd-title {
        font-size: 0.78rem;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--dim, #666);
        margin-bottom: 1rem;
      }
      .add-slide-dialog .asd-row {
        display: grid;
        grid-template-columns: 110px 1fr;
        gap: 0.7rem;
        align-items: center;
        margin-bottom: 0.7rem;
      }
      .add-slide-dialog .asd-label {
        font-size: 0.7rem;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        color: var(--dim, #666);
      }
      .add-slide-dialog .asd-input {
        background: var(--bg, #0a0a0a);
        color: var(--fg, #e6e6e6);
        border: 1px solid var(--dim-2, #2a2a2a);
        padding: 0.5rem 0.6rem;
        font-family: var(--mono, monospace);
        font-size: 0.9rem;
      }
      .add-slide-dialog .asd-actions {
        margin-top: 1rem;
        display: flex;
        gap: 0.5rem;
        justify-content: flex-end;
      }
      .add-slide-dialog button {
        background: transparent;
        color: var(--fg, #e6e6e6);
        border: 1px solid var(--dim-2, #2a2a2a);
        padding: 0.4rem 0.9rem;
        font-family: inherit;
        font-size: 0.78rem;
        letter-spacing: 0.1em;
        cursor: pointer;
      }
      .add-slide-dialog .asd-create {
        border-color: var(--accent, #00FF9C);
        color: var(--accent, #00FF9C);
      }

      .note-overlay .note-hint {
        color: var(--dim, #666);
        font-size: 0.7rem;
        letter-spacing: 0.1em;
        margin-bottom: 0.5rem;
      }

      /* Connector line + icon between adjacent storyboard tiles */
      .tx-connector-line {
        position: absolute;
        height: 1px;
        background: linear-gradient(to right, transparent 0%, var(--dim, #666) 20%, var(--dim, #666) 80%, transparent 100%);
        pointer-events: none;
        z-index: 5;
      }
      .tx-connector-icon {
        position: absolute;
        width: 32px; height: 32px;
        background: var(--bg, #0a0a0a);
        border: 1px solid var(--dim-2, #2a2a2a);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 6;
        transition: border-color 180ms, transform 180ms, box-shadow 180ms;
        color: var(--dim, #666);
      }
      .tx-connector-icon:hover {
        border-color: var(--accent, #00FF9C);
        color: var(--accent, #00FF9C);
        transform: scale(1.15);
        box-shadow: 0 0 14px var(--accent-glow, rgba(0,255,156,0.45));
      }
      .tx-connector-icon.row-break {
        background: rgba(10, 10, 10, 0.92);
        backdrop-filter: blur(4px);
      }
      .tx-connector-glyph { font-size: 0.95rem; line-height: 1; }
      .tx-connector-label {
        position: absolute;
        top: 100%; left: 50%;
        transform: translateX(-50%);
        margin-top: 0.4rem;
        font-size: 0.6rem;
        letter-spacing: 0.2em;
        color: var(--dim, #666);
        text-transform: uppercase;
        white-space: nowrap;
        opacity: 0;
        transition: opacity 180ms;
        pointer-events: none;
        background: rgba(10, 10, 10, 0.95);
        padding: 0.2rem 0.5rem;
      }
      .tx-connector-icon:hover .tx-connector-label { opacity: 1; }

      /* Transition picker */
      .transition-picker {
        position: fixed;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        background: var(--bg-elevated, #121212);
        border: 1px solid var(--accent, #00FF9C);
        padding: 1.4rem;
        z-index: 9200;
        min-width: 720px;
        max-width: min(900px, 92vw);
        max-height: 86vh;
        overflow-y: auto;
        box-shadow: 0 30px 80px rgba(0,0,0,0.7);
      }
      .transition-picker .tp-title {
        color: var(--fg, #e6e6e6);
        font-size: 0.85rem;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        margin-bottom: 0.4rem;
        display: flex;
        justify-content: space-between;
        gap: 1rem;
      }
      .transition-picker .tp-current { color: var(--dim, #666); font-weight: 400; }
      .transition-picker .tp-current strong { color: var(--accent, #00FF9C); font-weight: 500; }
      .transition-picker .tp-hint {
        font-size: 0.7rem;
        letter-spacing: 0.15em;
        color: var(--dim, #666);
        margin-bottom: 1rem;
        text-transform: uppercase;
      }
      .transition-picker .tp-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 0.8rem;
      }
      .transition-picker .tp-option {
        border: 1px solid var(--dim-2, #2a2a2a);
        padding: 0;
        cursor: pointer;
        background: var(--bg, #0a0a0a);
        transition: border-color 180ms;
        position: relative;
        overflow: hidden;
      }
      .transition-picker .tp-option:hover { border-color: var(--accent, #00FF9C); }
      .transition-picker .tp-option.is-current {
        border-color: var(--accent, #00FF9C);
        box-shadow: inset 0 0 0 1px var(--accent, #00FF9C);
      }
      .transition-picker .tp-stage {
        height: 90px;
        background: var(--bg-elevated, #121212);
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .transition-picker .tp-stage-content {
        font-size: 0.95rem;
        letter-spacing: 0.1em;
        color: var(--accent, #00FF9C);
        background: var(--bg-elevated, #121212);
        padding: 0.4rem 0.9rem;
        border: 1px solid var(--dim-2, #2a2a2a);
        /* Initially invisible — only the hover-triggered animation reveals it */
        opacity: 0;
      }
      .transition-picker .tp-meta {
        padding: 0.5rem 0.7rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        border-top: 1px solid var(--dim-2, #2a2a2a);
      }
      .transition-picker .tp-glyph { font-size: 1rem; color: var(--accent, #00FF9C); }
      .transition-picker .tp-name {
        font-size: 0.7rem;
        letter-spacing: 0.18em;
        color: var(--fg, #e6e6e6);
        text-transform: uppercase;
      }
      .transition-picker .tp-close {
        margin-top: 1rem;
        background: transparent;
        border: 1px solid var(--dim-2, #2a2a2a);
        color: var(--dim, #666);
        padding: 0.4rem 0.9rem;
        cursor: pointer;
        font-family: inherit;
        font-size: 0.72rem;
        letter-spacing: 0.18em;
        text-transform: uppercase;
      }
      .transition-picker .tp-close:hover {
        border-color: var(--accent, #00FF9C);
        color: var(--accent, #00FF9C);
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
