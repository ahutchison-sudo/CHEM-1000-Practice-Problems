# Adding Future Practice Topics

This app is organized by topic. The shared shell stays the same, and each chemistry topic gets its own file inside the `topics` folder.

## Current Structure

- `practice_shell.js` is the reusable shell. It checks answers, handles significant figures, gives feedback, and supports two attempts.
- `app.js` connects the shell to the web page.
- `topics/conversions.js` is the first topic module.
- `topics/topic_registry.js` lists which topic modules appear in the app.

## What A Topic Module Provides

Each topic module should provide:

- an `id`, used internally by the program
- a student-facing `name`
- a short `description`
- a `randomLabel`, such as `random conversion problem`
- a list of problem generator functions
- random weights for the problem types

Each generated problem should include:

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

## Future Topic Examples

Future topic files could look like this:

```text
topics/conversions.js
topics/moles.js
topics/stoichiometry.js
topics/solution-concentration.js
topics/gas-laws.js
```

Then `topics/topic_registry.js` would be updated so the new topic appears in the Practice topic menu.

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
