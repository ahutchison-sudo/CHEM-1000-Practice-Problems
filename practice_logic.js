(function (root) {
  "use strict";

  let logic;

  if (typeof module === "object" && module.exports) {
    const shell = require("./practice_shell.js");
    const topicRegistry = require("./topic_registry.js");
    logic = shell.createPracticeLogic(topicRegistry);
    module.exports = logic;
    return;
  }

  if (root.ChemPracticeLogic) {
    return;
  }

  if (root.ChemPracticeShell && root.ChemPracticeTopicRegistry) {
    logic = root.ChemPracticeShell.createPracticeLogic(root.ChemPracticeTopicRegistry);
    root.ChemPracticeLogic = logic;
  }
})(typeof globalThis !== "undefined" ? globalThis : window);

