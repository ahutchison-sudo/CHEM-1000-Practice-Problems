(function (root, factory) {
  const registry = factory(root);

  if (typeof module === "object" && module.exports) {
    module.exports = registry;
    return;
  }

  root.ChemPracticeTopicRegistry = registry;

  // This keeps a browser-friendly default available for app.js.
  if (root.ChemPracticeShell) {
    root.ChemPracticeLogic = root.ChemPracticeShell.createPracticeLogic(registry);
  }
})(typeof globalThis !== "undefined" ? globalThis : window, function (root) {
  "use strict";

  const conversionTopic = typeof require === "function"
    ? require("./conversions.js")
    : root.ChemPracticeConversionTopic;

  // Add future topic modules to this list. For example, a mole-conversions topic
  // could be loaded in index.html and then added here after conversionTopic.
  return [
    conversionTopic
  ];
});