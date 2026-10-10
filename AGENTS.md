# AGENTS.md

## Overview & Architecture Boundaries

**LogicForge** is an interactive, browser-native digital logic and circuit simulator built with modular Vanilla JavaScript (ES modules) and modern CSS.

### Core Module Boundaries

The codebase is organized into four distinct architectural layers under `js/`:

1. **Simulation Engine (`js/engine/`)**
   - [ComponentTypes.js](file:///c:/Users/admin/projects/something/js/engine/ComponentTypes.js): Pure functional logic kernels and pin metadata. Evaluates inputs into boolean outputs and computes next internal states (e.g., flip-flop latches, counters).
   - [Circuit.js](file:///c:/Users/admin/projects/something/js/engine/Circuit.js): The directed graph data structure holding components and wires. Coordinates signal propagation using iterative relaxation cycles and manages historical undo/redo snapshots.
   - [TruthTable.js](file:///c:/Users/admin/projects/something/js/engine/TruthTable.js): Permutation generator evaluating combinational logic circuits across $2^n$ binary inputs without mutating persistent circuit state.
   - [Audio.js](file:///c:/Users/admin/projects/something/js/engine/Audio.js): Procedural sound generator using Web Audio API for click, tick, and chime feedback.

2. **Rendering Layer (`js/render/`)**
   - [CanvasRenderer.js](file:///c:/Users/admin/projects/something/js/render/CanvasRenderer.js): Independent 60 FPS HTML5 Canvas renderer with DPI scaling, infinite pan/zoom camera transformations, IEEE/ANSI gate schematics, glowing electrical traces, and 7-segment hex display phosphor rendering.

3. **Preset Circuits (`js/presets/`)**
   - [presets.js](file:///c:/Users/admin/projects/something/js/presets/presets.js): Pre-configured, verified computational circuits (Elementary Gates, Half Adder, SR Latch 1-bit memory cell, 4-Bit Ripple Counter with 7-Segment Display, 2:1 Multiplexer).

4. **Application Controller (`js/app.js`)**
   - [app.js](file:///c:/Users/admin/projects/something/js/app.js): Wires UI DOM events (palette buttons, preset modals, HUD actions, shortcuts) with the circuit graph and rendering loop.

### Code Style Guidelines
- Indentation: 2 spaces throughout all `.js`, `.css`, and `.html` files.
- Zero external build step or bundle dependencies (uses native ES modules).
- Strictly preserve markdown links with the `file://` scheme when referencing local project paths in docs.
