#!/usr/bin/env node
const readline = require('readline');
const http = require('http');
const https = require('https');
const { exec } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function completedGamesPropsExtractor(line) {
  const regex = /\|\s*\[(.*?)\]\((.*?)\)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|/;
  const match = line.match(regex);
  if (match) {
    const gameName = match[1];
    const link = match[2];
    const mainCampaign = match[3];
    const dlc = match[4];
    const newLineFormatter = (finalURL) =>
      `| ${gameName} | [Steam](${finalURL}) | ${mainCampaign} | ${dlc} | - |`;
    return { link, newLineFormatter };
  } else {
    throw new Error(`Expected format:\n | [Game](link) | text | text |\n\nReceived:\n ${line}`);
  }
}

rl.question('Enter old line: ', (line) => {
  const result = completedGamesPropsExtractor(line);
  if (result) {
    const link = result.link;

    const protocol = link.startsWith('https') ? https : http;
    protocol.get(link, (response) => {
      const finalURL = response.headers.location || link;

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
    });
  } else {
    console.error('The input line does not match the old format.');
    process.exit(1);
  }
});
