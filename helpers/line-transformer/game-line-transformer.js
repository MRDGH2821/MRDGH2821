#!/usr/bin/env node
const readline = require('readline');
const http = require('http');
const https = require('https');
const { exec } = require('child_process');
const { backlogPropsExtractor, resolveLink } = require('./game-line-lib');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter old line: ', (line) => {
  const result = backlogPropsExtractor(line);
  if (result) {
    const link = result.link;

    const protocol = link.startsWith('https') ? https : http;

    const finalURL = resolveLink(link);

    const newLine = result.newLineFormatter(finalURL);
    console.log('Here is your line in the new format:\n');
    console.log(newLine);

    // Copy the new line to the clipboard
    const copyCommand =
      process.platform === 'win32'
        ? 'clip'
        : process.platform === 'darwin'
        ? 'pbcopy'
        : 'xclip -selection clipboard';
    exec(`echo "${newLine}" | ${copyCommand}`);
    console.info('\nCopied to clipboard!');
    process.exit(0);
  } else {
    console.error('The input line does not match the old format.');
    process.exit(1);
  }
});
