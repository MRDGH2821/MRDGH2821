const http = require('http');
const https = require('https');
/**
 *
 * @param {string} store
 */
function storeMatch(store) {
  switch (true) {
    case store.includes('.steampower'):
      return 'Steam';
    case store.includes('.epicgames'):
      return 'EGS';
    case store.includes('gog.com'):
      return 'GOG';
    case store.includes('ubisoft.'):
      return 'Ubisoft';
    case store.includes('.ea.com'):
      return 'EA';
    default:
      throw new Error('Store not found.');
  }
}

/**
 *
 * @param {string} line
 */
function completedGamesPropsExtractor(line) {
  const regex = /\|\s*\[(.*?)\]\((.*?)\)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|/;
  const match = line.match(regex);
  if (match) {
    const gameName = match[1];
    const link = match[2];
    const mainCampaign = match[3];
    const dlc = match[4];
    /**
     *
     * @param {string} finalURL
     * @returns string
     */
    const newLineFormatter = (finalURL) =>
      `| ${gameName} | [${storeMatch(finalURL)}](${finalURL}) | ${mainCampaign} | ${dlc} | - |`;
    return { link, newLineFormatter };
  } else {
    throw new Error(`Expected format:\n | [Game](link) | text | text |\n\nReceived:\n ${line}`);
  }
}

/**
 *
 * @param {string} line
 */
function backlogPropsExtractor(line) {
  const match = line.match(/\|\s*\[(.*?)\]\((.*?)\)\s*\|\s*(.*?)\s*\|/);
  if (match) {
    const gameName = match[1];
    const link = match[2];
    const notes = match[3];

    const newLineFormatter = (finalURL) =>
      `| ${gameName} | [${storeMatch(finalURL)}](${finalURL}) | ${notes} |`;
    return { link, newLineFormatter };
  } else {
    throw new Error(`Expected format:\n | [Game](link) | text |\n\nReceived:\n ${line}`);
  }
}

/**
 *
 * @param {string} link
 * @returns Promise<string>
 */
async function resolveLink(link) {
  const protocol = link.startsWith('https') ? https : http;
  return new Promise((resolve, reject) => {
    protocol
      .get(link, (response) => {
        const finalURL = response.headers.location || link;
        resolve(finalURL);
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}

module.exports = {
  backlogPropsExtractor,
  completedGamesPropsExtractor,
  resolveLink,
  storeMatch,
};
