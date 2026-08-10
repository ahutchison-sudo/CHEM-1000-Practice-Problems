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

  const SUGARS = {
    glucose: { name: "glucose", oh: ["down", "down", "up", "down"], ch2oh: "up" },
    galactose: { name: "galactose", oh: ["down", "up", "up", "down"], ch2oh: "up" },
    mannose: { name: "mannose", oh: ["up", "down", "up", "down"], ch2oh: "up" },
    altrose: { name: "altrose", oh: ["up", "up", "up", "down"], ch2oh: "up" },
    fructose: { name: "fructose", oh: ["down", "up", "down", "up"], ch2oh: "up", anomericCarbon: 2 }
  };

  const REACTION_EXAMPLES = [
    example("glucose", "altrose", "α", 1, 4),
    example("galactose", "glucose", "β", 1, 4),
    example("glucose", "fructose", "α", 1, 2),
    example("fructose", "galactose", "β", 2, 4),
    example("mannose", "glucose", "β", 1, 6),
    example("galactose", "mannose", "α", 1, 6),
    example("altrose", "glucose", "β", 1, 3)
  ];

  function example(donor, acceptor, anomer, donorCarbon, acceptorCarbon) {
    return { donor, acceptor, anomer, donorCarbon, acceptorCarbon };
  }

  function labelFor(index) {
    return String.fromCharCode(65 + index) + ".";
  }

  function shuffled(items) {
    const copy = items.slice();
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }
    return copy;
  }

  function ringSvg(sugarKey, anomer, options = {}) {
    const sugar = SUGARS[sugarKey];
    const id = options.id || "ring";
    const className = options.className || "carbohydrate-ring";
    const linkCarbon = options.linkCarbon || null;
    const isDonor = Boolean(options.isDonor);
    const points = { 1: [118, 95], 2: [88, 143], 3: [36, 143], 4: [8, 95], 5: [42, 48], O: [91, 48] };
    const bonds = [[1, 2], [2, 3], [3, 4], [4, 5], [5, "O"], ["O", 1]];
    const parts = ['<svg class="' + className + '" viewBox="0 0 142 205" role="img" aria-label="' + sugar.name + ' pyranose ring">'];
    parts.push('<g class="carb-bonds">');
    for (const [start, end] of bonds) {
      parts.push('<line x1="' + points[start][0] + '" y1="' + points[start][1] + '" x2="' + points[end][0] + '" y2="' + points[end][1] + '"/>');
    }
    parts.push('</g><text class="carb-oxygen" x="' + points.O[0] + '" y="' + points.O[1] + '">O</text>');

    for (let carbon = 1; carbon <= 4; carbon += 1) {
      const [x, y] = points[carbon];
      const direction = carbon === 1 ? (anomer === "α" ? "down" : "up") : sugar.oh[carbon - 1];
      const dy = direction === "up" ? -33 : 37;
      const showingBond = (isDonor && carbon === (sugar.anomericCarbon || 1)) || (!isDonor && carbon === linkCarbon);
      parts.push('<line class="carb-substituent" x1="' + x + '" y1="' + y + '" x2="' + x + '" y2="' + (y + dy * 0.66) + '"/>');
      if (showingBond) {
        parts.push('<circle class="carb-link-site" cx="' + x + '" cy="' + (y + dy) + '" r="5"/>');
      } else {
        parts.push('<text class="carb-oh" x="' + x + '" y="' + (y + dy) + '">OH</text>');
      }
      parts.push('<text class="carb-carbon" x="' + (x + 10) + '" y="' + (y - 6) + '">' + carbon + '</text>');
    }

    const [x5, y5] = points[5];
    parts.push('<line class="carb-substituent" x1="' + x5 + '" y1="' + y5 + '" x2="' + x5 + '" y2="' + (y5 - 30) + '"/>');
    parts.push('<text class="carb-oh" x="' + x5 + '" y="' + (y5 - 43) + '">CH₂OH</text>');
    if (linkCarbon === 6) {
      parts.push('<circle class="carb-link-site" cx="' + x5 + '" cy="' + (y5 - 43) + '" r="5"/>');
    }
    parts.push('</svg>');
    return parts.join("");
  }

  function monosaccharideSvg(sugarKey, anomer) {
    return ringSvg(sugarKey, anomer, { id: "mono-" + sugarKey, className: "carbohydrate-ring carbohydrate-monosaccharide" });
  }

  function disaccharideSvg(item) {
    const donor = SUGARS[item.donor];
    const acceptor = SUGARS[item.acceptor];
    const donorRing = ringSvg(item.donor, item.anomer, { id: "donor", isDonor: true, className: "carbohydrate-ring carbohydrate-product-ring" });
    const acceptorRing = ringSvg(item.acceptor, "β", { id: "acceptor", linkCarbon: item.acceptorCarbon, className: "carbohydrate-ring carbohydrate-product-ring" });
    const donorX = 12;
    const acceptorX = 214;
    const donorY = 10;
    const acceptorY = item.acceptorCarbon === 6 ? 0 : 10;
    const donorSite = { x: 118, y: item.anomer === "α" ? 132 : 58 };
    const acceptorSites = { 2: { x: 88, y: 143 }, 3: { x: 36, y: 143 }, 4: { x: 8, y: 95 }, 6: { x: 42, y: 5 } };
    const acceptorSite = acceptorSites[item.acceptorCarbon] || acceptorSites[4];
    const startX = donorX + donorSite.x;
    const startY = donorY + donorSite.y;
    const endX = acceptorX + acceptorSite.x;
    const endY = acceptorY + acceptorSite.y;
    return '<svg class="carbohydrate-product" viewBox="0 0 370 225" role="img" aria-label="Disaccharide structure"><g transform="translate(' + donorX + ' ' + donorY + ')">' + donorRing + '</g><g transform="translate(' + acceptorX + ' ' + acceptorY + ')">' + acceptorRing + '</g><path class="carb-glycosidic-bond" d="M ' + startX + ' ' + startY + ' C 182 ' + startY + ', 190 ' + endY + ', ' + endX + ' ' + endY + '"/><text class="carb-bond-oxygen" x="' + ((startX + endX) / 2) + '" y="' + ((startY + endY) / 2 - 8) + '">O</text></svg>';
  }

  function choiceItems(item) {
    const alternatives = [
      item,
      { ...item, anomer: item.anomer === "α" ? "β" : "α" },
      { ...item, acceptorCarbon: item.acceptorCarbon === 4 ? 6 : 4 },
      { ...item, donorCarbon: item.donorCarbon === 1 ? 2 : 1 },
      { donor: item.acceptor, acceptor: item.donor, anomer: item.anomer, donorCarbon: item.donorCarbon, acceptorCarbon: item.acceptorCarbon }
    ];
    return alternatives;
  }

  function makeCarbohydrateProblem() {
    const item = randomChoice(REACTION_EXAMPLES);
    const choices = shuffled(choiceItems(item)).map((candidate, index) => ({
      id: "choice-" + (index + 1),
      label: labelFor(index),
      text: candidate.donor + "–" + candidate.acceptor + " " + candidate.anomer + "(" + candidate.donorCarbon + "→" + candidate.acceptorCarbon + ")",
      html: disaccharideSvg(candidate),
      candidate
    }));
    const correctChoice = choices.find((choice) => (
      choice.candidate.donor === item.donor &&
      choice.candidate.acceptor === item.acceptor &&
      choice.candidate.anomer === item.anomer &&
      choice.candidate.donorCarbon === item.donorCarbon &&
      choice.candidate.acceptorCarbon === item.acceptorCarbon
    ));

    return {
      topic: "Predict disaccharide product",
      answerType: "multiple-choice",
      question: "Which disaccharide is formed by this glycosidic-bond reaction?",
      questionHtml: '<div class="carbohydrate-question"><p>Which disaccharide is formed when <strong>' + SUGARS[item.donor].name + '</strong> joins <strong>' + SUGARS[item.acceptor].name + '</strong> through an <strong>' + item.anomer + ' (' + item.donorCarbon + '→' + item.acceptorCarbon + ')</strong> glycosidic bond?</p><div class="carbohydrate-reactants"><div>' + monosaccharideSvg(item.donor, item.anomer) + '<span>' + SUGARS[item.donor].name + '</span></div><span class="carbohydrate-plus">+</span><div>' + monosaccharideSvg(item.acceptor, "β") + '<span>' + SUGARS[item.acceptor].name + '</span></div><span class="carbohydrate-arrow">→</span><strong>?</strong><span class="carbohydrate-plus">+</span><span>H₂O</span></div></div>',
      choices,
      answerChoiceId: correctChoice.id,
      answerText: item.anomer + " (" + item.donorCarbon + "→" + item.acceptorCarbon + ") glycosidic bond between " + SUGARS[item.donor].name + " and " + SUGARS[item.acceptor].name,
      unit: "",
      firstHint: "Find the donor's anomeric carbon and connect it through oxygen to the stated carbon on the acceptor. The α/β label sets the direction of the donor's glycosidic oxygen.",
      secondHint: "For an α linkage, the donor's glycosidic oxygen points down in this Haworth-style drawing; for β, it points up. The acceptor ring keeps its own anomeric OH unless that carbon is the stated linkage site.",
      explanation: "The new glycosidic bond connects carbon " + item.donorCarbon + " of " + SUGARS[item.donor].name + " to carbon " + item.acceptorCarbon + " of " + SUGARS[item.acceptor].name + ". The donor configuration is " + item.anomer + ", so choose the structure with that bond direction and those two rings.",
      startMessage: "Choose the disaccharide structure that matches the specified linkage. You have two attempts for this problem.",
      answerPlaceholder: "",
      solutionLabel: "Glycosidic-bond solution",
      reasoningLabel: "Carbohydrate-reaction reasoning"
    };
  }

  return {
    id: "carbohydrate-reactions",
    name: "Carbohydrate Reactions",
    description: "Practice predicting disaccharides formed from pyranose monosaccharides and specified glycosidic bonds.",
    randomLabel: "random carbohydrate reaction",
    problemGenerators: { "Predict disaccharide product": makeCarbohydrateProblem },
    randomWeights: [["Predict disaccharide product", 100]],
    publicData: {
      CARBOHYDRATE_REACTION_EXAMPLES: REACTION_EXAMPLES,
      CARBOHYDRATE_SUGARS: SUGARS
    }
  };
});