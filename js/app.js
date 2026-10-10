/**
 * Main Application Controller for LogicForge.
 * Orchestrates event handling, UI state, rendering, and simulation loops.
 * Indentation: 2 spaces.
 */

import { Circuit } from './engine/Circuit.js';
import { COMPONENT_TYPES, COMPONENT_CATEGORIES } from './engine/ComponentTypes.js';
import { CanvasRenderer } from './render/CanvasRenderer.js';
import { TruthTableGenerator } from './engine/TruthTable.js';
import { sound } from './engine/Audio.js';
import { PRESETS } from './presets/presets.js';

class App {
  constructor() {
    this.canvas = document.getElementById('circuit-canvas');
    this.circuit = new Circuit();
    this.renderer = new CanvasRenderer(this.canvas);

    this.simRunning = true;
    this.snapToGrid = true;
    this.gridStep = 24;

    this.interactionState = {
      selectedIds: new Set(),
      selectedWireId: null,
      hoveredComponentId: null,
      hoveredPin: null,
      wiring: null, // { compId, pinIndex, isOutput, startPos, snapPos, snapTarget }
      selectionBox: null,
      mouseWorld: { x: 0, y: 0 }
    };

    this.dragState = null;
    this.panState = null;
    this.pendingPlacement = null;

    this.init();
  }

  init() {
    this.renderer.resize();
    window.addEventListener('resize', () => this.renderer.resize());

    this.buildComponentPalette();
    this.buildPresetsMenu();
    this.bindEvents();
    this.bindModals();

    // Load initial preset (Half Adder)
    this.loadPreset('half_adder_discrete');

    // Start simulation & render loop
    this.startLoop();
  }

  buildComponentPalette() {
    const categories = [
      { key: COMPONENT_CATEGORIES.IO, elId: 'palette-io' },
      { key: COMPONENT_CATEGORIES.GATES, elId: 'palette-gates' },
      { key: COMPONENT_CATEGORIES.ARITHMETIC, elId: 'palette-arithmetic' },
      { key: COMPONENT_CATEGORIES.MEMORY, elId: 'palette-memory' }
    ];

    for (const cat of categories) {
      const container = document.getElementById(cat.elId);
      if (!container) continue;
      container.innerHTML = '';

      for (const [key, compDef] of Object.entries(COMPONENT_TYPES)) {
        if (compDef.category !== cat.key) continue;

        const btn = document.createElement('button');
        btn.className = 'palette-item';
        btn.setAttribute('data-type', key);
        btn.title = compDef.description;
        btn.innerHTML = `
          <span class="palette-badge">${key.substring(0, 3)}</span>
          <span class="palette-name">${compDef.name}</span>
        `;

        btn.addEventListener('click', () => {
          this.setPlacementMode(key);
        });

        container.appendChild(btn);
      }
    }
  }

  buildPresetsMenu() {
    const container = document.getElementById('presets-container');
    const presetsModal = document.getElementById('modal-presets');

    if (container) {
      container.innerHTML = '';
      for (const preset of PRESETS) {
        const card = document.createElement('div');
        card.className = 'preset-card';
        card.setAttribute('data-id', preset.id);

        let badgeText = 'Circuit';
        if (preset.id.includes('adder')) badgeText = 'Arithmetic';
        else if (preset.id.includes('gates')) badgeText = 'Gates';
        else if (preset.id.includes('latch')) badgeText = 'Memory';
        else if (preset.id.includes('counter')) badgeText = 'Sequential';
        else if (preset.id.includes('mux')) badgeText = 'Data MUX';

        card.innerHTML = `
          <div class="preset-info">
            <div class="preset-header-row">
              <span class="preset-title">${preset.name}</span>
              <span class="preset-badge">${badgeText}</span>
            </div>
            <p class="preset-desc">${preset.description}</p>
          </div>
          <button class="btn btn-primary" style="padding: 6px 14px;">Load</button>
        `;

        card.addEventListener('click', () => {
          this.loadPreset(preset.id);
          presetsModal?.classList.remove('open');
        });

        container.appendChild(card);
      }
    }

    const select = document.getElementById('preset-selector');
    if (select) {
      select.innerHTML = '';
      const defaultOpt = document.createElement('option');
      defaultOpt.value = '';
      defaultOpt.textContent = 'Presets: Select Circuit';
      select.appendChild(defaultOpt);

      for (const preset of PRESETS) {
        const opt = document.createElement('option');
        opt.value = preset.id;
        opt.textContent = preset.name;
        select.appendChild(opt);
      }

      select.addEventListener('change', (e) => {
        const id = e.target.value;
        if (id) {
          this.loadPreset(id);
          e.target.value = '';
        }
      });
    }
  }

