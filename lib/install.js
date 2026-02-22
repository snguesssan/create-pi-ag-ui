"use strict";

const { execSync } = require("node:child_process");

function installDeps(targetDir, pm) {
  const cmd = pm === "yarn" ? "yarn" : `${pm} install`;

  try {
    execSync(cmd, {
      cwd: targetDir,
      stdio: "inherit",
      env: { ...process.env, ADBLOCK: "1", DISABLE_OPENCOLLECTIVE: "1" },
    });
  } catch {
    console.warn(
      "\nDependency installation failed. You can install them manually:\n" +
        `  cd ${targetDir}\n  ${cmd}\n`
    );
  }
}

module.exports = { installDeps };
