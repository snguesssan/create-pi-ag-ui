#!/usr/bin/env node

"use strict";

const { join } = require("node:path");
const prompts = require("prompts");
const pc = require("picocolors");
const fs = require("fs-extra");
const { parseArgs } = require("../lib/parse-args");
const { copyTemplate } = require("../lib/copy-template");
const { installDeps } = require("../lib/install");
const { printSuccess, printHelp } = require("../lib/messages");

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  console.log();
  console.log(pc.bold("  Pi AG-UI") + pc.dim(" — Create a new project"));
  console.log();

  let projectName = args.projectName;
  if (!projectName) {
    const response = await prompts({
      type: "text",
      name: "projectName",
      message: "Project name:",
      initial: "my-pi-ag-ui",
      validate: (v) => v.trim().length > 0 || "Project name is required",
    });
    if (!response.projectName) {
      console.log(pc.red("Aborted."));
      process.exit(1);
    }
    projectName = response.projectName.trim();
  }

  const targetDir = join(process.cwd(), projectName);

  if (await fs.pathExists(targetDir)) {
    const contents = await fs.readdir(targetDir);
    if (contents.length > 0) {
      console.log(
        pc.red(`Error: Directory "${projectName}" already exists and is not empty.`)
      );
      process.exit(1);
    }
  }

  let pm = args.pm;
  if (!pm) {
    const response = await prompts({
      type: "select",
      name: "pm",
      message: "Package manager:",
      choices: [
        { title: "npm", value: "npm" },
        { title: "pnpm", value: "pnpm" },
        { title: "yarn", value: "yarn" },
        { title: "bun", value: "bun" },
      ],
    });
    if (!response.pm) {
      console.log(pc.red("Aborted."));
      process.exit(1);
    }
    pm = response.pm;
  }

  console.log();
  console.log(pc.cyan("  Scaffolding project in ") + pc.bold(targetDir));
  console.log();

  const templateDir = join(__dirname, "..", "template");
  await copyTemplate(templateDir, targetDir, projectName);

  if (!args.skipInstall) {
    console.log(pc.cyan(`  Installing dependencies with ${pm}...`));
    console.log();
    await installDeps(targetDir, pm);
  }

  printSuccess(projectName, pm, args.skipInstall);
}

main().catch((err) => {
  console.error(pc.red("Error:"), err.message || err);
  process.exit(1);
});
