(function (root, factory) {
  let shell = root.ChemPracticeShell;

  if (typeof module === "object" && module.exports) {
    shell = require("./practice_shell.js");
    module.exports = factory(shell.helpers);
    return;
  }

  root.ChemPracticeCarbohydrateReactionsTopic = factory(shell.helpers);
})(typeof globalThis !== "undefined" ? globalThis : window, function (helpers) {
  "use strict";

  const { randomChoice } = helpers;
  const ASSET_PATH = "assets/carbohydrates/";

  const STRUCTURES = {
    "alpha-glucose": asset("alpha-D-glucopyranose", 79025, "alpha-D-glucopyranose.png", "α-D-glucopyranose"),
    "beta-glucose": asset("beta-D-glucopyranose", 64689, "beta-D-glucopyranose.png", "β-D-glucopyranose"),
    "alpha-galactose": asset("alpha-D-galactopyranose", 439357, "alpha-D-galactopyranose.png", "α-D-galactopyranose"),
    "beta-galactose": asset("beta-D-galactopyranose", 439353, "beta-D-galactopyranose.png", "β-D-galactopyranose"),
    "beta-fructose": asset("beta-D-fructofuranose", 439709, "beta-D-fructofuranose.png", "β-D-fructofuranose"),
    maltose: asset("maltose", 439186, "maltose.png", "maltose"),
    cellobiose: asset("cellobiose", 439178, "cellobiose.png", "cellobiose"),
    lactose: asset("lactose", 440995, "lactose.png", "lactose"),
    isomaltose: asset("isomaltose", 439193, "isomaltose.png", "isomaltose"),
    melibiose: asset("melibiose", 440658, "melibiose.png", "melibiose"),
    sucrose: asset("sucrose", 5988, "sucrose.png", "sucrose"),
    trehalose: asset("trehalose", 7427, "trehalose.png", "trehalose")
  };

  const PROBLEMS = [
    reaction("maltose", "α-D-glucopyranose", "β-D-glucopyranose", "α (1→4)", "Maltose has an α-D-glucose donor linked from C1 to C4 of a second glucose residue."),
    reaction("cellobiose", "β-D-glucopyranose", "β-D-glucopyranose", "β (1→4)", "Cellobiose has a β-D-glucose donor linked from C1 to C4 of a second glucose residue."),
    reaction("lactose", "β-D-galactopyranose", "β-D-glucopyranose", "β (1→4)", "Lactose has a β-D-galactose donor linked from C1 to C4 of glucose."),
    reaction("isomaltose", "α-D-glucopyranose", "β-D-glucopyranose", "α (1→6)", "Isomaltose has an α-D-glucose donor linked from C1 to C6 of glucose."),
    reaction("melibiose", "α-D-galactopyranose", "β-D-glucopyranose", "α (1→6)", "Melibiose has an α-D-galactose donor linked from C1 to C6 of glucose."),
    reaction("sucrose", "α-D-glucopyranose", "β-D-fructofuranose", "α (1→2) β", "Sucrose links the anomeric C1 of α-D-glucose to the anomeric C2 of β-D-fructofuranose."),
    reaction("trehalose", "α-D-glucopyranose", "α-D-glucopyranose", "α,α (1↔1)", "Trehalose links the two anomeric C1 carbons of α-D-glucose residues.")
  ];

  function asset(manifestId, pubchemCid, filename, label) {
    return { manifestId, pubchemCid, filename, label, source: "Instructor-approved local asset" };
  }

  function reaction(productId, donorLabel, acceptorLabel, linkage, explanation) {
    const donor = Object.values(STRUCTURES).find((item) => item.label === donorLabel);
    const acceptor = Object.values(STRUCTURES).find((item) => item.label === acceptorLabel);
    return { product: STRUCTURES[productId], donor, acceptor, linkage, explanation };
  }

  function img(structure, className) {
    return '<img class="' + className + '" src="' + ASSET_PATH + structure.filename + '" alt="' + structure.label + '">';
  }

  function shuffled(items) {
    const copy = items.slice();
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }
    return copy;
  }

  function choicesFor(problem) {
    const distractors = Object.values(STRUCTURES)
      .filter((item) => ["maltose", "cellobiose", "lactose", "isomaltose", "melibiose", "sucrose", "trehalose"].includes(item.manifestId) && item.manifestId !== problem.product.manifestId);
    const selected = shuffled(distractors).slice(0, 4);
    return shuffled([problem.product, ...selected]).map((structure, index) => ({
      id: "choice-" + (index + 1),
      label: String.fromCharCode(65 + index) + ".",
      text: structure.label,
      html: '<figure class="carbohydrate-choice"><div class="carbohydrate-image-frame">' + img(structure, "approved-carbohydrate-image") + '</div><figcaption>' + structure.label + '</figcaption></figure>',
      structureManifestId: structure.manifestId,
      pubchemCid: structure.pubchemCid,
      assetFilename: structure.filename,
      structureSource: structure.source,
      structureModified: false
    }));
  }

  function makeProblem() {
    const problem = randomChoice(PROBLEMS);
    const choices = choicesFor(problem);
    const answerChoice = choices.find((choice) => choice.structureManifestId === problem.product.manifestId);
    return {
      topic: "Predict disaccharide product",
      answerType: "multiple-choice",
      question: "Which approved disaccharide structure is formed by this glycosidic-bond reaction?",
      questionHtml: '<div class="carbohydrate-question"><p>Which disaccharide is formed when <strong>' + problem.donor.label + '</strong> joins <strong>' + problem.acceptor.label + '</strong> through a <strong>' + problem.linkage + '</strong> glycosidic linkage?</p><div class="carbohydrate-reactants approved-reactants"><figure>' + img(problem.donor, "approved-monosaccharide-image") + '<figcaption>' + problem.donor.label + '</figcaption></figure><span class="carbohydrate-plus">+</span><figure>' + img(problem.acceptor, "approved-monosaccharide-image") + '<figcaption>' + problem.acceptor.label + '</figcaption></figure><span class="carbohydrate-arrow">→</span><strong>?</strong><span class="carbohydrate-plus">+</span><span>H₂O</span></div></div>',
      choices,
      answerChoiceId: answerChoice.id,
      answerText: problem.product.label + ": " + problem.linkage + " linkage",
      unit: "",
      firstHint: "Identify the two monosaccharide residues, then compare the specified α/β configuration and carbon numbers with the approved disaccharide structures.",
      secondHint: "The correct structure preserves the specified donor anomer and linkage position. The other answer choices differ in monomer identity, anomer, or linkage position.",
      explanation: problem.explanation,
      startMessage: "Choose the approved disaccharide structure that matches the stated glycosidic linkage. You have two attempts for this problem.",
      answerPlaceholder: "",
      solutionLabel: "Glycosidic-bond solution",
      reasoningLabel: "Carbohydrate-reaction reasoning",
      instructorMetadata: {
        structure_manifest_id: problem.product.manifestId,
        pubchem_cid: problem.product.pubchemCid,
        asset_filename: problem.product.filename,
        structure_source: problem.product.source,
        structure_modified: false
      }
    };
  }

  return {
    id: "carbohydrate-reactions",
    name: "Carbohydrate Reactions",
    description: "Practice identifying approved disaccharide products from their monosaccharide components and glycosidic linkages.",
    randomLabel: "random carbohydrate reaction",
    problemGenerators: { "Predict disaccharide product": makeProblem },
    randomWeights: [["Predict disaccharide product", 100]],
    publicData: { CARBOHYDRATE_REACTION_EXAMPLES: PROBLEMS, CARBOHYDRATE_STRUCTURES: STRUCTURES }
  };
});