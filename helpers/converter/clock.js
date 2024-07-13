#!/usr/bin/env node
const readline = require('readline');
const { copyToClipboard } = require('../lib');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * Core logic to convert duration to clock format.
 * @param {string} input - The input duration string.
 * @returns {string} - The formatted time string.
 */
function convertDurationToClockFormat(input) {
  // Use named capture groups to extract hours and minutes
  const regex = /(?:(?<hours>\d+)(?:h\s*)?(?<minutes>\d+)?m?)/;
  const match = input.match(regex);

  // Check if the input is valid
  if (!match) {
    return 'Invalid input'; // Or handle the error as appropriate
  }

  // Extract hours and minutes, considering standalone number as hours
  let hours = match.groups.hours ? parseInt(match.groups.hours, 10) : 0;
  let minutes = match.groups.minutes ? parseInt(match.groups.minutes, 10) : 0;

  // Calculate total minutes
  const totalMinutes = hours * 60 + minutes;

  // Convert total minutes to the desired format
  const formattedHours = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(3, '0');
  const formattedMinutes = (totalMinutes % 60).toString().padStart(2, '0');
  return `${formattedHours}:${formattedMinutes}`;
}

/**
 * Asks for duration and converts it using the core logic.
 */
function timeToClockConverter() {
  const durations = ['2h 42m', '2h', '42m', '3'];
  const longestStringLength = durations.reduce((a, b) => (a.length > b.length ? a : b), '').length;
  const durationText = durations
    .map(
      (duration) =>
        ` ${duration.padEnd(longestStringLength, ' ')} => ${convertDurationToClockFormat(
          duration,
        )}`,
    )
    .join('\n');
  const question = `Duration converter\n\nSample: \n${durationText}\n\nEnter the duration: `;
  rl.question(question, (input) => {
    const formattedTime = convertDurationToClockFormat(input);

    // Output
    copyToClipboard(formattedTime);
    console.log(`The duration ${formattedTime} has been copied to the clipboard.`);
    rl.close();
    process.exit(0);
  });
}

timeToClockConverter();
