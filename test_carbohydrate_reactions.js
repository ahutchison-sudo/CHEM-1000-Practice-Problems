const assert = require("assert");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const zlib = require("zlib");
const vm = require("vm");
const shell = require("./practice_shell.js");
const topic = require("./topic_carbohydrate_reactions.js");
const registry = require("./topic_registry.js");
const preview = shell.createPracticeLogic([topic]);
const data = topic.publicData;

assert.ok(!registry.some((item) => item.id === topic.id), "Keep the student topic disabled");
assert.ok(!require("./practice_logic.js").getTopicOptions().some((item) => item.id === topic.id));
assert.deepStrictEqual(data.CARBOHYDRATE_PRODUCT_IDS, ["cellobiose", "lactose"]);
assert.strictEqual(data.CARBOHYDRATE_TARGET_CHOICE_COUNT, 5);
assert.strictEqual(Object.keys(data.CARBOHYDRATE_STRUCTURES).length, 13);

// Check complete PNG chunks, CRCs, and compressed image data. Hashes bind the
// review to exact bytes; none of these checks certifies chemical stereochemistry.
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function validatePng(bytes) {
  assert.strictEqual(bytes.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
  let offset = 8;
  let ended = false;
  const imageData = [];
  while (offset < bytes.length) {
    assert.ok(offset + 12 <= bytes.length, "Truncated PNG chunk header");
    const length = bytes.readUInt32BE(offset);
    const end = offset + 12 + length;
    assert.ok(end <= bytes.length, "Truncated PNG chunk data");
    const type = bytes.toString("ascii", offset + 4, offset + 8);
    assert.strictEqual(crc32(bytes.subarray(offset + 4, end - 4)), bytes.readUInt32BE(end - 4));
    if (type === "IDAT") imageData.push(bytes.subarray(offset + 8, end - 4));
    offset = end;
    if (type === "IEND") { ended = true; break; }
  }
  assert.ok(ended, "Missing IEND");
  assert.strictEqual(offset, bytes.length);
  assert.ok(imageData.length > 0);
  assert.ok(zlib.inflateSync(Buffer.concat(imageData)).length > 0);
}

const directory = path.join(__dirname, "assets/carbohydrates");
assert.deepStrictEqual(fs.readdirSync(directory).filter((name) => name.endsWith(".png")).sort(),
  Object.values(data.CARBOHYDRATE_STRUCTURES).map((item) => item.filename).sort());
for (const structure of Object.values(data.CARBOHYDRATE_STRUCTURES)) {
  const bytes = fs.readFileSync(path.join(directory, structure.filename));
  assert.strictEqual(crypto.createHash("sha256").update(bytes).digest("hex"), structure.sha256);
  assert.strictEqual(structure.instructorAssetApproved, false);
  if (structure.reviewStatus === "invalid-png") {
    assert.throws(() => validatePng(bytes));
    assert.ok(!data.CARBOHYDRATE_PRODUCT_IDS.includes(structure.manifestId));
  } else {
    validatePng(bytes);
  }
}

// Deterministically cover each reaction and both shuffle orders, through the
// actual practice shell, including scoring and incorrect distractor rejection.
const originalRandom = Math.random;
try {
  for (const reactionRandom of [0, 0.999]) {
    for (const shuffleRandom of [0, 0.999]) {
      for (const problemType of [preview.RANDOM_PROBLEM_TYPE, "Predict disaccharide product"]) {
        // The random problem type consumes one extra value in weightedRandomTopic.
        const values = problemType === preview.RANDOM_PROBLEM_TYPE
          ? [0, reactionRandom, shuffleRandom] : [reactionRandom, shuffleRandom];
        Math.random = () => values.length ? values.shift() : 0.5;
        const problem = preview.generateProblem(topic.id, problemType);
        const expected = data.CARBOHYDRATE_REACTION_EXAMPLES[reactionRandom === 0 ? 0 : 1];
        assert.strictEqual(problem.practiceTopicId, topic.id);
        assert.strictEqual(problem.answerType, "multiple-choice");
        assert.strictEqual(problem.choices.length, 2, "Do not pad the preview with unverified images");
        assert.strictEqual(new Set(problem.choices.map((choice) => choice.structureManifestId)).size, 2);
        assert.deepStrictEqual(problem.choices.map((choice) => choice.label), ["A.", "B."]);
        assert.strictEqual(problem.choices.filter((choice) => choice.id === problem.answerChoiceId).length, 1);
        const answer = problem.choices.find((choice) => choice.id === problem.answerChoiceId);
        assert.strictEqual(answer.structureManifestId, expected.product.manifestId);
        for (const choice of problem.choices) {
          assert.ok(choice.html.includes("assets/carbohydrates/" + choice.assetFilename));
          assert.ok(choice.html.includes("<img"));
          assert.strictEqual(choice.structureModified, false);
          assert.strictEqual(choice.assetReviewStatus, "legacy-curated");
          assert.strictEqual(choice.instructorAssetApproved, false);
        }
        assert.ok(problem.questionHtml.includes(expected.donor.label));
        assert.ok(problem.questionHtml.includes(expected.acceptor.label));
        assert.ok(problem.questionHtml.includes("β reducing-end glucose"));
        assert.ok(problem.questionHtml.includes("formal condensation"));
        assert.ok(problem.explanation.includes("mutarotate"));
        assert.strictEqual(problem.instructorMetadata.asset_file, "assets/carbohydrates/" + answer.assetFilename);
        assert.strictEqual(problem.instructorMetadata.asset_sha256, answer.assetSha256);
        assert.strictEqual(problem.instructorMetadata.release_ready, false);
        assert.strictEqual(preview.evaluateAnswer(problem, answer.id).isCorrect, true);
        assert.strictEqual(preview.evaluateAnswer(problem, answer.label).isCorrect, true);
        const wrong = problem.choices.find((choice) => choice.id !== answer.id);
        assert.strictEqual(preview.evaluateAnswer(problem, wrong.id).isCorrect, false);
      }
    }
  }
} finally {
  Math.random = originalRandom;
}

assert.deepStrictEqual(data.CARBOHYDRATE_REACTION_EXAMPLES.map((item) =>
  [item.product.manifestId, item.donorId, item.acceptorId, item.anomer, item.donorCarbon, item.acceptorCarbon, item.acceptorAnomer]), [
  ["cellobiose", "beta-glucose", "beta-glucose", "β", 1, 4, "β"],
  ["lactose", "beta-galactose", "beta-glucose", "β", 1, 4, "β"]
]);

// Smoke-test the browser UMD branch and its actual disabled registry too.
const context = vm.createContext({ console });
const browserScripts = Array.from(fs.readFileSync(path.join(__dirname, "index.html"), "utf8")
  .matchAll(/<script src="([^"?]+)(?:\?[^" ]*)?"/g), (match) => match[1])
  .filter((filename) => filename !== "app.js");
for (const filename of browserScripts) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, filename), "utf8"), context, { filename });
}
assert.ok(!context.ChemPracticeTopicRegistry.some((item) => item && item.id === topic.id));
assert.ok(!context.ChemPracticeLogic.getTopicOptions().some((item) => item.id === topic.id));
assert.strictEqual(context.ChemPracticeCarbohydrateReactionsTopic.id, topic.id);
assert.strictEqual(context.ChemPracticeCarbohydrateReactionsTopic.problemGenerators["Predict disaccharide product"]().choices.length, 2);

console.log("Carbohydrate preview, asset integrity, and disabled-registry checks passed.");
