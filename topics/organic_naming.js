(function (root, factory) {
  let shell = root.ChemPracticeShell;

  if (typeof module === "object" && module.exports) {
    shell = require("../practice_shell.js");
    module.exports = factory(shell.helpers);
    return;
  }

  root.ChemPracticeOrganicNamingTopic = factory(shell.helpers);
})(typeof globalThis !== "undefined" ? globalThis : window, function (helpers) {
  "use strict";

  const { randomChoice } = helpers;

  // Short chains are hard to draw in a useful folded layout. For eligible
  // molecules, this setting makes challenge layouts appear a little under half
  // the time, which gives about one-third of all organic naming problems.
  const CHALLENGE_LAYOUT_PROBABILITY = 0.5;
  const EXPANDED_DRAWING_PROBABILITY = 0.5;

  const SUBSCRIPT_DIGITS = {
    0: "\u2080",
    1: "\u2081",
    2: "\u2082",
    3: "\u2083",
    4: "\u2084",
    5: "\u2085",
    6: "\u2086",
    7: "\u2087",
    8: "\u2088",
    9: "\u2089"
  };

  const PARENT_NAMES = {
    3: "propane",
    4: "butane",
    5: "pentane",
    6: "hexane",
    7: "heptane",
    8: "octane",
    9: "nonane",
    10: "decane"
  };

  const MULTIPLIER_PREFIXES = {
    1: "",
    2: "di",
    3: "tri",
    4: "tetra"
  };

  const SUBSTITUENTS = {
    methyl: substituent("methyl", "methyl", "chain", 1),
    ethyl: substituent("ethyl", "ethyl", "chain", 2),
    propyl: substituent("propyl", "propyl", "chain", 3),
    isopropyl: substituent("isopropyl", "isopropyl", "isopropyl", 3),
    butyl: substituent("butyl", "butyl", "chain", 4),
    isobutyl: substituent("isobutyl", "isobutyl", "isobutyl", 4),
    secbutyl: substituent("sec-butyl", "butyl", "secbutyl", 4),
    tertbutyl: substituent("tert-butyl", "butyl", "tertbutyl", 4),
    fluoro: substituent("fluoro", "fluoro", "halogen", 0, "F"),
    chloro: substituent("chloro", "chloro", "halogen", 0, "Cl"),
    bromo: substituent("bromo", "bromo", "halogen", 0, "Br"),
    iodo: substituent("iodo", "iodo", "halogen", 0, "I")
  };

  const ALKYL_SUBSTITUENT_MOLECULES = [
    molecule(3, [branch(2, "methyl")]),
    molecule(4, [branch(2, "methyl")]),
    molecule(5, [branch(3, "methyl")]),
    molecule(5, [branch(3, "ethyl")]),
    molecule(5, [branch(2, "methyl"), branch(2, "methyl")]),
    molecule(5, [branch(2, "methyl"), branch(3, "methyl")]),
    molecule(6, [branch(3, "ethyl")]),
    molecule(6, [branch(2, "methyl"), branch(2, "methyl")]),
    molecule(6, [branch(2, "methyl"), branch(3, "methyl")]),
    molecule(6, [branch(3, "methyl"), branch(3, "methyl")]),
    molecule(6, [branch(3, "ethyl"), branch(2, "methyl")]),
    molecule(7, [branch(2, "methyl"), branch(4, "methyl")]),
    molecule(7, [branch(3, "ethyl"), branch(4, "methyl")]),
    molecule(8, [branch(4, "propyl")]),
    molecule(8, [branch(3, "ethyl"), branch(5, "methyl")]),
    molecule(10, [branch(5, "butyl")])
  ];

  const HALOGEN_SUBSTITUENT_MOLECULES = [
    molecule(3, [branch(1, "fluoro")]),
    molecule(4, [branch(2, "fluoro")]),
    molecule(4, [branch(1, "chloro")]),
    molecule(4, [branch(2, "chloro")]),
    molecule(5, [branch(3, "bromo")]),
    molecule(5, [branch(1, "iodo")]),
    molecule(6, [branch(1, "chloro"), branch(4, "chloro")]),
    molecule(6, [branch(2, "bromo"), branch(3, "chloro")]),
    molecule(4, [branch(2, "bromo"), branch(3, "bromo")]),
    molecule(7, [branch(3, "iodo")]),
    molecule(7, [branch(2, "fluoro"), branch(4, "chloro")]),
    molecule(8, [branch(3, "bromo"), branch(5, "iodo")])
  ];

  const MIXED_SUBSTITUENT_MOLECULES = [
    molecule(6, [branch(2, "chloro"), branch(3, "methyl")]),
    molecule(6, [branch(3, "bromo"), branch(2, "methyl")]),
    molecule(6, [branch(2, "iodo"), branch(3, "methyl")]),
    molecule(7, [branch(2, "fluoro"), branch(4, "methyl")]),
    molecule(7, [branch(4, "bromo"), branch(3, "ethyl")]),
    molecule(8, [branch(2, "bromo"), branch(4, "ethyl"), branch(5, "methyl")]),
    molecule(8, [branch(3, "chloro"), branch(5, "ethyl"), branch(2, "methyl")]),
    molecule(9, [branch(5, "bromo"), branch(4, "propyl")]),
    molecule(10, [branch(3, "chloro"), branch(4, "ethyl"), branch(6, "methyl")]),
    molecule(10, [branch(2, "fluoro"), branch(5, "ethyl"), branch(7, "methyl")])
  ];

  const COMMON_BRANCHED_SUBSTITUENT_MOLECULES = [
    molecule(7, [branch(3, "isopropyl")]),
    molecule(7, [branch(4, "isopropyl")]),
    molecule(7, [branch(4, "tertbutyl")]),
    molecule(8, [branch(4, "isobutyl")]),
    molecule(8, [branch(4, "secbutyl")]),
    molecule(10, [branch(5, "tertbutyl")]),
    molecule(10, [branch(5, "isobutyl")]),
    molecule(10, [branch(5, "secbutyl")]),
    molecule(10, [branch(4, "ethyl"), branch(6, "isopropyl")]),
    molecule(10, [branch(3, "bromo"), branch(5, "tertbutyl")])
  ];

  const PROBLEM_GROUPS = {
    "Alkyl substituents": ALKYL_SUBSTITUENT_MOLECULES,
    "Halogen substituents": HALOGEN_SUBSTITUENT_MOLECULES,
    "Mixed substituents": MIXED_SUBSTITUENT_MOLECULES,
    "Common branched substituents": COMMON_BRANCHED_SUBSTITUENT_MOLECULES
  };

  const PROBLEM_GENERATORS = {
    "Alkyl substituents": () => makeOrganicNamingProblem("Alkyl substituents", ALKYL_SUBSTITUENT_MOLECULES),
    "Halogen substituents": () => makeOrganicNamingProblem("Halogen substituents", HALOGEN_SUBSTITUENT_MOLECULES),
    "Mixed substituents": () => makeOrganicNamingProblem("Mixed substituents", MIXED_SUBSTITUENT_MOLECULES),
    "Common branched substituents": () => makeOrganicNamingProblem("Common branched substituents", COMMON_BRANCHED_SUBSTITUENT_MOLECULES)
  };

  const RANDOM_PROBLEM_WEIGHTS = [
    ["Alkyl substituents", 30],
    ["Halogen substituents", 25],
    ["Mixed substituents", 25],
    ["Common branched substituents", 20]
  ];

  function substituent(name, sortKey, drawingType, carbonCount, atomLabel = "") {
    return {
      name,
      sortKey,
      drawingType,
      carbonCount,
      atomLabel
    };
  }

  function branch(position, kind) {
    return {
      position,
      kind
    };
  }

  function molecule(parentLength, substituents) {
    const copiedSubstituents = substituents.map((item) => ({
      position: item.position,
      kind: item.kind
    }));
    const answerText = buildName(parentLength, copiedSubstituents);

    return {
      parentLength,
      substituents: copiedSubstituents,
      answerText,
      acceptedAnswers: answerVariants(answerText)
    };
  }

  function parentName(parentLength) {
    return PARENT_NAMES[parentLength];
  }

  function substituentInfo(kind) {
    return SUBSTITUENTS[kind];
  }

  function groupedSubstituents(substituents) {
    const groups = {};

    for (const item of substituents) {
      if (!groups[item.kind]) {
        groups[item.kind] = [];
      }
      groups[item.kind].push(item.position);
    }

    return Object.keys(groups).map((kind) => ({
      kind,
      positions: groups[kind].slice().sort((a, b) => a - b)
    })).sort((a, b) => {
      const first = substituentInfo(a.kind).sortKey;
      const second = substituentInfo(b.kind).sortKey;
      return first.localeCompare(second);
    });
  }

  function buildName(parentLength, substituents) {
    const pieces = groupedSubstituents(substituents).map((group) => {
      const info = substituentInfo(group.kind);
      const multiplier = MULTIPLIER_PREFIXES[group.positions.length] || "";
      return `${group.positions.join(",")}-${multiplier}${info.name}`;
    });

    return `${pieces.join("-")}${parentName(parentLength)}`;
  }

  function addAnswerVariant(variants, text) {
    variants.add(text);
    variants.add(text.replace(/-/g, " "));
    variants.add(text.replace(/-/g, ""));
    variants.add(text.replace(/,/g, " "));
    variants.add(text.replace(/,/g, ""));
    variants.add(text.replace(/,/g, " ").replace(/-/g, " "));
  }

  function withParentSeparated(text) {
    const parentNames = Object.values(PARENT_NAMES).sort((a, b) => b.length - a.length);

    for (const name of parentNames) {
      if (text.endsWith(name)) {
        return `${text.slice(0, -name.length)} ${name}`;
      }
    }

    return text;
  }

  function answerVariants(answerText) {
    const variants = new Set();
    const firstPass = new Set([answerText, withParentSeparated(answerText)]);

    for (const text of firstPass) {
      addAnswerVariant(variants, text);
    }

    const expanded = Array.from(variants);
    for (const text of expanded) {
      addAnswerVariant(variants, text.replace(/sec-butyl/g, "secbutyl"));
      addAnswerVariant(variants, text.replace(/sec-butyl/g, "sec butyl"));
      addAnswerVariant(variants, text.replace(/tert-butyl/g, "tertbutyl"));
      addAnswerVariant(variants, text.replace(/tert-butyl/g, "tert butyl"));
      addAnswerVariant(variants, text.replace(/tert-butyl/g, "t-butyl"));
      addAnswerVariant(variants, text.replace(/isopropyl/g, "propan-2-yl"));
      addAnswerVariant(variants, text.replace(/isopropyl/g, "(propan-2-yl)"));
      addAnswerVariant(variants, text.replace(/isobutyl/g, "2-methylpropyl"));
      addAnswerVariant(variants, text.replace(/isobutyl/g, "(2-methylpropyl)"));
      addAnswerVariant(variants, text.replace(/sec-butyl/g, "butan-2-yl"));
      addAnswerVariant(variants, text.replace(/sec-butyl/g, "(butan-2-yl)"));
    }

    return Array.from(variants);
  }

  function chooseDrawingStyle() {
    return Math.random() < EXPANDED_DRAWING_PROBABILITY ? "expanded" : "skeletal";
  }

  function chooseDrawingLayout(item) {
    if (item.parentLength < 6) {
      return "standard";
    }

    return Math.random() < CHALLENGE_LAYOUT_PROBABILITY ? "folded" : "standard";
  }

  function makeOrganicNamingProblem(category, molecules) {
    const item = randomChoice(molecules);
    const parent = parentName(item.parentLength);
    const drawingStyle = chooseDrawingStyle();
    const drawingLayout = chooseDrawingLayout(item);

    return {
      topic: category,
      answerType: "text",
      question: "Name the substituted alkane shown.",
      questionHtml: `<div class="organic-question"><p>Name the substituted alkane shown.</p>${drawMoleculeSvg(item, drawingStyle, drawingLayout)}</div>`,
      answerText: item.answerText,
      acceptedAnswers: item.acceptedAnswers,
      drawingStyle,
      drawingLayout,
      unit: "",
      firstHint: "Trace the longest continuous carbon chain. Do not assume that the longest chain is the most horizontal part of the drawing.",
      secondHint: `The longest chain in this structure has ${item.parentLength} carbons, so the parent name is ${parent}. Now number that chain for the lowest substituent locants and alphabetize the substituent names.`,
      explanation: organicExplanation(item),
      answerPlaceholder: "Example: 4-ethylheptane",
      startMessage: "Enter the organic compound name. Capitalization does not matter. Common substituent names such as isopropyl, sec-butyl, and tert-butyl are accepted.",
      solutionLabel: "Organic naming solution",
      reasoningLabel: "Organic naming reasoning"
    };
  }

  function organicExplanation(item) {
    const parent = parentName(item.parentLength);
    const grouped = groupedSubstituents(item.substituents);
    const substituentText = grouped.map((group) => {
      const info = substituentInfo(group.kind);
      const locants = group.positions.join(",");
      const groupLabel = group.positions.length > 1 ? `${info.name} groups` : `${info.name} group`;
      const locantLabel = group.positions.length > 1 ? `locants ${locants}` : `carbon ${locants}`;
      return `${groupLabel} at ${locantLabel}`;
    }).join("; ");

    return `The longest continuous carbon chain has ${item.parentLength} carbons, so the parent is ${parent}. The substituents are: ${substituentText}. Put substituent names in alphabetical order and use commas between numbers and hyphens between numbers and words. The correct name is ${item.answerText}.`;
  }

  function roundCoordinate(value) {
    return Math.round(value * 10) / 10;
  }

  function pointFrom(point, angleDegrees, length) {
    const angleRadians = angleDegrees * Math.PI / 180;
    return {
      x: point.x + Math.cos(angleRadians) * length,
      y: point.y + Math.sin(angleRadians) * length
    };
  }

  function parentBondAngles(parentLength, drawingLayout) {
    const bondCount = parentLength - 1;

    if (drawingLayout === "folded" && parentLength >= 6) {
      const straightBonds = Math.max(3, Math.min(bondCount - 3, Math.ceil(bondCount * 0.55)));
      const angles = [];

      for (let index = 0; index < straightBonds; index += 1) {
        angles.push(index % 2 === 0 ? -28 : 28);
      }

      angles.push(95);

      while (angles.length < bondCount) {
        angles.push(angles.length % 2 === 0 ? -28 : 28);
      }

      return angles;
    }

    return Array.from({ length: bondCount }, (_, index) => index % 2 === 0 ? -28 : 28);
  }

  function parentCoordinates(parentLength, drawingLayout) {
    const bondLength = 58;
    const coordinates = [{ x: 0, y: 0 }];
    const angles = parentBondAngles(parentLength, drawingLayout);

    for (const angle of angles) {
      coordinates.push(pointFrom(coordinates[coordinates.length - 1], angle, bondLength));
    }

    return coordinates;
  }

  function branchDirection(anchor, branchIndex, branchCount, centerY) {
    if (branchCount > 1) {
      return branchIndex % 2 === 0 ? "up" : "down";
    }

    return anchor.y <= centerY ? "up" : "down";
  }

  function primaryAngle(direction) {
    return direction === "up" ? -90 : 90;
  }

  function secondaryAngle(direction) {
    return direction === "up" ? -30 : 30;
  }

  function oppositeSecondaryAngle(direction) {
    return direction === "up" ? -150 : 150;
  }

  function addNode(graph, element, point, role = "substituent") {
    const node = {
      id: graph.nodes.length,
      element,
      x: point.x,
      y: point.y,
      role
    };

    graph.nodes.push(node);
    return node.id;
  }

  function addBond(graph, firstId, secondId) {
    graph.bonds.push({
      firstId,
      secondId
    });
  }

  function nodeById(graph, id) {
    return graph.nodes.find((node) => node.id === id);
  }

  function addCarbonChain(graph, anchorId, direction, carbonCount) {
    const bondLength = 50;
    const angles = [
      primaryAngle(direction),
      secondaryAngle(direction),
      primaryAngle(direction),
      secondaryAngle(direction)
    ];
    let currentId = anchorId;
    let currentPoint = nodeById(graph, currentId);

    for (let index = 0; index < carbonCount; index += 1) {
      const nextPoint = pointFrom(currentPoint, angles[index % angles.length], bondLength);
      const nextId = addNode(graph, "C", nextPoint);
      addBond(graph, currentId, nextId);
      currentId = nextId;
      currentPoint = nextPoint;
    }
  }

  function addHalogen(graph, anchorId, direction, label) {
    const anchor = nodeById(graph, anchorId);
    const atomPoint = pointFrom(anchor, primaryAngle(direction), 54);
    const halogenId = addNode(graph, label, atomPoint, "halogen");
    addBond(graph, anchorId, halogenId);
  }

  function addIsopropyl(graph, anchorId, direction) {
    const bondLength = 50;
    const anchor = nodeById(graph, anchorId);
    const centerPoint = pointFrom(anchor, primaryAngle(direction), bondLength);
    const centerId = addNode(graph, "C", centerPoint);
    const firstMethylId = addNode(graph, "C", pointFrom(centerPoint, oppositeSecondaryAngle(direction), bondLength));
    const secondMethylId = addNode(graph, "C", pointFrom(centerPoint, secondaryAngle(direction), bondLength));

    addBond(graph, anchorId, centerId);
    addBond(graph, centerId, firstMethylId);
    addBond(graph, centerId, secondMethylId);
  }

  function addSecButyl(graph, anchorId, direction) {
    const bondLength = 50;
    const anchor = nodeById(graph, anchorId);
    const centerPoint = pointFrom(anchor, primaryAngle(direction), bondLength);
    const centerId = addNode(graph, "C", centerPoint);
    const methylId = addNode(graph, "C", pointFrom(centerPoint, oppositeSecondaryAngle(direction), bondLength));
    const ethylPoint = pointFrom(centerPoint, secondaryAngle(direction), bondLength);
    const ethylId = addNode(graph, "C", ethylPoint);
    const terminalId = addNode(graph, "C", pointFrom(ethylPoint, primaryAngle(direction), bondLength));

    addBond(graph, anchorId, centerId);
    addBond(graph, centerId, methylId);
    addBond(graph, centerId, ethylId);
    addBond(graph, ethylId, terminalId);
  }

  function addIsoButyl(graph, anchorId, direction) {
    const bondLength = 50;
    const anchor = nodeById(graph, anchorId);
    const firstPoint = pointFrom(anchor, primaryAngle(direction), bondLength);
    const firstId = addNode(graph, "C", firstPoint);
    const centerPoint = pointFrom(firstPoint, secondaryAngle(direction), bondLength);
    const centerId = addNode(graph, "C", centerPoint);
    const methylOneId = addNode(graph, "C", pointFrom(centerPoint, primaryAngle(direction), bondLength));
    const methylTwoId = addNode(graph, "C", pointFrom(centerPoint, secondaryAngle(direction), bondLength));

    addBond(graph, anchorId, firstId);
    addBond(graph, firstId, centerId);
    addBond(graph, centerId, methylOneId);
    addBond(graph, centerId, methylTwoId);
  }

  function addTertButyl(graph, anchorId, direction) {
    const bondLength = 48;
    const anchor = nodeById(graph, anchorId);
    const centerPoint = pointFrom(anchor, primaryAngle(direction), bondLength);
    const centerId = addNode(graph, "C", centerPoint);
    const methylOneId = addNode(graph, "C", pointFrom(centerPoint, primaryAngle(direction), bondLength));
    const methylTwoId = addNode(graph, "C", pointFrom(centerPoint, oppositeSecondaryAngle(direction), bondLength));
    const methylThreeId = addNode(graph, "C", pointFrom(centerPoint, secondaryAngle(direction), bondLength));

    addBond(graph, anchorId, centerId);
    addBond(graph, centerId, methylOneId);
    addBond(graph, centerId, methylTwoId);
    addBond(graph, centerId, methylThreeId);
  }

  function addSubstituent(graph, anchorId, kind, direction) {
    const info = substituentInfo(kind);

    if (info.drawingType === "halogen") {
      addHalogen(graph, anchorId, direction, info.atomLabel);
      return;
    }

    if (info.drawingType === "isopropyl") {
      addIsopropyl(graph, anchorId, direction);
      return;
    }

    if (info.drawingType === "isobutyl") {
      addIsoButyl(graph, anchorId, direction);
      return;
    }

    if (info.drawingType === "secbutyl") {
      addSecButyl(graph, anchorId, direction);
      return;
    }

    if (info.drawingType === "tertbutyl") {
      addTertButyl(graph, anchorId, direction);
      return;
    }

    addCarbonChain(graph, anchorId, direction, info.carbonCount);
  }

  function makeMoleculeGraph(item, drawingLayout) {
    const graph = {
      nodes: [],
      bonds: [],
      width: 0,
      height: 0
    };
    const parentPoints = parentCoordinates(item.parentLength, drawingLayout);
    const parentIds = parentPoints.map((point) => addNode(graph, "C", point, "parent"));
    const centerY = parentPoints.reduce((sum, point) => sum + point.y, 0) / parentPoints.length;

    for (let index = 0; index < parentIds.length - 1; index += 1) {
      addBond(graph, parentIds[index], parentIds[index + 1]);
    }

    for (let position = 1; position <= item.parentLength; position += 1) {
      const branchesAtPosition = item.substituents.filter((candidate) => candidate.position === position);
      const anchorId = parentIds[position - 1];
      const anchorPoint = parentPoints[position - 1];

      branchesAtPosition.forEach((candidate, branchIndex) => {
        addSubstituent(
          graph,
          anchorId,
          candidate.kind,
          branchDirection(anchorPoint, branchIndex, branchesAtPosition.length, centerY)
        );
      });
    }

    normalizeGraph(graph);
    return graph;
  }

  function normalizeGraph(graph) {
    const margin = 58;
    const minX = Math.min(...graph.nodes.map((node) => node.x));
    const maxX = Math.max(...graph.nodes.map((node) => node.x));
    const minY = Math.min(...graph.nodes.map((node) => node.y));
    const maxY = Math.max(...graph.nodes.map((node) => node.y));
    const shiftX = margin - minX;
    const shiftY = margin - minY;

    for (const node of graph.nodes) {
      node.x += shiftX;
      node.y += shiftY;
    }

    graph.width = Math.max(280, maxX - minX + margin * 2);
    graph.height = Math.max(240, maxY - minY + margin * 2);
  }

  function degreeForNode(graph, nodeId) {
    return graph.bonds.filter((bond) => bond.firstId === nodeId || bond.secondId === nodeId).length;
  }

  function carbonLabel(degree) {
    const hydrogenCount = Math.max(4 - degree, 0);

    if (hydrogenCount === 0) {
      return "C";
    }

    if (hydrogenCount === 1) {
      return "CH";
    }

    return `CH${SUBSCRIPT_DIGITS[hydrogenCount]}`;
  }

  function atomLabel(graph, node, drawingStyle) {
    if (node.element !== "C") {
      return node.element;
    }

    if (drawingStyle !== "expanded") {
      return "";
    }

    return carbonLabel(degreeForNode(graph, node.id));
  }

  function atomRadius(label) {
    if (!label) {
      return 0;
    }

    if (label.length >= 3) {
      return 24;
    }

    if (label.length === 2) {
      return 18;
    }

    return 14;
  }

  function trimmedLineElement(start, end, startRadius, endRadius) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) {
      return "";
    }

    const startTrim = startRadius > 0 ? Math.min(startRadius + 4, distance / 3) : 0;
    const endTrim = endRadius > 0 ? Math.min(endRadius + 4, distance / 3) : 0;
    const x1 = start.x + dx / distance * startTrim;
    const y1 = start.y + dy / distance * startTrim;
    const x2 = end.x - dx / distance * endTrim;
    const y2 = end.y - dy / distance * endTrim;

    return `<line x1="${roundCoordinate(x1)}" y1="${roundCoordinate(y1)}" x2="${roundCoordinate(x2)}" y2="${roundCoordinate(y2)}" stroke="#1f2933" stroke-width="4" stroke-linecap="round"></line>`;
  }

  function bondElement(graph, bond, drawingStyle) {
    const firstNode = nodeById(graph, bond.firstId);
    const secondNode = nodeById(graph, bond.secondId);
    const firstLabel = atomLabel(graph, firstNode, drawingStyle);
    const secondLabel = atomLabel(graph, secondNode, drawingStyle);

    return trimmedLineElement(
      firstNode,
      secondNode,
      atomRadius(firstLabel),
      atomRadius(secondLabel)
    );
  }

  function atomLabelElement(node, label) {
    if (!label) {
      return "";
    }

    return `<text class="atom-label" x="${roundCoordinate(node.x)}" y="${roundCoordinate(node.y)}" fill="#1f2933" font-family="Segoe UI, Arial, sans-serif" font-size="20" font-weight="700" text-anchor="middle" dominant-baseline="middle" paint-order="stroke" stroke="#ffffff" stroke-width="7">${label}</text>`;
  }

  function drawMoleculeSvg(item, drawingStyle, drawingLayout) {
    const graph = makeMoleculeGraph(item, drawingLayout);
    const bonds = graph.bonds.map((bond) => bondElement(graph, bond, drawingStyle));
    const labels = graph.nodes.map((node) => atomLabelElement(node, atomLabel(graph, node, drawingStyle)));

    return `<div class="structure-panel"><svg class="organic-structure organic-structure-${drawingStyle}" viewBox="0 0 ${roundCoordinate(graph.width)} ${roundCoordinate(graph.height)}" role="img" aria-label="Organic structure drawing" data-layout="${drawingLayout}" data-style="${drawingStyle}">${bonds.join("")}${labels.join("")}</svg></div>`;
  }

  return {
    id: "organic-alkane-naming",
    name: "Naming organic alkanes",
    description: "Practice naming substituted alkanes from line-angle and expanded structures.",
    randomLabel: "random organic naming problem",
    problemGenerators: PROBLEM_GENERATORS,
    randomWeights: RANDOM_PROBLEM_WEIGHTS,
    publicData: {
      ORGANIC_NAMING_PROBLEM_GROUPS: PROBLEM_GROUPS,
      ORGANIC_NAMING_RANDOM_PROBLEM_WEIGHTS: RANDOM_PROBLEM_WEIGHTS,
      ORGANIC_NAMING_CHALLENGE_LAYOUT_PROBABILITY: CHALLENGE_LAYOUT_PROBABILITY,
      ORGANIC_NAMING_EXPANDED_DRAWING_PROBABILITY: EXPANDED_DRAWING_PROBABILITY
    }
  };
});

