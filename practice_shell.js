(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.ChemPracticeShell = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function () {
  "use strict";

  // The shell uses this internal value when a student wants a random problem
  // from the currently selected topic.
  const RANDOM_PROBLEM_TYPE = "__random_problem_type__";

  function randomChoice(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function weightedRandomTopic(weightedTopics) {
    const totalWeight = weightedTopics.reduce((sum, item) => sum + item[1], 0);
    let target = Math.random() * totalWeight;

    for (const [topic, weight] of weightedTopics) {
      if (target < weight) {
        return topic;
      }
      target -= weight;
    }

    return weightedTopics[weightedTopics.length - 1][0];
  }

  function formatNumber(value, decimalPlaces = 4) {
    let text = Number(value).toFixed(decimalPlaces);
    text = text.replace(/0+$/, "").replace(/\.$/, "");
    return text === "-0" ? "0" : text;
  }

  function roundToSignificantFigures(value, significantFigures) {
    if (value === 0) {
      return 0;
    }

    const sign = Math.sign(value);
    const absoluteValue = Math.abs(value);
    const firstDigitPlace = Math.floor(Math.log10(absoluteValue));
    const factor = Math.pow(10, significantFigures - firstDigitPlace - 1);
    return sign * Math.round((absoluteValue * factor) + Number.EPSILON) / factor;
  }

  function formatToSignificantFigures(value, significantFigures) {
    const rounded = roundToSignificantFigures(value, significantFigures);
    if (rounded === 0) {
      return "0";
    }

    const firstDigitPlace = Math.floor(Math.log10(Math.abs(rounded)));
    const decimalPlaces = Math.max(significantFigures - firstDigitPlace - 1, 0);
    return rounded.toFixed(decimalPlaces);
  }

  function countSignificantFiguresInText(numberText) {
    let mainNumber = String(numberText).toLowerCase().split("e")[0];
    mainNumber = mainNumber.trim().replace(/^[+-]/, "");
    const hasDecimalPoint = mainNumber.includes(".");

    let digits;
    if (hasDecimalPoint) {
      digits = mainNumber.replace(".", "").replace(/^0+/, "");
    } else {
      digits = mainNumber.replace(/^0+/, "").replace(/0+$/, "");
    }

    return digits === "" ? 1 : digits.length;
  }

  function significantFiguresFromValue(value) {
    if (Number.isInteger(Number(value))) {
      return String(Math.abs(Number(value))).length;
    }
    return countSignificantFiguresInText(formatNumber(value));
  }

  function significantFiguresFromValues(...values) {
    return Math.min(...values.map(significantFiguresFromValue));
  }

  function significantFigurePhrase(count) {
    return count === 1 ? "1 significant figure" : `${count} significant figures`;
  }

  function answerWithUnit(problem) {
    return problem.unit ? `${problem.answerText} ${problem.unit}` : problem.answerText;
  }

  function parseCoefficientList(studentText) {
    const matches = String(studentText).match(/[-+]?\d+/g);
    if (!matches) {
      return [];
    }
    return matches.map((text) => Number(text));
  }

  function formatCoefficientList(coefficients) {
    return coefficients.join(", ");
  }

  function coefficientListsMatch(studentCoefficients, correctCoefficients) {
    if (studentCoefficients.length !== correctCoefficients.length) {
      return false;
    }

    return correctCoefficients.every((coefficient, index) => studentCoefficients[index] === coefficient);
  }

  function coefficientListIsScaledUp(studentCoefficients, correctCoefficients) {
    if (studentCoefficients.length !== correctCoefficients.length || correctCoefficients.length === 0) {
      return false;
    }

    const ratio = studentCoefficients[0] / correctCoefficients[0];
    if (!Number.isInteger(ratio) || ratio <= 1) {
      return false;
    }

    return correctCoefficients.every((coefficient, index) => studentCoefficients[index] === coefficient * ratio);
  }

  function coefficientOrderText(problem) {
    if (!problem.coefficientLabels || problem.coefficientLabels.length === 0) {
      return "the formulas from left to right";
    }

    return problem.coefficientLabels.map((label, index) => `${index + 1}. ${label}`).join("; ");
  }

  function normalizeTextAnswer(text) {
    return String(text)
      .toLowerCase()
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2013\u2014]/g, "-")
      .replace(/\((i|ii|iii|iv|v|vi|vii|viii|ix|x)\)/g, " $1 ")
      .replace(/\b1\b/g, " i ")
      .replace(/\b2\b/g, " ii ")
      .replace(/\b3\b/g, " iii ")
      .replace(/\b4\b/g, " iv ")
      .replace(/\b5\b/g, " v ")
      .replace(/\b6\b/g, " vi ")
      .replace(/\b7\b/g, " vii ")
      .replace(/\b8\b/g, " viii ")
      .replace(/\b9\b/g, " ix ")
      .replace(/\b10\b/g, " x ")
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
      .replace(/\s+/g, " ");
  }

  function acceptedTextAnswers(problem) {
    const answers = problem.acceptedAnswers && problem.acceptedAnswers.length > 0
      ? problem.acceptedAnswers
      : [problem.answerText];
    return answers.map(normalizeTextAnswer);
  }

  function evaluateTextAnswer(problem, studentText) {
    const normalizedStudentAnswer = normalizeTextAnswer(studentText);

    if (!normalizedStudentAnswer) {
      return {
        isCorrect: false,
        shouldCount: false,
        feedback: "I could not find a compound name in that answer. Try entering a name like sodium chloride or carbon dioxide."
      };
    }

    if (acceptedTextAnswers(problem).includes(normalizedStudentAnswer)) {
      return {
        isCorrect: true,
        shouldCount: true,
        feedback: `Correct.\n\nAnswer: ${answerWithUnit(problem)}\n\n${problem.reasoningLabel || "Naming reasoning"}:\n${problem.explanation}`
      };
    }

    return {
      isCorrect: false,
      shouldCount: true,
      feedback: `Not quite yet.\n\nCheck the naming path for this compound.\nFirst hint: ${problem.firstHint}`
    };
  }

  function extractNumberDetails(text) {
    const cleanText = String(text).replace(/,/g, "");
    const classroomScientific = cleanText.match(/([-+]?(?:\d+(?:\.\d*)?|\.\d+))\s*(?:x|\*)\s*10\s*(?:\^|\*\*)?\s*([-+]?\d+)/i);

    if (classroomScientific) {
      const mantissaText = classroomScientific[1];
      const mantissa = Number(mantissaText);
      const exponent = Number(classroomScientific[2]);
      return {
        value: mantissa * Math.pow(10, exponent),
        sigFigs: countSignificantFiguresInText(mantissaText)
      };
    }

    const ordinaryNumber = cleanText.match(/[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][-+]?\d+)?/);
    if (ordinaryNumber) {
      const numberText = ordinaryNumber[0];
      return {
        value: Number(numberText),
        sigFigs: countSignificantFiguresInText(numberText)
      };
    }

    return null;
  }

  function extractNumber(text) {
    const details = extractNumberDetails(text);
    return details ? details.value : null;
  }

  function answerIsClose(studentAnswer, correctAnswer, tolerance, toleranceKind) {
    const difference = Math.abs(studentAnswer - correctAnswer);
    if (toleranceKind === "absolute") {
      return difference <= tolerance;
    }
    if (correctAnswer === 0) {
      return difference <= tolerance;
    }
    return difference / Math.abs(correctAnswer) <= tolerance;
  }

  function answerMatchesSigFigRounding(studentAnswer, correctAnswer, studentSigFigs) {
    const roundedCorrect = roundToSignificantFigures(correctAnswer, studentSigFigs);
    const allowedTinyDifference = Math.max(Math.abs(roundedCorrect) * 0.000001, 0.000001);
    return Math.abs(studentAnswer - roundedCorrect) <= allowedTinyDifference;
  }

  function answerTextIsAmbiguousWholeNumber(problem) {
    const answerText = String(problem.answerText).trim();
    return /^[-+]?\d+$/.test(answerText) && answerText.endsWith("0");
  }

  function sigFigFeedback(problem, studentAnswer, studentSigFigs) {
    if (studentSigFigs === problem.expectedSigFigs) {
      return "";
    }

    const displayedAnswer = extractNumber(problem.answerText);
    if (
      displayedAnswer !== null &&
      answerTextIsAmbiguousWholeNumber(problem) &&
      answerIsClose(studentAnswer, displayedAnswer, 0.000001, "absolute")
    ) {
      return "";
    }

    return `\n\nSignificant figures note: You entered ${significantFigurePhrase(studentSigFigs)}. For this problem, use ${significantFigurePhrase(problem.expectedSigFigs)}. A properly rounded final answer is ${answerWithUnit(problem)}.`;
  }

  function evaluateCoefficientAnswer(problem, studentText) {
    const correctCoefficients = problem.coefficients || [];
    const expectedCount = correctCoefficients.length;
    const containsFormulaLetters = /[A-Za-z]/.test(String(studentText));

    if (containsFormulaLetters) {
      return {
        isCorrect: false,
        shouldCount: false,
        feedback: `Enter only the coefficients, not the whole equation. For this problem, enter ${expectedCount} whole numbers in order: ${coefficientOrderText(problem)}.`
      };
    }

    const studentCoefficients = parseCoefficientList(studentText);

    if (studentCoefficients.length === 0) {
      return {
        isCorrect: false,
        shouldCount: false,
        feedback: `I could not find any coefficients. Enter ${expectedCount} whole numbers in order, using 1 when a formula does not need a visible coefficient.`
      };
    }

    if (studentCoefficients.length !== expectedCount) {
      return {
        isCorrect: false,
        shouldCount: false,
        feedback: `I found ${studentCoefficients.length} coefficient(s), but this equation needs ${expectedCount}. Enter one coefficient for each formula in this order: ${coefficientOrderText(problem)}.`
      };
    }

    if (studentCoefficients.some((coefficient) => !Number.isInteger(coefficient) || coefficient <= 0)) {
      return {
        isCorrect: false,
        shouldCount: false,
        feedback: "Use positive whole-number coefficients only. If a formula does not need a visible coefficient, enter 1 for that position."
      };
    }

    if (coefficientListsMatch(studentCoefficients, correctCoefficients)) {
      const reasoningLabel = problem.reasoningLabel || "Balancing reasoning";
      return {
        isCorrect: true,
        shouldCount: true,
        feedback: `Correct.\n\nAnswer: ${answerWithUnit(problem)}\n\n${reasoningLabel}:\n${problem.explanation}`
      };
    }

    if (coefficientListIsScaledUp(studentCoefficients, correctCoefficients)) {
      return {
        isCorrect: false,
        shouldCount: true,
        feedback: `These coefficients are proportional to the balanced equation, but they are not the lowest whole-number set. Reduce ${formatCoefficientList(studentCoefficients)} to the smallest whole-number ratio.\n\nFirst hint: ${problem.firstHint}`
      };
    }

    return {
      isCorrect: false,
      shouldCount: true,
      feedback: `Not quite yet.\n\nCheck the atom counts on both sides of the arrow. Enter coefficients in this order: ${coefficientOrderText(problem)}.\nFirst hint: ${problem.firstHint}`
    };
  }

  function evaluateAnswer(problem, studentText) {
    if (problem.answerType === "coefficients") {
      return evaluateCoefficientAnswer(problem, studentText);
    }

    if (problem.answerType === "text") {
      return evaluateTextAnswer(problem, studentText);
    }

    const numberDetails = extractNumberDetails(studentText);

    if (!numberDetails) {
      return {
        isCorrect: false,
        shouldCount: false,
        feedback: "I could not find a number in that answer. Try entering a value like 18.02 or 0.0015."
      };
    }

    const studentAnswer = numberDetails.value;
    const studentSigFigs = numberDetails.sigFigs;
    const isClose = answerIsClose(studentAnswer, problem.answer, problem.tolerance, problem.toleranceKind);
    const matchesRoundedAnswer = answerMatchesSigFigRounding(studentAnswer, problem.answer, studentSigFigs);

    if (isClose || matchesRoundedAnswer) {
      return {
        isCorrect: true,
        shouldCount: true,
        feedback: `Correct.\n\nAnswer: ${answerWithUnit(problem)}${sigFigFeedback(problem, studentAnswer, studentSigFigs)}\n\n${problem.reasoningLabel || "Dimensional-analysis reasoning"}:\n${problem.explanation}`
      };
    }

    const direction = studentAnswer < problem.answer ? "lower" : "higher";
    let differenceText;
    if (problem.toleranceKind === "relative" && problem.answer !== 0) {
      const percentError = Math.abs(studentAnswer - problem.answer) / Math.abs(problem.answer) * 100;
      differenceText = `Your answer is ${direction} than expected by about ${percentError.toFixed(1)}%.`;
    } else {
      const difference = Math.abs(studentAnswer - problem.answer);
      differenceText = `Your answer is ${direction} than expected by about ${formatNumber(difference, 3)}.`;
    }

    if (studentAnswer < 0 && problem.answer > 0) {
      differenceText += " For this problem, the final value should be positive.";
    }

    return {
      isCorrect: false,
      shouldCount: true,
      feedback: `Not quite yet.\n\n${differenceText}\nFirst hint: ${problem.firstHint}\n\nCheck that your starting unit cancels and the requested unit is the only unit left. Use Show hint for the setup, or Show solution if you are ready to see the full work.`
    };
  }

  function createPracticeLogic(topicRegistry, options = {}) {
    const practiceTopics = topicRegistry.filter(Boolean);
    if (practiceTopics.length === 0) {
      throw new Error("The practice shell needs at least one topic module.");
    }

    const defaultTopicId = options.defaultTopicId || practiceTopics[0].id;

    function getTopic(topicId) {
      return practiceTopics.find((topic) => topic.id === topicId) || practiceTopics[0];
    }

    function getTopicOptions() {
      return practiceTopics.map((topic) => ({
        id: topic.id,
        name: topic.name,
        description: topic.description || ""
      }));
    }

    function getProblemTypeOptions(topicId) {
      const topic = getTopic(topicId);
      const optionsForTopic = [{
        value: RANDOM_PROBLEM_TYPE,
        label: topic.randomLabel || "random problem from this topic"
      }];

      for (const problemType of Object.keys(topic.problemGenerators)) {
        optionsForTopic.push({
          value: problemType,
          label: problemType
        });
      }

      return optionsForTopic;
    }

    function chooseProblemType(topic, selectedProblemType) {
      if (
        !selectedProblemType ||
        selectedProblemType === RANDOM_PROBLEM_TYPE ||
        selectedProblemType === topic.randomLabel
      ) {
        return weightedRandomTopic(topic.randomWeights);
      }

      if (topic.problemGenerators[selectedProblemType]) {
        return selectedProblemType;
      }

      return weightedRandomTopic(topic.randomWeights);
    }

    // This accepts either the new two-part call, generateProblem(topicId, problemType),
    // or the older one-part call, generateProblem(problemType), so the tests and older
    // examples remain easy to understand.
    function resolveGenerateArguments(topicIdOrProblemType, problemType) {
      const matchedTopic = practiceTopics.find((topic) => topic.id === topicIdOrProblemType);
      if (matchedTopic) {
        return {
          topic: matchedTopic,
          selectedProblemType: problemType
        };
      }

      return {
        topic: getTopic(defaultTopicId),
        selectedProblemType: topicIdOrProblemType || RANDOM_PROBLEM_TYPE
      };
    }

    function generateProblem(topicIdOrProblemType, problemType) {
      const resolved = resolveGenerateArguments(topicIdOrProblemType, problemType);
      const selectedProblemType = chooseProblemType(resolved.topic, resolved.selectedProblemType);
      const generator = resolved.topic.problemGenerators[selectedProblemType];
      const problem = generator();

      return {
        ...problem,
        practiceTopicId: resolved.topic.id,
        practiceTopicName: resolved.topic.name,
        problemType: problem.topic || selectedProblemType
      };
    }

    const defaultTopic = getTopic(defaultTopicId);
    const publicTopicData = practiceTopics.reduce((combined, topic) => Object.assign(combined, topic.publicData || {}), {});

    return Object.assign({
      RANDOM_PROBLEM_TYPE,
      MIXED_TOPIC: defaultTopic.randomLabel || "random problem from this topic",
      PRACTICE_TOPICS: practiceTopics,
      PROBLEM_GENERATORS: defaultTopic.problemGenerators,
      RANDOM_PROBLEM_WEIGHTS: defaultTopic.randomWeights,
      answerIsClose,
      answerMatchesSigFigRounding,
      answerWithUnit,
      countSignificantFiguresInText,
      evaluateAnswer,
      formatCoefficientList,
      parseCoefficientList,
      normalizeTextAnswer,
      extractNumber,
      extractNumberDetails,
      formatNumber,
      formatToSignificantFigures,
      generateProblem,
      getProblemTypeOptions,
      getTopicOptions,
      significantFiguresFromValue,
      weightedRandomTopic
    }, publicTopicData);
  }

  const helpers = {
    randomChoice,
    formatNumber,
    formatToSignificantFigures,
    significantFiguresFromValue,
    significantFiguresFromValues,
    significantFigurePhrase
  };

  return {
    RANDOM_PROBLEM_TYPE,
    answerIsClose,
    answerMatchesSigFigRounding,
    answerWithUnit,
    countSignificantFiguresInText,
    createPracticeLogic,
    evaluateAnswer,
    formatCoefficientList,
    parseCoefficientList,
    normalizeTextAnswer,
    extractNumber,
    extractNumberDetails,
    formatNumber,
    formatToSignificantFigures,
    helpers,
    significantFiguresFromValue,
    weightedRandomTopic
  };
});




