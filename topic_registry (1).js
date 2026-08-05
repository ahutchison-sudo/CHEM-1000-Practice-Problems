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

  const balancingTopic = typeof require === "function"
    ? require("./balancing.js")
    : root.ChemPracticeBalancingTopic;

  const namingTopic = typeof require === "function"
    ? require("./naming.js")
    : root.ChemPracticeNamingTopic;

  // Add future topic modules to this list after their script files are loaded
  // in index.html. The order here is the order students see in the menu.
  return [
    conversionTopic,
    balancingTopic,
    namingTopic
  ];
});
