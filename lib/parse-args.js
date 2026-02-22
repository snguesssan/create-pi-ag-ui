"use strict";

const VALID_PM = ["npm", "pnpm", "yarn", "bun"];

function parseArgs(argv) {
  const result = {
    projectName: null,
    pm: null,
    skipInstall: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === "--help" || arg === "-h") {
      result.help = true;
    } else if (arg === "--skip-install") {
      result.skipInstall = true;
    } else if (arg === "--pm") {
      const value = argv[++i];
      if (!VALID_PM.includes(value)) {
        console.error(
          `Invalid package manager: "${value}". Use one of: ${VALID_PM.join(", ")}`
        );
        process.exit(1);
      }
      result.pm = value;
    } else if (!arg.startsWith("-")) {
      result.projectName = arg;
    }
  }

  return result;
}

module.exports = { parseArgs };
