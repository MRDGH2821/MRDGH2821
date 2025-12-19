#!/usr/bin/env node

/**
 * Refactor Markdown Links to Reference Style
 *
 * This script converts inline markdown links [text](url) to reference-style
 * links [text][ref-id] with link definitions at the bottom of the file.
 *
 * The script generates meaningful IDs based on context:
 * - For game tables: uses game name + store name
 * - For other links: uses descriptive text
 *
 * Usage: node refactor-markdown-links.js <input-file> [output-file]
 */

const fs = require("fs");
const path = require("path");

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error(
    "Usage: node refactor-markdown-links.js <input-file> [output-file]"
  );
  console.error(
    "Example: node refactor-markdown-links.js game.md game-refactored.md"
  );
  process.exit(1);
}

const inputFile = args[0];
const outputFile = args[1] || inputFile;

// Check if input file exists
if (!fs.existsSync(inputFile)) {
  console.error(`Error: Input file "${inputFile}" not found`);
  process.exit(1);
}

// Read the file
console.log(`📖 Reading file: ${inputFile}`);
const content = fs.readFileSync(inputFile, "utf-8");

// Store unique links
const links = new Map();

// Known store abbreviations
const storeAbbreviations = {
  steam: "steam",
  "epic games store": "egs",
  egs: "egs",
  "egs mobile": "egs-mobile",
  "play store": "playstore",
  "google play": "playstore",
  gog: "gog",
  "gog dreamlist": "gog-dreamlist",
  ubisoft: "ubisoft",
  "microsoft store": "ms-store",
  ea: "ea",
  "amazon prime": "amazon",
  official: "official"
};

// Common game title abbreviations
const gameAbbreviations = {
  "assassin's creed": "ac",
  "assassins creed": "ac",
  bioshock: "bs",
  "tomb raider": "tr",
  dishonored: "dh",
  "the witcher": "witcher",
  "watch dogs": "wd",
  "devil may cry": "dmc",
  "plants vs zombies": "pvz",
  "plants vs. zombies": "pvz",
  "hero of the kingdom": "hotk",
  "monument valley": "mv"
};

/**
 * Extract store name from URL
 * @param {string} url - The URL
 * @returns {string} - Store abbreviation
 */
function extractStoreFromUrl(url) {
  const urlLower = url.toLowerCase();

  if (
    urlLower.includes("steampowered.com") ||
    urlLower.includes("steamcommunity.com")
  ) {
    return "steam";
  } else if (urlLower.includes("epicgames.com")) {
    if (urlLower.includes("android") || urlLower.includes("mobile")) {
      return "egs-mobile";
    }
    return "egs";
  } else if (urlLower.includes("play.google.com")) {
    return "playstore";
  } else if (urlLower.includes("gog.com")) {
    if (urlLower.includes("dreamlist")) {
      return "gog-dreamlist";
    }
    return "gog";
  } else if (urlLower.includes("ubisoft.com")) {
    return "ubisoft";
  } else if (urlLower.includes("microsoft.com/store")) {
    return "ms-store";
  } else if (urlLower.includes("ea.com")) {
    return "ea";
  } else if (urlLower.includes("amazon")) {
    return "amazon";
  } else if (
    urlLower.includes("github.com") ||
    urlLower.includes("readme.md")
  ) {
    return "repo";
  }

  return "web";
}

/**
 * Create abbreviated game name
 * @param {string} gameName - The full game name
 * @returns {string} - Abbreviated name
 */
function abbreviateGameName(gameName) {
  const lowerName = gameName.toLowerCase();

  // Check for known abbreviations
  for (const [full, abbrev] of Object.entries(gameAbbreviations)) {
    if (lowerName.startsWith(full)) {
      // Extract version number or subtitle
      const remaining = gameName.substring(full.length).trim();
      const numberMatch = remaining.match(/^(\d+)/);

      if (numberMatch) {
        return `${abbrev}${numberMatch[1]}`;
      } else if (remaining) {
        // Extract first letters of remaining words
        const words = remaining.split(/[\s:]+/).filter((w) => w.length > 0);
        const initials = words.map((w) => w[0].toLowerCase()).join("");
        return `${abbrev}-${initials}`;
      }
      return abbrev;
    }
  }

  // For other games, create a reasonable ID
  const cleanName = gameName
    .replace(/[™®©]/g, "") // Remove trademark symbols
    .replace(/['':]/g, "") // Remove apostrophes and colons
    .replace(/[^\w\s-]/g, "") // Remove other special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .toLowerCase()
    .replace(/^-+|-+$/g, ""); // Trim hyphens

  // If name is too long, use first 3-4 words or first 30 chars
  const words = cleanName.split("-");
  if (words.length > 4) {
    return words.slice(0, 4).join("-");
  } else if (cleanName.length > 40) {
    return cleanName.substring(0, 40).replace(/-[^-]*$/, "");
  }

  return cleanName;
}

