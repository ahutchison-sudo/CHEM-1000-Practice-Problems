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

const topicOptions = logic.getTopicOptions();
assert.ok(topicOptions.some((topic) => topic.id === "unit-conversions-and-dosing"));
assert.ok(topicOptions.some((topic) => topic.id === "balancing-chemical-reactions"));

const conversionProblemTypes = logic.getProblemTypeOptions("unit-conversions-and-dosing");
assert.strictEqual(conversionProblemTypes[0].label, "random conversion problem");
assert.ok(conversionProblemTypes.some((option) => option.label === "SI unit conversions"));
assert.ok(conversionProblemTypes.some((option) => option.label === "Multistep dosing"));

const balancingProblemTypes = logic.getProblemTypeOptions("balancing-chemical-reactions");
assert.strictEqual(balancingProblemTypes[0].label, "random balancing problem");
assert.ok(balancingProblemTypes.some((option) => option.label === "Combustion reactions"));
assert.ok(balancingProblemTypes.some((option) => option.label === "Double replacement and acid reactions"));

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

for (const reactions of Object.values(logic.BALANCING_PROBLEM_GROUPS)) {
  for (const reaction of reactions) {
    assert.ok(reaction.coefficients.every((coefficient) => Number.isInteger(coefficient) && coefficient > 0 && coefficient <= 15));
  }
}

console.log("All web app logic checks passed.");