  setPlacementMode(typeKey) {
    this.pendingPlacement = typeKey;
    document.body.style.cursor = 'crosshair';
    this.showToast(`Click canvas to place ${COMPONENT_TYPES[typeKey]?.name}`);
  }

  cancelPlacementMode() {
    this.pendingPlacement = null;
    document.body.style.cursor = 'default';
  }

  loadPreset(presetId) {
    const preset = PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    this.circuit.fromJSON(preset.data);
    sound.playChime();
    this.centerView();
    this.showToast(`Loaded: ${preset.name}`);
  }

  centerView() {
    if (this.circuit.components.size === 0) {
      this.renderer.camera.x = 100;
      this.renderer.camera.y = 100;
      this.renderer.camera.zoom = 1.0;
      return;
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const c of this.circuit.components.values()) {
      minX = Math.min(minX, c.x);
      minY = Math.min(minY, c.y);
      maxX = Math.max(maxX, c.x + c.width);
      maxY = Math.max(maxY, c.y + c.height);
    }

    const margin = 80;
    const circuitW = maxX - minX;
    const circuitH = maxY - minY;
    const canvasW = this.canvas.clientWidth;
    const canvasH = this.canvas.clientHeight;

    const zoom = Math.min(
      Math.max(Math.min((canvasW - margin * 2) / circuitW, (canvasH - margin * 2) / circuitH), 0.5),
      1.3
    );

    this.renderer.camera.zoom = zoom;
    this.renderer.camera.x = (canvasW - circuitW * zoom) / 2 - minX * zoom;
    this.renderer.camera.y = (canvasH - circuitH * zoom) / 2 - minY * zoom;
  }

  findPinUnderCursor(worldX, worldY, hitRadius = 14) {
    for (const comp of this.circuit.components.values()) {
      const def = COMPONENT_TYPES[comp.type];
      if (!def) continue;

      // Check outputs
      for (let i = 0; i < def.outputs.length; i++) {
        const pinPos = this.renderer.getPinWorldPos(comp, true, i);
        const dist = Math.hypot(worldX - pinPos.x, worldY - pinPos.y);
        if (dist <= hitRadius) {
          return { componentId: comp.id, isOutput: true, pinIndex: i, pos: pinPos };
        }
      }

      // Check inputs
      for (let i = 0; i < def.inputs.length; i++) {
        const pinPos = this.renderer.getPinWorldPos(comp, false, i);
        const dist = Math.hypot(worldX - pinPos.x, worldY - pinPos.y);
        if (dist <= hitRadius) {
          return { componentId: comp.id, isOutput: false, pinIndex: i, pos: pinPos };
        }
      }
    }
    return null;
  }

  findComponentUnderCursor(worldX, worldY) {
    // Search in reverse for top-most
    const comps = Array.from(this.circuit.components.values()).reverse();
    for (const comp of comps) {
      if (
        worldX >= comp.x &&
        worldX <= comp.x + comp.width &&
        worldY >= comp.y &&
        worldY <= comp.y + comp.height
      ) {
        return comp;
      }
    }
    return null;
  }