/**
 * Generate a meaningful link ID
 * @param {string} text - The link text
 * @param {string} url - The URL
 * @param {string} context - The line context (for detecting game names)
 * @returns {string} - A unique reference ID
 */
function generateLinkId(text, url, context) {
  // Check if this exact URL already has an ID (reuse existing)
  for (const [existingId, existingUrl] of links.entries()) {
    if (existingUrl === url) {
      return existingId;
    }
  }

  const storeName = extractStoreFromUrl(url);
  let baseId = "";

  // Try to detect if this is a game link in a table
  // Context should contain the game name from the same row
  const gameNameMatch = context.match(/^\|\s*([^|]+?)\s*\|/);

  if (
    gameNameMatch &&
    gameNameMatch[1].trim() !== "Game name" &&
    gameNameMatch[1].trim() !== "Game Name"
  ) {
    // This is likely a game entry in a table
    const gameName = gameNameMatch[1].trim();
    const gameId = abbreviateGameName(gameName);
    baseId = `${gameId}-${storeName}`;
  } else {
    // For non-game links, use the link text
    baseId = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/^-+|-+$/g, "")
      .substring(0, 50);

    if (!baseId) {
      baseId = "link";
    }

    // Don't add store name if it's already in the text
    if (!baseId.includes(storeName) && storeName !== "web") {
      baseId = `${baseId}-${storeName}`;
    }
  }

  // Ensure uniqueness
  let linkId = baseId;
  let counter = 1;

  while (links.has(linkId)) {
    linkId = `${baseId}-${counter}`;
    counter++;
  }

  links.set(linkId, url);
  return linkId;
}

console.log("🔄 Converting inline links to reference-style...");

// Split content into lines to maintain context
const lines = content.split("\n");
const newLines = [];

// Pattern to match markdown links: [text](url)
const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;

for (const line of lines) {
  let newLine = line;
  let match;
  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;

  // Find all matches in this line
  const matches = [];
  while ((match = linkPattern.exec(line)) !== null) {
    matches.push({
      fullMatch: match[0],
      text: match[1],
      url: match[2],
      index: match.index
    });
  }

  // Replace matches in reverse order to maintain correct indices
  for (let i = matches.length - 1; i >= 0; i--) {
    const m = matches[i];
    const linkId = generateLinkId(m.text, m.url, line);
    const replacement = `[${m.text}][${linkId}]`;
    newLine =
      newLine.substring(0, m.index) +
      replacement +
      newLine.substring(m.index + m.fullMatch.length);
  }

  newLines.push(newLine);
}

const newContent = newLines.join("\n");

console.log(`✅ Converted ${links.size} unique links`);

// Generate link definitions section
console.log("📝 Generating link definitions...");

// Check if the file already has a link definitions section
const hasLinkDefs = newContent.includes("<!-- Link Definitions -->");

let finalContent = newContent;
const allLinks = new Map();

if (hasLinkDefs) {
  // Extract existing link definitions
  const match = newContent.match(/\n<!-- Link Definitions -->\n([\s\S]*?)$/);
  if (match) {
    const existingDefs = match[1];
    // Parse existing link definitions
    const linkDefPattern = /^\[([^\]]+)\]:\s*(.+)$/gm;
    let defMatch;
    while ((defMatch = linkDefPattern.exec(existingDefs)) !== null) {
      allLinks.set(defMatch[1], defMatch[2]);
    }

    // Remove the old link definitions section from content
    finalContent = newContent.replace(
      /\n<!-- Link Definitions -->\n[\s\S]*$/,
      ""
    );
  }
}

// Add new links (will override if same ID exists)
for (const [linkId, url] of links.entries()) {
  allLinks.set(linkId, url);
}

// Sort all links by ID for better organization
const sortedLinks = Array.from(allLinks.entries()).sort((a, b) =>
  a[0].localeCompare(b[0])
);

// Build link definitions section
if (sortedLinks.length > 0) {
  let linkDefinitions = "\n\n<!-- Link Definitions -->\n";
  for (const [linkId, url] of sortedLinks) {
    linkDefinitions += `[${linkId}]: ${url}\n`;
  }
  finalContent += linkDefinitions;
}

// Write the output file
console.log(`💾 Writing to: ${outputFile}`);
fs.writeFileSync(outputFile, finalContent, "utf-8");

console.log("✨ Refactoring complete!");
console.log(`📊 Statistics:`);
console.log(`   - Total unique links: ${links.size}`);
console.log(`   - Input file: ${inputFile}`);
console.log(`   - Output file: ${outputFile}`);

// Show sample of converted links
if (links.size > 0) {
  console.log(`\n📌 Sample of link definitions (first 10):`);
  let count = 0;
  for (const [linkId, url] of sortedLinks) {
    if (count >= 10) break;
    const displayUrl = url.length > 60 ? url.substring(0, 57) + "..." : url;
    console.log(`   [${linkId}]: ${displayUrl}`);
    count++;
  }
}
