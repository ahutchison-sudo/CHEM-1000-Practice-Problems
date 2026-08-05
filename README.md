# CHEM 1000 Topic Practice Web App

This is the browser-based CHEM 1000 practice app. It is organized as a reusable topic practice shell.

The shell controls the student experience:

- practice topic menu
- problem type menu
- new problem button
- answer checking
- two attempts per problem
- automatic hint after the first missed answer
- full solution display
- score tracking
- significant-figures feedback for numeric problems without requiring scientific notation

## Current Practice Topics

### Unit conversions and dosing

This topic includes:

- random conversion problem
- SI unit conversions
- Imperial/SI conversions
- weight-based dosing
- multistep dosing
- weighted random problem mix
- ordinary decimal final answers

### Balancing chemical reactions

This topic includes:

- random balancing problem
- simple synthesis/decomposition reactions
- single replacement reactions
- double replacement and acid reactions
- combustion reactions
- other common reactions

Students see formulas with proper visual subscripts, such as `Al₂O₃`, and enter coefficients in order, such as `2, 1, 2`. The reaction bank is curated so the balanced coefficients are positive whole numbers and the largest coefficient is 15 or less.

### Naming simple compounds

This topic includes:

- random naming problem
- fixed-charge ionic compounds
- variable-charge ionic compounds that require Roman numerals
- polyatomic ionic compounds using the course polyatomic ion list
- diatomic elements
- binary covalent compounds using Greek prefixes

Students are given a formula and enter the compound name. Capitalization does not matter. Roman numerals are accepted in formats like `iron(III) chloride`, `iron III chloride`, or `iron 3 chloride`, while feedback shows the proper Roman numeral style.

## How To Try It

Open `index.html` in a web browser.

The app does not require Python, installation, accounts, or internet access when opened locally.

## Main Files

- `index.html` is the web page students open.
- `styles.css` controls the appearance.
- `app.js` connects the page buttons, menus, score, hints, and answer box.
- `practice_shell.js` contains the shared answer-checking and practice-session behavior.
- `topic_registry.js` lists the available topic modules used by the hosted page.
- `topic_conversions.js` contains the conversion and dosing problem generators.
- `topic_balancing.js` contains the balancing chemical reactions problem generators.
- `topic_naming.js` contains the simple compound naming problem generators.
- `topics/` keeps organized source copies for future topic work.
- `test_practice_logic.js` checks the important problem logic.
- `ADDING_TOPICS.md` explains how future topic modules should be added.
- `CANVAS_INTEGRATION.md` explains practical Canvas hosting options.

## Random Problem Mix For Unit Conversions And Dosing

If students choose `random conversion problem`, the app selects problem types with this distribution:

- 15% SI unit conversions
- 25% Imperial/SI conversions
- 25% weight-based dosing
- 35% multistep dosing

## Random Problem Mix For Balancing Chemical Reactions

If students choose `random balancing problem`, the app selects problem types with this distribution:

- 25% simple synthesis/decomposition
- 15% single replacement
- 25% double replacement and acid reactions
- 25% combustion reactions
- 10% other common reactions

## Random Problem Mix For Naming Simple Compounds

If students choose `random naming problem`, the app selects problem types with this distribution:

- 25% fixed-charge ionic compounds
- 20% variable-charge ionic compounds
- 25% polyatomic ionic compounds
- 10% diatomic elements
- 20% binary covalent compounds

## Canvas Summary

Canvas needs a web address, not a local file path. To use this app in a Canvas module, host this folder somewhere that provides an HTTPS link, then add that link to Canvas as an External URL module item.

For early testing, GitHub Pages can host this static site. For production course use, Cedarville IT may have a preferred hosting location.