  findWireNearCursor(worldX, worldY, hitThreshold = 8) {
    for (const wire of this.circuit.wires.values()) {
      const fromComp = this.circuit.components.get(wire.fromComponentId);
      const toComp = this.circuit.components.get(wire.toComponentId);
      if (!fromComp || !toComp) continue;

      const p0 = this.renderer.getPinWorldPos(fromComp, true, wire.fromPinIndex);
      const p3 = this.renderer.getPinWorldPos(toComp, false, wire.toPinIndex);
      const dx = Math.max(Math.abs(p3.x - p0.x) * 0.5, 40);
      const p1 = { x: p0.x + dx, y: p0.y };
      const p2 = { x: p3.x - dx, y: p3.y };

      // Sample points along cubic bezier
      for (let t = 0; t <= 1; t += 0.05) {
        const cx = Math.pow(1 - t, 3) * p0.x +
                   3 * Math.pow(1 - t, 2) * t * p1.x +
                   3 * (1 - t) * Math.pow(t, 2) * p2.x +
                   Math.pow(t, 3) * p3.x;
        const cy = Math.pow(1 - t, 3) * p0.y +
                   3 * Math.pow(1 - t, 2) * t * p1.y +
                   3 * (1 - t) * Math.pow(t, 2) * p2.y +
                   Math.pow(t, 3) * p3.y;
        if (Math.hypot(worldX - cx, worldY - cy) <= hitThreshold) {
          return wire;
        }
      }
    }
    return null;
  }

