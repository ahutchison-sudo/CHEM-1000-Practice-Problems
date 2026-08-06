(function (root, factory) {
  let shell = root.ChemPracticeShell;

  if (typeof module === "object" && module.exports) {
    shell = require("../practice_shell.js");
    module.exports = factory(shell.helpers);
    return;
  }

  root.ChemPracticeStoichiometryTopic = factory(shell.helpers);
})(typeof globalThis !== "undefined" ? globalThis : window, function (helpers) {
  "use strict";

  const { randomChoice, formatNumber, formatToSignificantFigures } = helpers;

  const SUBSCRIPT_DIGITS = {
    "0": "\u2080",
    "1": "\u2081",
    "2": "\u2082",
    "3": "\u2083",
    "4": "\u2084",
    "5": "\u2085",
    "6": "\u2086",
    "7": "\u2087",
    "8": "\u2088",
    "9": "\u2089"
  };

  // These atomic masses are rounded to the level commonly used in CHEM 1000.
  // The answer checker still allows small differences if a student uses a
  // slightly different periodic table.
  const ATOMIC_MASSES = {
    H: 1.008,
    C: 12.01,
    N: 14.01,
    O: 16.00,
    F: 19.00,
    Na: 22.99,
    Mg: 24.31,
    Al: 26.98,
    Si: 28.09,
    P: 30.97,
    S: 32.07,
    Cl: 35.45,
    K: 39.10,
    Ca: 40.08,
    Fe: 55.85,
    Cu: 63.55,
    Zn: 65.38,
    Br: 79.90,
    Ag: 107.87,
    I: 126.90,
    Ba: 137.33,
    Pb: 207.2
  };

  const COMPOUNDS = [
    compound("H2O"),
    compound("CO2"),
    compound("NaCl"),
    compound("CaCO3"),
    compound("Al2O3"),
    compound("C6H12O6"),
    compound("MgSO4"),
    compound("NH3"),
    compound("Fe2O3"),
    compound("H2SO4"),
    compound("NaHCO3"),
    compound("Ca(OH)2"),
    compound("KClO3"),
    compound("C2H5OH"),
    compound("O2"),
    compound("N2"),
    compound("CH4"),
    compound("HCl"),
    compound("NaOH"),
    compound("CaCl2")
  ];

  const GRAM_AMOUNTS = [
    measuredAmount(5.25, "5.25", 3),
    measuredAmount(8.40, "8.40", 3),
    measuredAmount(12.5, "12.5", 3),
    measuredAmount(18.75, "18.75", 4),
    measuredAmount(25.0, "25.0", 3),
    measuredAmount(36.0, "36.0", 3),
    measuredAmount(50.0, "50.0", 3),
    measuredAmount(75.0, "75.0", 3),
    measuredAmount(125.0, "125.0", 4)
  ];

  const MOLE_AMOUNTS = [
    measuredAmount(0.125, "0.125", 3),
    measuredAmount(0.250, "0.250", 3),
    measuredAmount(0.500, "0.500", 3),
    measuredAmount(0.750, "0.750", 3),
    measuredAmount(1.25, "1.25", 3),
    measuredAmount(2.50, "2.50", 3),
    measuredAmount(3.75, "3.75", 3)
  ];

  const REACTIONS = [
    reaction([species("H2", 2), species("O2", 1)], [species("H2O", 2)]),
    reaction([species("N2", 1), species("H2", 3)], [species("NH3", 2)]),
    reaction([species("Fe", 4), species("O2", 3)], [species("Fe2O3", 2)]),
    reaction([species("CH4", 1), species("O2", 2)], [species("CO2", 1), species("H2O", 2)]),
    reaction([species("C3H8", 1), species("O2", 5)], [species("CO2", 3), species("H2O", 4)]),
    reaction([species("KClO3", 2)], [species("KCl", 2), species("O2", 3)]),
    reaction([species("CaCO3", 1), species("HCl", 2)], [species("CaCl2", 1), species("H2O", 1), species("CO2", 1)]),
    reaction([species("Al", 2), species("Cl2", 3)], [species("AlCl3", 2)]),
    reaction([species("Na", 2), species("Cl2", 1)], [species("NaCl", 2)]),
    reaction([species("Mg", 2), species("O2", 1)], [species("MgO", 2)]),
    reaction([species("H2O2", 2)], [species("H2O", 2), species("O2", 1)]),
    reaction([species("C2H6", 2), species("O2", 7)], [species("CO2", 4), species("H2O", 6)])
  ];

  const PROBLEM_GENERATORS = {
    "Molar mass from formula": makeMolarMassProblem,
    "Grams to moles": makeGramsToMolesProblem,
    "Moles to grams": makeMolesToGramsProblem,
    "Mass-to-mass stoichiometry": makeMassToMassProblem
  };

  const RANDOM_PROBLEM_WEIGHTS = [
    ["Molar mass from formula", 20],
    ["Grams to moles", 20],
    ["Moles to grams", 20],
    ["Mass-to-mass stoichiometry", 40]
  ];

  function compound(formula) {
    return {
      formula
    };
  }

  function measuredAmount(value, text, sigFigs) {
    return {
      value,
      text,
      sigFigs
    };
  }

  function species(formula, coefficient) {
    return {
      formula,
      coefficient
    };
  }

  function reaction(reactants, products) {
    return {
      reactants,
      products,
      allSpecies: reactants.concat(products)
    };
  }

  function formulaForDisplay(formula) {
    return formula.replace(/\d/g, (digit) => SUBSCRIPT_DIGITS[digit]);
  }

  function coefficientFormulaText(item) {
    const coefficientText = item.coefficient === 1 ? "" : `${item.coefficient} `;
    return `${coefficientText}${formulaForDisplay(item.formula)}`;
  }

  function equationText(item) {
    const reactantText = item.reactants.map(coefficientFormulaText).join(" + ");
    const productText = item.products.map(coefficientFormulaText).join(" + ");
    return `${reactantText} -> ${productText}`;
  }

  function readNumber(formula, startIndex) {
    let index = startIndex;
    let digits = "";

    while (index < formula.length && /\d/.test(formula[index])) {
      digits += formula[index];
      index += 1;
    }

    return {
      value: digits ? Number(digits) : 1,
      nextIndex: index
    };
  }

  function addAtomCount(counts, element, amount) {
    counts[element] = (counts[element] || 0) + amount;
  }

  function addGroupCounts(targetCounts, groupCounts, multiplier) {
    for (const element of Object.keys(groupCounts)) {
      addAtomCount(targetCounts, element, groupCounts[element] * multiplier);
    }
  }

  // This reads a chemical formula into element counts. It supports the simple
  // formulas students see here, including parentheses such as Ca(OH)2.
  function parseFormula(formula) {
    const stack = [{}];
    let index = 0;

    while (index < formula.length) {
      const character = formula[index];

      if (character === "(") {
        stack.push({});
        index += 1;
        continue;
      }

      if (character === ")") {
        const groupCounts = stack.pop();
        const multiplierInfo = readNumber(formula, index + 1);
        addGroupCounts(stack[stack.length - 1], groupCounts, multiplierInfo.value);
        index = multiplierInfo.nextIndex;
        continue;
      }

      if (/[A-Z]/.test(character)) {
        let element = character;
        index += 1;

        if (index < formula.length && /[a-z]/.test(formula[index])) {
          element += formula[index];
          index += 1;
        }

        const amountInfo = readNumber(formula, index);
        addAtomCount(stack[stack.length - 1], element, amountInfo.value);
        index = amountInfo.nextIndex;
        continue;
      }

      throw new Error(`Could not read the formula ${formula}.`);
    }

    if (stack.length !== 1) {
      throw new Error(`Formula ${formula} has unmatched parentheses.`);
    }

    return stack[0];
  }

  function molarMass(formula) {
    const counts = parseFormula(formula);
    let total = 0;

    for (const element of Object.keys(counts)) {
      if (!ATOMIC_MASSES[element]) {
        throw new Error(`No atomic mass is listed for ${element}.`);
      }
      total += counts[element] * ATOMIC_MASSES[element];
    }

    return total;
  }

  function molarMassText(formula) {
    return formatToSignificantFigures(molarMass(formula), 4);
  }
  function exampleAnswerPlaceholder(unit) {
    if (unit === "mol") {
      return "Example: 0.725 mol";
    }

    if (unit === "g/mol") {
      return "Example: 25.0 g/mol";
    }

    if (unit === "g") {
      return "Example: 25.0 g";
    }

    return "Example: 25.0";
  }

  function makeNumericProblem({
    topic,
    question,
    answer,
    unit,
    answerText,
    expectedSigFigs,
    firstHint,
    secondHint,
    explanation
  }) {
    return {
      topic,
      question,
      answer,
      unit,
      answerText,
      expectedSigFigs,
      firstHint,
      secondHint,
      explanation,
      tolerance: 0.02,
      toleranceKind: "relative",
      answerPlaceholder: exampleAnswerPlaceholder(unit),
      startMessage: "Enter a number. Units are optional, but including them is good practice.",
      solutionLabel: "Stoichiometry solution",
      reasoningLabel: "Stoichiometry reasoning"
    };
  }

  function makeMolarMassProblem() {
    const item = randomChoice(COMPOUNDS);
    const displayedFormula = formulaForDisplay(item.formula);
    const mass = molarMass(item.formula);
    const answerText = formatToSignificantFigures(mass, 4);

    return makeNumericProblem({
      topic: "Molar mass from formula",
      question: `Determine the molar mass of:\n\n${displayedFormula}`,
      answer: mass,
      unit: "g/mol",
      answerText,
      expectedSigFigs: 4,
      firstHint: "Add the atomic masses for every atom in the formula. Subscripts tell you how many atoms of that element are present.",
      secondHint: `Set up the sum using the formula ${displayedFormula}. Multiply each atomic mass by its subscript, then add the results.`,
      explanation: `The molar mass of ${displayedFormula} is found by adding the atomic masses for all atoms in the formula. Using the rounded atomic masses in this app gives ${answerText} g/mol.`
    });
  }

  function makeGramsToMolesProblem() {
    const item = randomChoice(COMPOUNDS);
    const grams = randomChoice(GRAM_AMOUNTS);
    const mass = molarMass(item.formula);
    const answer = grams.value / mass;
    const answerText = formatToSignificantFigures(answer, grams.sigFigs);
    const displayedFormula = formulaForDisplay(item.formula);
    const massText = molarMassText(item.formula);

    return makeNumericProblem({
      topic: "Grams to moles",
      question: `How many moles of ${displayedFormula} are in ${grams.text} g of ${displayedFormula}?`,
      answer,
      unit: "mol",
      answerText,
      expectedSigFigs: grams.sigFigs,
      firstHint: "Use molar mass as the conversion factor between grams and moles.",
      secondHint: `${grams.text} g ${displayedFormula} x (1 mol ${displayedFormula} / ${massText} g ${displayedFormula})`,
      explanation: `${grams.text} g ${displayedFormula} x (1 mol ${displayedFormula} / ${massText} g ${displayedFormula}) = ${answerText} mol ${displayedFormula}.`
    });
  }

  function makeMolesToGramsProblem() {
    const item = randomChoice(COMPOUNDS);
    const moles = randomChoice(MOLE_AMOUNTS);
    const mass = molarMass(item.formula);
    const answer = moles.value * mass;
    const answerText = formatToSignificantFigures(answer, moles.sigFigs);
    const displayedFormula = formulaForDisplay(item.formula);
    const massText = molarMassText(item.formula);

    return makeNumericProblem({
      topic: "Moles to grams",
      question: `What mass in grams is ${moles.text} mol of ${displayedFormula}?`,
      answer,
      unit: "g",
      answerText,
      expectedSigFigs: moles.sigFigs,
      firstHint: "Use molar mass as grams per 1 mole of the compound.",
      secondHint: `${moles.text} mol ${displayedFormula} x (${massText} g ${displayedFormula} / 1 mol ${displayedFormula})`,
      explanation: `${moles.text} mol ${displayedFormula} x (${massText} g ${displayedFormula} / 1 mol ${displayedFormula}) = ${answerText} g ${displayedFormula}.`
    });
  }

  function makeMassToMassProblem() {
    const item = randomChoice(REACTIONS);
    const given = randomChoice(item.allSpecies);
    const possibleTargets = item.allSpecies.filter((candidate) => candidate.formula !== given.formula);
    const target = randomChoice(possibleTargets);
    const grams = randomChoice(GRAM_AMOUNTS);
    const givenMass = molarMass(given.formula);
    const targetMass = molarMass(target.formula);
    const molesGiven = grams.value / givenMass;
    const molesTarget = molesGiven * target.coefficient / given.coefficient;
    const answer = molesTarget * targetMass;
    const answerText = formatToSignificantFigures(answer, grams.sigFigs);
    const givenFormula = formulaForDisplay(given.formula);
    const targetFormula = formulaForDisplay(target.formula);
    const equation = equationText(item);
    const givenMassText = molarMassText(given.formula);
    const targetMassText = molarMassText(target.formula);

    return makeNumericProblem({
      topic: "Mass-to-mass stoichiometry",
      question: `Use this balanced equation:\n\n${equation}\n\nIf you have ${grams.text} g of ${givenFormula}, what mass of ${targetFormula} corresponds to that amount?`,
      answer,
      unit: "g",
      answerText,
      expectedSigFigs: grams.sigFigs,
      firstHint: "Use the path grams given -> moles given -> moles wanted -> grams wanted.",
      secondHint: `${grams.text} g ${givenFormula} x (1 mol ${givenFormula} / ${givenMassText} g ${givenFormula}) x (${target.coefficient} mol ${targetFormula} / ${given.coefficient} mol ${givenFormula}) x (${targetMassText} g ${targetFormula} / 1 mol ${targetFormula})`,
      explanation: `${grams.text} g ${givenFormula} x (1 mol ${givenFormula} / ${givenMassText} g ${givenFormula}) x (${target.coefficient} mol ${targetFormula} / ${given.coefficient} mol ${givenFormula}) x (${targetMassText} g ${targetFormula} / 1 mol ${targetFormula}) = ${answerText} g ${targetFormula}.`
    });
  }

  return {
    id: "simple-stoichiometry",
    name: "Simple stoichiometry",
    description: "Practice molar masses, grams-to-moles, moles-to-grams, and mass-to-mass calculations from balanced equations.",
    randomLabel: "random stoichiometry problem",
    problemGenerators: PROBLEM_GENERATORS,
    randomWeights: RANDOM_PROBLEM_WEIGHTS,
    publicData: {
      STOICHIOMETRY_COMPOUNDS: COMPOUNDS,
      STOICHIOMETRY_REACTIONS: REACTIONS,
      STOICHIOMETRY_RANDOM_PROBLEM_WEIGHTS: RANDOM_PROBLEM_WEIGHTS
    }
  };
});



