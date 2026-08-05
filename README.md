# CHEM 1000 Topic Practice Web App

This is the browser-based CHEM 1000 practice app. It is now organized as a reusable topic practice shell.

The shell controls the student experience:

- practice topic menu
- problem type menu
- new problem button
- answer checking
- two attempts per problem
- automatic hint after the first missed answer
- full solution display
- score tracking
- significant-figures feedback without requiring scientific notation

The first topic module is `Unit conversions and dosing`. It includes:

- random conversion problem
- SI unit conversions
- Imperial/SI conversions
- weight-based dosing
- multistep dosing
- weighted random problem mix
- ordinary decimal final answers

## How To Try It

Open `index.html` in a web browser.

The app does not require Python, installation, accounts, or internet access when opened locally.

## Main Files

- `index.html` is the web page students open.
- `styles.css` controls the appearance.
- `app.js` connects the page buttons, menus, score, hints, and answer box.
- `practice_shell.js` contains the shared answer-checking and practice-session behavior.
- `topics/topic_registry.js` lists the available topic modules.
- `topics/conversions.js` contains the current conversion and dosing problem generators.
- `test_practice_logic.js` checks the important problem logic.
- `ADDING_TOPICS.md` explains how future topic modules should be added.
- `CANVAS_INTEGRATION.md` explains practical Canvas hosting options.

## Random Problem Mix For Unit Conversions And Dosing

If students choose `random conversion problem`, the app selects problem types with this distribution:

- 15% SI unit conversions
- 25% Imperial/SI conversions
- 25% weight-based dosing
- 35% multistep dosing

## Canvas Summary

Canvas needs a web address, not a local file path. To use this app in a Canvas module, host this folder somewhere that provides an HTTPS link, then add that link to Canvas as an External URL module item.

For early testing, GitHub Pages can host this static site. For production course use, Cedarville IT may have a preferred hosting location.
