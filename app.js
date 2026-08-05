(function () {
  "use strict";

  const logic = window.ChemPracticeLogic;

  const topicSelect = document.getElementById("topicSelect");
  const problemTypeSelect = document.getElementById("problemTypeSelect");
  const newProblemButton = document.getElementById("newProblemButton");
  const hintButton = document.getElementById("hintButton");
  const solutionButton = document.getElementById("solutionButton");
  const problemTopic = document.getElementById("problemTopic");
  const attemptText = document.getElementById("attemptText");
  const questionText = document.getElementById("questionText");
  const answerForm = document.getElementById("answerForm");
  const answerInput = document.getElementById("answerInput");
  const feedbackBox = document.getElementById("feedbackBox");
  const scoreText = document.getElementById("scoreText");

  const state = {
    currentProblem: null,
    problemCompleted: false,
    currentProblemAttempts: 0,
    hintCount: 0,
    correctCount: 0,
    completedCount: 0
  };

  function setupTopicMenu() {
    topicSelect.replaceChildren();

    for (const topic of logic.getTopicOptions()) {
      const option = document.createElement("option");
      option.value = topic.id;
      option.textContent = topic.name;
      topicSelect.appendChild(option);
    }

    setupProblemTypeMenu();
  }

  function setupProblemTypeMenu() {
    problemTypeSelect.replaceChildren();

    for (const problemType of logic.getProblemTypeOptions(topicSelect.value)) {
      const option = document.createElement("option");
      option.value = problemType.value;
      option.textContent = problemType.label;
      problemTypeSelect.appendChild(option);
    }
  }

  function setFeedback(text, kind) {
    feedbackBox.textContent = text;
    feedbackBox.classList.remove("correct", "needs-work", "neutral");
    feedbackBox.classList.add(kind || "neutral");
  }

  function updateScore() {
    if (state.completedCount === 0) {
      scoreText.textContent = "No completed problems yet.";
      return;
    }

    scoreText.textContent = `Score: ${state.correctCount} correct out of ${state.completedCount} completed problems`;
  }

  function updateAttemptText() {
    if (state.problemCompleted) {
      attemptText.textContent = "Problem complete";
      return;
    }

    const nextAttempt = Math.min(state.currentProblemAttempts + 1, 2);
    attemptText.textContent = `Attempt ${nextAttempt} of 2`;
  }

  function newProblem() {
    state.currentProblem = logic.generateProblem(topicSelect.value, problemTypeSelect.value);
    state.problemCompleted = false;
    state.currentProblemAttempts = 0;
    state.hintCount = 0;

    problemTopic.textContent = `${state.currentProblem.practiceTopicName}: ${state.currentProblem.problemType}`;
    questionText.textContent = state.currentProblem.question;
    answerInput.value = "";
    answerInput.placeholder = state.currentProblem.answerPlaceholder || "Example: 250 mg";
    answerInput.focus();
    updateAttemptText();
    const startMessage = state.currentProblem.startMessage || "Enter your answer, then choose Check answer. You have two attempts for this problem. Units are welcome but not required.\n\nTip: arrange each relationship so the unwanted unit cancels and the requested unit remains.";
    setFeedback(startMessage, "neutral");
  }

  function checkAnswer() {
    if (!state.currentProblem) {
      newProblem();
      return;
    }

    const result = logic.evaluateAnswer(state.currentProblem, answerInput.value);

    if (!result.shouldCount) {
      setFeedback(result.feedback, "needs-work");
      return;
    }

    if (state.problemCompleted) {
      setFeedback(
        `This problem has already been completed.\n\n${result.feedback}\n\nChoose New problem when you are ready to continue.`,
        result.isCorrect ? "correct" : "neutral"
      );
      return;
    }

    state.currentProblemAttempts += 1;

    if (result.isCorrect) {
      state.problemCompleted = true;
      state.completedCount += 1;
      state.correctCount += 1;
      setFeedback(result.feedback, "correct");
      updateScore();
      updateAttemptText();
      return;
    }

    if (state.currentProblemAttempts === 1) {
      state.hintCount = Math.max(state.hintCount, 1);
      setFeedback(
        `Not quite yet. You have one more attempt for this problem.\n\nHint 1:\n${state.currentProblem.firstHint}\n\nTry again before viewing the full solution.`,
        "needs-work"
      );
      updateAttemptText();
      return;
    }

    state.problemCompleted = true;
    state.completedCount += 1;
    setFeedback(
      `Not quite. That was the second attempt for this problem.\n\n${result.feedback}\n\nAnswer: ${logic.answerWithUnit(state.currentProblem)}\n\n${state.currentProblem.solutionLabel || "Dimensional-analysis solution"}:\n${state.currentProblem.explanation}`,
      "needs-work"
    );
    updateScore();
    updateAttemptText();
  }

  function showHint() {
    if (!state.currentProblem) {
      return;
    }

    state.hintCount += 1;
    if (state.hintCount === 1) {
      setFeedback(`Hint 1:\n${state.currentProblem.firstHint}`, "neutral");
      return;
    }

    setFeedback(
      `Hint 1:\n${state.currentProblem.firstHint}\n\nHint 2:\n${state.currentProblem.secondHint}`,
      "neutral"
    );
  }

  function showSolution() {
    if (!state.currentProblem) {
      return;
    }

    setFeedback(
      `Answer: ${logic.answerWithUnit(state.currentProblem)}\n\n${state.currentProblem.solutionLabel || "Dimensional-analysis solution"}:\n${state.currentProblem.explanation}`,
      "neutral"
    );
  }

  setupTopicMenu();
  newProblemButton.addEventListener("click", newProblem);
  hintButton.addEventListener("click", showHint);
  solutionButton.addEventListener("click", showSolution);
  topicSelect.addEventListener("change", function () {
    setupProblemTypeMenu();
    newProblem();
  });
  problemTypeSelect.addEventListener("change", newProblem);
  answerForm.addEventListener("submit", function (event) {
    event.preventDefault();
    checkAnswer();
  });

  updateScore();
  newProblem();
})();

