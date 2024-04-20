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
  const match = line.match(/\|\s*(.*)\s*\|\s*(\[.*\]\(https.*\))\s*\|\s*(.*)\s*\|/);
  if (match) {
    const gameName = match[1];
    const link = match[2];
    const notes = match[3];

    const newLineFormatter = (finalURL) => `| ${gameName} | ${link} ||||||||| ${notes} |`;
    return { link, newLineFormatter };
  } else {
    throw new Error(
      `Expected format:\n | Game Name | [Store](link) | Notes |\n\nReceived:\n ${line}`,
    );
  }
}

/**
 *
 * @param {string} line
 */
function unofficialPropsExtractor(line) {
  const match = line.match(/\|\s*(.*)\s*\|\s*(\[.*\]\(https.*\))\s*\|\s*(.*)\s*\|/u);
  if (match) {
    const gameName = match[1];
    const link = match[2];
    const mainCampaign = match[3];
    const dlc = match[4];
    const notes = match[5];

    const newLineFormatter = (finalURL) =>
      `| ${gameName} | [${storeMatch(
        finalURL,
      )}](${finalURL}) |${mainCampaign}| | | |${dlc}|||| ${notes} |`;
    return { link, newLineFormatter };
  } else {
    throw new Error(
      `Expected format:\n | Game Name | Main Campaign Complete? | All DLCs Complete ? | Alternate link |\n\nReceived:\n ${line}`,
    );
  }
}

/**
 * Converts Notation line to a markdown table row
 * @param {string} line A line in the format of `- [emoji] text`
 * @returns string
 */
function notationToTable(line) {
  const match = line.match(/-\s(.{1,4})\s(.*)/);
  if (match) {
    const [_, notation, description] = match;
    return `| ${notation} | ${description} |`;
  } else {
    throw new Error(`Expected format:\n - [emoji] text\n\nReceived:\n ${line}`);
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
  unofficialPropsExtractor,
  completedGamesPropsExtractor,
  resolveLink,
  storeMatch,
  notationToTable,
};
