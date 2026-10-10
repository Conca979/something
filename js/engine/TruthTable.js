/**
 * Automated Truth Table Generator & Boolean Logic Analyzer.
 * Indentation: 2 spaces.
 */

export class TruthTableGenerator {
  /**
   * Evaluates all binary permutations of input switches and records output values.
   * @param {import('./Circuit.js').Circuit} circuit 
   */
  static generate(circuit) {
    // 1. Identify input components (Switches / Buttons)
    const inputComponents = Array.from(circuit.components.values())
      .filter(c => c.type === 'SWITCH' || c.type === 'BUTTON')
      .sort((a, b) => a.x - b.x || a.y - b.y);

    // 2. Identify output components (LEDs / Probes)
    const outputComponents = Array.from(circuit.components.values())
      .filter(c => c.type === 'LED' || c.type === 'PROBE')
      .sort((a, b) => a.x - b.x || a.y - b.y);

    if (inputComponents.length === 0) {
      return {
        error: 'No input switches found in the circuit. Add at least one Toggle Switch to generate a truth table.'
      };
    }

    if (outputComponents.length === 0) {
      return {
        error: 'No output indicators found. Add at least one LED or Logic Probe to generate a truth table.'
      };
    }

    if (inputComponents.length > 7) {
      return {
        error: `Circuit contains ${inputComponents.length} inputs. Truth table analysis is limited to 7 inputs (128 combinations) for performance.`
      };
    }

    // Backup current circuit state
    const originalSnapshot = circuit.toJSON();

    const inputNames = inputComponents.map((c, idx) => c.label || `In ${idx + 1}`);
    const outputNames = outputComponents.map((c, idx) => c.label || `Out ${idx + 1}`);

    const totalCombinations = 1 << inputComponents.length;
    const rows = [];

    // Evaluate each permutation
    for (let i = 0; i < totalCombinations; i++) {
      const inputVals = [];
      for (let bit = inputComponents.length - 1; bit >= 0; bit--) {
        const val = Boolean((i >> bit) & 1);
        inputVals.push(val);
      }

      // Assign input values to switches
      for (let idx = 0; idx < inputComponents.length; idx++) {
        const comp = circuit.components.get(inputComponents[idx].id);
        if (comp) {
          comp.state.value = inputVals[idx];
          comp.outputs[0] = inputVals[idx];
        }
      }

      // Run multiple steps to let signals fully stabilize
      for (let s = 0; s < 5; s++) {
        circuit.step();
      }

      // Read output values
      const outputVals = outputComponents.map(compRef => {
        const comp = circuit.components.get(compRef.id);
        if (!comp) return false;
        if (comp.type === 'LED') return Boolean(comp.state?.lit);
        if (comp.type === 'PROBE') return Boolean(comp.state?.value);
        return false;
      });

      rows.push({
        inputs: inputVals,
        outputs: outputVals
      });
    }

    // Restore original circuit state
    circuit.fromJSON(originalSnapshot, false);

    return {
      success: true,
      inputs: inputNames,
      outputs: outputNames,
      rows
    };
  }

  /**
   * Renders the truth table to a styled HTML table string.
   */
  static toHTML(result) {
    if (!result || result.error) {
      return `<div class="truth-table-error">${result?.error || 'Unable to generate table.'}</div>`;
    }

    let html = '<div class="table-responsive"><table class="truth-table">';
    html += '<thead><tr>';

    // Header inputs
    for (const inName of result.inputs) {
      html += `<th class="th-in">${inName}</th>`;
    }
    // Divider
    html += '<th class="th-divider"></th>';
    // Header outputs
    for (const outName of result.outputs) {
      html += `<th class="th-out">${outName}</th>`;
    }
    html += '</tr></thead><tbody>';

    for (const row of result.rows) {
      html += '<tr>';
      for (const val of row.inputs) {
        html += `<td class="td-in val-${val ? '1' : '0'}">${val ? '1' : '0'}</td>`;
      }
      html += '<td class="td-divider"></td>';
      for (const val of row.outputs) {
        html += `<td class="td-out val-${val ? '1' : '0'}">${val ? '1' : '0'}</td>`;
      }
      html += '</tr>';
    }

    html += '</tbody></table></div>';
    return html;
  }
}
