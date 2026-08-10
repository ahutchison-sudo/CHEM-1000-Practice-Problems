(function (root, factory) {
  let shell = root.ChemPracticeShell;

  if (typeof module === "object" && module.exports) {
    shell = require("./practice_shell.js");
    module.exports = factory(shell.helpers);
    return;
  }

  root.ChemPracticeRedoxTopic = factory(shell.helpers);
})(typeof globalThis !== "undefined" ? globalThis : window, function (helpers) {
  "use strict";

  const { randomChoice } = helpers;

  const RANDOM_PROBLEM_WEIGHTS = [
    ["Identify oxidation state", 50],
    ["Identify oxidizing or reducing agent", 50]
  ];

  const OXIDATION_STATE_EXAMPLES = [
    oxidationStateExample("S", "SO<sub>4</sub><sup>2−</sup>", "+6", "Oxygen is −2. Four oxygen atoms contribute −8, so sulfur must be +6 to give the ion its overall −2 charge."),
    oxidationStateExample("Mn", "MnO<sub>4</sub><sup>−</sup>", "+7", "Oxygen is −2. Four oxygen atoms total −8, so manganese must be +7 for the ion to have a −1 charge."),
    oxidationStateExample("Cr", "Cr<sub>2</sub>O<sub>7</sub><sup>2−</sup>", "+6", "Seven oxygen atoms total −14. The two chromium atoms must total +12, so each chromium is +6."),
    oxidationStateExample("N", "NH<sub>4</sub><sup>+</sup>", "−3", "Hydrogen is +1. Four hydrogens total +4, so nitrogen must be −3 for the ion to have a +1 charge."),
    oxidationStateExample("Cl", "ClO<sub>3</sub><sup>−</sup>", "+5", "Three oxygen atoms total −6. Chlorine must be +5 for chlorate to have an overall −1 charge."),
    oxidationStateExample("N", "NO<sub>2</sub><sup>−</sup>", "+3", "The two oxygen atoms total −4, so nitrogen must be +3 for nitrite to have an overall −1 charge."),
    oxidationStateExample("Fe", "Fe<sub>2</sub>O<sub>3</sub>", "+3", "Three oxygen atoms total −6. The two iron atoms must total +6, so each iron is +3."),
    oxidationStateExample("C", "CO<sub>3</sub><sup>2−</sup>", "+4", "Three oxygen atoms total −6. Carbon must be +4 for carbonate to have an overall −2 charge."),
    oxidationStateExample("P", "PO<sub>4</sub><sup>3−</sup>", "+5", "Four oxygen atoms total −8. Phosphorus must be +5 for phosphate to have an overall −3 charge."),
    oxidationStateExample("O", "H<sub>2</sub>O<sub>2</sub>", "−1", "Hydrogen is +1. The two hydrogens total +2, so the two oxygen atoms must total −2; each oxygen in a peroxide is −1."),
    oxidationStateExample("O", "OF<sub>2</sub>", "+2", "Fluorine is always −1. The two fluorines total −2, so oxygen must be +2 in OF₂.")
  ];

  const REDOX_AGENT_EXAMPLES = [
    redoxAgentExample("Zn + CuSO<sub>4</sub> → ZnSO<sub>4</sub> + Cu", "reducing agent", "Zn", ["CuSO₄", "ZnSO₄", "Cu"], "Zinc changes from 0 to +2, so it is oxidized. The substance oxidized is the reducing agent."),
    redoxAgentExample("2 Mg + O<sub>2</sub> → 2 MgO", "reducing agent", "Mg", ["O₂", "MgO", "No reducing agent"], "Magnesium changes from 0 to +2 and is oxidized. Therefore, magnesium is the reducing agent."),
    redoxAgentExample("Fe<sub>2</sub>O<sub>3</sub> + 3 CO → 2 Fe + 3 CO<sub>2</sub>", "reducing agent", "CO", ["Fe₂O₃", "Fe", "CO₂"], "Carbon in CO changes from +2 to +4, so CO is oxidized. The substance oxidized is the reducing agent."),
    redoxAgentExample("2 Al + 3 CuCl<sub>2</sub> → 2 AlCl<sub>3</sub> + 3 Cu", "reducing agent", "Al", ["CuCl₂", "AlCl₃", "Cu"], "Aluminum changes from 0 to +3 and is oxidized. Therefore, aluminum is the reducing agent."),
    redoxAgentExample("Cl<sub>2</sub> + 2 KI → 2 KCl + I<sub>2</sub>", "oxidizing agent", "Cl₂", ["KI", "KCl", "I₂"], "Chlorine changes from 0 to −1 and is reduced. The substance reduced is the oxidizing agent."),
    redoxAgentExample("2 FeCl<sub>3</sub> + SnCl<sub>2</sub> → 2 FeCl<sub>2</sub> + SnCl<sub>4</sub>", "oxidizing agent", "FeCl₃", ["SnCl₂", "FeCl₂", "SnCl₄"], "Iron changes from +3 to +2 and is reduced. The substance reduced is the oxidizing agent."),
    redoxAgentExample("MnO<sub>4</sub><sup>−</sup> + 5 Fe<sup>2+</sup> + 8 H<sup>+</sup> → Mn<sup>2+</sup> + 5 Fe<sup>3+</sup> + 4 H<sub>2</sub>O", "oxidizing agent", "MnO₄⁻", ["Fe²⁺", "H⁺", "Mn²⁺"], "Manganese changes from +7 to +2, so permanganate is reduced. The species reduced is the oxidizing agent."),
    redoxAgentExample("Cr<sub>2</sub>O<sub>7</sub><sup>2−</sup> + 6 I<sup>−</sup> + 14 H<sup>+</sup> → 2 Cr<sup>3+</sup> + 3 I<sub>2</sub> + 7 H<sub>2</sub>O", "oxidizing agent", "Cr₂O₇²⁻", ["I⁻", "H⁺", "Cr³⁺"], "Chromium changes from +6 to +3, so dichromate is reduced. The species reduced is the oxidizing agent.")
  ];

  function oxidationStateExample(atom, formulaHtml, answer, explanation) {
    return { atom, formulaHtml, answer, explanation };
  }

  function redoxAgentExample(equationHtml, agentType, answer, distractors, explanation) {
    return { equationHtml, agentType, answer, distractors, explanation };
  }

  function shuffled(items) {
    const copy = items.slice();
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const otherIndex = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[otherIndex]] = [copy[otherIndex], copy[index]];
    }
    return copy;
  }

  function buildChoices(correctText, distractors) {
    const texts = shuffled([correctText, ...distractors]);
    return {
      choices: texts.map((text, index) => ({
        id: "choice-" + (index + 1),
        label: String.fromCharCode(65 + index),
        text
      })),
      answerChoiceId: "choice-" + (texts.indexOf(correctText) + 1)
    };
  }

  function makeOxidationStateProblem() {
    const item = randomChoice(OXIDATION_STATE_EXAMPLES);
    const choiceInfo = buildChoices(item.answer, ["−4", "−2", "+2", "+3", "+4", "+5", "+6", "+7"].filter((value) => value !== item.answer).slice(0, 3));

    return {
      topic: "Identify oxidation state",
      answerType: "multiple-choice",
      question: "What is the oxidation state of " + item.atom + " in the compound shown?",
      questionHtml: "<div class=\"redox-question\"><p>What is the oxidation state of <strong>" + item.atom + "</strong> in the compound shown?</p><div class=\"reaction-equation\">" + item.formulaHtml + "</div></div>",
      choices: choiceInfo.choices,
      answerChoiceId: choiceInfo.answerChoiceId,
      answerText: item.answer,
      unit: "",
      firstHint: "Use the usual oxidation states first: oxygen is usually −2, hydrogen is usually +1, and the total must equal the compound or ion charge.",
      secondHint: "Write an algebraic sum for all atoms. Be alert for exceptions: oxygen is −1 in peroxides and +2 in OF₂.",
      explanation: item.explanation,
      startMessage: "Choose the oxidation state of the specified atom. You have two attempts for this problem.",
      answerPlaceholder: "",
      solutionLabel: "Oxidation-state solution",
      reasoningLabel: "Oxidation-state reasoning"
    };
  }

  function makeRedoxAgentProblem() {
    const item = randomChoice(REDOX_AGENT_EXAMPLES);
    const choiceInfo = buildChoices(item.answer, item.distractors);

    return {
      topic: "Identify oxidizing or reducing agent",
      answerType: "multiple-choice",
      question: "Identify the " + item.agentType + " in this redox reaction.",
      questionHtml: "<div class=\"redox-question\"><p>Identify the <strong>" + item.agentType + "</strong> in this redox reaction.</p><div class=\"reaction-equation\">" + item.equationHtml + "</div></div>",
      choices: choiceInfo.choices,
      answerChoiceId: choiceInfo.answerChoiceId,
      answerText: item.answer,
      unit: "",
      firstHint: "Compare oxidation states before and after the reaction. Oxidation is loss of electrons; reduction is gain of electrons.",
      secondHint: "The reducing agent is oxidized, and the oxidizing agent is reduced.",
      explanation: item.explanation,
      startMessage: "Choose the species that plays the requested role. You have two attempts for this problem.",
      answerPlaceholder: "",
      solutionLabel: "Redox-agent solution",
      reasoningLabel: "Redox-agent reasoning"
    };
  }

  const PROBLEM_GENERATORS = {
    "Identify oxidation state": makeOxidationStateProblem,
    "Identify oxidizing or reducing agent": makeRedoxAgentProblem
  };

  return {
    id: "oxidation-reduction-reactions",
    name: "Oxidation–Reduction Reactions",
    description: "Practice assigning oxidation states and identifying oxidizing and reducing agents.",
    randomLabel: "random oxidation–reduction problem",
    problemGenerators: PROBLEM_GENERATORS,
    randomWeights: RANDOM_PROBLEM_WEIGHTS,
    publicData: {
      REDOX_RANDOM_PROBLEM_WEIGHTS: RANDOM_PROBLEM_WEIGHTS,
      REDOX_OXIDATION_STATE_EXAMPLES: OXIDATION_STATE_EXAMPLES,
      REDOX_AGENT_EXAMPLES: REDOX_AGENT_EXAMPLES
    }
  };
});