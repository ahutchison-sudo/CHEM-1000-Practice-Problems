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
  const ASSET_VERSION = "20260819-curated-only";
  // Historical source claim; no per-file Commons URL/license or instructor sign-off
  // is recorded. Chemical review is distinct from permission to release to students.
  const HAWORTH_SOURCE = "Local PNG; legacy code attributes Wikimedia Commons (provenance unverified)";
  const ASSET_REVIEW = {
    "alpha-D-glucopyranose": "chemically-consistent",
    "beta-D-glucopyranose": "chemically-consistent",
    "alpha-D-galactopyranose": "chemically-consistent",
    "beta-D-galactopyranose": "chemically-consistent",
    "beta-D-fructofuranose": "chemically-consistent",
    cellobiose: "legacy-curated",
    lactose: "legacy-curated",
    sucrose: "instructor-review-required",
    lactulose: "instructor-review-required",
    isomaltose: "instructor-review-required",
    trehalose: "stereochemistry-review-required",
    maltose: "invalid-png",
    melibiose: "invalid-png"
  };

  const STRUCTURES = {
    "alpha-glucose": asset("alpha-D-glucopyranose", 79025, "alpha-D-glucopyranose.png", "\u03B1-D-glucopyranose", "b7ebacb99a9a94e5244c221f3649ed63696b0ec2ce80f9231aeffa288bed05bb"),
    "beta-glucose": asset("beta-D-glucopyranose", 64689, "beta-D-glucopyranose.png", "\u03B2-D-glucopyranose", "48c1c5bc5a39cafa3aae81a82907f921a6036010971e79dd5c8fb5018948915c"),
    "alpha-galactose": asset("alpha-D-galactopyranose", 439357, "alpha-D-galactopyranose.png", "\u03B1-D-galactopyranose", "3278b58bd47431cf9b3c6fa1580453d39436be9f99dd676f525d9b02c97ea18a"),
    "beta-galactose": asset("beta-D-galactopyranose", 439353, "beta-D-galactopyranose.png", "\u03B2-D-galactopyranose", "27eea37e0d0b7cf09de88a332f43663a72163b34f9a53879f8437773cee50fd6"),
    "beta-fructose": asset("beta-D-fructofuranose", 439709, "beta-D-fructofuranose.png", "\u03B2-D-fructofuranose", "d7956340e1599c36b0633b6e51fc48da8c24879610adec4a265f6115d485996f"),
    maltose: asset("maltose", 439186, "maltose.png", "maltose", "fc76eb4cd99865c4517921fa59fe70e3717d22b27ee376586bbcefad00d76cdb"),
    cellobiose: asset("cellobiose", 439178, "cellobiose.png", "cellobiose", "fc49e07dcbfe194bfccfada9b5fbe17c24e9d536c1d517297d3f38b0f6d71863"),
    lactose: asset("lactose", 440995, "lactose.png", "lactose", "6bcaeb170f99a3aa09d17d92951436e87aebabd64440edad4bcb142fb6a4ac02"),
    sucrose: asset("sucrose", 5988, "sucrose.png", "sucrose", "a2acdf9379fec36bcaa165407c4cb05a6470f2c6e82a62895af29f58b6261cea"),
    lactulose: asset("lactulose", 11333, "lactulose.png", "lactulose", "a4a9f8f2151584719d27bf24a9ff68cccb71f2af5ad2f18960d8696fc3647c78"),
    // CIDs are database references for the named compounds, not image verification.
    isomaltose: asset("isomaltose", null, "isomaltose.png", "isomaltose", "bccc19b37d8f10fc3b5bbc92ce02735f385cf40142d5622ee96a107a8847cbc7"),
    melibiose: asset("melibiose", null, "melibiose.png", "melibiose", "39938ee82ce93904d73519bcd8768ec3803b7e2060385775a6216c5053f8f673"),
    trehalose: asset("trehalose", null, "trehalose.png", "trehalose", "b9042566be60c508ead7f9e816cb3975effe8ca523013a772b739a964f857cb0")
  };

  // Keep the historical curated subset for isolated instructor previews only.
  // Do not pad to five with quarantined assets; see CARBOHYDRATE_REVIEW.md.
  const PRODUCT_IDS = ["cellobiose", "lactose"];
  const TARGET_CHOICE_COUNT = 5;

  const PROBLEMS = [
    reaction("cellobiose", "beta-glucose", "beta-glucose",
      "Cellobiose has a β-D-glucose donor linked from C1 to C4 of a second glucose residue."),
    reaction("lactose", "beta-galactose", "beta-glucose",
      "Lactose has a β-D-galactose donor linked from C1 to C4 of glucose.")
  ];

  function asset(manifestId, pubchemCid, filename, label, sha256) {
    return {
      manifestId, pubchemCid, filename, label, sha256, source: HAWORTH_SOURCE,
      reviewStatus: ASSET_REVIEW[manifestId], instructorAssetApproved: false
    };
  }

  function reaction(productId, donorId, acceptorId, explanation) {
    const product = STRUCTURES[productId];
    const donor = STRUCTURES[donorId];
    const acceptor = STRUCTURES[acceptorId];
    if (!product || !donor || !acceptor || !PRODUCT_IDS.includes(productId) ||
        product.reviewStatus !== "legacy-curated" ||
        donor.reviewStatus !== "chemically-consistent" ||
        acceptor.reviewStatus !== "chemically-consistent") {
      throw new Error("Carbohydrate reaction references an unavailable structure.");
    }
    return {
      product, donor, acceptor, donorId, acceptorId,
      anomer: "β", donorCarbon: 1, acceptorCarbon: 4,
      acceptorAnomer: "β", linkage: "β (1→4)",
      explanation: explanation + " The drawing shows the β reducing-end glucose anomer. " +
        "Its free C1 hydroxyl is not part of the glycosidic bond; the reducing end can mutarotate in solution."
    };
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

  function choicesFor() {
    return shuffled(PRODUCT_IDS).map((productId, index) => {
      const structure = STRUCTURES[productId];
      if (!structure || structure.reviewStatus !== "legacy-curated") {
        throw new Error("Carbohydrate preview cannot use a quarantined answer asset.");
      }
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
        instructorAssetApproved: structure.instructorAssetApproved,
        assetReviewStatus: structure.reviewStatus
      };
    });
  }

  function makeProblem() {
    const problem = randomChoice(PROBLEMS);
    const choices = choicesFor();
    const answerChoice = choices.find((choice) => choice.structureManifestId === problem.product.manifestId);
    return {
      topic: "Predict disaccharide product",
      answerType: "multiple-choice",
      question: "Which disaccharide structure matches the specified residues and glycosidic linkage?",
      questionHtml: '<div class="carbohydrate-question"><p>In a formal condensation model, which disaccharide is formed when <strong>' + problem.donor.label + '</strong> joins <strong>' + problem.acceptor.label + '</strong> through a <strong>' + problem.linkage + '</strong> glycosidic linkage? Show the β reducing-end glucose anomer.</p><div class="carbohydrate-reactants approved-reactants"><figure>' + img(problem.donor, "approved-monosaccharide-image") + '<figcaption>' + problem.donor.label + '</figcaption></figure><span class="carbohydrate-plus">+</span><figure>' + img(problem.acceptor, "approved-monosaccharide-image") + '<figcaption>' + problem.acceptor.label + '</figcaption></figure><span class="carbohydrate-arrow">\u2192</span><strong>?</strong><span class="carbohydrate-plus">+</span><span>H\u2082O</span></div></div>',
      choices,
      answerChoiceId: answerChoice.id,
      answerText: problem.product.label + ": " + problem.linkage + " linkage",
      unit: "",
      firstHint: "Identify the two monosaccharide residues, then compare the specified \u03B1/\u03B2 configuration and carbon numbers with the disaccharide structures.",
      secondHint: "Both preview choices have a β (1→4) linkage and a β reducing-end glucose. Compare the donor C4 hydroxyl: down for glucose, up for galactose.",
      explanation: problem.explanation,
      startMessage: "Choose the disaccharide structure that matches the stated residues and glycosidic linkage. You have two attempts for this problem.",
      answerPlaceholder: "",
      solutionLabel: "Glycosidic-bond solution",
      reasoningLabel: "Carbohydrate-reaction reasoning",
      instructorMetadata: {
        structure_manifest_id: problem.product.manifestId,
        pubchem_cid: problem.product.pubchemCid,
        asset_file: ASSET_PATH + problem.product.filename,
        asset_sha256: problem.product.sha256,
        structure_source: problem.product.source,
        structure_modified: false,
        instructor_asset_approved: problem.product.instructorAssetApproved,
        asset_review_status: problem.product.reviewStatus,
        target_choice_count: TARGET_CHOICE_COUNT,
        release_ready: false
      }
    };
  }

  return {
    id: "carbohydrate-reactions",
    name: "Carbohydrate Reactions",
    description: "Instructor preview of disaccharide structures and specified glycosidic linkages; disabled pending release review.",
    randomLabel: "random carbohydrate reaction",
    problemGenerators: { "Predict disaccharide product": makeProblem },
    randomWeights: [["Predict disaccharide product", 100]],
    publicData: { CARBOHYDRATE_REACTION_EXAMPLES: PROBLEMS, CARBOHYDRATE_STRUCTURES: STRUCTURES, CARBOHYDRATE_PRODUCT_IDS: PRODUCT_IDS, CARBOHYDRATE_TARGET_CHOICE_COUNT: TARGET_CHOICE_COUNT }
  };
});