  bindEvents() {
    const canvas = this.canvas;

    // Mouse Move
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseScreen = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      const mouseWorld = this.renderer.screenToWorld(mouseScreen.x, mouseScreen.y);
      this.interactionState.mouseWorld = mouseWorld;

      // Handle Canvas Panning
      if (this.panState) {
        this.renderer.camera.x = mouseScreen.x - this.panState.startX;
        this.renderer.camera.y = mouseScreen.y - this.panState.startY;
        return;
      }

      // Handle Component Dragging
      if (this.dragState) {
        const dx = mouseWorld.x - this.dragState.startMouseWorld.x;
        const dy = mouseWorld.y - this.dragState.startMouseWorld.y;

        for (const [compId, startPos] of this.dragState.components.entries()) {
          const comp = this.circuit.components.get(compId);
          if (!comp) continue;
          let targetX = startPos.x + dx;
          let targetY = startPos.y + dy;

          if (this.snapToGrid) {
            targetX = Math.round(targetX / this.gridStep) * this.gridStep;
            targetY = Math.round(targetY / this.gridStep) * this.gridStep;
          }

          comp.x = targetX;
          comp.y = targetY;
        }
        return;
      }

      // Handle Box Selection Marquee
      if (this.interactionState.selectionBox) {
        this.interactionState.selectionBox.currentX = mouseWorld.x;
        this.interactionState.selectionBox.currentY = mouseWorld.y;
        return;
      }

      // Handle Active Wire Dragging
      if (this.interactionState.wiring) {
        const pin = this.findPinUnderCursor(mouseWorld.x, mouseWorld.y, 16);
        if (pin && pin.isOutput !== this.interactionState.wiring.isOutput) {
          // Valid connection target
          this.interactionState.wiring.snapPos = pin.pos;
          this.interactionState.wiring.snapTarget = pin;
        } else {
          this.interactionState.wiring.snapPos = null;
          this.interactionState.wiring.snapTarget = null;
        }
        return;
      }

      // Hover detections
      const hoveredPin = this.findPinUnderCursor(mouseWorld.x, mouseWorld.y);
      this.interactionState.hoveredPin = hoveredPin;

      if (!hoveredPin) {
        const hoveredComp = this.findComponentUnderCursor(mouseWorld.x, mouseWorld.y);
        this.interactionState.hoveredComponentId = hoveredComp ? hoveredComp.id : null;
      } else {
        this.interactionState.hoveredComponentId = null;
      }
    });

    // Mouse Down
    canvas.addEventListener('mousedown', (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseScreen = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      const mouseWorld = this.renderer.screenToWorld(mouseScreen.x, mouseScreen.y);

      // Middle click or Space+click pans canvas
      if (e.button === 1 || (e.button === 0 && e.spaceKey)) {
        this.panState = {
          startX: mouseScreen.x - this.renderer.camera.x,
          startY: mouseScreen.y - this.renderer.camera.y
        };
        return;
      }

      if (e.button !== 0) return;

      // 1. Placement mode active
      if (this.pendingPlacement) {
        let posX = mouseWorld.x;
        let posY = mouseWorld.y;
        if (this.snapToGrid) {
          posX = Math.round(posX / this.gridStep) * this.gridStep;
          posY = Math.round(posY / this.gridStep) * this.gridStep;
        }
        this.circuit.saveSnapshot();
        const created = this.circuit.addComponent(this.pendingPlacement, posX - 30, posY - 25);
        sound.playConnect();
        this.cancelPlacementMode();
        this.interactionState.selectedIds.clear();
        this.interactionState.selectedIds.add(created.id);
        return;
      }

      // 2. Click on a Pin -> Start wiring
      const pin = this.findPinUnderCursor(mouseWorld.x, mouseWorld.y);
      if (pin) {
        this.interactionState.wiring = {
          compId: pin.componentId,
          pinIndex: pin.pinIndex,
          isOutput: pin.isOutput,
          startPos: pin.pos,
          snapPos: null,
          snapTarget: null
        };
        return;
      }

      // 3. Click on a Component
      const comp = this.findComponentUnderCursor(mouseWorld.x, mouseWorld.y);
      if (comp) {
        // Tactile IO interactions:
        if (comp.type === 'SWITCH') {
          comp.state.value = !comp.state.value;
          comp.outputs[0] = comp.state.value;
          sound.playClick(comp.state.value);
          this.circuit.step();
          return;
        }

        if (comp.type === 'BUTTON') {
          comp.state.value = true;
          comp.outputs[0] = true;
          sound.playClick(true);
          this.circuit.step();
          this.activeButton = comp;
          return;
        }

        // Selection handling
        if (!e.shiftKey && !this.interactionState.selectedIds.has(comp.id)) {
          this.interactionState.selectedIds.clear();
        }
        this.interactionState.selectedIds.add(comp.id);
        this.interactionState.selectedWireId = null;

        // Start Dragging
        const compPositions = new Map();
        for (const id of this.interactionState.selectedIds) {
          const c = this.circuit.components.get(id);
          if (c) compPositions.set(id, { x: c.x, y: c.y });
        }
        this.dragState = {
          startMouseWorld: { ...mouseWorld },
          components: compPositions
        };
        return;
      }

      // 4. Click on a Wire
      const wire = this.findWireNearCursor(mouseWorld.x, mouseWorld.y);
      if (wire) {
        this.interactionState.selectedWireId = wire.id;
        this.interactionState.selectedIds.clear();
        return;
      }

      // 5. Click on empty space -> start selection box or clear selection
      if (!e.shiftKey) {
        this.interactionState.selectedIds.clear();
        this.interactionState.selectedWireId = null;
      }
      this.interactionState.selectionBox = {
        startX: mouseWorld.x,
        startY: mouseWorld.y,
        currentX: mouseWorld.x,
        currentY: mouseWorld.y
      };
    });

    // Mouse Up
    window.addEventListener('mouseup', (e) => {
      if (this.activeButton) {
        this.activeButton.state.value = false;
        this.activeButton.outputs[0] = false;
        this.activeButton = null;
        this.circuit.step();
      }

      if (this.panState) {
        this.panState = null;
      }

      if (this.dragState) {
        this.dragState = null;
        this.circuit.saveSnapshot();
      }

      // Complete Wiring
      if (this.interactionState.wiring) {
        const wiring = this.interactionState.wiring;
        if (wiring.snapTarget) {
          this.circuit.saveSnapshot();
          if (wiring.isOutput) {
            this.circuit.addWire(
              wiring.compId,
              wiring.pinIndex,
              wiring.snapTarget.componentId,
              wiring.snapTarget.pinIndex
            );
          } else {
            this.circuit.addWire(
              wiring.snapTarget.componentId,
              wiring.snapTarget.pinIndex,
              wiring.compId,
              wiring.pinIndex
            );
          }
          sound.playConnect();
          this.circuit.step();
        }
        this.interactionState.wiring = null;
      }

      // Complete Selection Marquee
      if (this.interactionState.selectionBox) {
        const box = this.interactionState.selectionBox;
        const x1 = Math.min(box.startX, box.currentX);
        const x2 = Math.max(box.startX, box.currentX);
        const y1 = Math.min(box.startY, box.currentY);
        const y2 = Math.max(box.startY, box.currentY);

        if (Math.abs(x2 - x1) > 5 || Math.abs(y2 - y1) > 5) {
          for (const comp of this.circuit.components.values()) {
            if (
              comp.x + comp.width >= x1 &&
              comp.x <= x2 &&
              comp.y + comp.height >= y1 &&
              comp.y <= y2
            ) {
              this.interactionState.selectedIds.add(comp.id);
            }
          }
        }
        this.interactionState.selectionBox = null;
      }
    });

    // Wheel Zoom
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
      const newZoom = Math.min(Math.max(this.renderer.camera.zoom * zoomFactor, 0.25), 2.8);

      // Zoom towards cursor
      this.renderer.camera.x = mouseX - (mouseX - this.renderer.camera.x) * (newZoom / this.renderer.camera.zoom);
      this.renderer.camera.y = mouseY - (mouseY - this.renderer.camera.y) * (newZoom / this.renderer.camera.zoom);
      this.renderer.camera.zoom = newZoom;
    }, { passive: false });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      // Don't trigger shortcuts if user is typing in modal/input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        this.toggleRun();
      } else if (e.key === 's' || e.key === 'S') {
        this.stepSimulation();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        this.deleteSelection();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        if (e.shiftKey) {
          this.circuit.redo();
        } else {
          this.circuit.undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) {
        e.preventDefault();
        this.circuit.redo();
      } else if (e.key === 'c' || e.key === 'C') {
        this.centerView();
      } else if (e.key === 'Escape') {
        this.cancelPlacementMode();
        this.interactionState.wiring = null;
        this.interactionState.selectedIds.clear();
        this.interactionState.selectedWireId = null;
      }
    });

    // Toolbar buttons
    document.getElementById('btn-play-pause')?.addEventListener('click', () => this.toggleRun());
    document.getElementById('btn-step')?.addEventListener('click', () => this.stepSimulation());
    document.getElementById('btn-center')?.addEventListener('click', () => this.centerView());
    document.getElementById('btn-clear')?.addEventListener('click', () => {
      if (confirm('Clear the entire circuit canvas?')) {
        this.circuit.saveSnapshot();
        this.circuit.clear();
        sound.playDelete();
      }
    });
    document.getElementById('btn-sound')?.addEventListener('click', () => {
      const enabled = sound.toggleMute();
      const soundBtn = document.getElementById('btn-sound');
      if (soundBtn) {
        soundBtn.classList.toggle('muted', !enabled);
        soundBtn.title = enabled ? 'Mute Audio' : 'Unmute Audio';
      }
      this.showToast(enabled ? 'Audio feedback enabled' : 'Audio muted');
    });
    document.getElementById('btn-truth-table')?.addEventListener('click', () => this.openTruthTable());
  }

  toggleRun() {
    this.simRunning = !this.simRunning;
    const btn = document.getElementById('btn-play-pause');
    if (btn) {
      btn.innerHTML = this.simRunning ? '<span>⏸</span> Pause' : '<span>▶</span> Run';
      btn.classList.toggle('active', this.simRunning);
    }
    this.showToast(this.simRunning ? 'Simulation running' : 'Simulation paused');
  }

  stepSimulation() {
    this.simRunning = false;
    document.getElementById('btn-play-pause').innerHTML = '<span>▶</span> Run';
    document.getElementById('btn-play-pause').classList.remove('active');
    this.circuit.step();
    sound.playClockTick();
    this.showToast('Stepped 1 cycle');
  }

  deleteSelection() {
    if (this.interactionState.selectedIds.size > 0 || this.interactionState.selectedWireId) {
      this.circuit.saveSnapshot();
      for (const compId of this.interactionState.selectedIds) {
        this.circuit.removeComponent(compId);
      }
      if (this.interactionState.selectedWireId) {
        this.circuit.removeWire(this.interactionState.selectedWireId);
      }
      this.interactionState.selectedIds.clear();
      this.interactionState.selectedWireId = null;
      sound.playDelete();
      this.circuit.step();
    }
  }

  bindModals() {
    // Presets modal
    const presetsModal = document.getElementById('modal-presets');
    document.getElementById('btn-presets')?.addEventListener('click', () => {
      presetsModal?.classList.add('open');
    });
    document.getElementById('close-presets-modal')?.addEventListener('click', () => {
      presetsModal?.classList.remove('open');
    });

    // Truth table modal
    const ttModal = document.getElementById('modal-truth-table');
    document.getElementById('close-tt-modal')?.addEventListener('click', () => {
      ttModal.classList.remove('open');
    });

    // Export/Import modal
    const exportModal = document.getElementById('modal-export');
    document.getElementById('btn-export')?.addEventListener('click', () => {
      const json = JSON.stringify(this.circuit.toJSON(), null, 2);
      document.getElementById('export-json-area').value = json;
      exportModal.classList.add('open');
    });
    document.getElementById('close-export-modal')?.addEventListener('click', () => {
      exportModal.classList.remove('open');
    });
    document.getElementById('btn-import-apply')?.addEventListener('click', () => {
      try {
        const text = document.getElementById('export-json-area').value;
        const data = JSON.parse(text);
        this.circuit.fromJSON(data);
        sound.playChime();
        this.centerView();
        exportModal.classList.remove('open');
        this.showToast('Circuit imported successfully');
      } catch (err) {
        alert('Invalid circuit JSON: ' + err.message);
      }
    });

    // Help modal
    const helpModal = document.getElementById('modal-help');
    document.getElementById('btn-help')?.addEventListener('click', () => {
      helpModal.classList.add('open');
    });
    document.getElementById('close-help-modal')?.addEventListener('click', () => {
      helpModal.classList.remove('open');
    });

    // Export Screenshot
    document.getElementById('btn-screenshot')?.addEventListener('click', () => {
      const dataUrl = this.canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.download = `logicforge-circuit-${Date.now()}.png`;
      a.href = dataUrl;
      a.click();
      this.showToast('PNG image downloaded');
    });
  }

  openTruthTable() {
    const modal = document.getElementById('modal-truth-table');
    const container = document.getElementById('truth-table-content');
    modal.classList.add('open');

    container.innerHTML = '<div class="loading-spinner">Evaluating combinational logic permutations...</div>';

    setTimeout(() => {
      const result = TruthTableGenerator.generate(this.circuit);
      if (result.success) {
        sound.playChime();
      }
      container.innerHTML = TruthTableGenerator.toHTML(result);
    }, 50);
  }

  showToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

  updateMetrics() {
    const compCount = this.circuit.components.size;
    const wireCount = this.circuit.wires.size;
    const zoomPct = Math.round(this.renderer.camera.zoom * 100);

    const metricEl = document.getElementById('status-metrics');
    if (metricEl) {
      metricEl.innerHTML = `
        <span>Gates & Nodes: <b>${compCount}</b></span>
        <span>Wires: <b>${wireCount}</b></span>
        <span>Zoom: <b>${zoomPct}%</b></span>
        <span>Sim: <b style="color: ${this.simRunning ? '#10b981' : '#f59e0b'}">${this.simRunning ? 'Running' : 'Paused'}</b></span>
      `;
    }
  }

  startLoop() {
    const loop = (timestamp) => {
      if (this.simRunning) {
        this.circuit.step(timestamp);
      }
      this.renderer.render(this.circuit, this.interactionState);
      this.updateMetrics();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
