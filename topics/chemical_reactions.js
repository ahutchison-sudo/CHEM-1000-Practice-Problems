(function (root, factory) {
  let shell = root.ChemPracticeShell;

  if (typeof module === "object" && module.exports) {
    shell = require("../practice_shell.js");
    module.exports = factory(shell.helpers);
    return;
  }

  root.ChemPracticeChemicalReactionsTopic = factory(shell.helpers);
})(typeof globalThis !== "undefined" ? globalThis : window, function (helpers) {
  "use strict";

  const { randomChoice } = helpers;

  const REACTION_TYPES = [
    "Dehydration",
    "Hydrolysis",
    "Double displacement",
    "Hydrogenation of an alkene",
    "Hydration of an alkene",
    "Hydrohalogenation of an alkene"
  ];

  const REACTION_TYPE_DETAILS = {
    "Dehydration": {
      choiceText: "A dehydration reaction",
      pattern: "Dehydration removes H and OH as water, often forming a carbon-carbon double bond.",
      productHint: "Look for water as a product and a new double bond in the organic product."
    },
    "Hydrolysis": {
      choiceText: "A hydrolysis reaction",
      pattern: "Hydrolysis uses water to split a bond. In these examples, an ester is split into a carboxylic acid and an alcohol.",
      productHint: "Water breaks the ester at the C-O bond, giving a carboxylic acid plus an alcohol."
    },
    "Double displacement": {
      choiceText: "A double displacement reaction",
      pattern: "In a double displacement reaction, two ionic compounds exchange partners.",
      productHint: "Keep each ion's charge in mind, then swap the cation partners."
    },
    "Hydrogenation of an alkene": {
      choiceText: "A hydrogenation reaction",
      pattern: "Hydrogenation adds H2 across a carbon-carbon double bond, converting an alkene into an alkane.",
      productHint: "Both alkene carbons gain hydrogen atoms, and the double bond becomes a single bond."
    },
    "Hydration of an alkene": {
      choiceText: "A hydration reaction",
      pattern: "Hydration adds H and OH across an alkene. Markovnikov's rule places OH on the more substituted carbon.",
      productHint: "Use Markovnikov's rule: H goes to the alkene carbon that already has more H atoms, and OH goes to the other alkene carbon."
    },
    "Hydrohalogenation of an alkene": {
      choiceText: "A hydrohalogenation reaction",
      pattern: "Hydrohalogenation adds H and a halogen across an alkene. Markovnikov's rule places the halogen on the more substituted carbon.",
      productHint: "Use Markovnikov's rule: H goes to the alkene carbon that already has more H atoms, and the halogen goes to the other alkene carbon."
    }
  };

  const IDENTIFY_REACTION_EXAMPLES = [
    identifyExample(
      "Double displacement",
      "AgNO3 + NaCl -> AgCl + NaNO3",
      "The silver ion and sodium ion exchange anion partners, producing AgCl and NaNO3."
    ),
    identifyExample(
      "Double displacement",
      "BaCl2 + Na2SO4 -> BaSO4 + 2 NaCl",
      "Barium and sodium exchange anion partners. The sulfate ion stays together as a polyatomic ion."
    ),
    identifyExample(
      "Hydrolysis",
      "CH3COOCH3 + H2O -> CH3COOH + CH3OH",
      "Water splits the ester into a carboxylic acid and an alcohol."
    ),
    identifyExample(
      "Hydrolysis",
      "CH3COOCH(CH3)2 + H2O -> CH3COOH + HOCH(CH3)2",
      "Water breaks the ester bond, giving acetic acid and an alcohol."
    ),
    identifyExample(
      "Dehydration",
      "CH3CH2OH -> CH2=CH2 + H2O",
      "The alcohol loses H and OH as water and forms an alkene."
    ),
    identifyExample(
      "Dehydration",
      "CH3CH(OH)CH3 -> CH3CH=CH2 + H2O",
      "The alcohol loses water, leaving a carbon-carbon double bond."
    ),
    identifyExample(
      "Hydrogenation of an alkene",
      "CH2=CHCH3 + H2 -> CH3CH2CH3",
      "Hydrogen adds across the double bond, converting the alkene to an alkane."
    ),
    identifyExample(
      "Hydrogenation of an alkene",
      "CH3CH=CHCH3 + H2 -> CH3CH2CH2CH3",
      "Hydrogen adds to both carbons of the double bond."
    ),
    identifyExample(
      "Hydration of an alkene",
      "CH2=CHCH3 + H2O -> CH3CH(OH)CH3",
      "Water adds across the alkene. The OH group ends up on the more substituted carbon."
    ),
    identifyExample(
      "Hydration of an alkene",
      "CH3CH2CH=CH2 + H2O -> CH3CH2CH(OH)CH3",
      "Water adds across the double bond according to Markovnikov's rule."
    ),
    identifyExample(
      "Hydrohalogenation of an alkene",
      "CH2=CHCH3 + HBr -> CH3CHBrCH3",
      "H and Br add across the alkene. Br goes to the more substituted carbon."
    ),
    identifyExample(
      "Hydrohalogenation of an alkene",
      "CH3CH2CH=CH2 + HCl -> CH3CH2CHClCH3",
      "H and Cl add across the alkene according to Markovnikov's rule."
    )
  ];

  const PRODUCT_PREDICTION_EXAMPLES = [
    productExample(
      "Dehydration",
      "CH3CH2OH -> ?",
      [
        "CH2=CH2 + H2O",
        "CH3CH3 + O2",
        "CH3COOH + H2",
        "CH3CH2OH + H2O",
        "CH3CH2Cl + NaOH"
      ],
      "CH2=CH2 + H2O",
      "A dehydration reaction removes water from the alcohol.",
      "Remove H and OH from adjacent atoms to form the double bond and H2O.",
      "Ethanol loses water to form ethene."
    ),
    productExample(
      "Dehydration",
      "CH3CH(OH)CH3 -> ?",
      [
        "CH3CH=CH2 + H2O",
        "CH3CH2CH3 + O2",
        "CH3COCH3 + H2",
        "CH3CH(OH)CH2OH",
        "CH2=CH2 + CH3OH"
      ],
      "CH3CH=CH2 + H2O",
      "A dehydration reaction removes water and forms an alkene.",
      "The OH group and a neighboring H are lost as H2O.",
      "2-propanol dehydrates to propene and water."
    ),
    productExample(
      "Hydrolysis",
      "CH3COOCH3 + H2O -> ?",
      [
        "CH3COOH + CH3OH",
        "CH3COOCH3 + H2",
        "CH3CH2OH + CO2",
        "CH3COCH3 + H2O",
        "CH3COOH + CH4"
      ],
      "CH3COOH + CH3OH",
      "Hydrolysis uses water to split the ester.",
      "The carbonyl side becomes a carboxylic acid, and the alkoxy side becomes an alcohol.",
      "Methyl acetate hydrolyzes to acetic acid and methanol."
    ),
    productExample(
      "Hydrolysis",
      "CH3COOCH2CH3 + H2O -> ?",
      [
        "CH3COOH + CH3CH2OH",
        "CH3CH2COOH + CH3OH",
        "CH3COOCH2CH3 + H2",
        "CH3CH2OH + CO2",
        "CH3COCH3 + CH3OH"
      ],
      "CH3COOH + CH3CH2OH",
      "Hydrolysis splits the ester into two smaller molecules.",
      "The acyl portion becomes the carboxylic acid, and the ethoxy portion becomes ethanol.",
      "Ethyl acetate hydrolyzes to acetic acid and ethanol."
    ),
    productExample(
      "Double displacement",
      "AgNO3 + NaCl -> ?",
      [
        "AgCl + NaNO3",
        "AgNa + ClNO3",
        "AgNO3 + NaCl",
        "AgCl2 + NaNO2",
        "Ag2Cl + Na2NO3"
      ],
      "AgCl + NaNO3",
      "In double displacement, the cations exchange anion partners.",
      "Ag+ pairs with Cl-, and Na+ pairs with NO3-.",
      "The products are silver chloride and sodium nitrate."
    ),
    productExample(
      "Double displacement",
      "BaCl2 + Na2SO4 -> ?",
      [
        "BaSO4 + 2 NaCl",
        "BaNa2 + Cl2SO4",
        "BaCl2 + Na2SO4",
        "BaSO3 + 2 NaClO",
        "Ba2SO4 + NaCl"
      ],
      "BaSO4 + 2 NaCl",
      "Keep the sulfate ion together and exchange cation partners.",
      "Ba2+ pairs with SO4 2-, and Na+ pairs with Cl-.",
      "The double displacement products are BaSO4 and NaCl."
    ),
    productExample(
      "Hydrogenation of an alkene",
      "CH2=CHCH3 + H2 -> ?",
      [
        "CH3CH2CH3",
        "CH3CH(OH)CH3",
        "CH3CHBrCH3",
        "CH2=CHCH3 + H2O",
        "CH3CH=CH2"
      ],
      "CH3CH2CH3",
      "Hydrogenation adds hydrogen across the carbon-carbon double bond.",
      "The double bond becomes a single bond, and the carbon chain becomes saturated.",
      "Propene hydrogenates to propane."
    ),
    productExample(
      "Hydrogenation of an alkene",
      "CH3CH=CHCH3 + H2 -> ?",
      [
        "CH3CH2CH2CH3",
        "CH3CH(OH)CH2CH3",
        "CH3CHBrCH2CH3",
        "CH3CH=CHCH3 + H2O",
        "CH3CH2CH=CH2"
      ],
      "CH3CH2CH2CH3",
      "Hydrogenation removes the double bond by adding H2.",
      "Add one H to each alkene carbon and change the double bond to a single bond.",
      "2-butene hydrogenates to butane."
    ),
    productExample(
      "Hydration of an alkene",
      "CH2=CHCH3 + H2O -> ?",
      [
        "CH3CH(OH)CH3",
        "CH3CH2CH2OH",
        "CH3CH2CH3",
        "CH3CHBrCH3",
        "CH2=CHCH2OH"
      ],
      "CH3CH(OH)CH3",
      "Hydration adds H and OH across the double bond.",
      "By Markovnikov's rule, OH goes on the alkene carbon that is bonded to more carbon atoms.",
      "Propene hydrates to 2-propanol, not 1-propanol."
    ),
    productExample(
      "Hydration of an alkene",
      "CH3CH2CH=CH2 + H2O -> ?",
      [
        "CH3CH2CH(OH)CH3",
        "CH3CH2CH2CH2OH",
        "CH3CH2CH2CH3",
        "CH3CH2CHClCH3",
        "CH3CH2CH=CH(OH)"
      ],
      "CH3CH2CH(OH)CH3",
      "Use Markovnikov's rule for the OH placement.",
      "The terminal alkene carbon has more H atoms, so H adds there and OH adds to the internal carbon.",
      "1-butene hydrates to 2-butanol."
    ),
    productExample(
      "Hydrohalogenation of an alkene",
      "CH2=CHCH3 + HBr -> ?",
      [
        "CH3CHBrCH3",
        "CH3CH2CH2Br",
        "CH3CH(OH)CH3",
        "CH3CH2CH3",
        "CH2=CHCH2Br"
      ],
      "CH3CHBrCH3",
      "Hydrohalogenation adds H and a halogen across the double bond.",
      "By Markovnikov's rule, Br goes on the more substituted alkene carbon.",
      "Propene reacts with HBr to form 2-bromopropane."
    ),
    productExample(
      "Hydrohalogenation of an alkene",
      "CH3CH2CH=CH2 + HCl -> ?",
      [
        "CH3CH2CHClCH3",
        "CH3CH2CH2CH2Cl",
        "CH3CH2CH(OH)CH3",
        "CH3CH2CH2CH3",
        "CH3CH2CH=CHCl"
      ],
      "CH3CH2CHClCH3",
      "Apply Markovnikov's rule to decide where Cl goes.",
      "H adds to the terminal carbon, and Cl adds to the internal carbon.",
      "1-butene reacts with HCl to form 2-chlorobutane."
    )
  ];

  const PROBLEM_GROUPS = {
    "Identify reaction type": IDENTIFY_REACTION_EXAMPLES,
    "Predict products": PRODUCT_PREDICTION_EXAMPLES
  };

  const PROBLEM_GENERATORS = {
    "Identify reaction type": () => makeIdentifyProblem(),
    "Predict products": () => makeProductProblem()
  };

  const RANDOM_PROBLEM_WEIGHTS = [
    ["Identify reaction type", 50],
    ["Predict products", 50]
  ];

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function chemicalHtml(text) {
    return escapeHtml(text)
      .replace(/-&gt;/g, "&rarr;")
      .replace(/([A-Za-z)])(\d+)/g, "$1<sub>$2</sub>")
      .replace(/\s+/g, " ");
  }

  function identifyExample(reactionType, equation, explanation) {
    return {
      reactionType,
      equation,
      explanation
    };
  }

  function productExample(reactionType, reactants, choiceTexts, correctText, firstHint, secondHint, explanation) {
    return {
      reactionType,
      reactants,
      choiceTexts,
      correctText,
      firstHint,
      secondHint,
      explanation
    };
  }

  function shuffleCopy(items) {
    const copied = items.slice();

    for (let index = copied.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      const oldValue = copied[index];
      copied[index] = copied[swapIndex];
      copied[swapIndex] = oldValue;
    }

    return copied;
  }

  function labelForIndex(index) {
    return `${String.fromCharCode(65 + index)}.`;
  }

  function buildChoices(choiceTexts, correctText) {
    const shuffled = shuffleCopy(choiceTexts);
    const choices = shuffled.map((text, index) => ({
      id: `choice-${index + 1}`,
      label: labelForIndex(index),
      text,
      html: chemicalHtml(text)
    }));
    const correctChoice = choices.find((choice) => choice.text === correctText);

    return {
      choices,
      answerChoiceId: correctChoice.id,
      answerText: correctText
    };
  }

  function buildReactionTypeChoices(correctReactionType) {
    const choiceTexts = REACTION_TYPES.map((type) => REACTION_TYPE_DETAILS[type].choiceText);
    return buildChoices(choiceTexts, REACTION_TYPE_DETAILS[correctReactionType].choiceText);
  }

  function reactionTypeHint(reactionType) {
    return REACTION_TYPE_DETAILS[reactionType].pattern;
  }

  function makeIdentifyProblem() {
    const item = randomChoice(IDENTIFY_REACTION_EXAMPLES);
    const choiceInfo = buildReactionTypeChoices(item.reactionType);

    return {
      topic: "Identify reaction type",
      answerType: "multiple-choice",
      question: "The reaction below is best classified as:",
      questionHtml: `<div class="reaction-question"><p>The reaction below is best classified as:</p><div class="reaction-equation">${chemicalHtml(item.equation)}</div></div>`,
      choices: choiceInfo.choices,
      answerChoiceId: choiceInfo.answerChoiceId,
      answerText: choiceInfo.answerText,
      unit: "",
      reactionType: item.reactionType,
      firstHint: "Look for the overall pattern: water removed, water used to split a bond, ions swapping partners, or addition across an alkene.",
      secondHint: reactionTypeHint(item.reactionType),
      explanation: `${reactionTypeHint(item.reactionType)} ${item.explanation}`,
      startMessage: "Choose the best answer from the choices. You have two attempts for this problem.",
      answerPlaceholder: "",
      solutionLabel: "Reaction classification solution",
      reasoningLabel: "Reaction classification reasoning"
    };
  }

  function makeProductProblem() {
    const item = randomChoice(PRODUCT_PREDICTION_EXAMPLES);
    const choiceInfo = buildChoices(item.choiceTexts, item.correctText);

    return {
      topic: "Predict products",
      answerType: "multiple-choice",
      question: "What would be the product(s) of the reaction below?",
      questionHtml: `<div class="reaction-question"><p>What would be the product(s) of the reaction below?</p><div class="reaction-equation">${chemicalHtml(item.reactants)}</div></div>`,
      choices: choiceInfo.choices,
      answerChoiceId: choiceInfo.answerChoiceId,
      answerText: choiceInfo.answerText,
      unit: "",
      reactionType: item.reactionType,
      firstHint: item.firstHint,
      secondHint: item.secondHint,
      explanation: `${REACTION_TYPE_DETAILS[item.reactionType].productHint} ${item.explanation}`,
      startMessage: "Choose the product choice that best completes the reaction. You have two attempts for this problem.",
      answerPlaceholder: "",
      solutionLabel: "Product prediction solution",
      reasoningLabel: "Reaction reasoning"
    };
  }

  return {
    id: "chemical-reactions",
    name: "Chemical Reactions",
    description: "Practice identifying reaction types and predicting products for common CHEM 1000 reactions.",
    randomLabel: "random chemical reactions problem",
    problemGenerators: PROBLEM_GENERATORS,
    randomWeights: RANDOM_PROBLEM_WEIGHTS,
    publicData: {
      CHEMICAL_REACTION_TYPES: REACTION_TYPES,
      CHEMICAL_REACTION_PROBLEM_GROUPS: PROBLEM_GROUPS,
      CHEMICAL_REACTION_RANDOM_PROBLEM_WEIGHTS: RANDOM_PROBLEM_WEIGHTS
    }
  };
});
