#!/usr/bin/env node
const readline = require('readline');
const { resolveLink, backlogPropsExtractor } = require('./game-line-lib');
const { exec } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const lines = [];
console.info('Enter lines');
rl.on('line', (line) => {
  lines.push(line);
});

rl.on('close', async () => {
  // Process the lines here
  console.log('\n\nProcessing lines...\n');
  const newLines = [];
  for (const line of lines) {
    const result = backlogPropsExtractor(line);
    if (result) {
      const link = result.link;
      const finalURL = await resolveLink(link);

      const newLine = result.newLineFormatter(finalURL);
      newLines.push(newLine);
    } else {
      console.error(`Given line does not match old format:\n${line}\n\n-----`);
    }
  }

  // Copy the new line to the clipboard
  const copyCommand =
    process.platform === 'win32'
      ? 'clip'
      : process.platform === 'darwin'
      ? 'pbcopy'
      : 'xclip -selection clipboard';
  exec(`echo "${newLines.join('\n')}" | ${copyCommand}`);
  console.info('\nCopied to clipboard!');
  process.exit(0);
});
