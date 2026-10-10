# LogicForge ⚡
> *From elementary boolean gates to universal computation — a high-performance interactive digital logic laboratory and circuit simulator.*

![LogicForge Banner](https://img.shields.io/badge/LogicForge-Interactive%20Circuit%20Simulator-38bdf8?style=for-the-badge&logo=electron)
![License](https://img.shields.io/badge/License-MIT-10b981?style=for-the-badge)
![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero%20(Pure%20Vanilla%20JS)-818cf8?style=for-the-badge)

---

## 💡 Overview

**LogicForge** is an interactive, browser-based digital logic studio and circuit simulator built from first principles. It embodies the philosophy of **"Simple, but Logic"**: starting with pure boolean truths (HIGH/LOW, AND, OR, NOT, NAND, NOR, XOR), it demonstrates how complex digital systems — adders, data selectors, latches, and clock-driven sequential ripple counters — naturally emerge.

Designed with a sleek obsidian and neon-cyan laboratory aesthetic, LogicForge features real-time relaxation-based signal propagation, glowing animated electron traces, procedural Web Audio relay feedback, an automated truth table generator, and curated pre-built circuits.

---

## ✨ Key Features

### 1. Interactive Circuit Canvas
- **High-DPI 60 FPS Rendering:** Built on HTML5 Canvas with smooth infinite panning and cursor-centered zooming.
- **Glowing Animated Electrical Traces:** Visualizes current flow with animated glowing electron pulses on active HIGH (`1`) wires and muted traces on LOW (`0`).
- **Standard IEEE/ANSI Logic Gate Symbols:** Crisp schematics for AND, OR, NOT, NAND, NOR, XOR, XNOR, and Buffer.
- **Tactile Inputs & Indicators:**
  - **Toggle Switches** with flip animation and click audio
  - **Momentary Push Buttons**
  - **Adjustable Clock Generators** (square-wave pulse generator)
  - **Glowing Multicolored LEDs** (Emerald, Cyan, Amber, Ruby)
  - **Digital Logic Probes** (real-time binary readouts)
  - **7-Segment Hex Display** (decodes 4-bit nibbles from `0` to `F`)

### 2. Signal Propagation & Relaxation Engine
- **Feedback & Oscillation Support:** Solves combinational circuits and sequential feedback loops (like cross-coupled latches and ring counters) using multi-cycle relaxation without blocking or infinite loops.
- **Synchronous Edge-Triggered Flip-Flops:** Implements mathematically precise positive clock edge detection for deterministic sequential circuits.
- **Real-Time & Stepped Execution:** Run continuous real-time simulation or step cycle-by-cycle (`S` key) to inspect propagation delays.

### 3. Automated Truth Table Generator
- **Combinational Logic Permutation Solver:** Analyzes any active circuit, automatically sweeps through all input switch permutations ($2^n$, up to 128 states), and constructs a live truth table comparing inputs against output indicators.

### 4. Curated Circuit Presets
Load verified computational circuits with 1 click:
1. **Logic Gates Showcase:** Side-by-side comparison of basic elementary gates.
2. **Half Adder from Elementary Gates:** 1-bit binary arithmetic using XOR (Sum) and AND (Carry).
3. **1-Bit Memory Cell (SR Latch):** Bistable cross-coupled NOR gates showing how feedback loops store state.
4. **4-Bit Binary Ripple Counter with 7-Segment Display:** Master clock driving chained D Flip-Flops into a 7-segment hex display, counting dynamically from `0` to `F`.
5. **2:1 Data Multiplexer:** Control line switching between two data input streams.

### 5. Tactile Web Audio Synthesizer
- Procedural audio feedback using Web Audio API:
  - Mechanical switch click on toggles
  - Soft woodblock tick on clock pulses
  - Harmonic connection chimes on wire creation
  - Audio mute/unmute toggle

### 6. Persistence & Export
- **JSON Import / Export:** Save circuit schematics as formatted JSON or paste custom netlists.
- **High-Resolution PNG Snapshot:** One-click export of current canvas as an image.
- **Full Undo / Redo:** Complete historical snapshots (`Ctrl+Z` / `Ctrl+Y`).

---

## 🚀 Quick Start

LogicForge has **zero external build steps or dependencies**. You can run it with any standard HTTP server or open directly in modern browsers.

### Running Locally with Python
```bash
# Start a local static server
python -m http.server 8080
```
Open [http://localhost:8080/](http://localhost:8080/) in your web browser.

### Running with Node.js
```bash
# Using npx serve
npx -y serve .
```

---

## ⌨️ Controls & Shortcuts

| Action | Shortcut / Input |
|---|---|
| **Toggle Simulation** | `Space` |
| **Single Step Cycle** | `S` |
| **Fit / Center View** | `C` |
| **Delete Selected** | `Delete` / `Backspace` |
| **Undo** | `Ctrl + Z` (or `Cmd + Z`) |
| **Redo** | `Ctrl + Y` (or `Cmd + Shift + Z`) |
| **Pan Canvas** | Middle Mouse Button or Drag on Empty Space |
| **Zoom In / Out** | Mouse Wheel |
| **Connect Wire** | Click & Drag from any Pin to a compatible Pin |
| **Cancel Wire / Deselect** | `Escape` |

---

## 📁 Project Architecture

```
something/
├── index.html                  # Accessible, SEO-optimized markup & HUD layout
├── css/
│   └── style.css               # Obsidian glassmorphic design system & typography
├── js/
│   ├── app.js                  # Main controller, event routing, loop orchestration
│   ├── engine/
│   │   ├── ComponentTypes.js   # Gate logic kernels & pin geometry specifications
│   │   ├── Circuit.js          # Graph model, relaxation solver, undo/redo manager
│   │   ├── TruthTable.js       # Permutation solver and table generator
│   │   └── Audio.js            # Web Audio API sound synthesis
│   ├── render/
│   │   └── CanvasRenderer.js   # 60 FPS HTML5 canvas renderer, neon glow, DPI scaling
│   └── presets/
│       └── presets.js          # Curated logic circuits (Adders, Counters, Latches)
├── README.md                   # Project documentation
└── AGENTS.md                   # System architecture and agent guidelines
```

---

## 📄 License

MIT License. Crafted with precision for computational logic exploration.