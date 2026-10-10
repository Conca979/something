/**
 * Circuit Simulation Model and Signal Propagation Engine for LogicForge.
 * Indentation: 2 spaces.
 */

import { COMPONENT_TYPES } from './ComponentTypes.js';

export class Circuit {
  constructor() {
    this.components = new Map();
    this.wires = new Map();
    this.nextId = 1;
    this.listeners = new Set();
    this.history = [];
    this.historyIndex = -1;
    this.maxHistory = 30;
  }

  generateId(prefix = 'c') {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
  }

  addComponent(typeKey, x = 100, y = 100, customProps = {}, existingId = null) {
    const compDef = COMPONENT_TYPES[typeKey];
    if (!compDef) {
      throw new Error(`Unknown component type: ${typeKey}`);
    }

    const id = existingId || this.generateId('node');
    const comp = {
      id,
      type: typeKey,
      x: Math.round(x),
      y: Math.round(y),
      width: compDef.width,
      height: compDef.height,
      label: customProps.label || compDef.name,
      inputs: compDef.inputs.map(() => false),
      outputs: compDef.outputs.map(() => false),
      state: compDef.defaultState ? JSON.parse(JSON.stringify(compDef.defaultState)) : {},
      customProps: { ...customProps }
    };

    this.components.set(id, comp);
    this.notifyChange('component_added', comp);
    return comp;
  }

  removeComponent(componentId) {
    if (!this.components.has(componentId)) return;

    // Remove all associated wires
    const wiresToRemove = [];
    for (const [wireId, wire] of this.wires.entries()) {
      if (wire.fromComponentId === componentId || wire.toComponentId === componentId) {
        wiresToRemove.push(wireId);
      }
    }
    for (const wireId of wiresToRemove) {
      this.removeWire(wireId, false);
    }

    const removed = this.components.get(componentId);
    this.components.delete(componentId);
    this.notifyChange('component_removed', removed);
  }

  addWire(fromComponentId, fromPinIndex, toComponentId, toPinIndex, existingId = null) {
    // Validate existence
    const fromComp = this.components.get(fromComponentId);
    const toComp = this.components.get(toComponentId);
    if (!fromComp || !toComp) return null;

    // Prevent connecting to same pin
    if (fromComponentId === toComponentId && fromPinIndex === toPinIndex) return null;

    // Check if a wire already connects to this specific input pin
    // In digital logic, an input pin can only have one driving source
    for (const wire of this.wires.values()) {
      if (wire.toComponentId === toComponentId && wire.toPinIndex === toPinIndex) {
        // Replace existing wire to this input
        this.removeWire(wire.id, false);
        break;
      }
    }

    const id = existingId || this.generateId('wire');
    const wire = {
      id,
      fromComponentId,
      fromPinIndex,
      toComponentId,
      toPinIndex,
      state: false
    };

    this.wires.set(id, wire);
    this.notifyChange('wire_added', wire);
    return wire;
  }

  removeWire(wireId, notify = true) {
    const wire = this.wires.get(wireId);
    if (!wire) return;

    // Reset input pin on target component
    const targetComp = this.components.get(wire.toComponentId);
    if (targetComp && targetComp.inputs[wire.toPinIndex] !== undefined) {
      targetComp.inputs[wire.toPinIndex] = false;
    }

    this.wires.delete(wireId);
    if (notify) {
      this.notifyChange('wire_removed', wire);
    }
  }

  getComponent(id) {
    return this.components.get(id);
  }

  getWire(id) {
    return this.wires.get(id);
  }

  clear() {
    this.components.clear();
    this.wires.clear();
    this.notifyChange('circuit_cleared');
  }

