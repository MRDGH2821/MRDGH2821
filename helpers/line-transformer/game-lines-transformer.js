#!/usr/bin/env node
const readline = require("readline");
const { unofficialPropsExtractor } = require("./game-line-lib");
const { copyToClipboard } = require("../lib");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const lines = [];
console.info("Enter lines");
rl.on("line", (line) => {
  lines.push(line);
});

rl.on("close", async () => {
  // Process the lines here
  console.log("\n\nProcessing lines...\n");
  const newLines = [];
  for (const line of lines) {
    const result = unofficialPropsExtractor(line);
    if (result) {
      const link = result.link;
      const finalURL = await resolveLink(link);

      const newLine = result.newLineFormatter(finalURL);
      newLines.push(newLine);
      // newLines.push(result);
    } else {
      console.error(`Given line does not match old format:\n${line}\n\n-----`);
    }
  }

  copyToClipboard(newLines.join("\n"));
  console.info("\nCopied to clipboard!");
  process.exit(0);
});
