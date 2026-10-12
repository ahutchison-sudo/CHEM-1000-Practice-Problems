# Carbohydrate reaction review — 12 October 2026

## Release decision

**Keep the topic disabled.** `topic_registry.js` still excludes it. The repaired module is an instructor preview with two distinct products, cellobiose and lactose. Five structural choices remain the release goal, not a requirement to include questionable images. No PNG was replaced, redrawn, or newly approved in this review.

The exact local bytes were inspected using Pillow with transparency composited onto white for viewing. Eleven PNGs decoded; maltose and melibiose failed. Automated checks now bind all 13 files to their SHA-256 hashes and check PNG chunk boundaries, CRCs, complete image data, and decompression. These checks protect reviewed bytes; they cannot certify stereochemistry.

The previous `instructorAssetApproved: true` and blanket “Instructor-approved” source string were unsupported by a per-file approval record. The module now records `instructorAssetApproved: false` and separates chemical assessment from instructor release approval. Historical “approved” CSS class names are retained for layout compatibility only.

## History and chemical findings

- `8b6c5bb` removed lactulose from choices as a “flawed carbohydrate answer asset.”
- `acf440d` narrowed choices to cellobiose and lactose and removed maltose/sucrose questions.
- `e0e2e3f` disabled the whole topic. This review does not reverse those decisions.

The remaining reactions are chemically consistent as **formal condensation/structure-matching models**:

| Product | Donor residue | Acceptor residue | Bond | Product shown |
| --- | --- | --- | --- | --- |
| Cellobiose | β-D-glucopyranosyl | D-glucopyranose | donor C1–O–acceptor C4, β(1→4) | β reducing-end glucose |
| Lactose | β-D-galactopyranosyl | D-glucopyranose | donor C1–O–acceptor C4, β(1→4) | β reducing-end glucose |

Both products have complete six-membered rings with ring oxygens. For glucose in the conventional orientation, C2 OH is down, C3 OH up, C4 OH down, and C5 CH2OH up. Galactose differs at C4 (OH up). The left residue in lactose preserves that galactose C4 orientation; cellobiose preserves the glucose orientation. Their glycosidic substituents at donor C1 are β, and the linkage terminates at acceptor C4.

The free acceptor C1 hydroxyl is not consumed in a 1→4 linkage. Both retained PNGs draw it β. This is distinct from the β configuration of the donor glycosidic bond. The prompt now specifies the β reducing-end anomer, and the explanation notes mutarotation. Mixing two free sugars does not by itself imply selective synthesis of this particular product; the linkage is prescribed by the exercise.

## Complete asset inventory

“Consistent” below is this review's visual chemical assessment, **not instructor approval**. The source code's PubChem identifiers identify named compounds and do not certify the precise anomer or provenance of a PNG.

| Local PNG | Assessment of the actual image | Disposition |
| --- | --- | --- |
| `alpha-D-glucopyranose.png` | Complete pyranose; C1 OH down, C2 down, C3 up, C4 down, C5 CH2OH up. Consistent α-D-glucose. | Chemically consistent; unused in current preview. Instructor sign-off pending. |
| `beta-D-glucopyranose.png` | Complete pyranose; C1 OH up, with glucose C2–C5 configuration. | Retain as preview reactant; sign-off pending. |
| `alpha-D-galactopyranose.png` | Complete pyranose; C1 OH down and C4 OH up. | Chemically consistent; unused. Sign-off pending. |
| `beta-D-galactopyranose.png` | Complete pyranose; C1 OH up and C4 OH up. | Retain as preview reactant; sign-off pending. |
| `beta-D-fructofuranose.png` | Complete five-membered O/C2/C3/C4/C5 ring; both exocyclic hydroxymethyl groups present; C2 OH up, C3 OH up, C4 OH down, C5 C6 group up. | Chemically consistent; unused. Sign-off pending. |
| `cellobiose.png` | Glucose–glucose, β(1→4), with β reducing-end glucose. | Historical curated subset; retain for isolated preview. Final instructor approval pending. |
| `lactose.png` | Galactose–glucose, β(1→4), with β reducing-end glucose. | Historical curated subset; retain for isolated preview. Final instructor approval pending. |
| `maltose.png` | **Undecodable/truncated:** 29,985 bytes; the declared 32,768-byte IDAT chunk extends past EOF; no complete IEND. Its actual SHA-256 also differs from the old generator metadata. | Replace with a complete verified Glc-α(1→4)-Glc diagram. Do not salvage partial pixels. Hash metadata corrected to current bytes; never selectable. |
| `melibiose.png` | **Undecodable/truncated:** 29,983 bytes; declared 32,790-byte IDAT exceeds available bytes; no complete IEND. | Replace before assessing Gal-α(1→6)-Glc stereochemistry. Never selectable. |
| `sucrose.png` | Complete glucose pyranose/fructose furanose rings; connection is between glucose C1 and fructose C2. Visually consistent with Glc-α(1↔2)-β-Fru when the reversed fructose orientation is accounted for. Curved bonds need careful interpretation. | Previously excluded; candidate only. Instructor must verify both anomeric centers, ring perspective, and readability before restoration. |
| `lactulose.png` | Complete galactose pyranose/fructose furanose rings; visually consistent Gal-β(1→4)-Fru. The bridge meets fructose C4, not C2; fructose C2 retains a free OH and a hydroxymethyl group. | Previously explicitly removed as flawed. This apparent consistency does not resolve the instructor's original concern. Keep quarantined; approve or replace, including reducing-end fructose anomer and curved-bond readability. |
| `isomaltose.png` | Two complete glucose chair structures, apparent α(1→6) connection to the acceptor hydroxymethyl group; acceptor C1 is wavy/unspecified. | Plausible chemistry candidate, but **not a Haworth-style choice**. Instructor verification required; prefer a consistent Haworth replacement, with the intended reducing-end anomer specified. |
| `trehalose.png` | Two complete pyranose rings with an apparent 1↔1 bridge. The second ring's reversed layout and substituent orientations do not provide a confidently verified α-D-glucose residue. | Quarantine for stereochemical verification/replacement. Do not label this PNG verified α,α-trehalose merely from its filename. |

