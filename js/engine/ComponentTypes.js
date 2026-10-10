/**
 * Component definitions and logic simulation kernels for LogicForge.
 * Indentation: 2 spaces.
 */

export const COMPONENT_CATEGORIES = {
  GATES: 'Logic Gates',
  IO: 'Inputs & Displays',
  ARITHMETIC: 'Arithmetic',
  MEMORY: 'Memory & Latches'
};

export const COMPONENT_TYPES = {
  // --- BASIC LOGIC GATES ---
  AND: {
    id: 'AND',
    name: 'AND Gate',
    category: COMPONENT_CATEGORIES.GATES,
    description: 'Output is HIGH only when all inputs are HIGH.',
    width: 80,
    height: 60,
    inputs: [
      { id: 'in0', name: 'A', xRel: 0, yRel: 0.3 },
      { id: 'in1', name: 'B', xRel: 0, yRel: 0.7 }
    ],
    outputs: [
      { id: 'out0', name: 'Y', xRel: 1, yRel: 0.5 }
    ],
    evaluate: (inputs) => ({
      outputs: [Boolean(inputs[0] && inputs[1])]
    })
  },

  OR: {
    id: 'OR',
    name: 'OR Gate',
    category: COMPONENT_CATEGORIES.GATES,
    description: 'Output is HIGH if at least one input is HIGH.',
    width: 80,
    height: 60,
    inputs: [
      { id: 'in0', name: 'A', xRel: 0, yRel: 0.3 },
      { id: 'in1', name: 'B', xRel: 0, yRel: 0.7 }
    ],
    outputs: [
      { id: 'out0', name: 'Y', xRel: 1, yRel: 0.5 }
    ],
    evaluate: (inputs) => ({
      outputs: [Boolean(inputs[0] || inputs[1])]
    })
  },

  NOT: {
    id: 'NOT',
    name: 'NOT Gate',
    category: COMPONENT_CATEGORIES.GATES,
    description: 'Inverts the incoming digital signal.',
    width: 70,
    height: 50,
    inputs: [
      { id: 'in0', name: 'A', xRel: 0, yRel: 0.5 }
    ],
    outputs: [
      { id: 'out0', name: 'Y', xRel: 1, yRel: 0.5 }
    ],
    evaluate: (inputs) => ({
      outputs: [!inputs[0]]
    })
  },

  NAND: {
    id: 'NAND',
    name: 'NAND Gate',
    category: COMPONENT_CATEGORIES.GATES,
    description: 'Universal logic gate; inverted AND.',
    width: 85,
    height: 60,
    inputs: [
      { id: 'in0', name: 'A', xRel: 0, yRel: 0.3 },
      { id: 'in1', name: 'B', xRel: 0, yRel: 0.7 }
    ],
    outputs: [
      { id: 'out0', name: 'Y', xRel: 1, yRel: 0.5 }
    ],
    evaluate: (inputs) => ({
      outputs: [!(inputs[0] && inputs[1])]
    })
  },

  NOR: {
    id: 'NOR',
    name: 'NOR Gate',
    category: COMPONENT_CATEGORIES.GATES,
    description: 'Universal logic gate; inverted OR.',
    width: 85,
    height: 60,
    inputs: [
      { id: 'in0', name: 'A', xRel: 0, yRel: 0.3 },
      { id: 'in1', name: 'B', xRel: 0, yRel: 0.7 }
    ],
    outputs: [
      { id: 'out0', name: 'Y', xRel: 1, yRel: 0.5 }
    ],
    evaluate: (inputs) => ({
      outputs: [!(inputs[0] || inputs[1])]
    })
  },

  XOR: {
    id: 'XOR',
    name: 'XOR Gate',
    category: COMPONENT_CATEGORIES.GATES,
    description: 'Exclusive OR: HIGH when odd number of inputs are HIGH.',
    width: 85,
    height: 60,
    inputs: [
      { id: 'in0', name: 'A', xRel: 0, yRel: 0.3 },
      { id: 'in1', name: 'B', xRel: 0, yRel: 0.7 }
    ],
    outputs: [
      { id: 'out0', name: 'Y', xRel: 1, yRel: 0.5 }
    ],
    evaluate: (inputs) => ({
      outputs: [Boolean(Boolean(inputs[0]) !== Boolean(inputs[1]))]
    })
  },

  XNOR: {
    id: 'XNOR',
    name: 'XNOR Gate',
    category: COMPONENT_CATEGORIES.GATES,
    description: 'Equivalence gate: HIGH when both inputs are equal.',
    width: 90,
    height: 60,
    inputs: [
      { id: 'in0', name: 'A', xRel: 0, yRel: 0.3 },
      { id: 'in1', name: 'B', xRel: 0, yRel: 0.7 }
    ],
    outputs: [
      { id: 'out0', name: 'Y', xRel: 1, yRel: 0.5 }
    ],
    evaluate: (inputs) => ({
      outputs: [Boolean(Boolean(inputs[0]) === Boolean(inputs[1]))]
    })
  },

  BUFFER: {
    id: 'BUFFER',
    name: 'Buffer',
    category: COMPONENT_CATEGORIES.GATES,
    description: 'Signal repeater passing input to output unaltered.',
    width: 70,
    height: 50,
    inputs: [
      { id: 'in0', name: 'A', xRel: 0, yRel: 0.5 }
    ],
    outputs: [
      { id: 'out0', name: 'Y', xRel: 1, yRel: 0.5 }
    ],
    evaluate: (inputs) => ({
      outputs: [Boolean(inputs[0])]
    })
  },

  // --- INPUTS & DISPLAYS ---
  SWITCH: {
    id: 'SWITCH',
    name: 'Toggle Switch',
    category: COMPONENT_CATEGORIES.IO,
    description: 'Interactive bistable switch toggling 0 (LOW) or 1 (HIGH).',
    width: 70,
    height: 50,
    inputs: [],
    outputs: [
      { id: 'out0', name: 'Q', xRel: 1, yRel: 0.5 }
    ],
    defaultState: { value: false },
    evaluate: (inputs, state) => ({
      outputs: [Boolean(state?.value)]
    })
  },

  BUTTON: {
    id: 'BUTTON',
    name: 'Push Button',
    category: COMPONENT_CATEGORIES.IO,
    description: 'Momentary contact switch: HIGH while pressed, LOW when released.',
    width: 70,
    height: 50,
    inputs: [],
    outputs: [
      { id: 'out0', name: 'Q', xRel: 1, yRel: 0.5 }
    ],
    defaultState: { value: false },
    evaluate: (inputs, state) => ({
      outputs: [Boolean(state?.value)]
    })
  },

  CLOCK: {
    id: 'CLOCK',
    name: 'Clock Pulse',
    category: COMPONENT_CATEGORIES.IO,
    description: 'Periodic square-wave signal generator for sequential circuits.',
    width: 80,
    height: 55,
    inputs: [],
    outputs: [
      { id: 'out0', name: 'CLK', xRel: 1, yRel: 0.5 }
    ],
    defaultState: { value: false, frequency: 1, lastToggle: 0 },
    evaluate: (inputs, state, now) => {
      const freq = state?.frequency || 1;
      const periodMs = 1000 / freq;
      const halfPeriod = periodMs / 2;
      const isHigh = Math.floor(now / halfPeriod) % 2 === 0;
      return {
        outputs: [isHigh],
        nextState: { ...state, value: isHigh }
      };
    }
  },

  VCC: {
    id: 'VCC',
    name: 'VCC (+5V)',
    category: COMPONENT_CATEGORIES.IO,
    description: 'Constant logic HIGH (1) voltage supply.',
    width: 60,
    height: 40,
    inputs: [],
    outputs: [
      { id: 'out0', name: '1', xRel: 1, yRel: 0.5 }
    ],
    evaluate: () => ({
      outputs: [true]
    })
  },

  GND: {
    id: 'GND',
    name: 'Ground (0V)',
    category: COMPONENT_CATEGORIES.IO,
    description: 'Constant logic LOW (0) reference.',
    width: 60,
    height: 40,
    inputs: [],
    outputs: [
      { id: 'out0', name: '0', xRel: 1, yRel: 0.5 }
    ],
    evaluate: () => ({
      outputs: [false]
    })
  },

  LED: {
    id: 'LED',
    name: 'LED Indicator',
    category: COMPONENT_CATEGORIES.IO,
    description: 'Visual luminescent diode glowing when input is HIGH.',
    width: 60,
    height: 60,
    inputs: [
      { id: 'in0', name: 'IN', xRel: 0, yRel: 0.5 }
    ],
    outputs: [],
    defaultState: { color: '#10b981' },
    evaluate: (inputs, state) => ({
      outputs: [],
      nextState: { ...state, lit: Boolean(inputs[0]) }
    })
  },

  PROBE: {
    id: 'PROBE',
    name: 'Logic Probe',
    category: COMPONENT_CATEGORIES.IO,
    description: 'Digital readout meter displaying binary 0/1 and logic state.',
    width: 65,
    height: 45,
    inputs: [
      { id: 'in0', name: 'IN', xRel: 0, yRel: 0.5 }
    ],
    outputs: [],
    evaluate: (inputs, state) => ({
      outputs: [],
      nextState: { ...state, value: Boolean(inputs[0]) }
    })
  },

  SEVEN_SEGMENT: {
    id: 'SEVEN_SEGMENT',
    name: '7-Segment Hex Display',
    category: COMPONENT_CATEGORIES.IO,
    description: '4-bit binary decoder displaying hex characters (0 to F).',
    width: 90,
    height: 110,
    inputs: [
      { id: 'in0', name: 'D0 (1)', xRel: 0, yRel: 0.2 },
      { id: 'in1', name: 'D1 (2)', xRel: 0, yRel: 0.4 },
      { id: 'in2', name: 'D2 (4)', xRel: 0, yRel: 0.6 },
      { id: 'in3', name: 'D3 (8)', xRel: 0, yRel: 0.8 }
    ],
    outputs: [],
    evaluate: (inputs, state) => {
      const val = (inputs[0] ? 1 : 0) |
                  (inputs[1] ? 2 : 0) |
                  (inputs[2] ? 4 : 0) |
                  (inputs[3] ? 8 : 0);
      return {
        outputs: [],
        nextState: { ...state, value: val }
      };
    }
  },

  // --- ARITHMETIC CIRCUITS ---
  HALF_ADDER: {
    id: 'HALF_ADDER',
    name: 'Half Adder',
    category: COMPONENT_CATEGORIES.ARITHMETIC,
    description: 'Adds two 1-bit binary inputs, outputting Sum and Carry.',
    width: 95,
    height: 70,
    inputs: [
      { id: 'in0', name: 'A', xRel: 0, yRel: 0.35 },
      { id: 'in1', name: 'B', xRel: 0, yRel: 0.65 }
    ],
    outputs: [
      { id: 'out0', name: 'Sum', xRel: 1, yRel: 0.35 },
      { id: 'out1', name: 'Cout', xRel: 1, yRel: 0.65 }
    ],
    evaluate: (inputs) => {
      const a = Boolean(inputs[0]);
      const b = Boolean(inputs[1]);
      return {
        outputs: [a !== b, a && b]
      };
    }
  },

  FULL_ADDER: {
    id: 'FULL_ADDER',
    name: 'Full Adder',
    category: COMPONENT_CATEGORIES.ARITHMETIC,
    description: 'Adds two bits plus Carry-in, producing Sum and Carry-out.',
    width: 105,
    height: 80,
    inputs: [
      { id: 'in0', name: 'A', xRel: 0, yRel: 0.25 },
      { id: 'in1', name: 'B', xRel: 0, yRel: 0.5 },
      { id: 'in2', name: 'Cin', xRel: 0, yRel: 0.75 }
    ],
    outputs: [
      { id: 'out0', name: 'Sum', xRel: 1, yRel: 0.35 },
      { id: 'out1', name: 'Cout', xRel: 1, yRel: 0.65 }
    ],
    evaluate: (inputs) => {
      const a = Boolean(inputs[0]);
      const b = Boolean(inputs[1]);
      const cin = Boolean(inputs[2]);
      const sum = (a !== b) !== cin;
      const cout = (a && b) || (cin && (a !== b));
      return {
        outputs: [sum, cout]
      };
    }
  },

  MUX_2TO1: {
    id: 'MUX_2TO1',
    name: '2:1 Multiplexer',
    category: COMPONENT_CATEGORIES.ARITHMETIC,
    description: 'Selects between data input D0 and D1 based on Select line.',
    width: 90,
    height: 75,
    inputs: [
      { id: 'in0', name: 'D0', xRel: 0, yRel: 0.25 },
      { id: 'in1', name: 'D1', xRel: 0, yRel: 0.55 },
      { id: 'in2', name: 'Sel', xRel: 0.5, yRel: 1.0 }
    ],
    outputs: [
      { id: 'out0', name: 'Y', xRel: 1, yRel: 0.4 }
    ],
    evaluate: (inputs) => {
      const d0 = Boolean(inputs[0]);
      const d1 = Boolean(inputs[1]);
      const sel = Boolean(inputs[2]);
      return {
        outputs: [sel ? d1 : d0]
      };
    }
  },

  // --- MEMORY & LATCHES ---
  SR_LATCH: {
    id: 'SR_LATCH',
    name: 'SR Latch',
    category: COMPONENT_CATEGORIES.MEMORY,
    description: 'Bistable multivibrator storing 1 bit of volatile memory.',
    width: 95,
    height: 70,
    inputs: [
      { id: 'in0', name: 'Set', xRel: 0, yRel: 0.35 },
      { id: 'in1', name: 'Rst', xRel: 0, yRel: 0.65 }
    ],
    outputs: [
      { id: 'out0', name: 'Q', xRel: 1, yRel: 0.35 },
      { id: 'out1', name: 'Q\'', xRel: 1, yRel: 0.65 }
    ],
    defaultState: { q: false },
    evaluate: (inputs, state) => {
      const s = Boolean(inputs[0]);
      const r = Boolean(inputs[1]);
      let currentQ = state?.q ?? false;
      if (s && !r) {
        currentQ = true;
      } else if (!s && r) {
        currentQ = false;
      } else if (s && r) {
        return {
          outputs: [false, false],
          nextState: { ...state, q: false, invalid: true }
        };
      }
      return {
        outputs: [currentQ, !currentQ],
        nextState: { ...state, q: currentQ, invalid: false }
      };
    }
  },

  D_FLIP_FLOP: {
    id: 'D_FLIP_FLOP',
    name: 'D Flip-Flop',
    category: COMPONENT_CATEGORIES.MEMORY,
    description: 'Positive-edge triggered data flip-flop with asynchronous reset.',
    width: 100,
    height: 80,
    inputs: [
      { id: 'in0', name: 'D', xRel: 0, yRel: 0.3 },
      { id: 'in1', name: 'CLK >', xRel: 0, yRel: 0.5 },
      { id: 'in2', name: 'RST', xRel: 0, yRel: 0.7 }
    ],
    outputs: [
      { id: 'out0', name: 'Q', xRel: 1, yRel: 0.35 },
      { id: 'out1', name: 'Q\'', xRel: 1, yRel: 0.65 }
    ],
    defaultState: { q: false, prevClk: false },
    evaluate: (inputs, state) => {
      const d = Boolean(inputs[0]);
      const clk = Boolean(inputs[1]);
      const rst = Boolean(inputs[2]);
      let currentQ = state?.q ?? false;
      const prevClk = state?.prevClk ?? false;

      if (rst) {
        currentQ = false;
      } else if (!prevClk && clk) {
        // Positive clock edge detected
        currentQ = d;
      }

      return {
        outputs: [currentQ, !currentQ],
        nextState: { ...state, q: currentQ }
      };
    }
  }
};
