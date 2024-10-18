import GLPK from 'glpk.js';

export const BESSOptimization = async ({ capacity, power, loadData, energyChargeData, inputs }) => {

  // Extract input values
  const E_cap = capacity;
  const P_max = power;
  const p_D = inputs.find(input => input.name === 'Demand Charge')?.value || 0;
  const p_B = inputs.find(input => input.name === 'Cost of Battery')?.value || 0;
  const p_P = inputs.find(input => input.name === 'Cost of Power Equipment')?.value || 0;
  const p_I = inputs.find(input => input.name === 'Cost of Installation')?.value || 0;
  const kappa = inputs.find(input => input.name === 'Efficiency')?.value / 100 || 1;
  const deg = inputs.find(input => input.name === 'Degradation')?.value / 100 || 0.02;
  const holdingPeriod = inputs.find(input => input.name === 'Holding Period')?.value || 10;
  const SoC_min = 0.1;
  const SoC_max = 0.95;
  const discountRate = inputs.find(input => input.name === 'Discount Rate')?.value / 100 || 0.05;
  const T = 24;
  const delta_T = 1;

  const L_B = loadData.map(item => item.y);
  const p_E = energyChargeData.map(item => item.y);
  // Calculate yearly cost without BESS
  const calculateCostWithoutBattery = () => {
    const dailyEnergyCost = L_B.reduce((sum, load, t) => sum + load * p_E[t] * delta_T, 0);
    const peakDemand = Math.max(...L_B);

    const annualEnergyCost = dailyEnergyCost * 365;
    const annualDemandCharge = peakDemand * 12 * p_D;
    return annualEnergyCost + annualDemandCharge;
  };

  // Update calculateNPV to return the results instead of using state
  const calculateNPV = (annualCostWithBattery) => {
    const annualCostWithoutBattery = calculateCostWithoutBattery();

    const totalInitialCost = p_B * E_cap + p_P * P_max + p_I;
    let npvWithBattery = totalInitialCost;
    let npvWithoutBattery = 0;
    const npvByYear = {
      withBattery: [npvWithBattery],
      withoutBattery: [npvWithoutBattery]
    };

    for (let year = 1; year <= holdingPeriod; year++) {
      npvWithBattery += annualCostWithBattery * Math.pow(1 + deg, year) / Math.pow(1 + discountRate, year);
      npvWithoutBattery += annualCostWithoutBattery / Math.pow(1 + discountRate, year);

      npvByYear.withBattery.push(npvWithBattery);
      npvByYear.withoutBattery.push(npvWithoutBattery);
    }

    return { npvWithBattery, npvByYear };
  };

  // Load GLPK
  let glpk = await GLPK();

  // Prepare the model
  let lp = {
    name: 'BESS Optimization',
    objective: {
      direction: glpk.GLP_MIN,
      name: 'cost',
      vars: []
    },
    subjectTo: [],
    vars: {}
  };

  // Add variables
  // Add variables without bounds
  for (let t = 0; t < T; t++) {
      lp.vars[`L_${t}`] = { name: `L_${t}`, type: glpk.GLP_CV };
      lp.vars[`c_${t}`] = { name: `c_${t}`, type: glpk.GLP_CV };
      lp.vars[`d_${t}`] = { name: `d_${t}`, type: glpk.GLP_CV };
      lp.vars[`E_${t}`] = { name: `E_${t}`, type: glpk.GLP_CV };
  }
  lp.vars['L_max'] = { name: 'L_max', type: glpk.GLP_CV };

  // Add bounds as constraints
  for (let t = 0; t < T; t++) {
      // L_t lower bound
      lp.subjectTo.push({
      name: `L_${t}_lower_bound`,
      vars: [{ name: `L_${t}`, coef: 1 }],
      bnds: { type: glpk.GLP_LO, lb: -1000000}
      });
  
      // c_t bounds
      lp.subjectTo.push({
      name: `c_${t}_bounds`,
      vars: [{ name: `c_${t}`, coef: 1 }],
      bnds: { type: glpk.GLP_DB, lb: 0, ub: P_max }
      });
  
      // d_t bounds
      lp.subjectTo.push({
      name: `d_${t}_bounds`,
      vars: [{ name: `d_${t}`, coef: 1 }],
      bnds: { type: glpk.GLP_DB, lb: 0, ub: P_max }
      });
  
      // E_t bounds
      lp.subjectTo.push({
      name: `E_${t}_bounds`,
      vars: [{ name: `E_${t}`, coef: 1 }],
      bnds: { type: glpk.GLP_DB, lb: SoC_min * E_cap, ub: SoC_max * E_cap }
      });

  }
  
  // L_max lower bound
  lp.subjectTo.push({
      name: 'L_max_lower_bound',
      vars: [{ name: 'L_max', coef: 1 }],
      bnds: { type: glpk.GLP_LO, lb: 0 }
  });

  // Objective function
  lp.objective.vars = [
    { name: 'L_max', coef: 12 * p_D },
    ...Array.from({length: T}, (_, t) => ({ name: `L_${t}`, coef: 365 * p_E[t] * delta_T }))
  ];

    //lp.objective.vars.push({ name: 'const', coef: p_B * E_cap + p_P * P_max + p_I });

  // Add constraints
  for (let t = 0; t < T; t++) {
    // Load balance constraint
    lp.subjectTo.push({
      name: `load_balance_${t}`,
      vars: [
        { name: `L_${t}`, coef: 1 },
        { name: `c_${t}`, coef: -1 },
        { name: `d_${t}`, coef: 1 }
      ],
      bnds: { type: glpk.GLP_FX, ub: L_B[t]+1e-7, lb: L_B[t] }
    });

    // Maximum load constraint
    lp.subjectTo.push({
      name: `max_load_${t}`,
      vars: [
        { name: `L_${t}`, coef: 1 },
        { name: 'L_max', coef: -1 }
      ],
      bnds: { type: glpk.GLP_UP, ub: 0 }
    });

    // Battery energy constraints
      lp.subjectTo.push({
      name: `energy_balance[${t}]`,
      vars: [
          { name: `E_${(t+1) % T}`, coef: 1 },
          { name: `E_${t}`, coef: -1 },
          { name: `c_${t}`, coef: -delta_T * kappa ** 0.5 },
          { name: `d_${t}`, coef: -delta_T * (kappa ** 0.5-2) }
      ],
      bnds: { type: glpk.GLP_FX, ub: 1e-7, lb: 0 }
      });

    // Charging and discharging limits based on SoC
    lp.subjectTo.push({
      name: `soc_charge_${t}`,
      vars: [
        { name: `E_${t}`, coef: 1 },
        { name: `c_${t}`, coef: delta_T * kappa ** 0.5 }
      ],
      bnds: { type: glpk.GLP_UP, ub: SoC_max * E_cap }
    });

    lp.subjectTo.push({
      name: `soc_discharge_${t}`,
      vars: [
        { name: `E_${t}`, coef: 1 },
        { name: `d_${t}`, coef: -delta_T * (2 - kappa ** 0.5) }
      ],
      bnds: { type: glpk.GLP_LO, lb: SoC_min * E_cap }
    });
  }

  // Solve the problem
  try {
    const result = await glpk.solve(lp);

    // Extract results
    const newLoad = Array.from({ length: T }, (_, t) => result.result.vars[`L_${t}`]);
    const energyProfile = Array.from({ length: T }, (_, t) => result.result.vars[`E_${t}`]);
    const SoCProfile = energyProfile.map(E_t => E_t / E_cap);

    const optimalCost = result.result.z;
    const status = result.result.status === glpk.GLP_OPT ? 'Optimal' : 'Not Optimal';

    const npvResults = calculateNPV(optimalCost);

    return {
      status: status,
      optimalCost: optimalCost,
      newLoad: newLoad,
      energyProfile: energyProfile,
      SoCProfile: SoCProfile,
      npv: npvResults.npvWithBattery,
      npvByYear: npvResults.npvByYear,
      capacity: capacity,
      power: power
    };
  } catch (error) {
    console.error('Error solving LP:', error);

    return {
      status: 'Error',
      optimalCost: null,
      newLoad: null,
      energyProfile: null,
      SoCProfile: null,
      npv: null,
      npvByYear: null,
      capacity: capacity,
      power: power,
      error: error.message
    };
  } finally {
    // Always clean up, even if an error occurred
    // Cleanup
    if (glpk && typeof glpk.free === 'function') {
      glpk.free();
    }
    lp = null;
    glpk = null;
  }
};
