# Adding Future Practice Topics

This app is organized by topic. The shared shell stays the same, and each chemistry topic gets its own topic file.

## Current Structure

- `practice_shell.js` is the reusable shell. It checks answers, handles significant figures for numeric problems, checks coefficient lists, checks text names, gives feedback, and supports two attempts.
- `app.js` connects the shell to the web page.
- `topic_conversions.js` is the unit conversions and dosing topic module used by the hosted page.
- `topic_balancing.js` is the balancing chemical reactions topic module used by the hosted page.
- `topic_naming.js` is the simple compound naming topic module used by the hosted page.
- `topic_registry.js` lists which topic modules appear in the app.
- `topics/` keeps organized source copies, but the live GitHub Pages version uses top-level topic files so uploading is simpler.

## What A Numeric Topic Module Provides

Each numeric topic module should provide:

- an `id`, used internally by the program
- a student-facing `name`
- a short `description`
- a `randomLabel`, such as `random conversion problem`
- a list of problem generator functions
- random weights for the problem types

Each generated numeric problem should include:

- `topic`: the problem type name shown to students
- `question`: the question students answer
- `answer`: the exact numeric answer used for checking
- `unit`: the expected unit shown in feedback
- `answerText`: the rounded answer shown to students
- `firstHint`: the hint after the first missed attempt
- `secondHint`: the setup hint shown by the Show hint button
- `explanation`: the full worked solution
- `tolerance`: how far away the answer can be and still count as correct
- `toleranceKind`: usually `relative`
- `expectedSigFigs`: the correct number of significant figures

## What A Coefficient Topic Module Provides

Balancing reactions use a coefficient-list answer instead of a single number. Those generated problems should include:

- `answerType: "coefficients"`
- `coefficients`: the correct coefficient list, such as `[2, 1, 2]`
- `coefficientLabels`: the formulas in order, such as `["H₂", "O₂", "H₂O"]`
- `answerText`: the coefficient list and balanced equation shown in feedback
- `firstHint`, `secondHint`, and `explanation`
- `answerPlaceholder`, usually something like `Example: 2, 1, 2`
- `startMessage`, which tells students to enter coefficients only

## What A Text Naming Topic Module Provides

Naming problems use a text answer instead of a number or coefficient list. Those generated problems should include:

- `answerType: "text"`
- `answerText`: the official name shown in feedback
- `acceptedAnswers`: alternate names that should count as correct
- `firstHint`, `secondHint`, and `explanation`
- `answerPlaceholder`, usually something like `Example: sodium chloride`
- `startMessage`, which tells students what kind of name to enter

Text answers ignore capitalization and extra punctuation. Roman numerals are accepted in common formats, but the official feedback should show the proper Roman numeral style.

## Future Topic Examples

Future topic files could look like this:

```text
topic_conversions.js
topic_balancing.js
topic_naming.js
topic_moles.js
topic_stoichiometry.js
topic_solution_concentration.js
topic_gas_laws.js
```

Then `topic_registry.js` would be updated so the new topic appears in the Practice topic menu.

## Suggested Next Topics

Good candidates for later CHEM 1000 practice modules might be:

- atoms, ions, and formula units
- molar mass
- grams to moles and moles to grams
- particles to moles and moles to particles
- empirical formulas
- stoichiometry
- limiting reactants
- molarity and solution dilution
- gas laws

The advantage of this structure is that students keep seeing the same interface, while the problem logic changes by topic.
