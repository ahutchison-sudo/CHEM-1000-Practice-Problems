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
    ? require("./topic_conversions.js")
    : root.ChemPracticeConversionTopic;

  const balancingTopic = typeof require === "function"
    ? require("./topic_balancing.js")
    : root.ChemPracticeBalancingTopic;

  const namingTopic = typeof require === "function"
    ? require("./topic_naming.js")
    : root.ChemPracticeNamingTopic;

  const stoichiometryTopic = typeof require === "function"
    ? require("./topic_stoichiometry.js")
    : root.ChemPracticeStoichiometryTopic;

  const organicNamingTopic = typeof require === "function"
    ? require("./topic_organic_naming.js")
    : root.ChemPracticeOrganicNamingTopic;

  const chemicalReactionsTopic = typeof require === "function"
    ? require("./topic_chemical_reactions.js")
    : root.ChemPracticeChemicalReactionsTopic;

  const redoxTopic = typeof require === "function"
    ? require("./topic_redox.js")
    : root.ChemPracticeRedoxTopic;

  const intermolecularForcesTopic = typeof require === "function"
    ? require("./topic_intermolecular_forces.js")
    : root.ChemPracticeIntermolecularForcesTopic;

  // Carbohydrate Reactions remains in topic_carbohydrate_reactions.js but is
  // temporarily excluded from the student menu pending further image review.

  // Add future topic modules to this list after their script files are loaded
  // in index.html. The order here is the order students see in the menu.
  return [
    conversionTopic,
    balancingTopic,
    namingTopic,
    stoichiometryTopic,
    organicNamingTopic,
    chemicalReactionsTopic,
    redoxTopic,
    intermolecularForcesTopic
  ];
});



