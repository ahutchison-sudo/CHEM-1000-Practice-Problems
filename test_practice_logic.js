const assert = require("assert");
const logic = require("./practice_logic.js");

function makeNumericProblem(overrides = {}) {
  return {
    topic: "Test topic",
    question: "Convert 1 g to mg.",
    answer: 1000,
    unit: "mg",
    answerText: "1000",
    firstHint: "Use 1 g = 1000 mg.",
    secondHint: "1 g x (1000 mg / 1 g)",
    explanation: "1 g x (1000 mg / 1 g) = 1000 mg.",
    tolerance: 0.02,
    toleranceKind: "relative",
    expectedSigFigs: 1,
    ...overrides
  };
}

function makeCoefficientProblem(overrides = {}) {
  return {
    topic: "Balancing test",
    answerType: "coefficients",
    question: "Balance H2 + O2 -> H2O.",
    coefficients: [2, 1, 2],
    coefficientLabels: ["H2", "O2", "H2O"],
    answerText: "2, 1, 2\nBalanced equation: 2 H2 + O2 -> 2 H2O",
    unit: "",
    firstHint: "Balance hydrogen first, then oxygen.",
    secondHint: "Use this order: H2, O2, H2O.",
    explanation: "Coefficients: 2, 1, 2",
    reasoningLabel: "Balancing reasoning",
    ...overrides
  };
}

function makeTextProblem(overrides = {}) {
  return {
    topic: "Naming test",
    answerType: "text",
    question: "Name this compound: FeCl3.",
    answerText: "iron(III) chloride",
    acceptedAnswers: ["iron(III) chloride"],
    unit: "",
    firstHint: "This metal needs a Roman numeral.",
    secondHint: "Use the metal charge in Roman numerals.",
    explanation: "Each chloride is -1, so iron is +3.",
    reasoningLabel: "Naming reasoning",
    ...overrides
  };
}

const topicOptions = logic.getTopicOptions();
assert.ok(topicOptions.some((topic) => topic.id === "unit-conversions-and-dosing"));
assert.ok(topicOptions.some((topic) => topic.id === "balancing-chemical-reactions"));
assert.ok(topicOptions.some((topic) => topic.id === "naming-simple-compounds"));
assert.ok(topicOptions.some((topic) => topic.id === "simple-stoichiometry"));
assert.ok(topicOptions.some((topic) => topic.id === "organic-alkane-naming"));

const conversionProblemTypes = logic.getProblemTypeOptions("unit-conversions-and-dosing");
assert.strictEqual(conversionProblemTypes[0].label, "random conversion problem");
assert.ok(conversionProblemTypes.some((option) => option.label === "SI unit conversions"));
assert.ok(conversionProblemTypes.some((option) => option.label === "Multistep dosing"));

const balancingProblemTypes = logic.getProblemTypeOptions("balancing-chemical-reactions");
assert.strictEqual(balancingProblemTypes[0].label, "random balancing problem");
assert.ok(balancingProblemTypes.some((option) => option.label === "Combustion reactions"));
assert.ok(balancingProblemTypes.some((option) => option.label === "Double replacement and acid reactions"));

const namingProblemTypes = logic.getProblemTypeOptions("naming-simple-compounds");
assert.strictEqual(namingProblemTypes[0].label, "random naming problem");
assert.ok(namingProblemTypes.some((option) => option.label === "Fixed-charge ionic compounds"));
assert.ok(namingProblemTypes.some((option) => option.label === "Polyatomic ionic compounds"));
assert.ok(namingProblemTypes.some((option) => option.label === "Binary covalent compounds"));

const stoichiometryProblemTypes = logic.getProblemTypeOptions("simple-stoichiometry");
assert.strictEqual(stoichiometryProblemTypes[0].label, "random stoichiometry problem");
assert.ok(stoichiometryProblemTypes.some((option) => option.label === "Molar mass from formula"));
assert.ok(stoichiometryProblemTypes.some((option) => option.label === "Grams to moles"));
assert.ok(stoichiometryProblemTypes.some((option) => option.label === "Moles to grams"));
assert.ok(stoichiometryProblemTypes.some((option) => option.label === "Mass-to-mass stoichiometry"));
const organicProblemTypes = logic.getProblemTypeOptions("organic-alkane-naming");
assert.strictEqual(organicProblemTypes[0].label, "random organic naming problem");
assert.ok(organicProblemTypes.some((option) => option.label === "Alkyl substituents"));
assert.ok(organicProblemTypes.some((option) => option.label === "Halogen substituents"));
assert.ok(organicProblemTypes.some((option) => option.label === "Mixed substituents"));
assert.ok(organicProblemTypes.some((option) => option.label === "Common branched substituents"));

