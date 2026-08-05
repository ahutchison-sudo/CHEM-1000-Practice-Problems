# CHEM 1000 Conversion problem practice Web App

This is the browser-based version of the CHEM 1000 conversion practice program.

It keeps the same classroom behavior as the Python prototype:

- random conversion problem option
- SI unit conversions
- Imperial/SI conversions
- weight-based dosing
- multistep dosing
- weighted random problem mix
- two attempts per problem
- automatic hint after the first missed answer
- significant-figures feedback without requiring scientific notation
- ordinary decimal final answers

## How To Try It

Open `index.html` in a web browser.

The app does not require Python, installation, accounts, or internet access when opened locally.

## Files

- `index.html` is the web page.
- `styles.css` controls the appearance.
- `practice_logic.js` contains the problem generators and answer checking.
- `app.js` connects the logic to the buttons, score, hints, and answer box.
- `test_practice_logic.js` checks the important problem logic.
- `CANVAS_INTEGRATION.md` explains practical Canvas hosting options.

## Random Problem Mix

If students choose `random conversion problem`, the app selects problem types with this distribution:

- 15% SI unit conversions
- 25% Imperial/SI conversions
- 25% weight-based dosing
- 35% multistep dosing

## Canvas Summary

Canvas needs a web address, not a local file path. To use this app in a Canvas module, host this folder somewhere that provides an HTTPS link, then add that link to Canvas as an External URL module item.

For early testing, you can host it on a simple static site host. For production course use, Cedarville IT may have a preferred hosting location.
