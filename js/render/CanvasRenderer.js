/**
 * High-Performance Canvas Renderer for LogicForge.
 * Renders circuits, IEEE/ANSI logic gates, glowing electrical traces, and tactile IO components.
 * Indentation: 2 spaces.
 */

import { COMPONENT_TYPES } from '../engine/ComponentTypes.js';

export class CanvasRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.camera = {
      x: 60,
      y: 60,
      zoom: 1.0
    };

    this.dashOffset = 0;
    this.lastFrameTime = performance.now();
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = Math.round(rect.width * dpr);
    this.canvas.height = Math.round(rect.height * dpr);
    this.ctx.resetTransform();
    this.ctx.scale(dpr, dpr);
  }

  screenToWorld(screenX, screenY) {
    return {
      x: (screenX - this.camera.x) / this.camera.zoom,
      y: (screenY - this.camera.y) / this.camera.zoom
    };
  }

  worldToScreen(worldX, worldY) {
    return {
      x: worldX * this.camera.zoom + this.camera.x,
      y: worldY * this.camera.zoom + this.camera.y
    };
  }

  getPinWorldPos(comp, isOutput, pinIndex) {
    const def = COMPONENT_TYPES[comp.type];
    if (!def) return { x: comp.x, y: comp.y };
    const pins = isOutput ? def.outputs : def.inputs;
    const pin = pins[pinIndex] || { xRel: 0, yRel: 0.5 };
    return {
      x: comp.x + pin.xRel * comp.width,
      y: comp.y + pin.yRel * comp.height
    };
  }

  render(circuit, interactionState) {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    const ctx = this.ctx;

    // Advance electrical pulse animation
    const now = performance.now();
    const dt = (now - this.lastFrameTime) / 1000;
    this.lastFrameTime = now;
    this.dashOffset = (this.dashOffset - dt * 25) % 24;

    // 1. Clear background
    ctx.fillStyle = '#080c14';
    ctx.fillRect(0, 0, width, height);

    // 2. Draw engineering grid
    this.drawGrid(width, height);

    ctx.save();
    // Apply camera transform
    ctx.translate(this.camera.x, this.camera.y);
    ctx.scale(this.camera.zoom, this.camera.zoom);

    // 3. Draw wires
    for (const wire of circuit.wires.values()) {
      this.drawWire(wire, circuit, interactionState);
    }

    // 4. Draw active wire in progress
    if (interactionState.wiring) {
      this.drawDraftWire(interactionState.wiring, interactionState.mouseWorld);
    }

    // 5. Draw components
    for (const comp of circuit.components.values()) {
      const isSelected = interactionState.selectedIds.has(comp.id);
      const isHovered = interactionState.hoveredComponentId === comp.id;
      this.drawComponent(comp, isSelected, isHovered, interactionState);
    }

    // 6. Draw selection marquee
    if (interactionState.selectionBox) {
      this.drawSelectionMarquee(interactionState.selectionBox);
    }

    ctx.restore();
  }

  drawGrid(width, height) {
    const ctx = this.ctx;
    const zoom = this.camera.zoom;
    const gridSize = 24 * zoom;

    const offsetX = (this.camera.x % gridSize + gridSize) % gridSize;
    const offsetY = (this.camera.y % gridSize + gridSize) % gridSize;

    ctx.save();
    // Dots pattern
    ctx.fillStyle = 'rgba(74, 99, 140, 0.22)';
    const dotRadius = zoom > 0.8 ? 1.5 : 1.0;

    for (let x = offsetX; x < width; x += gridSize) {
      for (let y = offsetY; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  drawWire(wire, circuit, interactionState) {
    const fromComp = circuit.components.get(wire.fromComponentId);
    const toComp = circuit.components.get(wire.toComponentId);
    if (!fromComp || !toComp) return;

    const start = this.getPinWorldPos(fromComp, true, wire.fromPinIndex);
    const end = this.getPinWorldPos(toComp, false, wire.toPinIndex);
    const isHigh = Boolean(wire.state);
    const isSelected = interactionState.selectedWireId === wire.id;

    const ctx = this.ctx;
    ctx.save();

    const dx = Math.max(Math.abs(end.x - start.x) * 0.5, 40);
    const cp1x = start.x + dx;
    const cp1y = start.y;
    const cp2x = end.x - dx;
    const cp2y = end.y;

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, end.x, end.y);

    if (isSelected) {
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    if (isHigh) {
      // Glow background line
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 10;
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Flowing electron pulse dashes
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#a7f3d0';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.lineDashOffset = this.dashOffset;
      ctx.stroke();
    } else {
      // LOW line (dark cyan/slate)
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#27354a';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    ctx.restore();
  }

  drawDraftWire(wiring, mouseWorld) {
    const ctx = this.ctx;
    ctx.save();

    const start = wiring.startPos;
    const end = wiring.snapPos || mouseWorld;

    const dx = Math.max(Math.abs(end.x - start.x) * 0.5, 40);
    const cp1x = start.x + (wiring.isOutput ? dx : -dx);
    const cp1y = start.y;
    const cp2x = end.x + (wiring.isOutput ? -dx : dx);
    const cp2y = end.y;

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, end.x, end.y);

    ctx.strokeStyle = wiring.snapPos ? '#38bdf8' : 'rgba(56, 189, 248, 0.6)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([5, 5]);
    ctx.stroke();

    ctx.restore();
  }

  drawComponent(comp, isSelected, isHovered, interactionState) {
    const def = COMPONENT_TYPES[comp.type];
    if (!def) return;

    const ctx = this.ctx;
    ctx.save();

    const x = comp.x;
    const y = comp.y;
    const w = comp.width;
    const h = comp.height;
    const r = 8;

    // Drop shadow
    ctx.shadowColor = isSelected ? 'rgba(56, 189, 248, 0.35)' : 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = isSelected ? 16 : 8;
    ctx.shadowOffsetY = 4;

    // Component body background
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);

    const grad = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, '#151e30');
    grad.addColorStop(1, '#0c1322');
    ctx.fillStyle = grad;
    ctx.fill();

    // Border
    ctx.shadowBlur = 0;
    ctx.lineWidth = isSelected ? 2 : 1;
    ctx.strokeStyle = isSelected ? '#38bdf8' : (isHovered ? '#64748b' : '#2a3a55');
    ctx.stroke();

    // Render type-specific visual symbol inside body
    this.drawComponentInterior(comp, def);

    // Header label
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 10px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(comp.label, x + w / 2, y + 4);

    // Draw Input & Output Pins
    this.drawPins(comp, def, interactionState);

    ctx.restore();
  }

  drawComponentInterior(comp, def) {
    const ctx = this.ctx;
    const cx = comp.x + comp.width / 2;
    const cy = comp.y + comp.height / 2 + 5;

    switch (comp.type) {
      case 'SWITCH': {
        const isOn = Boolean(comp.state?.value);
        const swWidth = 36;
        const swHeight = 18;
        const swX = cx - swWidth / 2;
        const swY = cy - swHeight / 2;

        // Track
        ctx.beginPath();
        ctx.roundRect(swX, swY, swWidth, swHeight, 9);
        ctx.fillStyle = isOn ? 'rgba(16, 185, 129, 0.25)' : '#1e293b';
        ctx.fill();
        ctx.strokeStyle = isOn ? '#10b981' : '#475569';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Knob
        const knobX = isOn ? swX + swWidth - 10 : swX + 10;
        ctx.beginPath();
        ctx.arc(knobX, cy, 6.5, 0, Math.PI * 2);
        ctx.fillStyle = isOn ? '#10b981' : '#94a3b8';
        if (isOn) {
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 8;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
        break;
      }

      case 'BUTTON': {
        const isPressed = Boolean(comp.state?.value);
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.fillStyle = isPressed ? '#38bdf8' : '#1e293b';
        ctx.strokeStyle = isPressed ? '#bae6fd' : '#475569';
        ctx.lineWidth = 2;
        if (isPressed) {
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 10;
        }
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;
        break;
      }

      case 'CLOCK': {
        const isHigh = Boolean(comp.state?.value);
        const freq = comp.state?.frequency || 1;
        ctx.strokeStyle = isHigh ? '#fbbf24' : '#64748b';
        ctx.lineWidth = 2;
        if (isHigh) {
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 8;
        }
        // Square wave symbol
        ctx.beginPath();
        ctx.moveTo(cx - 16, cy + 6);
        ctx.lineTo(cx - 8, cy + 6);
        ctx.lineTo(cx - 8, cy - 6);
        ctx.lineTo(cx + 8, cy - 6);
        ctx.lineTo(cx + 8, cy + 6);
        ctx.lineTo(cx + 16, cy + 6);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Freq badge
        ctx.fillStyle = '#f59e0b';
        ctx.font = '500 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${freq}Hz`, cx, cy + 14);
        break;
      }

      case 'LED': {
        const isLit = Boolean(comp.state?.lit);
        const baseColor = comp.state?.color || '#10b981';

        ctx.beginPath();
        ctx.arc(cx, cy, 15, 0, Math.PI * 2);

        if (isLit) {
          ctx.shadowColor = baseColor;
          ctx.shadowBlur = 16;
          const radial = ctx.createRadialGradient(cx - 3, cy - 3, 2, cx, cy, 15);
          radial.addColorStop(0, '#ffffff');
          radial.addColorStop(0.3, baseColor);
          radial.addColorStop(1, '#064e3b');
          ctx.fillStyle = radial;
          ctx.fill();
          ctx.strokeStyle = '#a7f3d0';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else {
          ctx.fillStyle = '#1e293b';
          ctx.fill();
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
        ctx.shadowBlur = 0;
        break;
      }

      case 'PROBE': {
        const isHigh = Boolean(comp.state?.value);
        ctx.beginPath();
        ctx.roundRect(cx - 18, cy - 10, 36, 20, 4);
        ctx.fillStyle = '#060a12';
        ctx.fill();
        ctx.strokeStyle = isHigh ? '#10b981' : '#334155';
        ctx.stroke();

        ctx.fillStyle = isHigh ? '#34d399' : '#64748b';
        ctx.font = '700 13px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(isHigh ? '1' : '0', cx, cy + 1);
        break;
      }

      case 'SEVEN_SEGMENT': {
        this.draw7SegmentDisplay(comp, cx, cy);
        break;
      }

      case 'VCC': {
        ctx.fillStyle = '#ef4444';
        ctx.font = '700 11px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('+5V', cx, cy);
        break;
      }

      case 'GND': {
        ctx.fillStyle = '#64748b';
        ctx.font = '700 11px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('0V', cx, cy);
        break;
      }

      default: {
        // Standard Logic Gates & Modules: draw crisp ANSI/IEEE logic gate symbols
        this.drawGateSymbol(comp.type, cx, cy);
        break;
      }
    }
  }

  drawGateSymbol(type, cx, cy) {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (type) {
      case 'AND': {
        // D shape
        ctx.beginPath();
        ctx.moveTo(cx - 12, cy - 12);
        ctx.lineTo(cx, cy - 12);
        ctx.arc(cx, cy, 12, -Math.PI / 2, Math.PI / 2);
        ctx.lineTo(cx - 12, cy + 12);
        ctx.closePath();
        ctx.stroke();
        break;
      }

      case 'NAND': {
        // D shape + bubble
        ctx.beginPath();
        ctx.moveTo(cx - 14, cy - 12);
        ctx.lineTo(cx - 2, cy - 12);
        ctx.arc(cx - 2, cy, 12, -Math.PI / 2, Math.PI / 2);
        ctx.lineTo(cx - 14, cy + 12);
        ctx.closePath();
        ctx.stroke();
        // Bubble
        ctx.beginPath();
        ctx.arc(cx + 14, cy, 3, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }

      case 'OR': {
        // Curved shield
        ctx.beginPath();
        ctx.moveTo(cx - 14, cy - 12);
        ctx.quadraticCurveTo(cx - 6, cy - 12, cx + 12, cy);
        ctx.quadraticCurveTo(cx - 6, cy + 12, cx - 14, cy + 12);
        ctx.quadraticCurveTo(cx - 8, cy, cx - 14, cy - 12);
        ctx.stroke();
        break;
      }

      case 'NOR': {
        // Curved shield + bubble
        ctx.beginPath();
        ctx.moveTo(cx - 16, cy - 12);
        ctx.quadraticCurveTo(cx - 8, cy - 12, cx + 8, cy);
        ctx.quadraticCurveTo(cx - 8, cy + 12, cx - 16, cy + 12);
        ctx.quadraticCurveTo(cx - 10, cy, cx - 16, cy - 12);
        ctx.stroke();
        // Bubble
        ctx.beginPath();
        ctx.arc(cx + 14, cy, 3, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }

      case 'XOR': {
        // Offset curved line + OR shield
        ctx.beginPath();
        ctx.moveTo(cx - 16, cy - 12);
        ctx.quadraticCurveTo(cx - 10, cy, cx - 16, cy + 12);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(cx - 12, cy - 12);
        ctx.quadraticCurveTo(cx - 4, cy - 12, cx + 12, cy);
        ctx.quadraticCurveTo(cx - 4, cy + 12, cx - 12, cy + 12);
        ctx.quadraticCurveTo(cx - 6, cy, cx - 12, cy - 12);
        ctx.stroke();
        break;
      }

      case 'XNOR': {
        // Offset curved line + OR shield + bubble
        ctx.beginPath();
        ctx.moveTo(cx - 18, cy - 12);
        ctx.quadraticCurveTo(cx - 12, cy, cx - 18, cy + 12);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(cx - 14, cy - 12);
        ctx.quadraticCurveTo(cx - 6, cy - 12, cx + 8, cy);
        ctx.quadraticCurveTo(cx - 6, cy + 12, cx - 14, cy + 12);
        ctx.quadraticCurveTo(cx - 8, cy, cx - 14, cy - 12);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx + 14, cy, 3, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }

      case 'NOT': {
        // Triangle with inversion bubble
        ctx.beginPath();
        ctx.moveTo(cx - 12, cy - 11);
        ctx.lineTo(cx + 6, cy);
        ctx.lineTo(cx - 12, cy + 11);
        ctx.closePath();
        ctx.stroke();
        // Bubble
        ctx.beginPath();
        ctx.arc(cx + 11, cy, 3, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }

      case 'BUFFER': {
        ctx.beginPath();
        ctx.moveTo(cx - 10, cy - 11);
        ctx.lineTo(cx + 10, cy);
        ctx.lineTo(cx - 10, cy + 11);
        ctx.closePath();
        ctx.stroke();
        break;
      }

      default: {
        // IC chip identifier
        ctx.fillStyle = '#818cf8';
        ctx.font = '700 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(type.replace('_', ' '), cx, cy);
        break;
      }
    }

    ctx.restore();
  }

  draw7SegmentDisplay(comp, cx, cy) {
    const ctx = this.ctx;
    const val = Number(comp.state?.value || 0);

    // Segment definitions (A, B, C, D, E, F, G) for 0-F
    // 0: A B C D E F
    // 1: B C
    // 2: A B G E D
    // 3: A B G C D
    // 4: F G B C
    // 5: A F G C D
    // 6: A F G E C D
    // 7: A B C
    // 8: A B C D E F G
    // 9: A B C D F G
    // A: A B C E F G
    // b: C D E F G
    // C: A D E F
    // d: B C D E G
    // E: A D E F G
    // F: A E F G
    const segMap = [
      0x3F, 0x06, 0x5B, 0x4F, 0x66, 0x6D, 0x7D, 0x07,
      0x7F, 0x6F, 0x77, 0x7C, 0x39, 0x5E, 0x79, 0x71
    ];
    const mask = segMap[val % 16] || 0;

    const litColor = '#ef4444';
    const dimColor = '#2d141e';

    const sx = cx + 8;
    const sy = cy - 2;

    ctx.save();
    // Background screen of display
    ctx.fillStyle = '#05070a';
    ctx.roundRect(sx - 18, sy - 28, 36, 56, 4);
    ctx.fill();

    const drawSeg = (active, x1, y1, x2, y2) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.strokeStyle = active ? litColor : dimColor;
      if (active) {
        ctx.shadowColor = litColor;
        ctx.shadowBlur = 6;
      } else {
        ctx.shadowBlur = 0;
      }
      ctx.stroke();
    };

    // A (top)
    drawSeg((mask & 0x01), sx - 10, sy - 22, sx + 10, sy - 22);
    // B (top right)
    drawSeg((mask & 0x02), sx + 11, sy - 20, sx + 11, sy - 3);
    // C (bottom right)
    drawSeg((mask & 0x04), sx + 11, sy + 3, sx + 11, sy + 20);
    // D (bottom)
    drawSeg((mask & 0x08), sx - 10, sy + 22, sx + 10, sy + 22);
    // E (bottom left)
    drawSeg((mask & 0x10), sx - 11, sy + 3, sx - 11, sy + 20);
    // F (top left)
    drawSeg((mask & 0x20), sx - 11, sy - 20, sx - 11, sy - 3);
    // G (middle)
    drawSeg((mask & 0x40), sx - 10, sy, sx + 10, sy);

    ctx.restore();
  }

  drawPins(comp, def, interactionState) {
    const ctx = this.ctx;

    // Draw Input pins
    def.inputs.forEach((pin, idx) => {
      const pos = this.getPinWorldPos(comp, false, idx);
      const isHigh = Boolean(comp.inputs[idx]);
      const isHovered = interactionState.hoveredPin &&
        interactionState.hoveredPin.componentId === comp.id &&
        !interactionState.hoveredPin.isOutput &&
        interactionState.hoveredPin.pinIndex === idx;

      this.drawPinNode(pos.x, pos.y, isHigh, isHovered, pin.name, false);
    });

    // Draw Output pins
    def.outputs.forEach((pin, idx) => {
      const pos = this.getPinWorldPos(comp, true, idx);
      const isHigh = Boolean(comp.outputs[idx]);
      const isHovered = interactionState.hoveredPin &&
        interactionState.hoveredPin.componentId === comp.id &&
        interactionState.hoveredPin.isOutput &&
        interactionState.hoveredPin.pinIndex === idx;

      this.drawPinNode(pos.x, pos.y, isHigh, isHovered, pin.name, true);
    });
  }

  drawPinNode(x, y, isHigh, isHovered, label, isOutput) {
    const ctx = this.ctx;
    ctx.save();

    const radius = isHovered ? 5.5 : 4;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);

    if (isHigh) {
      ctx.fillStyle = '#10b981';
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 8;
    } else {
      ctx.fillStyle = isHovered ? '#60a5fa' : '#334155';
      ctx.shadowBlur = 0;
    }

    ctx.fill();
    ctx.strokeStyle = '#090d16';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Pin tiny label
    ctx.shadowBlur = 0;
    ctx.fillStyle = isHovered ? '#f1f5f9' : '#64748b';
    ctx.font = '500 8.5px Inter, monospace';
    ctx.textBaseline = 'middle';
    ctx.textAlign = isOutput ? 'right' : 'left';
    const offsetX = isOutput ? -8 : 8;
    ctx.fillText(label, x + offsetX, y);

    ctx.restore();
  }

  drawSelectionMarquee(box) {
    const ctx = this.ctx;
    ctx.save();
    const x = Math.min(box.startX, box.currentX);
    const y = Math.min(box.startY, box.currentY);
    const w = Math.abs(box.currentX - box.startX);
    const h = Math.abs(box.currentY - box.startY);

    ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.fillRect(x, y, w, h);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(x, y, w, h);
    ctx.restore();
  }
}
