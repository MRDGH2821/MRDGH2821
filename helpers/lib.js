const { exec } = require('child_process');

const copyCommand =
  process.platform === 'win32'
    ? 'clip'
    : process.platform === 'darwin'
    ? 'pbcopy'
    : 'xclip -selection clipboard';

function copyToClipboard(text) {
  exec(`echo "${text}" | ${copyCommand}`);
}

module.exports = {
  copyToClipboard,
};