  /**
   * Evaluates the circuit by propagating logic levels through components and wires.
   * Uses relaxation iterations to handle feedback loops safely.
   */
  step(timestamp = performance.now()) {
    const MAX_PROPAGATION_CYCLES = 12;
    let hasChanged = false;

    for (let cycle = 0; cycle < MAX_PROPAGATION_CYCLES; cycle++) {
      let cycleChanged = false;

      // 1. Propagate output states to wire states and input pins
      for (const wire of this.wires.values()) {
        const sourceComp = this.components.get(wire.fromComponentId);
        const targetComp = this.components.get(wire.toComponentId);
        if (!sourceComp || !targetComp) continue;

        const sourceVal = Boolean(sourceComp.outputs[wire.fromPinIndex]);
        if (wire.state !== sourceVal) {
          wire.state = sourceVal;
          cycleChanged = true;
        }

        if (targetComp.inputs[wire.toPinIndex] !== sourceVal) {
          targetComp.inputs[wire.toPinIndex] = sourceVal;
          cycleChanged = true;
        }
      }

      // 2. Evaluate all components
      for (const comp of this.components.values()) {
        const def = COMPONENT_TYPES[comp.type];
        if (!def || !def.evaluate) continue;

        const evalResult = def.evaluate(comp.inputs, comp.state, timestamp);
        if (!evalResult) continue;

        // Check if outputs changed
        if (evalResult.outputs) {
          for (let i = 0; i < evalResult.outputs.length; i++) {
            const nextVal = Boolean(evalResult.outputs[i]);
            if (comp.outputs[i] !== nextVal) {
              comp.outputs[i] = nextVal;
              cycleChanged = true;
            }
          }
        }

        // Update internal state if returned
        if (evalResult.nextState) {
          comp.state = evalResult.nextState;
        }
      }

      if (cycleChanged) {
        hasChanged = true;
      } else {
        // Circuit reached stable equilibrium
        break;
      }
    }

    // Finalize sequential clock states across steps
    for (const comp of this.components.values()) {
      if (comp.type === 'D_FLIP_FLOP') {
        comp.state.prevClk = Boolean(comp.inputs[1]);
      }
    }

    return hasChanged;
  }

  saveSnapshot() {
    const snapshot = this.toJSON();
    // Truncate redo tree if we are in the middle of history
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }
    this.history.push(snapshot);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    } else {
      this.historyIndex++;
    }
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.fromJSON(this.history[this.historyIndex], false);
      this.notifyChange('history_changed');
      return true;
    }
    return false;
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.fromJSON(this.history[this.historyIndex], false);
      this.notifyChange('history_changed');
      return true;
    }
    return false;
  }

  toJSON() {
    return {
      version: 1,
      components: Array.from(this.components.values()).map(c => ({
        id: c.id,
        type: c.type,
        x: c.x,
        y: c.y,
        label: c.label,
        state: c.state,
        customProps: c.customProps
      })),
      wires: Array.from(this.wires.values()).map(w => ({
        id: w.id,
        fromComponentId: w.fromComponentId,
        fromPinIndex: w.fromPinIndex,
        toComponentId: w.toComponentId,
        toPinIndex: w.toPinIndex
      }))
    };
  }

  fromJSON(data, resetHistory = true) {
    if (!data || !Array.isArray(data.components)) return;

    this.components.clear();
    this.wires.clear();

    for (const c of data.components) {
      const compDef = COMPONENT_TYPES[c.type];
      if (!compDef) continue;
      const comp = {
        id: c.id,
        type: c.type,
        x: c.x,
        y: c.y,
        width: compDef.width,
        height: compDef.height,
        label: c.label || compDef.name,
        inputs: compDef.inputs.map(() => false),
        outputs: compDef.outputs.map(() => false),
        state: c.state ? JSON.parse(JSON.stringify(c.state)) : {},
        customProps: c.customProps || {}
      };
      this.components.set(c.id, comp);
    }

    if (Array.isArray(data.wires)) {
      for (const w of data.wires) {
        if (this.components.has(w.fromComponentId) && this.components.has(w.toComponentId)) {
          this.wires.set(w.id, {
            id: w.id,
            fromComponentId: w.fromComponentId,
            fromPinIndex: w.fromPinIndex,
            toComponentId: w.toComponentId,
            toPinIndex: w.toPinIndex,
            state: false
          });
        }
      }
    }

    if (resetHistory) {
      this.history = [this.toJSON()];
      this.historyIndex = 0;
    }

    this.step();
    this.notifyChange('circuit_loaded');
  }

  addListener(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notifyChange(type, payload = null) {
    for (const listener of this.listeners) {
      try {
        listener(type, payload);
      } catch (err) {
        console.error('Circuit listener error:', err);
      }
    }
  }
}
