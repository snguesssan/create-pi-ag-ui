"use strict";

const path = require("node:path");
const fs = require("fs-extra");

const RENAME_MAP = {
  gitignore: ".gitignore",
  "env.example": ".env.example",
  "eslintrc.json": ".eslintrc.json",
};

async function copyTemplate(templateDir, targetDir, projectName) {
  await fs.copy(templateDir, targetDir);

  for (const [from, to] of Object.entries(RENAME_MAP)) {
    const srcPath = path.join(targetDir, from);
    const destPath = path.join(targetDir, to);
    if (await fs.pathExists(srcPath)) {
      await fs.rename(srcPath, destPath);
    }
  }

  const pkgPath = path.join(targetDir, "package.json");
  const pkg = await fs.readJson(pkgPath);
  pkg.name = projectName;
  await fs.writeJson(pkgPath, pkg, { spaces: 2 });

  const envExamplePath = path.join(targetDir, ".env.example");
  const envLocalPath = path.join(targetDir, ".env.local");
  if (await fs.pathExists(envExamplePath)) {
    await fs.copy(envExamplePath, envLocalPath);
  }
}

module.exports = { copyTemplate };
