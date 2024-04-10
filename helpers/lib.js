const copyCommand =
  process.platform === 'win32'
    ? 'clip'
    : process.platform === 'darwin'
    ? 'pbcopy'
    : 'xclip -selection clipboard';

module.exports = {
  copyCommand,
};