assert.strictEqual(logic.normalizeTextAnswer("Iron(III) chloride"), "iron iii chloride");
assert.strictEqual(logic.normalizeTextAnswer("iron 3 chloride"), "iron iii chloride");
assert.deepStrictEqual(logic.parseCoefficientList("2, 1, 2"), [2, 1, 2]);
assert.deepStrictEqual(logic.parseCoefficientList("2 1 2"), [2, 1, 2]);

assert.strictEqual(logic.extractNumber("18.02 g/mol"), 18.02);
assert.strictEqual(logic.extractNumber("6.02e23 particles"), 6.02e23);
assert.ok(Math.abs(logic.extractNumber("1.2 x 10^-3 mL") - 0.0012) < 1e-12);

assert.strictEqual(logic.countSignificantFiguresInText("0.0120"), 3);
assert.strictEqual(logic.countSignificantFiguresInText("1200"), 2);
assert.strictEqual(logic.countSignificantFiguresInText("1200."), 4);

assert.strictEqual(logic.formatToSignificantFigures(225, 1), "200");
assert.strictEqual(logic.formatToSignificantFigures(225, 2), "230");
assert.strictEqual(logic.formatToSignificantFigures(0.125, 2), "0.13");
assert.strictEqual(logic.formatToSignificantFigures(200, 2), "200");
assert.ok(!logic.formatToSignificantFigures(200, 2).includes("x 10"));

let result = logic.evaluateAnswer(makeNumericProblem({ answer: 225, answerText: "200" }), "225 mg");
assert.strictEqual(result.isCorrect, true);
assert.strictEqual(result.shouldCount, true);
assert.ok(result.feedback.includes("Significant figures note"));

result = logic.evaluateAnswer(makeNumericProblem({ answer: 200, answerText: "200", expectedSigFigs: 2 }), "200 mg");
assert.strictEqual(result.isCorrect, true);
assert.strictEqual(result.shouldCount, true);
assert.ok(!result.feedback.includes("Significant figures note"));
assert.ok(!result.feedback.includes("x 10"));

result = logic.evaluateAnswer(makeNumericProblem(), "500 mg");
assert.strictEqual(result.isCorrect, false);
assert.strictEqual(result.shouldCount, true);
assert.ok(result.feedback.includes("Not quite"));

result = logic.evaluateAnswer(makeCoefficientProblem(), "2, 1, 2");
assert.strictEqual(result.isCorrect, true);
assert.strictEqual(result.shouldCount, true);
assert.ok(result.feedback.includes("Balancing reasoning"));

result = logic.evaluateAnswer(makeCoefficientProblem(), "4, 2, 4");
assert.strictEqual(result.isCorrect, false);
assert.strictEqual(result.shouldCount, true);
assert.ok(result.feedback.includes("lowest whole-number"));

result = logic.evaluateAnswer(makeCoefficientProblem(), "2 H2 + O2 -> 2 H2O");
assert.strictEqual(result.isCorrect, false);
assert.strictEqual(result.shouldCount, false);
assert.ok(result.feedback.includes("coefficients, not the whole equation"));

result = logic.evaluateAnswer(makeTextProblem(), "Iron III Chloride");
assert.strictEqual(result.isCorrect, true);
assert.strictEqual(result.shouldCount, true);
assert.ok(result.feedback.includes("Naming reasoning"));

result = logic.evaluateAnswer(makeTextProblem(), "iron 3 chloride");
assert.strictEqual(result.isCorrect, true);
assert.strictEqual(result.shouldCount, true);

result = logic.evaluateAnswer(makeTextProblem({
  answerText: "sodium hydrogen carbonate",
  acceptedAnswers: ["sodium hydrogen carbonate", "sodium bicarbonate"]
}), "sodium bicarbonate");
assert.strictEqual(result.isCorrect, true);
assert.strictEqual(result.shouldCount, true);

result = logic.evaluateAnswer(makeTextProblem({ answerText: "carbon dioxide", acceptedAnswers: ["carbon dioxide"] }), "carbon oxide");
assert.strictEqual(result.isCorrect, false);
assert.strictEqual(result.shouldCount, true);

assert.deepStrictEqual(Object.fromEntries(logic.RANDOM_PROBLEM_WEIGHTS), {
  "SI unit conversions": 15,
  "Imperial/SI conversions": 25,
  "Weight-based dosing": 25,
  "Multistep dosing": 35
});
assert.strictEqual(logic.RANDOM_PROBLEM_WEIGHTS.reduce((sum, item) => sum + item[1], 0), 100);
assert.ok(!Object.keys(logic.PROBLEM_GENERATORS).includes("Solution dosing"));
assert.ok(!Object.keys(logic.PROBLEM_GENERATORS).includes("Tablet count dosing"));

