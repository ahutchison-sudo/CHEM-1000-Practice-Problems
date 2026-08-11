(function (root, factory) {
  let shell = root.ChemPracticeShell;

  if (typeof module === "object" && module.exports) {
    shell = require("./practice_shell.js");
    module.exports = factory(shell.helpers);
    return;
  }

  root.ChemPracticeIntermolecularForcesTopic = factory(shell.helpers);
})(typeof globalThis !== "undefined" ? globalThis : window, function (helpers) {
  "use strict";

  const { randomChoice } = helpers;

  const FORCE_CHOICES = [
    "Ion–dipole",
    "Dipole–dipole",
    "Hydrogen bonding",
    "London dispersion forces"
  ];

  const PAIR_EXAMPLES = [
    pair("Na<sup>+</sup>", "H<sub>2</sub>O", "Ion–dipole", "A sodium ion is attracted to the partial negative charge on the oxygen atom of water. An ion interacting with a polar molecule gives ion–dipole attraction."),
    pair("Cl<sup>−</sup>", "CH<sub>3</sub>OH", "Ion–dipole", "A chloride ion is attracted to the partial positive region of the polar methanol molecule. An ion interacting with a polar molecule gives ion–dipole attraction."),
    pair("Mg<sup>2+</sup>", "NH<sub>3</sub>", "Ion–dipole", "A magnesium ion interacts with the partial negative end of polar ammonia. This is an ion–dipole attraction."),
    pair("H<sub>2</sub>O", "NH<sub>3</sub>", "Hydrogen bonding", "Water and ammonia each have N/O–H bonds and lone pairs on electronegative atoms, so they can form hydrogen bonds."),
    pair("CH<sub>3</sub>OH", "H<sub>2</sub>O", "Hydrogen bonding", "Methanol and water can form hydrogen bonds because hydrogen is bonded to oxygen and oxygen has lone pairs."),
    pair("HF", "NH<sub>3</sub>", "Hydrogen bonding", "Hydrogen fluoride has an H–F bond, and ammonia has a nitrogen lone pair. Their strongest intermolecular attraction is hydrogen bonding."),
    pair("HCl", "CH<sub>3</sub>Cl", "Dipole–dipole", "Both HCl and chloromethane are polar molecules, but neither contains hydrogen bonded to N, O, or F. Their strongest attraction is dipole–dipole."),
    pair("SO<sub>2</sub>", "CH<sub>3</sub>Cl", "Dipole–dipole", "Sulfur dioxide and chloromethane are polar molecules. Because neither can hydrogen-bond with the other, their strongest attraction is dipole–dipole."),
    pair("CH<sub>3</sub>Cl", "CH<sub>2</sub>O", "Dipole–dipole", "Chloromethane and formaldehyde are polar molecules without an N–H, O–H, or F–H hydrogen-bond donor. Their strongest attraction is dipole–dipole."),
    pair("CH<sub>4</sub>", "CO<sub>2</sub>", "London dispersion forces", "Methane and carbon dioxide are nonpolar molecules. Their strongest attraction is London dispersion forces."),
    pair("I<sub>2</sub>", "CH<sub>4</sub>", "London dispersion forces", "Iodine and methane are nonpolar. London dispersion forces are the strongest intermolecular attraction between them."),
    pair("CCl<sub>4</sub>", "CO<sub>2</sub>", "London dispersion forces", "Carbon tetrachloride and carbon dioxide are nonpolar molecules. Their strongest attraction is London dispersion forces.")
  ];

  function pair(firstFormula, secondFormula, force, explanation) {
    return { firstFormula, secondFormula, force, explanation };
  }

  function shuffled(items) {
    const copy = items.slice();
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const otherIndex = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[otherIndex]] = [copy[otherIndex], copy[index]];
    }
    return copy;
  }

  function makeProblem() {
    const item = randomChoice(PAIR_EXAMPLES);
    const choices = shuffled(FORCE_CHOICES).map((text, index) => ({
      id: "choice-" + (index + 1),
      label: String.fromCharCode(65 + index),
      text
    }));
    const answerChoice = choices.find((choice) => choice.text === item.force);

    return {
      topic: "Identify strongest intermolecular force",
      answerType: "multiple-choice",
      question: "What is the strongest intermolecular force between these two particles?",
      questionHtml: '<div class="intermolecular-question"><p>What is the strongest intermolecular force between these two particles?</p><div class="reaction-equation"><span>' + item.firstFormula + '</span>&nbsp;<span class="intermolecular-pair-separator">and</span>&nbsp;<span>' + item.secondFormula + '</span></div></div>',
      choices,
      answerChoiceId: answerChoice.id,
      answerText: item.force,
      unit: "",
      firstHint: "First decide whether either particle is an ion. If not, look for an N–H, O–H, or F–H bond paired with a lone pair on N, O, or F.",
      secondHint: "Ion–dipole requires an ion and a polar molecule. Hydrogen bonding requires H bonded to N, O, or F. If both molecules are polar without hydrogen bonding, choose dipole–dipole; otherwise choose London dispersion forces.",
      explanation: item.explanation,
      startMessage: "Choose the strongest intermolecular force between the two particles. You have two attempts for this problem.",
      answerPlaceholder: "",
      solutionLabel: "Intermolecular-force solution",
      reasoningLabel: "Intermolecular-force reasoning"
    };
  }

  return {
    id: "intermolecular-forces",
    name: "Intermolecular Forces",
    description: "Practice identifying the strongest intermolecular force between two particles.",
    randomLabel: "random intermolecular-force problem",
    problemGenerators: { "Identify strongest intermolecular force": makeProblem },
    randomWeights: [["Identify strongest intermolecular force", 100]],
    publicData: { INTERMOLECULAR_FORCE_EXAMPLES: PAIR_EXAMPLES }
  };
});
