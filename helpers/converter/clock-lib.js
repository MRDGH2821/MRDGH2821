#!/usr/bin/env node
const readline = require('readline');
const { copyToClipboard } = require('../lib');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * Converts duration to clock format
 * @param {'d'|'h'|'m'} unit - The unit of duration to convert to a clock format.
 */
function timeToClockConverter(unit = 'h') {
  const units = {
    d: 24 * 60,
    h: 60,
    m: 1,
  };
  const multiplier = units[unit];
  rl.question('Enter the duration: ', (time) => {
    const totalMinutes = time * multiplier;
    const h = Math.floor(totalMinutes / 60);
    const m = Math.round(totalMinutes % 60);
    const formattedTime = `${h.toString().padStart(3, '0')}:${m.toString().padStart(2, '0')}`;

    copyToClipboard(formattedTime);
    console.log(`The duration ${formattedTime} has been copied to the clipboard.`);
    rl.close();
    process.exit(0);
  });
}

module.exports = {
  timeToClockConverter,
};
