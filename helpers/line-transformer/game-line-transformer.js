#!/usr/bin/env node
const readline = require('readline');
const { backlogPropsExtractor, resolveLink } = require('./game-line-lib');
const { copyToClipboard } = require('../lib');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter old line: ', async (line) => {
  const result = backlogPropsExtractor(line);
  if (result) {
    const link = result.link;
    const finalURL = await resolveLink(link);

    const newLine = result.newLineFormatter(finalURL);
    console.log('Here is your line in the new format:\n');
    console.log(newLine);

    copyToClipboard(newLine);
    console.info('\nCopied to clipboard!');
    process.exit(0);
  } else {
    console.error('The input line does not match the old format.');
    process.exit(1);
  }
});
