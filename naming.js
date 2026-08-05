(function (root, factory) {
  let shell = root.ChemPracticeShell;

  if (typeof module === "object" && module.exports) {
    shell = require("../practice_shell.js");
    module.exports = factory(shell.helpers);
    return;
  }

  root.ChemPracticeNamingTopic = factory(shell.helpers);
})(typeof globalThis !== "undefined" ? globalThis : window, function (helpers) {
  "use strict";

  const { randomChoice } = helpers;

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

  const FIXED_IONIC_HINT = "This is ionic because it contains a metal and a nonmetal. The metal has a fixed charge, so use no Roman numeral and no Greek prefixes.";
  const VARIABLE_IONIC_HINT = "This is ionic because it contains a metal and a nonmetal. The metal can form more than one ion, so use a Roman numeral for the metal charge. Do not use Greek prefixes.";
  const POLYATOMIC_HINT = "This is ionic and contains a polyatomic ion from the course list. Keep the polyatomic ion name unchanged; use a Roman numeral only if the metal needs one.";
  const COVALENT_HINT = "Both elements are nonmetals, so this is covalent. Use Greek prefixes. Do not use mono- on the first element; change the second element ending to -ide.";
  const DIATOMIC_HINT = "This is one of the seven common diatomic elements. Use the element name, not Greek-prefix compound naming.";

  const FIXED_CHARGE_IONIC_COMPOUNDS = [
    compound("LiF", "lithium fluoride"),
    compound("NaCl", "sodium chloride"),
    compound("KBr", "potassium bromide"),
    compound("MgCl2", "magnesium chloride"),
    compound("CaO", "calcium oxide"),
    compound("BaS", "barium sulfide"),
    compound("Al2O3", "aluminum oxide"),
    compound("AlCl3", "aluminum chloride"),
    compound("Ca3N2", "calcium nitride"),
    compound("Na3P", "sodium phosphide"),
    compound("SrI2", "strontium iodide"),
    compound("Mg3P2", "magnesium phosphide")
  ];

  const VARIABLE_CHARGE_IONIC_COMPOUNDS = [
    compound("FeCl2", "iron(II) chloride", [], "Each chloride is -1, so two chlorides give -2. Iron must be +2."),
    compound("FeCl3", "iron(III) chloride", [], "Each chloride is -1, so three chlorides give -3. Iron must be +3."),
    compound("CuCl", "copper(I) chloride", [], "Chloride is -1, so copper must be +1."),
    compound("CuCl2", "copper(II) chloride", [], "Each chloride is -1, so two chlorides give -2. Copper must be +2."),
    compound("Cu2O", "copper(I) oxide", [], "Oxide is -2. Two copper ions must total +2, so each copper is +1."),
    compound("CuO", "copper(II) oxide", [], "Oxide is -2, so copper must be +2."),
    compound("SnO", "tin(II) oxide", [], "Oxide is -2, so tin must be +2."),
    compound("SnO2", "tin(IV) oxide", [], "Two oxide ions total -4, so tin must be +4."),
    compound("PbCl2", "lead(II) chloride", [], "Each chloride is -1, so lead must be +2."),
    compound("PbO2", "lead(IV) oxide", [], "Two oxide ions total -4, so lead must be +4."),
    compound("CoCl2", "cobalt(II) chloride", [], "Each chloride is -1, so cobalt must be +2."),
    compound("Cr2O3", "chromium(III) oxide", [], "Three oxide ions total -6. Two chromium ions must total +6, so each chromium is +3."),
    compound("MnO2", "manganese(IV) oxide", [], "Two oxide ions total -4, so manganese must be +4.")
  ];

  const POLYATOMIC_IONIC_COMPOUNDS = [
    compound("NaOH", "sodium hydroxide"),
    compound("NH4Cl", "ammonium chloride"),
    compound("(NH4)2SO4", "ammonium sulfate"),
    compound("KNO3", "potassium nitrate"),
    compound("NaNO2", "sodium nitrite"),
    compound("KClO3", "potassium chlorate"),
    compound("NaClO2", "sodium chlorite"),
    compound("CaCO3", "calcium carbonate"),
    compound("NaHCO3", "sodium hydrogen carbonate", ["sodium bicarbonate"]),
    compound("NaCN", "sodium cyanide"),
    compound("NaC2H3O2", "sodium acetate"),
    compound("Ca(C2H3O2)2", "calcium acetate"),
    compound("NaC3H5O3", "sodium lactate"),
    compound("MgSO4", "magnesium sulfate"),
    compound("NaHSO4", "sodium hydrogen sulfate", ["sodium bisulfate"]),
    compound("Na2SO3", "sodium sulfite"),
    compound("NaHSO3", "sodium hydrogen sulfite", ["sodium bisulfite"]),
    compound("Ca3(PO4)2", "calcium phosphate"),
    compound("Na2HPO4", "sodium hydrogen phosphate"),
    compound("NaH2PO4", "sodium dihydrogen phosphate"),
    compound("Ca3(PO3)2", "calcium phosphite"),
    compound("KMnO4", "potassium permanganate"),
    compound("FeSO4", "iron(II) sulfate", [], "Sulfate is -2, so iron must be +2."),
    compound("Fe2(SO4)3", "iron(III) sulfate", [], "Three sulfate ions total -6. Two iron ions must total +6, so each iron is +3.")
  ];

  const DIATOMIC_ELEMENTS = [
    compound("H2", "hydrogen", ["hydrogen gas"]),
    compound("N2", "nitrogen", ["nitrogen gas"]),
    compound("O2", "oxygen", ["oxygen gas"]),
    compound("F2", "fluorine", ["fluorine gas"]),
    compound("Cl2", "chlorine", ["chlorine gas"]),
    compound("Br2", "bromine"),
    compound("I2", "iodine")
  ];

  const BINARY_COVALENT_COMPOUNDS = [
    compound("CO", "carbon monoxide"),
    compound("CO2", "carbon dioxide"),
    compound("N2O", "dinitrogen monoxide"),
    compound("NO", "nitrogen monoxide", ["nitric oxide"]),
    compound("NO2", "nitrogen dioxide"),
    compound("N2O3", "dinitrogen trioxide"),
    compound("N2O4", "dinitrogen tetroxide"),
    compound("N2O5", "dinitrogen pentoxide"),
    compound("SF6", "sulfur hexafluoride"),
    compound("SO2", "sulfur dioxide"),
    compound("SO3", "sulfur trioxide"),
    compound("PCl3", "phosphorus trichloride"),
    compound("PCl5", "phosphorus pentachloride"),
    compound("CCl4", "carbon tetrachloride"),
    compound("CS2", "carbon disulfide"),
    compound("SiO2", "silicon dioxide"),
    compound("BF3", "boron trifluoride"),
    compound("IF5", "iodine pentafluoride"),
    compound("Cl2O", "dichlorine monoxide"),
    compound("Cl2O7", "dichlorine heptoxide"),
    compound("P2O5", "diphosphorus pentoxide")
  ];

  const PROBLEM_GROUPS = {
    "Fixed-charge ionic compounds": FIXED_CHARGE_IONIC_COMPOUNDS,
    "Variable-charge ionic compounds": VARIABLE_CHARGE_IONIC_COMPOUNDS,
    "Polyatomic ionic compounds": POLYATOMIC_IONIC_COMPOUNDS,
    "Diatomic elements": DIATOMIC_ELEMENTS,
    "Binary covalent compounds": BINARY_COVALENT_COMPOUNDS
  };

  const PROBLEM_GENERATORS = {
    "Fixed-charge ionic compounds": () => makeNamingProblem("Fixed-charge ionic compounds", FIXED_CHARGE_IONIC_COMPOUNDS, FIXED_IONIC_HINT),
    "Variable-charge ionic compounds": () => makeNamingProblem("Variable-charge ionic compounds", VARIABLE_CHARGE_IONIC_COMPOUNDS, VARIABLE_IONIC_HINT),
    "Polyatomic ionic compounds": () => makeNamingProblem("Polyatomic ionic compounds", POLYATOMIC_IONIC_COMPOUNDS, POLYATOMIC_HINT),
    "Diatomic elements": () => makeNamingProblem("Diatomic elements", DIATOMIC_ELEMENTS, DIATOMIC_HINT),
    "Binary covalent compounds": () => makeNamingProblem("Binary covalent compounds", BINARY_COVALENT_COMPOUNDS, COVALENT_HINT)
  };

  const RANDOM_PROBLEM_WEIGHTS = [
    ["Fixed-charge ionic compounds", 25],
    ["Variable-charge ionic compounds", 20],
    ["Polyatomic ionic compounds", 25],
    ["Diatomic elements", 10],
    ["Binary covalent compounds", 20]
  ];

  function compound(formula, name, acceptedAnswers = [], explanationDetail = "") {
    return {
      formula,
      name,
      acceptedAnswers: [name].concat(acceptedAnswers),
      explanationDetail
    };
  }

  function formulaForDisplay(formula) {
    return formula.replace(/\d/g, (digit) => SUBSCRIPT_DIGITS[digit]);
  }

  function namingExplanation(item, category, categoryHint) {
    const displayedFormula = formulaForDisplay(item.formula);
    const detail = item.explanationDetail ? `\n\n${item.explanationDetail}` : "";

    if (category === "Diatomic elements") {
      return `${displayedFormula} is a diatomic element. The name is the element name: ${item.name}.${detail}`;
    }

    if (category === "Binary covalent compounds") {
      return `${displayedFormula} contains two nonmetals, so use Greek prefixes. The correct name is ${item.name}.${detail}`;
    }

    return `${displayedFormula} is ionic. Name the cation first, then name the anion. The correct name is ${item.name}.${detail}`;
  }

  function makeNamingProblem(category, compounds, categoryHint) {
    const item = randomChoice(compounds);
    const displayedFormula = formulaForDisplay(item.formula);
    const questionKind = category === "Diatomic elements" ? "diatomic element" : "compound";

    return {
      topic: category,
      answerType: "text",
      question: `Name this ${questionKind}:\n\n${displayedFormula}`,
      answerText: item.name,
      acceptedAnswers: item.acceptedAnswers,
      unit: "",
      firstHint: categoryHint,
      secondHint: "Follow the naming flow chart: decide whether it is ionic or covalent first, then decide whether Roman numerals or Greek prefixes are needed.",
      explanation: namingExplanation(item, category, categoryHint),
      answerPlaceholder: "Example: sodium chloride",
      startMessage: "Enter the compound name. Capitalization does not matter. For metals that need Roman numerals, formats like iron(III) chloride or iron III chloride are accepted.",
      solutionLabel: "Naming solution",
      reasoningLabel: "Naming reasoning"
    };
  }

  return {
    id: "naming-simple-compounds",
    name: "Naming simple compounds",
    description: "Practice naming simple ionic compounds, diatomic elements, and binary covalent compounds.",
    randomLabel: "random naming problem",
    problemGenerators: PROBLEM_GENERATORS,
    randomWeights: RANDOM_PROBLEM_WEIGHTS,
    publicData: {
      NAMING_PROBLEM_GROUPS: PROBLEM_GROUPS,
      NAMING_RANDOM_PROBLEM_WEIGHTS: RANDOM_PROBLEM_WEIGHTS
    }
  };
});

