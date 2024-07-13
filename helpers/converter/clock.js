#!/usr/bin/env node
const readline = require('readline');
const { copyToClipboard } = require('../lib');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * Converts duration to clock format (e.g., 2h 42m -> 02:42)
 */
function timeToClockConverter() {
  rl.question('Enter the duration (e.g., 2h 42m): ', (input) => {
    // Regular expression to extract hours and minutes
    const regex = /(?:(\d+)h)?\s*(?:(\d+)m)?/;
    const match = input.match(regex);

    // Extract hours and minutes, defaulting to 0 if not present
    const hours = match[1] ? parseInt(match[1], 10) : 0;
    const minutes = match[2] ? parseInt(match[2], 10) : 0;

    // Calculate total minutes
    const totalMinutes = hours * 60 + minutes;

    // Convert total minutes to the desired format
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    const formattedTime = `${h.toString().padStart(3, '0')}:${m.toString().padStart(2, '0')}`;

    // Output
    copyToClipboard(formattedTime);
    console.log(`The duration ${formattedTime} has been copied to the clipboard.`);
    rl.close();
    process.exit(0);
  });
}


timeToClockConverter();
