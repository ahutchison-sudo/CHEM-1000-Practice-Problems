(function (root, factory) {
  let shell = root.ChemPracticeShell;

  if (typeof module === "object" && module.exports) {
    shell = require("./practice_shell.js");
    module.exports = factory(shell.helpers);
    return;
  }

  root.ChemPracticeAcidBaseTopic = factory(shell.helpers);
})(typeof globalThis !== "undefined" ? globalThis : window, function (helpers) {
  "use strict";

  const { randomChoice, formatNumber, formatToSignificantFigures } = helpers;

  const REACTIONS = [
    reaction("HCl + H₂O ⇌ H₃O⁺ + Cl⁻", "HCl", "H₂O", "H₃O⁺", "Cl⁻"),
    reaction("HNO₃ + H₂O ⇌ H₃O⁺ + NO₃⁻", "HNO₃", "H₂O", "H₃O⁺", "NO₃⁻"),
    reaction("HF + H₂O ⇌ H₃O⁺ + F⁻", "HF", "H₂O", "H₃O⁺", "F⁻"),
    reaction("CH₃COOH + H₂O ⇌ H₃O⁺ + CH₃COO⁻", "CH₃COOH", "H₂O", "H₃O⁺", "CH₃COO⁻"),
    reaction("NH₃ + H₂O ⇌ NH₄⁺ + OH⁻", "NH₃", "H₂O", "NH₄⁺", "OH⁻"),
    reaction("CO₃²⁻ + H₂O ⇌ HCO₃⁻ + OH⁻", "CO₃²⁻", "H₂O", "HCO₃⁻", "OH⁻"),
    reaction("HSO₄⁻ + H₂O ⇌ H₃O⁺ + SO₄²⁻", "HSO₄⁻", "H₂O", "H₃O⁺", "SO₄²⁻")
  ];

  const HYDROGEN_CONCENTRATIONS = [
    1.00e-2, 2.50e-2, 1.00e-3, 4.00e-4, 1.00e-5, 3.16e-6, 1.00e-7, 5.00e-9, 1.00e-10
  ];

  const PH_VALUES = [1.25, 2.00, 2.50, 3.00, 3.50, 4.25, 5.00, 6.50, 7.00, 8.20];

  const PROBLEM_GENERATORS = {
    "Identify a conjugate acid or base": makeConjugateProblem,
    "pH from hydrogen-ion concentration": makePhProblem,
    "Hydrogen-ion concentration from pH": makeHydrogenConcentrationProblem
  };

  const RANDOM_PROBLEM_WEIGHTS = [
    ["Identify a conjugate acid or base", 34],
    ["pH from hydrogen-ion concentration", 33],
    ["Hydrogen-ion concentration from pH", 33]
  ];

  function reaction(equation, acid, base, conjugateAcid, conjugateBase) {
    return { equation, acid, base, conjugateAcid, conjugateBase };
  }

  function shuffled(items) {
    const copy = items.slice();
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const otherIndex = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[otherIndex]] = [copy[otherIndex], copy[index]];
    }
    return copy;
  }

  function makeConjugateProblem() {
    const item = randomChoice(REACTIONS);
    const asksForConjugateBase = Math.random() < 0.5;
    const target = asksForConjugateBase ? item.conjugateBase : item.conjugateAcid;
    const reference = asksForConjugateBase ? item.acid : item.base;
    const role = asksForConjugateBase ? "conjugate base" : "conjugate acid";
    const choices = shuffled([item.acid, item.base, item.conjugateAcid, item.conjugateBase]).map((text, index) => ({
      id: "choice-" + (index + 1),
      label: String.fromCharCode(65 + index),
      text
    }));
    const answerChoice = choices.find((choice) => choice.text === target);

    return {
      topic: "Identify a conjugate acid or base",
      answerType: "multiple-choice",
      question: "Which species is the " + role + " of " + reference + " in the reaction shown?",
      questionHtml: '<div class="acid-base-question"><p>Which species is the <strong>' + role + '</strong> of <strong>' + reference + '</strong> in the reaction shown?</p><div class="reaction-equation">' + item.equation + '</div></div>',
      choices,
      answerChoiceId: answerChoice.id,
      answerText: target,
      unit: "",
      firstHint: "Conjugate acid–base pairs differ by exactly one H⁺. The conjugate base has one fewer hydrogen; the conjugate acid has one more hydrogen.",
      secondHint: asksForConjugateBase ? reference + " loses H⁺ in this reaction. Find the product that has one fewer H atom." : reference + " gains H⁺ in this reaction. Find the product that has one more H atom.",
      explanation: asksForConjugateBase ? reference + " donates H⁺ to form " + target + ", so " + target + " is its conjugate base." : reference + " accepts H⁺ to form " + target + ", so " + target + " is its conjugate acid.",
      startMessage: "Choose the species that forms the requested conjugate acid–base pair. You have two attempts for this problem.",
      answerPlaceholder: "",
      solutionLabel: "Conjugate-pair solution",
      reasoningLabel: "Acid–base reasoning"
    };
  }

  function makePhProblem() {
    const concentration = randomChoice(HYDROGEN_CONCENTRATIONS);
    const answer = -Math.log10(concentration);
    const concentrationText = formatToSignificantFigures(concentration, 3);
    const answerText = formatNumber(answer, 3);

    return {
      topic: "pH from hydrogen-ion concentration",
      question: "What is the pH of a solution with [H⁺] = " + concentrationText + " M?",
      answer,
      unit: "pH",
      answerText,
      expectedSigFigs: 3,
      tolerance: 0.01,
      toleranceKind: "absolute",
      firstHint: "Use pH = −log[H⁺].",
      secondHint: "Substitute the concentration: pH = −log(" + concentrationText + ").",
      explanation: "pH = −log[H⁺] = −log(" + concentrationText + ") = " + answerText + ".",
      answerPlaceholder: "Example: 3.40",
      startMessage: "Enter the pH as a number. You have two attempts for this problem.",
      solutionLabel: "pH calculation",
      reasoningLabel: "Acid–base reasoning"
    };
  }

  function makeHydrogenConcentrationProblem() {
    const pH = randomChoice(PH_VALUES);
    const answer = Math.pow(10, -pH);
    const answerText = formatToSignificantFigures(answer, 3);

    return {
      topic: "Hydrogen-ion concentration from pH",
      question: "What is [H⁺] for a solution with pH = " + amountText(pH) + "?",
      answer,
      unit: "M",
      answerText,
      expectedSigFigs: 3,
      tolerance: 0.02,
      toleranceKind: "relative",
      firstHint: "Rearrange pH = −log[H⁺] to [H⁺] = 10⁻ᵖᴴ.",
      secondHint: "[H⁺] = 10^(−" + amountText(pH) + ").",
      explanation: "[H⁺] = 10⁻ᵖᴴ = 10^(−" + amountText(pH) + ") = " + answerText + " M.",
      answerPlaceholder: "Example: 1.00e-3 M",
      startMessage: "Enter the hydrogen-ion concentration. Units are optional, but including M is good practice.",
      solutionLabel: "Hydrogen-ion concentration calculation",
      reasoningLabel: "Acid–base reasoning"
    };
  }

  function amountText(value) {
    return formatNumber(value, 2);
  }

  return {
    id: "acid-base-problems",
    name: "Acid–Base Problems",
    description: "Practice conjugate acid–base pairs, pH, and hydrogen-ion concentration.",
    randomLabel: "random acid–base problem",
    problemGenerators: PROBLEM_GENERATORS,
    randomWeights: RANDOM_PROBLEM_WEIGHTS,
    publicData: { ACID_BASE_REACTIONS: REACTIONS }
  };
});
