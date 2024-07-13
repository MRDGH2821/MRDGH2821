const { exec } = require('child_process');

const copyCommand =
  process.platform === 'win32'
    ? 'clip'
    : process.platform === 'darwin'
      ? 'pbcopy'
      : 'xclip -selection clipboard';

function copyToClipboard(text) {
  // For Windows and macOS, the command remains the same as they do not add a new line by default
  // For Linux with xclip, use `printf` instead of `echo` to avoid adding a new line
  const command = process.platform === 'linux' ? `printf "%s" "${text}" | ${copyCommand}` : `echo "${text}" | ${copyCommand}`;
  exec(command);
}

module.exports = {
  copyToClipboard,
};
