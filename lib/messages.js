"use strict";

const pc = require("picocolors");

function printHelp() {
  console.log(`
  ${pc.bold("@snguesssan/create-pi-ag-ui")} — Scaffold a Pi AG-UI project

  ${pc.bold("Usage:")}
    npx @snguesssan/create-pi-ag-ui ${pc.dim("[project-name]")} ${pc.dim("[options]")}

  ${pc.bold("Options:")}
    --pm <npm|pnpm|yarn|bun>   Package manager to use
    --skip-install             Skip dependency installation
    -h, --help                 Show this help message

  ${pc.bold("Examples:")}
    npx @snguesssan/create-pi-ag-ui my-app
    npx @snguesssan/create-pi-ag-ui my-app --pm pnpm
    npx @snguesssan/create-pi-ag-ui my-app --skip-install
`);
}

function printSuccess(projectName, pm, skippedInstall) {
  const runCmd = pm === "yarn" ? "yarn dev" : `${pm} run dev`;
  const installCmd = pm === "yarn" ? "yarn" : `${pm} install`;

  console.log();
  console.log(
    pc.green(pc.bold("  Done!")) + " Project created in " + pc.bold(projectName)
  );
  console.log();
  console.log("  Next steps:");
  console.log();
  console.log(pc.cyan(`    cd ${projectName}`));
  if (skippedInstall) {
    console.log(pc.cyan(`    ${installCmd}`));
  }
  console.log(pc.cyan("    # Add your ANTHROPIC_API_KEY to .env.local"));
  console.log(pc.cyan(`    ${runCmd}`));
  console.log();
  console.log(pc.dim("  Open http://localhost:3000 to see your AI agent."));
  console.log();
}

module.exports = { printHelp, printSuccess };
