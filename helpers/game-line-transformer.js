#!/usr/bin/env node
const readline = require('readline');
const http = require('http');
const https = require('https');
const { exec } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter old line: ', (line) => {
  const match = line.match(/\|\s*\[(.*?)\]\((.*?)\)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|/);
  if (match) {
    const gameName = match[1];
    const link = match[2];
    const mainCampaign = match[3];
    const dlc = match[4];

    const protocol = link.startsWith('https') ? https : http;
    protocol.get(link, (response) => {
      const finalURL = response.headers.location || link;

      const newLine = `| ${gameName} | [Steam](${finalURL}) | ${mainCampaign} | ${dlc} | - |`;
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
