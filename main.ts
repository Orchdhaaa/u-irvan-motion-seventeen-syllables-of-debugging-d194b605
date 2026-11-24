import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

// Seventeen Syllables of Debugging — one haiku about debugging.
//
// Line 1 (5): one(1) log(1) line(1) sur-vived(2) = 5
// Line 2 (7): bur-ied(2) in(1) ten(1) thou-sand(2) lines(1) = 7
// Line 3 (5): it(1) was(1) my(1) own(1) print(1) = 5
//
// The picture: a single log line outlives a flood of ten thousand.
// The turn: the clue that survived was my own leftover print.
const HAIKU = [
  "one log line survived",
  "buried in ten thousand lines",
  "it was my own print",
].join("\n");

// Syllable counts for each word of the haiku, in line order. The program
// verifies the 5-7-5 shape at runtime and refuses to write a bad entry.
const SYLLABLES: Record<string, number> = {
  one: 1,
  log: 1,
  line: 1,
  survived: 2,
  buried: 2,
  in: 1,
  ten: 1,
  thousand: 2,
  lines: 1,
  it: 1,
  was: 1,
  my: 1,
  own: 1,
  print: 1,
};
const EXPECTED_SHAPE = [5, 7, 5];

function checkShape(lines: string[]): void {
  lines.forEach((line, i) => {
    const count = line
      .split(/\s+/)
      .filter(Boolean)
      .reduce((sum, word) => {
        const n = SYLLABLES[word];
        if (n === undefined) {
          throw new Error(`no syllable count recorded for word: ${word}`);
        }
        return sum + n;
      }, 0);
    if (count !== EXPECTED_SHAPE[i]) {
      throw new Error(
        `line ${i + 1} has ${count} syllables, expected ${EXPECTED_SHAPE[i]}`,
      );
    }
  });
}

function resolveOutDir(): string {
  return process.env.MAKEFUN_OUTPUT_DIR || process.env.OUTPUT_DIR || "/output";
}

function writeEntry(text: string, outDir: string): string {
  const chars = [...text].length;
  if (chars < 1 || chars > 200) {
    throw new Error(`entry must be 1-200 characters, got ${chars}`);
  }
  if (text.trim().length === 0) {
    throw new Error("entry must not be only whitespace");
  }
  const lines = text.split("\n");
  if (lines.length !== 3) {
    throw new Error(`entry must be exactly 3 lines, got ${lines.length}`);
  }
  checkShape(lines);
  const outFile = `${outDir}/entry.txt`;
  mkdirSync(outDir, { recursive: true });
  writeFileSync(outFile, text, "utf8");
  const back = readFileSync(outFile, "utf8");
  if (back !== text) {
    throw new Error("read-back mismatch: written file differs from the entry");
  }
  return outFile;
}

const outFile = writeEntry(HAIKU, resolveOutDir());
console.log(`wrote haiku (${[...HAIKU].length} chars) to ${outFile}`);
