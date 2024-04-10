#!/usr/bin/env node
const readline = require('readline');
const { copyToClipboard } = require('../lib');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter the number of minutes: ', (minutes) => {
  const totalMinutes = minutes;
  const h = Math.floor(totalMinutes / 60);
  const m = Math.round(totalMinutes % 60);
  const formattedTime = `${h.toString().padStart(3, '0')}:${m.toString().padStart(2, '0')}`;

  copyToClipboard(formattedTime);
  console.log(`The time ${formattedTime} has been copied to the clipboard.`);
  rl.close();
  process.exit(0);
});
