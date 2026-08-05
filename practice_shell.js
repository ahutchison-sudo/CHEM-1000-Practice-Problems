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

  function evaluateAnswer(problem, studentText) {
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
        feedback: `Correct.\n\nAnswer: ${answerWithUnit(problem)}${sigFigFeedback(problem, studentAnswer, studentSigFigs)}\n\nDimensional-analysis reasoning:\n${problem.explanation}`
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
    extractNumber,
    extractNumberDetails,
    formatNumber,
    formatToSignificantFigures,
    helpers,
    significantFiguresFromValue,
    weightedRandomTopic
  };
});