assert.ok(logic.WEIGHT_BASED_DOSE_RATES.length >= 12);
assert.ok(logic.MULTISTEP_DOSE_RATES.length >= 12);
assert.ok(logic.WEIGHT_BASED_DOSE_RATES.includes(5));
assert.ok(logic.MULTISTEP_DOSE_RATES.includes(5));

for (const topic of Object.keys(logic.PROBLEM_GENERATORS)) {
  const problem = logic.generateProblem(topic);
  assert.strictEqual(problem.topic, topic);
  assert.strictEqual(problem.practiceTopicId, "unit-conversions-and-dosing");
  assert.strictEqual(problem.practiceTopicName, "Unit conversions and dosing");
  assert.ok(problem.question.length > 0);
  assert.strictEqual(typeof problem.answer, "number");
  assert.ok(problem.answerText.length > 0);
  assert.ok(problem.firstHint.length > 0);
  assert.ok(problem.secondHint.length > 0);
  assert.ok(problem.explanation.length > 0);
}

const randomConversionProblem = logic.generateProblem("unit-conversions-and-dosing", logic.RANDOM_PROBLEM_TYPE);
assert.strictEqual(randomConversionProblem.practiceTopicName, "Unit conversions and dosing");
assert.ok(Object.keys(logic.PROBLEM_GENERATORS).includes(randomConversionProblem.problemType));

const randomBalancingProblem = logic.generateProblem("balancing-chemical-reactions", logic.RANDOM_PROBLEM_TYPE);
assert.strictEqual(randomBalancingProblem.practiceTopicName, "Balancing chemical reactions");
assert.strictEqual(randomBalancingProblem.answerType, "coefficients");
assert.ok(randomBalancingProblem.coefficients.every((coefficient) => coefficient <= 15));
assert.ok(randomBalancingProblem.question.includes("Balance this chemical equation"));
assert.ok(/[\u2080-\u2089]/.test(randomBalancingProblem.question));
assert.ok(/[\u2080-\u2089]/.test(randomBalancingProblem.answerText));

const randomNamingProblem = logic.generateProblem("naming-simple-compounds", logic.RANDOM_PROBLEM_TYPE);
assert.strictEqual(randomNamingProblem.practiceTopicName, "Naming simple compounds");
assert.strictEqual(randomNamingProblem.answerType, "text");
assert.ok(randomNamingProblem.question.includes("Name this"));
assert.ok(randomNamingProblem.acceptedAnswers.includes(randomNamingProblem.answerText));

const randomStoichiometryProblem = logic.generateProblem("simple-stoichiometry", logic.RANDOM_PROBLEM_TYPE);
assert.strictEqual(randomStoichiometryProblem.practiceTopicName, "Simple stoichiometry");
assert.strictEqual(typeof randomStoichiometryProblem.answer, "number");
assert.ok(randomStoichiometryProblem.answerText.length > 0);
assert.ok(randomStoichiometryProblem.firstHint.length > 0);
assert.ok(randomStoichiometryProblem.secondHint.length > 0);
assert.ok(randomStoichiometryProblem.explanation.length > 0);
assert.ok(!randomStoichiometryProblem.explanation.includes("limiting reagent"));

const expectedStoichiometryPlaceholderByUnit = {
  "g/mol": "Example: 25.0 g/mol",
  mol: "Example: 0.725 mol",
  g: "Example: 25.0 g"
};
for (const problemType of ["Molar mass from formula", "Grams to moles", "Moles to grams", "Mass-to-mass stoichiometry"]) {
  const problem = logic.generateProblem("simple-stoichiometry", problemType);
  assert.strictEqual(problem.practiceTopicId, "simple-stoichiometry");
  assert.strictEqual(problem.practiceTopicName, "Simple stoichiometry");
  assert.strictEqual(problem.topic, problemType);
  assert.strictEqual(typeof problem.answer, "number");
  assert.ok(Number.isFinite(problem.answer));
  assert.ok(problem.answer > 0);
  assert.ok(problem.answerText.length > 0);
  assert.ok(problem.expectedSigFigs >= 3);
  assert.ok(problem.tolerance > 0);
  assert.strictEqual(problem.answerPlaceholder, expectedStoichiometryPlaceholderByUnit[problem.unit]);
}