All 13 hashes and statuses are exposed in `CARBOHYDRATE_STRUCTURES`; only `CARBOHYDRATE_PRODUCT_IDS` supplies choices. Invalid and pending-review assets are inventoried, not used as answers or distractors.

## Five-choice development path

A useful first set is **maltose, cellobiose, lactose, sucrose, and isomaltose**. It compares glucose versus galactose donors, α versus β donor configuration, 1→4 versus 1→6 attachment, and a two-anomeric-center glucose/fructose product. This is a proposed set only: the current generator still has two choices.

To reach that set, supply/approve a complete maltose Haworth PNG, approve or replace sucrose, and supply/approve a Haworth isomaltose PNG. Alternatively, an instructor-approved lactulose replacement could serve as the fifth product. No available local 1→3 diagram has been verified; the former test demanding a C3 acceptor was inappropriate and has been removed. Do not invent a 1→3 product to satisfy a stale test.

If reaction coverage is expanded after approval, record explicit donor/acceptor IDs and carbon numbers. Match each drawn reducing-end anomer to the prompt. For sucrose use α-D-Glcp-(1↔2)-β-D-Fruf: both anomeric centers are involved, so there is no free reducing end. For isomaltose use Glc-α(1→6)-Glc, not 1→4. For ordinary α,α-trehalose both glucose anomeric centers must be α and connected 1↔1.

Before recommending re-enabling:

1. Instructor approves the exact hashes of each selected product and reactant PNG; record the reviewer/date and chemical identity, linkage and drawn anomer.
2. Resolve the historical sucrose/lactulose exclusions and trehalose uncertainty if those images are to be used; replace truncated files if selected.
3. Verify source URL, author/license, and attribution for each selected image. The repository's generic Commons claim is not per-file provenance.
4. Confirm five distinct approved structural choices, one correct match per reaction, consistent readable presentation, and suitable hints without relying solely on compound-name captions.
5. Run all logic/asset checks and visually review the final question layout. Only then make a separate explicit registry-enabling change.

## Repairs and validation

- Kept the historical two-product preview and the disabled production registry.
- Added a complete 13-file inventory with review statuses; removed unsupported instructor-approval claims.
- Fixed the wrong `assets/` product metadata path to `assets/carbohydrates/` and the stale maltose hash.
- Used explicit reactant IDs and recorded donor/acceptor carbon numbers and reducing-end anomer.
- Shuffled structures before assigning A/B letters; letters now follow displayed order and do not reveal product identity via a fixed label.
- Specified the reducing-end β anomer; made the formal-condensation assumption explicit; replaced the generic hint with the actual glucose/galactose C4 distinction.
- Replaced registry-dependent carbohydrate tests with an isolated shell preview. Deterministic tests cover both reactions, both choice orders, correct and incorrect scoring, actual HTML asset paths, PNG integrity/hash quarantine, and the browser module loading path with the disabled registry.
- Updated README to describe the actual disabled two-PNG preview and five-choice release goal.

Run `node test_practice_logic.js` (includes the carbohydrate checks), `node test_carbohydrate_reactions.js` for focused review, and `node chem1000_conversion_web_app/test_practice_logic.js` for the separate legacy application.

## Primary chemical references

These sources support chemical identities/linkages, not the repository PNGs' provenance or instructor approval:

- [ChEBI β-cellobiose, CHEBI:36217](https://www.ebi.ac.uk/chebi/CHEBI:36217): identifies the β reducing-end glucose anomer.
- [NIH MeSH cellobiose](https://meshb.nlm.nih.gov/record/ui?ui=D002475): glucose–glucose β(1→4).
- [PubChem lactose, CID 440995](https://pubchem.ncbi.nlm.nih.gov/compound/440995) and [ChEBI β-lactose, CHEBI:36218](https://www.ebi.ac.uk/chebi/CHEBI:36218): galactose–glucose β(1→4), distinguishing reducing-end configuration.
- [ChEBI sucrose, CHEBI:17992](https://www.ebi.ac.uk/chebi/CHEBI:17992): α-glucose/β-fructose glycosyl glycoside; both anomeric centers are joined.
- [ChEBI isomaltose, CHEBI:28189](https://www.ebi.ac.uk/chebi/CHEBI:28189): glucose–glucose α(1→6).
- [ChEBI α,α-trehalose, CHEBI:16551](https://www.ebi.ac.uk/chebi/CHEBI:16551): both anomeric configurations α, 1↔1 connection.
- [Enzymatic lactulose synthesis study](https://www.sciencedirect.com/science/article/pii/S0141022906000433): supports lactulose formation by galactosyl transfer to fructose. The local drawing assessment remains a visual inference requiring instructor resolution of the prior exclusion.
