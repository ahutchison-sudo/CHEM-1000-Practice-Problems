(function (root, factory) {
  let shell = root.ChemPracticeShell;

  if (typeof module === "object" && module.exports) {
    shell = require("./practice_shell.js");
    module.exports = factory(shell.helpers);
    return;
  }

  root.ChemPracticeConcentrationTopic = factory(shell.helpers);
})(typeof globalThis !== "undefined" ? globalThis : window, function (helpers) {
  "use strict";

  const { randomChoice, formatNumber, formatToSignificantFigures } = helpers;

  const IONIC_COMPOUNDS = [
    ionicCompound("NaCl", 58.44, [{ ion: "Na⁺", count: 1, charge: 1 }, { ion: "Cl⁻", count: 1, charge: 1 }]),
    ionicCompound("KCl", 74.55, [{ ion: "K⁺", count: 1, charge: 1 }, { ion: "Cl⁻", count: 1, charge: 1 }]),
    ionicCompound("CaCl2", 110.98, [{ ion: "Ca²⁺", count: 1, charge: 2 }, { ion: "Cl⁻", count: 2, charge: 1 }]),
    ionicCompound("MgSO4", 120.37, [{ ion: "Mg²⁺", count: 1, charge: 2 }, { ion: "SO₄²⁻", count: 1, charge: 2 }]),
    ionicCompound("Na2SO4", 142.04, [{ ion: "Na⁺", count: 2, charge: 1 }, { ion: "SO₄²⁻", count: 1, charge: 2 }]),
    ionicCompound("Al2(SO4)3", 342.15, [{ ion: "Al³⁺", count: 2, charge: 3 }, { ion: "SO₄²⁻", count: 3, charge: 2 }])
  ];

  const MASS_AMOUNTS = [2.50, 4.80, 7.25, 10.0, 12.5, 18.0, 25.0];
  const VOLUMES_ML = [100, 125, 200, 250, 400, 500];
  const TARGET_MOLARITIES = [0.100, 0.125, 0.200, 0.250, 0.400, 0.500];
  const DENSITIES = [1.02, 1.05, 1.08, 1.10, 1.15, 1.20];
  const WEIGHT_PERCENTS = [2.50, 5.00, 8.00, 10.0, 12.5, 15.0, 20.0];

  const PROBLEM_GENERATORS = {
    "Molarity of an ion from dissolved mass": makeIonMolarityProblem,
    "Mass needed for a target molarity": makeMassForMolarityProblem,
    "Weight percent from density": makeWeightPercentProblem,
    "Solute mass for a target weight percent": makeMassForWeightPercentProblem,
    "Milliequivalents per liter of an ion": makeMilliequivalentsProblem
  };

  // These category weights intentionally follow the requested 50/35/25
  // distribution for molarity, weight percent, and milliequivalents problems.
  const RANDOM_PROBLEM_WEIGHTS = [
    ["Molarity of an ion from dissolved mass", 25],
    ["Mass needed for a target molarity", 25],
    ["Weight percent from density", 17.5],
    ["Solute mass for a target weight percent", 17.5],
    ["Milliequivalents per liter of an ion", 25]
  ];

  function ionicCompound(formula, molarMass, ions) {
    return { formula, molarMass, ions };
  }

  function formulaForDisplay(formula) {
    return formula.replace(/\d/g, (digit) => "₀₁₂₃₄₅₆₇₈₉"[Number(digit)]);
  }

  function amountText(value, decimals) {
    return formatNumber(value, decimals);
  }

  function numericProblem(details) {
    return Object.assign({
      unit: "",
      tolerance: 0.02,
      toleranceKind: "relative",
      expectedSigFigs: 3,
      answerPlaceholder: "Example: 0.250",
      startMessage: "Enter a number. Units are optional, but including them is good practice.",
      solutionLabel: "Concentration solution",
      reasoningLabel: "Concentration reasoning"
    }, details);
  }

  function selectedIon(compound) {
    return randomChoice(compound.ions);
  }

  function makeIonMolarityProblem() {
    const compound = randomChoice(IONIC_COMPOUNDS);
    const ion = selectedIon(compound);
    const mass = randomChoice(MASS_AMOUNTS);
    const volumeMl = randomChoice(VOLUMES_ML);
    const molesCompound = mass / compound.molarMass;
    const answer = molesCompound * ion.count / (volumeMl / 1000);
    const formula = formulaForDisplay(compound.formula);
    const answerText = formatToSignificantFigures(answer, 3);

    return numericProblem({
      topic: "Molarity of an ion from dissolved mass",
      question: mass + " g of " + formula + " is dissolved in water to make " + volumeMl + " mL of solution. What is the molarity of " + ion.ion + "?",
      answer,
      unit: "M",
      answerText,
      firstHint: "Convert grams of the ionic compound to moles, use the formula to find moles of the requested ion, then divide by liters of solution.",
      secondHint: mass + " g " + formula + " × (1 mol " + formula + " / " + amountText(compound.molarMass, 2) + " g " + formula + ") × (" + ion.count + " mol " + ion.ion + " / 1 mol " + formula + ") ÷ " + (volumeMl / 1000) + " L",
      explanation: "The dissolved compound gives " + ion.count + " mol of " + ion.ion + " per mol of " + formula + ". This gives " + answerText + " M " + ion.ion + "."
    });
  }

  function makeMassForMolarityProblem() {
    const compound = randomChoice(IONIC_COMPOUNDS);
    const targetMolarity = randomChoice(TARGET_MOLARITIES);
    const volumeMl = randomChoice(VOLUMES_ML);
    const answer = targetMolarity * (volumeMl / 1000) * compound.molarMass;
    const formula = formulaForDisplay(compound.formula);
    const answerText = formatToSignificantFigures(answer, 3);

    return numericProblem({
      topic: "Mass needed for a target molarity",
      question: "What mass of " + formula + " must be dissolved to prepare " + volumeMl + " mL of a " + amountText(targetMolarity, 3) + " M solution?",
      answer,
      unit: "g",
      answerText,
      firstHint: "Use M = mol/L to find the required moles, then multiply by the molar mass.",
      secondHint: amountText(targetMolarity, 3) + " mol/L × " + (volumeMl / 1000) + " L × " + amountText(compound.molarMass, 2) + " g/mol",
      explanation: "The solution needs " + amountText(targetMolarity * volumeMl / 1000, 4) + " mol of " + formula + ". Multiplying by its molar mass gives " + answerText + " g."
    });
  }

  function makeWeightPercentProblem() {
    const massSolute = randomChoice(MASS_AMOUNTS);
    const volumeMl = randomChoice(VOLUMES_ML);
    const density = randomChoice(DENSITIES);
    const massSolution = density * volumeMl;
    const answer = massSolute / massSolution * 100;
    const answerText = formatToSignificantFigures(answer, 3);

    return numericProblem({
      topic: "Weight percent from density",
      question: "A solution has a density of " + amountText(density, 2) + " g/mL. It contains " + amountText(massSolute, 2) + " g of solute in a final solution volume of " + volumeMl + " mL. What is its weight percent (w/w)?",
      answer,
      unit: "%",
      answerText,
      firstHint: "First use density × final solution volume to find the mass of the entire solution.",
      secondHint: "Mass of solution = " + amountText(density, 2) + " g/mL × " + volumeMl + " mL = " + amountText(massSolution, 2) + " g. Then % w/w = (mass solute / mass solution) × 100.",
      explanation: "The total solution mass is " + amountText(massSolution, 2) + " g. Therefore, (" + amountText(massSolute, 2) + " g / " + amountText(massSolution, 2) + " g) × 100 = " + answerText + "% w/w."
    });
  }

  function makeMassForWeightPercentProblem() {
    const weightPercent = randomChoice(WEIGHT_PERCENTS);
    const volumeMl = randomChoice(VOLUMES_ML);
    const density = randomChoice(DENSITIES);
    const massSolution = density * volumeMl;
    const answer = weightPercent / 100 * massSolution;
    const answerText = formatToSignificantFigures(answer, 3);

    return numericProblem({
      topic: "Solute mass for a target weight percent",
      question: "What mass of solute must be dissolved in water to prepare " + volumeMl + " mL of a " + amountText(weightPercent, 2) + "% (w/w) solution with a density of " + amountText(density, 2) + " g/mL?",
      answer,
      unit: "g",
      answerText,
      firstHint: "Use density × final solution volume to find the total solution mass. Then take the stated percentage of that mass.",
      secondHint: "Mass of solution = " + amountText(density, 2) + " g/mL × " + volumeMl + " mL = " + amountText(massSolution, 2) + " g. Solute mass = (" + amountText(weightPercent, 2) + " / 100) × " + amountText(massSolution, 2) + " g.",
      explanation: "A " + amountText(weightPercent, 2) + "% (w/w) solution contains " + amountText(weightPercent, 2) + " g solute per 100 g solution. The required solute mass is " + answerText + " g."
    });
  }

  function makeMilliequivalentsProblem() {
    const compound = randomChoice(IONIC_COMPOUNDS);
    const ion = selectedIon(compound);
    const mass = randomChoice(MASS_AMOUNTS);
    const volumeMl = randomChoice(VOLUMES_ML);
    const molesIon = mass / compound.molarMass * ion.count;
    const answer = molesIon * ion.charge * 1000 / (volumeMl / 1000);
    const formula = formulaForDisplay(compound.formula);
    const answerText = formatToSignificantFigures(answer, 3);

    return numericProblem({
      topic: "Milliequivalents per liter of an ion",
      question: amountText(mass, 2) + " g of " + formula + " is dissolved in water to make " + volumeMl + " mL of solution. What is the concentration of " + ion.ion + " in mEq/L?",
      answer,
      unit: "mEq/L",
      answerText,
      firstHint: "Find moles of the requested ion, multiply by the magnitude of its charge to get equivalents, convert to milliequivalents, then divide by liters.",
      secondHint: amountText(mass, 2) + " g " + formula + " × (1 mol " + formula + " / " + amountText(compound.molarMass, 2) + " g) × (" + ion.count + " mol " + ion.ion + " / 1 mol " + formula + ") × (" + ion.charge + " Eq / 1 mol " + ion.ion + ") × (1000 mEq / 1 Eq) ÷ " + (volumeMl / 1000) + " L",
      explanation: ion.ion + " has a charge magnitude of " + ion.charge + ", so each mole of " + ion.ion + " contributes " + ion.charge + " equivalents. The concentration is " + answerText + " mEq/L."
    });
  }

  return {
    id: "concentration-problems",
    name: "Concentration Problems",
    description: "Practice molarity, weight percent, and milliequivalents-per-liter calculations.",
    randomLabel: "random concentration problem",
    problemGenerators: PROBLEM_GENERATORS,
    randomWeights: RANDOM_PROBLEM_WEIGHTS,
    publicData: { CONCENTRATION_IONIC_COMPOUNDS: IONIC_COMPOUNDS }
  };
});