const molarMassProblem = logic.generateProblem("simple-stoichiometry", "Molar mass from formula");
assert.strictEqual(molarMassProblem.unit, "g/mol");
assert.ok(molarMassProblem.question.includes("Determine the molar mass"));

const gramsToMolesProblem = logic.generateProblem("simple-stoichiometry", "Grams to moles");
assert.strictEqual(gramsToMolesProblem.unit, "mol");
assert.ok(gramsToMolesProblem.secondHint.includes("1 mol"));

const molesToGramsProblem = logic.generateProblem("simple-stoichiometry", "Moles to grams");
assert.strictEqual(molesToGramsProblem.unit, "g");
assert.ok(molesToGramsProblem.secondHint.includes("g"));

const massToMassProblem = logic.generateProblem("simple-stoichiometry", "Mass-to-mass stoichiometry");
assert.strictEqual(massToMassProblem.unit, "g");
assert.ok(massToMassProblem.question.includes("Use this balanced equation"));
assert.ok(/[\u2080-\u2089]/.test(massToMassProblem.question));
assert.ok(massToMassProblem.secondHint.includes("mol"));

result = logic.evaluateAnswer(massToMassProblem, massToMassProblem.answerText);
assert.strictEqual(result.isCorrect, true);
assert.strictEqual(result.shouldCount, true);
assert.ok(result.feedback.includes("Stoichiometry reasoning"));
const randomOrganicProblem = logic.generateProblem("organic-alkane-naming", logic.RANDOM_PROBLEM_TYPE);
assert.strictEqual(randomOrganicProblem.practiceTopicName, "Naming organic alkanes");
assert.strictEqual(randomOrganicProblem.answerType, "text");
assert.ok(randomOrganicProblem.questionHtml.includes("<svg"));
assert.ok(randomOrganicProblem.questionHtml.includes("organic-structure"));
assert.ok(randomOrganicProblem.answerText.length > 0);
assert.ok(randomOrganicProblem.acceptedAnswers.includes(randomOrganicProblem.answerText));
assert.strictEqual(randomOrganicProblem.answerPlaceholder, "Example: 4-ethylheptane");
assert.ok(["skeletal", "expanded"].includes(randomOrganicProblem.drawingStyle));
assert.ok(["standard", "folded"].includes(randomOrganicProblem.drawingLayout));
assert.ok(!randomOrganicProblem.questionHtml.includes(randomOrganicProblem.answerText));

result = logic.evaluateAnswer(randomOrganicProblem, randomOrganicProblem.answerText.toUpperCase());
assert.strictEqual(result.isCorrect, true);
assert.strictEqual(result.shouldCount, true);
assert.ok(result.feedback.includes("Organic naming reasoning"));

result = logic.evaluateAnswer(randomOrganicProblem, randomOrganicProblem.answerText.replace(/,/g, " ").replace(/-/g, " "));
assert.strictEqual(result.isCorrect, true);
assert.strictEqual(result.shouldCount, true);

const originalMathRandom = Math.random;
let forcedOrganicProblem;
try {
  Math.random = () => 0.1;
  forcedOrganicProblem = logic.generateProblem("organic-alkane-naming", "Common branched substituents");
} finally {
  Math.random = originalMathRandom;
}
assert.strictEqual(forcedOrganicProblem.drawingStyle, "expanded");
assert.strictEqual(forcedOrganicProblem.drawingLayout, "folded");
assert.ok(forcedOrganicProblem.questionHtml.includes('data-style="expanded"'));
assert.ok(forcedOrganicProblem.questionHtml.includes('data-layout="folded"'));
assert.ok(forcedOrganicProblem.questionHtml.includes("<text"));
assert.ok(forcedOrganicProblem.questionHtml.includes("CH"));

let forcedSkeletalProblem;
try {
  Math.random = () => 0.9;
  forcedSkeletalProblem = logic.generateProblem("organic-alkane-naming", "Common branched substituents");
} finally {
  Math.random = originalMathRandom;
}
assert.strictEqual(forcedSkeletalProblem.drawingStyle, "skeletal");
assert.ok(forcedSkeletalProblem.questionHtml.includes('data-style="skeletal"'));
const skeletalBondMatches = [...forcedSkeletalProblem.questionHtml.matchAll(/<line x1="([^"]+)" y1="([^"]+)" x2="([^"]+)" y2="([^"]+)"/g)];
const skeletalEndpoints = new Map();
for (const match of skeletalBondMatches) {
  const firstEndpoint = match[1] + "," + match[2];
  const secondEndpoint = match[3] + "," + match[4];
  skeletalEndpoints.set(firstEndpoint, (skeletalEndpoints.get(firstEndpoint) || 0) + 1);
  skeletalEndpoints.set(secondEndpoint, (skeletalEndpoints.get(secondEndpoint) || 0) + 1);
}
assert.ok([...skeletalEndpoints.values()].some((count) => count >= 2));

