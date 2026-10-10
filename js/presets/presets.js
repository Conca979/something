/**
 * Curated Logic Circuit Presets demonstrating computational logic from first principles.
 * Indentation: 2 spaces.
 */

export const PRESETS = [
  {
    id: 'basic_gates',
    name: 'Logic Gates Showcase',
    description: 'Compares AND, OR, XOR, NAND, NOR, and NOT side-by-side with shared inputs.',
    data: {
      version: 1,
      components: [
        { id: 'sw_a', type: 'SWITCH', x: 80, y: 140, label: 'Input A', state: { value: true } },
        { id: 'sw_b', type: 'SWITCH', x: 80, y: 260, label: 'Input B', state: { value: false } },
        
        { id: 'gate_and', type: 'AND', x: 280, y: 80, label: 'AND' },
        { id: 'gate_or', type: 'OR', x: 280, y: 170, label: 'OR' },
        { id: 'gate_xor', type: 'XOR', x: 280, y: 260, label: 'XOR' },
        { id: 'gate_nand', type: 'NAND', x: 280, y: 350, label: 'NAND' },
        { id: 'gate_nor', type: 'NOR', x: 280, y: 440, label: 'NOR' },

        { id: 'led_and', type: 'LED', x: 440, y: 80, label: 'AND Out', state: { color: '#10b981' } },
        { id: 'led_or', type: 'LED', x: 440, y: 170, label: 'OR Out', state: { color: '#3b82f6' } },
        { id: 'led_xor', type: 'LED', x: 440, y: 260, label: 'XOR Out', state: { color: '#f59e0b' } },
        { id: 'led_nand', type: 'LED', x: 440, y: 350, label: 'NAND Out', state: { color: '#ec4899' } },
        { id: 'led_nor', type: 'LED', x: 440, y: 440, label: 'NOR Out', state: { color: '#8b5cf6' } }
      ],
      wires: [
        { id: 'w1', fromComponentId: 'sw_a', fromPinIndex: 0, toComponentId: 'gate_and', toPinIndex: 0 },
        { id: 'w2', fromComponentId: 'sw_b', fromPinIndex: 0, toComponentId: 'gate_and', toPinIndex: 1 },

        { id: 'w3', fromComponentId: 'sw_a', fromPinIndex: 0, toComponentId: 'gate_or', toPinIndex: 0 },
        { id: 'w4', fromComponentId: 'sw_b', fromPinIndex: 0, toComponentId: 'gate_or', toPinIndex: 1 },

        { id: 'w5', fromComponentId: 'sw_a', fromPinIndex: 0, toComponentId: 'gate_xor', toPinIndex: 0 },
        { id: 'w6', fromComponentId: 'sw_b', fromPinIndex: 0, toComponentId: 'gate_xor', toPinIndex: 1 },

        { id: 'w7', fromComponentId: 'sw_a', fromPinIndex: 0, toComponentId: 'gate_nand', toPinIndex: 0 },
        { id: 'w8', fromComponentId: 'sw_b', fromPinIndex: 0, toComponentId: 'gate_nand', toPinIndex: 1 },

        { id: 'w9', fromComponentId: 'sw_a', fromPinIndex: 0, toComponentId: 'gate_nor', toPinIndex: 0 },
        { id: 'w10', fromComponentId: 'sw_b', fromPinIndex: 0, toComponentId: 'gate_nor', toPinIndex: 1 },

        { id: 'w11', fromComponentId: 'gate_and', fromPinIndex: 0, toComponentId: 'led_and', toPinIndex: 0 },
        { id: 'w12', fromComponentId: 'gate_or', fromPinIndex: 0, toComponentId: 'led_or', toPinIndex: 0 },
        { id: 'w13', fromComponentId: 'gate_xor', fromPinIndex: 0, toComponentId: 'led_xor', toPinIndex: 0 },
        { id: 'w14', fromComponentId: 'gate_nand', fromPinIndex: 0, toComponentId: 'led_nand', toPinIndex: 0 },
        { id: 'w15', fromComponentId: 'gate_nor', fromPinIndex: 0, toComponentId: 'led_nor', toPinIndex: 0 }
      ]
    }
  },

  {
    id: 'half_adder_discrete',
    name: 'Half Adder from Elementary Gates',
    description: 'Demonstrates 1-bit binary addition using an XOR gate (Sum) and an AND gate (Carry).',
    data: {
      version: 1,
      components: [
        { id: 'sw_a', type: 'SWITCH', x: 80, y: 120, label: 'Bit A', state: { value: true } },
        { id: 'sw_b', type: 'SWITCH', x: 80, y: 240, label: 'Bit B', state: { value: true } },

        { id: 'gate_xor', type: 'XOR', x: 260, y: 120, label: 'Sum (XOR)' },
        { id: 'gate_and', type: 'AND', x: 260, y: 240, label: 'Carry (AND)' },

        { id: 'led_sum', type: 'LED', x: 420, y: 120, label: 'Sum (S)', state: { color: '#38bdf8' } },
        { id: 'led_carry', type: 'LED', x: 420, y: 240, label: 'Carry (C)', state: { color: '#10b981' } }
      ],
      wires: [
        { id: 'w1', fromComponentId: 'sw_a', fromPinIndex: 0, toComponentId: 'gate_xor', toPinIndex: 0 },
        { id: 'w2', fromComponentId: 'sw_b', fromPinIndex: 0, toComponentId: 'gate_xor', toPinIndex: 1 },
        { id: 'w3', fromComponentId: 'sw_a', fromPinIndex: 0, toComponentId: 'gate_and', toPinIndex: 0 },
        { id: 'w4', fromComponentId: 'sw_b', fromPinIndex: 0, toComponentId: 'gate_and', toPinIndex: 1 },
        { id: 'w5', fromComponentId: 'gate_xor', fromPinIndex: 0, toComponentId: 'led_sum', toPinIndex: 0 },
        { id: 'w6', fromComponentId: 'gate_and', fromPinIndex: 0, toComponentId: 'led_carry', toPinIndex: 0 }
      ]
    }
  },

  {
    id: 'sr_latch_memory',
    name: '1-Bit Memory Cell (SR Latch)',
    description: 'Cross-coupled NOR gates creating bistable feedback memory: retains 1 bit of state.',
    data: {
      version: 1,
      components: [
        { id: 'sw_reset', type: 'BUTTON', x: 80, y: 120, label: 'Reset (R)', state: { value: false } },
        { id: 'sw_set', type: 'BUTTON', x: 80, y: 240, label: 'Set (S)', state: { value: false } },

        { id: 'nor_top', type: 'NOR', x: 260, y: 110, label: 'NOR 1' },
        { id: 'nor_bottom', type: 'NOR', x: 260, y: 250, label: 'NOR 2' },

        { id: 'led_q', type: 'LED', x: 440, y: 110, label: 'Q (Output)', state: { color: '#10b981' } },
        { id: 'led_qbar', type: 'LED', x: 440, y: 250, label: 'Q\' (Inverse)', state: { color: '#f43f5e' } }
      ],
      wires: [
        { id: 'w1', fromComponentId: 'sw_reset', fromPinIndex: 0, toComponentId: 'nor_top', toPinIndex: 0 },
        { id: 'w2', fromComponentId: 'sw_set', fromPinIndex: 0, toComponentId: 'nor_bottom', toPinIndex: 1 },

        // Cross-coupled feedback wires
        { id: 'w3', fromComponentId: 'nor_bottom', fromPinIndex: 0, toComponentId: 'nor_top', toPinIndex: 1 },
        { id: 'w4', fromComponentId: 'nor_top', fromPinIndex: 0, toComponentId: 'nor_bottom', toPinIndex: 0 },

        // Outputs
        { id: 'w5', fromComponentId: 'nor_top', fromPinIndex: 0, toComponentId: 'led_q', toPinIndex: 0 },
        { id: 'w6', fromComponentId: 'nor_bottom', fromPinIndex: 0, toComponentId: 'led_qbar', toPinIndex: 0 }
      ]
    }
  },

  {
    id: 'counter_7seg',
    name: '4-Bit Ripple Counter with 7-Segment Display',
    description: 'A 2Hz Clock drives chained D Flip-Flops into a 7-Segment Hex Display, counting 0 to F.',
    data: {
      version: 1,
      components: [
        { id: 'clk', type: 'CLOCK', x: 40, y: 170, label: 'Master Clock', state: { frequency: 2 } },

        { id: 'dff0', type: 'D_FLIP_FLOP', x: 180, y: 150, label: 'Bit 0 (1s)' },
        { id: 'dff1', type: 'D_FLIP_FLOP', x: 330, y: 150, label: 'Bit 1 (2s)' },
        { id: 'dff2', type: 'D_FLIP_FLOP', x: 480, y: 150, label: 'Bit 2 (4s)' },
        { id: 'dff3', type: 'D_FLIP_FLOP', x: 630, y: 150, label: 'Bit 3 (8s)' },

        { id: 'seg7', type: 'SEVEN_SEGMENT', x: 800, y: 130, label: 'Hex Display' }
      ],
      wires: [
        // DFF0: Toggle by feeding Q' back to D
        { id: 'w_d0', fromComponentId: 'dff0', fromPinIndex: 1, toComponentId: 'dff0', toPinIndex: 0 },
        { id: 'w_clk0', fromComponentId: 'clk', fromPinIndex: 0, toComponentId: 'dff0', toPinIndex: 1 },

        // DFF1: Clocked by DFF0 Q'
        { id: 'w_d1', fromComponentId: 'dff1', fromPinIndex: 1, toComponentId: 'dff1', toPinIndex: 0 },
        { id: 'w_clk1', fromComponentId: 'dff0', fromPinIndex: 1, toComponentId: 'dff1', toPinIndex: 1 },

        // DFF2: Clocked by DFF1 Q'
        { id: 'w_d2', fromComponentId: 'dff2', fromPinIndex: 1, toComponentId: 'dff2', toPinIndex: 0 },
        { id: 'w_clk2', fromComponentId: 'dff1', fromPinIndex: 1, toComponentId: 'dff2', toPinIndex: 1 },

        // DFF3: Clocked by DFF2 Q'
        { id: 'w_d3', fromComponentId: 'dff3', fromPinIndex: 1, toComponentId: 'dff3', toPinIndex: 0 },
        { id: 'w_clk3', fromComponentId: 'dff2', fromPinIndex: 1, toComponentId: 'dff3', toPinIndex: 1 },

        // Connect Q outputs to 7-segment display inputs D0..D3
        { id: 'w_seg0', fromComponentId: 'dff0', fromPinIndex: 0, toComponentId: 'seg7', toPinIndex: 0 },
        { id: 'w_seg1', fromComponentId: 'dff1', fromPinIndex: 0, toComponentId: 'seg7', toPinIndex: 1 },
        { id: 'w_seg2', fromComponentId: 'dff2', fromPinIndex: 0, toComponentId: 'seg7', toPinIndex: 2 },
        { id: 'w_seg3', fromComponentId: 'dff3', fromPinIndex: 0, toComponentId: 'seg7', toPinIndex: 3 }
      ]
    }
  },

  {
    id: 'mux_selector',
    name: '2:1 Data Multiplexer',
    description: 'Routes either Channel A or Channel B to output depending on Select line.',
    data: {
      version: 1,
      components: [
        { id: 'sw_d0', type: 'SWITCH', x: 80, y: 100, label: 'Data In 0', state: { value: true } },
        { id: 'sw_d1', type: 'SWITCH', x: 80, y: 200, label: 'Data In 1', state: { value: false } },
        { id: 'sw_sel', type: 'SWITCH', x: 80, y: 300, label: 'Select (S)', state: { value: false } },

        { id: 'mux', type: 'MUX_2TO1', x: 280, y: 150, label: '2:1 MUX' },

        { id: 'led_out', type: 'LED', x: 440, y: 160, label: 'Selected Output', state: { color: '#38bdf8' } }
      ],
      wires: [
        { id: 'w1', fromComponentId: 'sw_d0', fromPinIndex: 0, toComponentId: 'mux', toPinIndex: 0 },
        { id: 'w2', fromComponentId: 'sw_d1', fromPinIndex: 0, toComponentId: 'mux', toPinIndex: 1 },
        { id: 'w3', fromComponentId: 'sw_sel', fromPinIndex: 0, toComponentId: 'mux', toPinIndex: 2 },
        { id: 'w4', fromComponentId: 'mux', fromPinIndex: 0, toComponentId: 'led_out', toPinIndex: 0 }
      ]
    }
  }
];
