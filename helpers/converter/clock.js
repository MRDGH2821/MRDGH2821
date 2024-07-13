#!/usr/bin/env node
const readline = require('readline');
const { copyToClipboard } = require('../lib');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Modified part to accept CLI args
const args = process.argv.slice(2); // Get CLI arguments excluding the first two elements

/**
 * Core logic to convert duration to clock format.
 * @param {string} input - The input duration string.
 * @returns {string} - The formatted time string.
 */
function convertDurationToClockFormat(input) {
  // Separate regex patterns for hours and minutes
  const hoursRegex = /(?:(?<hours>\d+)h)/;
  const minutesRegex = /(?:(?<minutes>\d+)m)/;

  // Attempt to match both patterns
  const hoursMatch = input.match(hoursRegex);
  const minutesMatch = input.match(minutesRegex);

  // Parse hours and minutes, defaulting to 0 if not present
  let hours = hoursMatch ? parseInt(hoursMatch.groups.hours, 10) : 0;
  let minutes = minutesMatch ? parseInt(minutesMatch.groups.minutes, 10) : 0;

  // If the input is a standalone number without 'h' or 'm', treat it as hours
  if (!hoursMatch && !minutesMatch && /^\d+$/.test(input)) {
    hours = parseInt(input, 10);
  }

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
function interactiveConverter() {
  if (args.length > 0) {
    return;
  }

  const durations = ['2h 42m', '2h', '42m', '3', '121m'];
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

function cliConverter() {
  if (args.length <= 0) {
    return;
  }
  // If there are CLI arguments, process each as a duration

  const formattedTime = convertDurationToClockFormat(args.join(' '));
  copyToClipboard(formattedTime);
  console.log(`The duration ${formattedTime} has been copied to the clipboard.`);
  process.exit(0);
}

cliConverter();
interactiveConverter();