for (const problemType of ["Alkyl substituents", "Halogen substituents", "Mixed substituents", "Common branched substituents"]) {
  const problem = logic.generateProblem("organic-alkane-naming", problemType);
  assert.strictEqual(problem.practiceTopicId, "organic-alkane-naming");
  assert.strictEqual(problem.practiceTopicName, "Naming organic alkanes");
  assert.strictEqual(problem.topic, problemType);
  assert.strictEqual(problem.answerType, "text");
  assert.ok(problem.questionHtml.includes("<svg"));
  assert.ok(["skeletal", "expanded"].includes(problem.drawingStyle));
  assert.ok(["standard", "folded"].includes(problem.drawingLayout));
  assert.ok(problem.acceptedAnswers.includes(problem.answerText));
}

for (const compounds of Object.values(logic.NAMING_PROBLEM_GROUPS)) {
  for (const compound of compounds) {
    assert.ok(compound.formula.length > 0);
    assert.ok(compound.name.length > 0);
    assert.ok(compound.acceptedAnswers.includes(compound.name));
  }
}

for (const reactions of Object.values(logic.BALANCING_PROBLEM_GROUPS)) {
  for (const reaction of reactions) {
    assert.ok(reaction.coefficients.every((coefficient) => Number.isInteger(coefficient) && coefficient > 0 && coefficient <= 15));
  }
}

assert.deepStrictEqual(Object.fromEntries(logic.STOICHIOMETRY_RANDOM_PROBLEM_WEIGHTS), {
  "Molar mass from formula": 20,
  "Grams to moles": 20,
  "Moles to grams": 20,
  "Mass-to-mass stoichiometry": 40
});
assert.strictEqual(logic.STOICHIOMETRY_RANDOM_PROBLEM_WEIGHTS.reduce((sum, item) => sum + item[1], 0), 100);
assert.ok(logic.STOICHIOMETRY_COMPOUNDS.length >= 12);
assert.ok(logic.STOICHIOMETRY_REACTIONS.length >= 8);

for (const compound of logic.STOICHIOMETRY_COMPOUNDS) {
  assert.ok(compound.formula.length > 0);
}
assert.deepStrictEqual(Object.fromEntries(logic.ORGANIC_NAMING_RANDOM_PROBLEM_WEIGHTS), {
  "Alkyl substituents": 30,
  "Halogen substituents": 25,
  "Mixed substituents": 25,
  "Common branched substituents": 20
});
assert.strictEqual(logic.ORGANIC_NAMING_RANDOM_PROBLEM_WEIGHTS.reduce((sum, item) => sum + item[1], 0), 100);
assert.strictEqual(logic.ORGANIC_NAMING_CHALLENGE_LAYOUT_PROBABILITY, 0.5);
assert.strictEqual(logic.ORGANIC_NAMING_EXPANDED_DRAWING_PROBABILITY, 0.5);

const allOrganicMolecules = Object.values(logic.ORGANIC_NAMING_PROBLEM_GROUPS).flat();
assert.ok(allOrganicMolecules.length >= 40);
assert.ok(allOrganicMolecules.some((item) => item.answerText.includes("isopropyl")));
assert.ok(allOrganicMolecules.some((item) => item.answerText.includes("isobutyl")));
assert.ok(allOrganicMolecules.some((item) => item.answerText.includes("sec-butyl")));
assert.ok(allOrganicMolecules.some((item) => item.answerText.includes("tert-butyl")));
assert.ok(allOrganicMolecules.some((item) => item.answerText.includes("fluoro")));
assert.ok(allOrganicMolecules.some((item) => item.answerText.includes("chloro")));
assert.ok(allOrganicMolecules.some((item) => item.answerText.includes("bromo")));
assert.ok(allOrganicMolecules.some((item) => item.answerText.includes("iodo")));

const tertButylMolecule = allOrganicMolecules.find((item) => item.answerText.includes("tert-butyl"));
result = logic.evaluateAnswer({
  answerType: "text",
  answerText: tertButylMolecule.answerText,
  acceptedAnswers: tertButylMolecule.acceptedAnswers,
  unit: "",
  firstHint: "",
  explanation: "",
  reasoningLabel: "Organic naming reasoning"
}, tertButylMolecule.answerText.replace("tert-butyl", "tertbutyl"));
assert.strictEqual(result.isCorrect, true);
assert.strictEqual(result.shouldCount, true);

console.log("All web app logic checks passed.");








