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
  const ASSET_VERSION = "20260818-haworth-v2";
  const HAWORTH_SOURCE = "Instructor-approved local Haworth PNG (Wikimedia Commons source)";

  const STRUCTURES = {
    "alpha-glucose": asset("alpha-D-glucopyranose", 79025, "alpha-D-glucopyranose.png", "\u03B1-D-glucopyranose", "b7ebacb99a9a94e5244c221f3649ed63696b0ec2ce80f9231aeffa288bed05bb"),
    "beta-glucose": asset("beta-D-glucopyranose", 64689, "beta-D-glucopyranose.png", "\u03B2-D-glucopyranose", "48c1c5bc5a39cafa3aae81a82907f921a6036010971e79dd5c8fb5018948915c"),
    "alpha-galactose": asset("alpha-D-galactopyranose", 439357, "alpha-D-galactopyranose.png", "\u03B1-D-galactopyranose", "3278b58bd47431cf9b3c6fa1580453d39436be9f99dd676f525d9b02c97ea18a"),
    "beta-galactose": asset("beta-D-galactopyranose", 439353, "beta-D-galactopyranose.png", "\u03B2-D-galactopyranose", "27eea37e0d0b7cf09de88a332f43663a72163b34f9a53879f8437773cee50fd6"),
    "beta-fructose": asset("beta-D-fructofuranose", 439709, "beta-D-fructofuranose.png", "\u03B2-D-fructofuranose", "d7956340e1599c36b0633b6e51fc48da8c24879610adec4a265f6115d485996f"),
    maltose: asset("maltose", 439186, "maltose.png", "maltose", "5dd997103a7f0790b0cdd4dbf3835478534812e1838133b6930196210b828d92"),
    cellobiose: asset("cellobiose", 439178, "cellobiose.png", "cellobiose", "fc49e07dcbfe194bfccfada9b5fbe17c24e9d536c1d517297d3f38b0f6d71863"),
    lactose: asset("lactose", 440995, "lactose.png", "lactose", "6bcaeb170f99a3aa09d17d92951436e87aebabd64440edad4bcb142fb6a4ac02"),
    sucrose: asset("sucrose", 5988, "sucrose.png", "sucrose", "a2acdf9379fec36bcaa165407c4cb05a6470f2c6e82a62895af29f58b6261cea"),
    lactulose: asset("lactulose", 11333, "lactulose.png", "lactulose", "a4a9f8f2151584719d27bf24a9ff68cccb71f2af5ad2f18960d8696fc3647c78")
  };

  const PRODUCT_IDS = ["maltose", "cellobiose", "lactose", "sucrose", "lactulose"];

  const PROBLEMS = [
    reaction("maltose", "\u03B1-D-glucopyranose", "\u03B2-D-glucopyranose", "\u03B1 (1\u21924)", "Maltose has an \u03B1-D-glucose donor linked from C1 to C4 of a second glucose residue."),
    reaction("cellobiose", "\u03B2-D-glucopyranose", "\u03B2-D-glucopyranose", "\u03B2 (1\u21924)", "Cellobiose has a \u03B2-D-glucose donor linked from C1 to C4 of a second glucose residue."),
    reaction("lactose", "\u03B2-D-galactopyranose", "\u03B2-D-glucopyranose", "\u03B2 (1\u21924)", "Lactose has a \u03B2-D-galactose donor linked from C1 to C4 of glucose."),
    reaction("sucrose", "\u03B1-D-glucopyranose", "\u03B2-D-fructofuranose", "\u03B1 (1\u21922) \u03B2", "Sucrose links the anomeric C1 of \u03B1-D-glucose to the anomeric C2 of \u03B2-D-fructofuranose.")
  ];

  function asset(manifestId, pubchemCid, filename, label, sha256) {
    return { manifestId, pubchemCid, filename, label, sha256, source: HAWORTH_SOURCE };
  }

  function reaction(productId, donorLabel, acceptorLabel, linkage, explanation) {
    const donor = Object.values(STRUCTURES).find((item) => item.label === donorLabel);
    const acceptor = Object.values(STRUCTURES).find((item) => item.label === acceptorLabel);
    return { product: STRUCTURES[productId], donor, acceptor, linkage, explanation };
  }

  function img(structure, className) {
    return '<img class="' + className + '" src="' + ASSET_PATH + structure.filename + '?v=' + ASSET_VERSION + '" alt="' + structure.label + '">';
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
    return shuffled(PRODUCT_IDS.map((productId, index) => {
      const structure = STRUCTURES[productId];
      return {
        id: "choice-" + (index + 1),
        label: String.fromCharCode(65 + index) + ".",
        text: structure.label,
        html: '<figure class="carbohydrate-choice"><div class="carbohydrate-image-frame">' + img(structure, "approved-carbohydrate-image") + '</div><figcaption>' + structure.label + '</figcaption></figure>',
        structureManifestId: structure.manifestId,
        pubchemCid: structure.pubchemCid,
        assetFilename: structure.filename,
        assetSha256: structure.sha256,
        structureSource: structure.source,
        structureModified: false,
        instructorAssetApproved: true
      };
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
      questionHtml: '<div class="carbohydrate-question"><p>Which disaccharide is formed when <strong>' + problem.donor.label + '</strong> joins <strong>' + problem.acceptor.label + '</strong> through a <strong>' + problem.linkage + '</strong> glycosidic linkage?</p><div class="carbohydrate-reactants approved-reactants"><figure>' + img(problem.donor, "approved-monosaccharide-image") + '<figcaption>' + problem.donor.label + '</figcaption></figure><span class="carbohydrate-plus">+</span><figure>' + img(problem.acceptor, "approved-monosaccharide-image") + '<figcaption>' + problem.acceptor.label + '</figcaption></figure><span class="carbohydrate-arrow">\u2192</span><strong>?</strong><span class="carbohydrate-plus">+</span><span>H\u2082O</span></div></div>',
      choices,
      answerChoiceId: answerChoice.id,
      answerText: problem.product.label + ": " + problem.linkage + " linkage",
      unit: "",
      firstHint: "Identify the two monosaccharide residues, then compare the specified \u03B1/\u03B2 configuration and carbon numbers with the approved Haworth disaccharide structures.",
      secondHint: "The correct structure preserves the specified donor anomer and linkage position. The other answer choices differ in monomer identity, anomer, or linkage position.",
      explanation: problem.explanation,
      startMessage: "Choose the approved Haworth disaccharide structure that matches the stated glycosidic linkage. You have two attempts for this problem.",
      answerPlaceholder: "",
      solutionLabel: "Glycosidic-bond solution",
      reasoningLabel: "Carbohydrate-reaction reasoning",
      instructorMetadata: {
        structure_manifest_id: problem.product.manifestId,
        pubchem_cid: problem.product.pubchemCid,
        asset_file: "assets/" + problem.product.filename,
        asset_sha256: problem.product.sha256,
        structure_source: problem.product.source,
        structure_modified: false,
        instructor_asset_approved: true
      }
    };
  }

  return {
    id: "carbohydrate-reactions",
    name: "Carbohydrate Reactions",
    description: "Practice identifying approved Haworth disaccharide products from their monosaccharide components and glycosidic linkages.",
    randomLabel: "random carbohydrate reaction",
    problemGenerators: { "Predict disaccharide product": makeProblem },
    randomWeights: [["Predict disaccharide product", 100]],
    publicData: { CARBOHYDRATE_REACTION_EXAMPLES: PROBLEMS, CARBOHYDRATE_STRUCTURES: STRUCTURES }
  };
});
