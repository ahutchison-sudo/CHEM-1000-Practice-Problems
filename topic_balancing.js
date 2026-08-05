(function (root, factory) {
  let shell = root.ChemPracticeShell;

  if (typeof module === "object" && module.exports) {
    shell = require("./practice_shell.js");
    module.exports = factory(shell.helpers);
    return;
  }

  root.ChemPracticeBalancingTopic = factory(shell.helpers);
})(typeof globalThis !== "undefined" ? globalThis : window, function (helpers) {
  "use strict";

  const { randomChoice } = helpers;

  // Each reaction stores formulas without coefficients plus the smallest whole-number
  // coefficient set. All coefficients in this bank are 15 or less.
  const SIMPLE_REACTIONS = [
    reaction(["H2", "O2"], ["H2O"], [2, 1, 2], "Balance hydrogen first, then oxygen."),
    reaction(["N2", "H2"], ["NH3"], [1, 3, 2], "Nitrogen appears in one formula on each side, so start with N2 and NH3."),
    reaction(["Fe", "O2"], ["Fe2O3"], [4, 3, 2], "Oxygen is paired as O2 on the left and O3 in Fe2O3, so use a common multiple of 2 and 3."),
    reaction(["Al", "O2"], ["Al2O3"], [4, 3, 2], "Oxygen is paired as O2 on the left and O3 in Al2O3, so use a common multiple of 2 and 3."),
    reaction(["Na", "Cl2"], ["NaCl"], [2, 1, 2], "Chlorine is diatomic on the left, so make two NaCl formula units on the right."),
    reaction(["P4", "O2"], ["P2O5"], [1, 5, 2], "Start with phosphorus, then balance oxygen."),
    reaction(["Li", "N2"], ["Li3N"], [6, 1, 2], "Nitrogen is diatomic on the left, so make two Li3N formula units on the right."),
    reaction(["KClO3"], ["KCl", "O2"], [2, 2, 3], "Oxygen appears as 3 in KClO3 and 2 in O2, so use a common multiple of 3 and 2."),
    reaction(["H2O2"], ["H2O", "O2"], [2, 2, 1], "Balance oxygen after matching the hydrogen atoms."),
    reaction(["HgO"], ["Hg", "O2"], [2, 2, 1], "Oxygen is diatomic on the right, so use two HgO formula units on the left.")
  ];

  const SINGLE_REPLACEMENT_REACTIONS = [
    reaction(["Mg", "HCl"], ["MgCl2", "H2"], [1, 2, 1, 1], "MgCl2 contains two chlorine atoms, so start by placing 2 before HCl."),
    reaction(["Zn", "HCl"], ["ZnCl2", "H2"], [1, 2, 1, 1], "ZnCl2 contains two chlorine atoms, so start by placing 2 before HCl."),
    reaction(["Al", "HCl"], ["AlCl3", "H2"], [2, 6, 2, 3], "Balance chlorine and hydrogen after making the aluminum atoms match."),
    reaction(["Na", "H2O"], ["NaOH", "H2"], [2, 2, 2, 1], "Hydrogen appears in both NaOH and H2 on the product side, so check H last."),
    reaction(["Ca", "H2O"], ["Ca(OH)2", "H2"], [1, 2, 1, 1], "Ca(OH)2 has two OH groups, so use two water molecules."),
    reaction(["Fe", "CuSO4"], ["FeSO4", "Cu"], [1, 1, 1, 1], "This reaction is already balanced with one of each formula."),
    reaction(["Cl2", "KI"], ["KCl", "I2"], [1, 2, 2, 1], "The halogens are diatomic as elements, so balance iodine and chlorine as pairs.")
  ];

  const DOUBLE_REPLACEMENT_REACTIONS = [
    reaction(["BaCl2", "Na2SO4"], ["BaSO4", "NaCl"], [1, 1, 1, 2], "Treat SO4 as a group because it stays together on both sides."),
    reaction(["Pb(NO3)2", "KI"], ["PbI2", "KNO3"], [1, 2, 1, 2], "Treat NO3 as a group because it stays together on both sides."),
    reaction(["FeCl3", "NaOH"], ["Fe(OH)3", "NaCl"], [1, 3, 1, 3], "Fe(OH)3 has three OH groups, so use three NaOH formula units."),
    reaction(["Al2(SO4)3", "Ca(OH)2"], ["Al(OH)3", "CaSO4"], [1, 3, 2, 3], "Keep SO4 together and OH together while balancing the metal atoms."),
    reaction(["AgNO3", "NaCl"], ["AgCl", "NaNO3"], [1, 1, 1, 1], "This double-replacement equation is already balanced with one of each formula."),
    reaction(["Na2CO3", "HCl"], ["NaCl", "H2O", "CO2"], [1, 2, 2, 1, 1], "Start with sodium and chlorine, then check hydrogen and oxygen."),
    reaction(["CaCO3", "HCl"], ["CaCl2", "H2O", "CO2"], [1, 2, 1, 1, 1], "CaCl2 contains two chlorine atoms, so place 2 before HCl."),
    reaction(["H3PO4", "NaOH"], ["Na3PO4", "H2O"], [1, 3, 1, 3], "Na3PO4 needs three sodium atoms, so use three NaOH formula units."),
    reaction(["Ca(OH)2", "HCl"], ["CaCl2", "H2O"], [1, 2, 1, 2], "CaCl2 needs two chloride ions, and Ca(OH)2 has two OH groups.")
  ];

  const COMBUSTION_REACTIONS = [
    reaction(["CH4", "O2"], ["CO2", "H2O"], [1, 2, 1, 2], "For combustion, balance carbon first, hydrogen second, and oxygen last."),
    reaction(["C3H8", "O2"], ["CO2", "H2O"], [1, 5, 3, 4], "For combustion, balance carbon first, hydrogen second, and oxygen last."),
    reaction(["C2H6", "O2"], ["CO2", "H2O"], [2, 7, 4, 6], "When oxygen would need a fraction, double all coefficients to make whole numbers."),
    reaction(["C2H5OH", "O2"], ["CO2", "H2O"], [1, 3, 2, 3], "Ethanol already contains oxygen, so include that oxygen when balancing O last."),
    reaction(["C4H10", "O2"], ["CO2", "H2O"], [2, 13, 8, 10], "Butane gives a fractional oxygen coefficient at first; double all coefficients."),
    reaction(["C2H4", "O2"], ["CO2", "H2O"], [1, 3, 2, 2], "Balance carbon first, hydrogen second, and oxygen last."),
    reaction(["C6H12O6", "O2"], ["CO2", "H2O"], [1, 6, 6, 6], "Glucose already contains oxygen, so count those oxygen atoms before choosing O2.")
  ];

  const OTHER_COMMON_REACTIONS = [
    reaction(["NH3", "O2"], ["NO", "H2O"], [4, 5, 4, 6], "Balance nitrogen first, hydrogen second, and oxygen last."),
    reaction(["SO2", "O2"], ["SO3"], [2, 1, 2], "Use two SO3 formula units so oxygen can be balanced with whole numbers."),
    reaction(["NO", "O2"], ["NO2"], [2, 1, 2], "Balance nitrogen first, then oxygen."),
    reaction(["H2S", "O2"], ["SO2", "H2O"], [2, 3, 2, 2], "Balance sulfur first, hydrogen second, and oxygen last."),
    reaction(["NaOH", "H2SO4"], ["Na2SO4", "H2O"], [2, 1, 1, 2], "Na2SO4 needs two sodium atoms, so start with 2 NaOH.")
  ];

  const PROBLEM_GROUPS = {
    "Simple synthesis/decomposition": SIMPLE_REACTIONS,
    "Single replacement": SINGLE_REPLACEMENT_REACTIONS,
    "Double replacement and acid reactions": DOUBLE_REPLACEMENT_REACTIONS,
    "Combustion reactions": COMBUSTION_REACTIONS,
    "Other common reactions": OTHER_COMMON_REACTIONS
  };

  const PROBLEM_GENERATORS = {
    "Simple synthesis/decomposition": () => makeBalancingProblem("Simple synthesis/decomposition", SIMPLE_REACTIONS),
    "Single replacement": () => makeBalancingProblem("Single replacement", SINGLE_REPLACEMENT_REACTIONS),
    "Double replacement and acid reactions": () => makeBalancingProblem("Double replacement and acid reactions", DOUBLE_REPLACEMENT_REACTIONS),
    "Combustion reactions": () => makeBalancingProblem("Combustion reactions", COMBUSTION_REACTIONS),
    "Other common reactions": () => makeBalancingProblem("Other common reactions", OTHER_COMMON_REACTIONS)
  };

  const RANDOM_PROBLEM_WEIGHTS = [
    ["Simple synthesis/decomposition", 25],
    ["Single replacement", 15],
    ["Double replacement and acid reactions", 25],
    ["Combustion reactions", 25],
    ["Other common reactions", 10]
  ];

  function reaction(reactants, products, coefficients, hint) {
    return {
      reactants,
      products,
      coefficients,
      hint
    };
  }

  function unbalancedEquation(reactionData) {
    return `${reactionData.reactants.join(" + ")} -> ${reactionData.products.join(" + ")}`;
  }

  function formulaWithCoefficient(coefficient, formula) {
    return coefficient === 1 ? formula : `${coefficient} ${formula}`;
  }

  function balancedEquation(reactionData) {
    const reactantText = reactionData.reactants
      .map((formula, index) => formulaWithCoefficient(reactionData.coefficients[index], formula))
      .join(" + ");
    const productStart = reactionData.reactants.length;
    const productText = reactionData.products
      .map((formula, index) => formulaWithCoefficient(reactionData.coefficients[productStart + index], formula))
      .join(" + ");
    return `${reactantText} -> ${productText}`;
  }

  function coefficientListText(coefficients) {
    return coefficients.join(", ");
  }

  function coefficientLabels(reactionData) {
    return reactionData.reactants.concat(reactionData.products);
  }

  function coefficientGuide(reactionData) {
    return coefficientLabels(reactionData)
      .map((formula, index) => `${index + 1}. ${formula}`)
      .join("; ");
  }

  function makeBalancingProblem(topic, reactions) {
    const reactionData = randomChoice(reactions);
    const answerList = coefficientListText(reactionData.coefficients);
    const balanced = balancedEquation(reactionData);
    const guide = coefficientGuide(reactionData);

    return {
      topic,
      answerType: "coefficients",
      question: `Balance this chemical equation. Enter the coefficients in order.\n\n${unbalancedEquation(reactionData)}`,
      coefficients: reactionData.coefficients,
      coefficientLabels: coefficientLabels(reactionData),
      answerText: `${answerList}\nBalanced equation: ${balanced}`,
      unit: "",
      firstHint: reactionData.hint,
      secondHint: `Use this coefficient order: ${guide}. Remember to enter 1 for any formula that does not need a visible coefficient.`,
      explanation: `Coefficients: ${answerList}\nBalanced equation: ${balanced}\n\nThe coefficient set is the smallest whole-number ratio, and each element has the same number of atoms on both sides of the equation.`,
      answerPlaceholder: "Example: 2, 1, 2",
      startMessage: `Enter coefficients only, separated by commas or spaces. Use 1 for formulas that do not need a visible coefficient.\n\nCoefficient order: ${guide}`,
      solutionLabel: "Balancing solution",
      reasoningLabel: "Balancing reasoning"
    };
  }

  return {
    id: "balancing-chemical-reactions",
    name: "Balancing chemical reactions",
    description: "Practice finding the smallest whole-number coefficients for chemical equations.",
    randomLabel: "random balancing problem",
    problemGenerators: PROBLEM_GENERATORS,
    randomWeights: RANDOM_PROBLEM_WEIGHTS,
    publicData: {
      BALANCING_PROBLEM_GROUPS: PROBLEM_GROUPS,
      BALANCING_RANDOM_PROBLEM_WEIGHTS: RANDOM_PROBLEM_WEIGHTS
    }
  };
});
