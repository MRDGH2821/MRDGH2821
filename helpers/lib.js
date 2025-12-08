const { exec } = require("child_process");
let copyCommand;
switch (process.platform) {
  case "win32":
    copyCommand = "clip";
    break;
  case "darwin":
    copyCommand = "pbcopy";
    break;
  default:
    copyCommand =
      '$(command -v wl-copy >/dev/null 2>&1 && echo "wl-copy" || echo "xclip -selection clipboard")';
    break;
}

function copyToClipboard(text) {
  // For Windows and macOS, the command remains the same as they do not add a new line by default
  // For Linux, try wl-copy first (Wayland), fallback to xclip (X11), use `printf` to avoid adding a new line
  const command =
    process.platform === "linux"
      ? `printf "%s" "${text}" | ${copyCommand}`
      : `echo "${text}" | ${copyCommand}`;
  exec(command);
}

module.exports = {
  copyToClipboard
};
