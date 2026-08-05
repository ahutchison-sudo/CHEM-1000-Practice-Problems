(function (root, factory) {
  let shell = root.ChemPracticeShell;

  if (typeof module === "object" && module.exports) {
    shell = require("./practice_shell.js");
    module.exports = factory(shell.helpers);
    return;
  }

  root.ChemPracticeConversionTopic = factory(shell.helpers);
})(typeof globalThis !== "undefined" ? globalThis : window, function (helpers) {
  "use strict";

  const {
    randomChoice,
    formatNumber,
    formatToSignificantFigures,
    significantFiguresFromValue,
    significantFiguresFromValues,
    significantFigurePhrase
  } = helpers;

  // This file is one topic module. Future topics can follow the same pattern:
  // 1. list the problem types for the topic,
  // 2. write one generator function for each problem type,
  // 3. export the topic name, random mix, and generator list at the bottom.

  // Students should know these SI relationships, so SI problems do not show
  // the factor in the question. The first hint shows the factor if needed.
  const SI_CONVERSIONS = [
    unitConversion("kg", "g", 1000, "g", 1, "kg", "1 kg = 1000 g", [0.25, 0.5, 1.2, 2.5, 4.0]),
    unitConversion("g", "kg", 1, "kg", 1000, "g", "1 kg = 1000 g", [125, 250, 500, 750, 1500, 2500]),
    unitConversion("g", "mg", 1000, "mg", 1, "g", "1 g = 1000 mg", [0.25, 0.5, 1.2, 2.5, 4.0]),
    unitConversion("mg", "g", 1, "g", 1000, "mg", "1 g = 1000 mg", [125, 250, 500, 750, 1500, 2500]),
    unitConversion("mg", "mcg", 1000, "mcg", 1, "mg", "1 mg = 1000 mcg", [0.25, 0.5, 1.2, 2.5, 4.0]),
    unitConversion("mcg", "mg", 1, "mg", 1000, "mcg", "1 mg = 1000 mcg", [125, 250, 500, 750, 1500, 2500]),
    unitConversion("L", "mL", 1000, "mL", 1, "L", "1 L = 1000 mL", [0.125, 0.25, 0.5, 0.75, 1.5, 2.0]),
    unitConversion("mL", "L", 1, "L", 1000, "mL", "1 L = 1000 mL", [125, 250, 500, 750, 1500, 2000]),
    unitConversion("m", "cm", 100, "cm", 1, "m", "1 m = 100 cm", [0.25, 0.5, 1.2, 2.5, 4.0]),
    unitConversion("cm", "m", 1, "m", 100, "cm", "1 m = 100 cm", [25, 50, 125, 250, 400]),
    unitConversion("m", "mm", 1000, "mm", 1, "m", "1 m = 1000 mm", [0.02, 0.05, 0.1, 0.25, 1.5]),
    unitConversion("mm", "m", 1, "m", 1000, "mm", "1 m = 1000 mm", [10, 25, 50, 125, 750, 1500])
  ];

  // These factors are supplied because students should not have to memorize
  // SI/imperial relationships for this practice set.
  const IMPERIAL_CONVERSIONS = [
    unitConversion("cm", "in", 1, "in", 2.54, "cm", "1 in = 2.54 cm", [2.54, 5.08, 10.16, 15.24, 30.48, 45.72]),
    unitConversion("in", "cm", 2.54, "cm", 1, "in", "1 in = 2.54 cm", [1, 2, 4, 6, 12, 18]),
    unitConversion("kg", "lb", 2.205, "lb", 1, "kg", "1 kg = 2.205 lb", [45, 50, 60, 70, 80, 90]),
    unitConversion("lb", "kg", 1, "kg", 2.205, "lb", "1 kg = 2.205 lb", [110, 132, 154, 176, 198, 220]),
    unitConversion("g", "oz", 1, "oz", 28.35, "g", "1 oz = 28.35 g", [28.35, 56.7, 85.05, 113.4, 226.8]),
    unitConversion("oz", "g", 28.35, "g", 1, "oz", "1 oz = 28.35 g", [1, 2, 3, 4, 8, 12]),
    unitConversion("mL", "fl oz", 1, "fl oz", 29.57, "mL", "1 fl oz = 29.57 mL", [29.57, 59.14, 118.28, 250, 500]),
    unitConversion("fl oz", "mL", 29.57, "mL", 1, "fl oz", "1 fl oz = 29.57 mL", [1, 2, 4, 8, 12]),
    unitConversion("L", "gal", 1, "gal", 3.785, "L", "1 gal = 3.785 L", [0.5, 1, 2, 3.785, 7.57]),
    unitConversion("gal", "L", 3.785, "L", 1, "gal", "1 gal = 3.785 L", [0.25, 0.5, 1, 2, 5])
  ];

  const WEIGHT_BASED_DOSE_RATES = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 7.5, 8, 10, 12, 15, 20];
  const MULTISTEP_DOSE_RATES = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 7.5, 8, 10, 12, 15];

  const PROBLEM_GENERATORS = {
    "SI unit conversions": generateSiConversionProblem,
    "Imperial/SI conversions": generateImperialConversionProblem,
    "Weight-based dosing": generateWeightBasedDoseProblem,
    "Multistep dosing": generateMultistepDoseProblem
  };

  const RANDOM_PROBLEM_WEIGHTS = [
    ["SI unit conversions", 15],
    ["Imperial/SI conversions", 25],
    ["Weight-based dosing", 25],
    ["Multistep dosing", 35]
  ];

  function unitConversion(fromUnit, toUnit, numeratorValue, numeratorUnit, denominatorValue, denominatorUnit, factorSentence, startingValues) {
    return {
      fromUnit,
      toUnit,
      numeratorValue,
      numeratorUnit,
      denominatorValue,
      denominatorUnit,
      factorSentence,
      startingValues
    };
  }

  function conversionFactorSigFigs(conversion) {
    const factorValues = [];
    if (conversion.numeratorValue !== 1) {
      factorValues.push(conversion.numeratorValue);
    }
    if (conversion.denominatorValue !== 1) {
      factorValues.push(conversion.denominatorValue);
    }
    return factorValues.length === 0 ? 99 : significantFiguresFromValues(...factorValues);
  }

  function conversionSetup(amount, conversion) {
    return `${formatNumber(amount)} ${conversion.fromUnit} x (${formatNumber(conversion.numeratorValue)} ${conversion.numeratorUnit} / ${formatNumber(conversion.denominatorValue)} ${conversion.denominatorUnit})`;
  }

  function makeConversionProblem(topic, conversion, amount, showFactorInQuestion) {
    const answer = amount * conversion.numeratorValue / conversion.denominatorValue;
    const expectedSigFigs = showFactorInQuestion
      ? Math.min(significantFiguresFromValue(amount), conversionFactorSigFigs(conversion))
      : significantFiguresFromValue(amount);
    const answerText = formatToSignificantFigures(answer, expectedSigFigs);
    const setup = conversionSetup(amount, conversion);

    let question = `Convert ${formatNumber(amount)} ${conversion.fromUnit} to ${conversion.toUnit}.`;
    if (showFactorInQuestion) {
      question += ` Use ${conversion.factorSentence}.`;
    }

    const firstHint = showFactorInQuestion
      ? `The needed conversion factor is already given: ${conversion.factorSentence}. Write it so ${conversion.fromUnit} cancels and ${conversion.toUnit} remains.`
      : `Useful SI conversion factor: ${conversion.factorSentence}. Write it so ${conversion.fromUnit} cancels and ${conversion.toUnit} remains.`;

    return {
      topic,
      question,
      answer,
      unit: conversion.toUnit,
      answerText,
      firstHint,
      secondHint: `Set up the dimensional analysis like this: ${setup}.`,
      explanation: `${setup} = ${answerText} ${conversion.toUnit}. The ${conversion.fromUnit} units cancel, leaving ${conversion.toUnit}. The final answer is reported to ${significantFigurePhrase(expectedSigFigs)}.`,
      tolerance: 0.02,
      toleranceKind: "relative",
      expectedSigFigs
    };
  }

  function generateSiConversionProblem() {
    const conversion = randomChoice(SI_CONVERSIONS);
    const amount = randomChoice(conversion.startingValues);
    return makeConversionProblem("SI unit conversions", conversion, amount, false);
  }

  function generateImperialConversionProblem() {
    const conversion = randomChoice(IMPERIAL_CONVERSIONS);
    const amount = randomChoice(conversion.startingValues);
    return makeConversionProblem("Imperial/SI conversions", conversion, amount, true);
  }

  function generateWeightBasedDoseProblem() {
    const massKg = randomChoice([45, 50, 55, 60, 65, 70, 75, 80, 90, 100]);
    const doseRate = randomChoice(WEIGHT_BASED_DOSE_RATES);
    const doseMg = massKg * doseRate;
    const expectedSigFigs = significantFiguresFromValues(massKg, doseRate);
    const setup = `${formatNumber(massKg)} kg x (${formatNumber(doseRate)} mg / 1 kg)`;
    const answerText = formatToSignificantFigures(doseMg, expectedSigFigs);

    return {
      topic: "Weight-based dosing",
      question: `A simulated patient has a mass of ${formatNumber(massKg)} kg. The practice dose is ${formatNumber(doseRate)} mg/kg. How many mg are needed?`,
      answer: doseMg,
      unit: "mg",
      answerText,
      firstHint: "Start with the patient mass in kg. The kg unit should cancel when you multiply by mg/kg.",
      secondHint: `Set up the dimensional analysis like this: ${setup}.`,
      explanation: `${setup} = ${answerText} mg. The kg units cancel, leaving mg. The final answer is reported to ${significantFigurePhrase(expectedSigFigs)}. This is practice math only, not a real medication recommendation.`,
      tolerance: 0.02,
      toleranceKind: "relative",
      expectedSigFigs
    };
  }

  function generateMultistepDoseProblem() {
    const massLb = randomChoice([110, 132, 154, 176, 198, 220]);
    const doseRate = randomChoice(MULTISTEP_DOSE_RATES);
    const concentration = randomChoice([25, 50, 75, 100]);
    const massKg = massLb / 2.205;
    const doseMg = massKg * doseRate;
    const volumeMl = doseMg / concentration;
    const expectedSigFigs = Math.min(
      significantFiguresFromValues(massLb, doseRate, concentration),
      significantFiguresFromValue(2.205)
    );
    const setup = `${formatNumber(massLb)} lb x (1 kg / 2.205 lb) x (${formatNumber(doseRate)} mg / 1 kg) x (1 mL / ${formatNumber(concentration)} mg)`;
    const answerText = formatToSignificantFigures(volumeMl, expectedSigFigs);

    return {
      topic: "Multistep dosing",
      question: `A simulated patient has a mass of ${formatNumber(massLb)} lb. The practice dose is ${formatNumber(doseRate)} mg/kg, and the solution contains ${formatNumber(concentration)} mg/mL. How many mL are needed? Use 1 kg = 2.205 lb.`,
      answer: volumeMl,
      unit: "mL",
      answerText,
      firstHint: "This is a chain of conversions: lb to kg, kg to mg using mg/kg, then mg to mL using mg/mL.",
      secondHint: `Set up the dimensional analysis like this: ${setup}.`,
      explanation: `${setup} = ${answerText} mL. Each middle unit cancels: lb, kg, and mg. The final unit is mL. The final answer is reported to ${significantFigurePhrase(expectedSigFigs)}. This is practice math only, not a real medication recommendation.`,
      tolerance: 0.03,
      toleranceKind: "relative",
      expectedSigFigs
    };
  }

  return {
    id: "unit-conversions-and-dosing",
    name: "Unit conversions and dosing",
    description: "Dimensional-analysis practice with SI conversions, SI/imperial conversions, and dosing calculations.",
    randomLabel: "random conversion problem",
    problemGenerators: PROBLEM_GENERATORS,
    randomWeights: RANDOM_PROBLEM_WEIGHTS,
    publicData: {
      SI_CONVERSIONS,
      IMPERIAL_CONVERSIONS,
      WEIGHT_BASED_DOSE_RATES,
      MULTISTEP_DOSE_RATES
    }
  };
});
