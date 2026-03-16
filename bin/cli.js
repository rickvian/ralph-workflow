#!/usr/bin/env node

/**
 * ralph-workflow CLI entry point.
 *
 * Usage:
 *   npx ralph-workflow          — interactive setup
 *   npx ralph-workflow --check-isolation  — also inject isolation-check scripts into the container
 *
 * Flow:
 *   1. Ask which AI coding CLI to use.
 *   2. Ask whether to set up a VS Code Dev Container for isolation.
 *   3a. Yes → pick a container template → optionally set up a scoped GitHub PAT.
 *   3b. No  → confirm the user understands the risk, then proceed directly.
 *   4. Copy Ralph template files and generate ralph.sh for the chosen CLI.
 */

import { rl, ask } from './lib/ui.js';
import { setupDevContainer } from './commands/devcontainer.js';
import { scaffoldRalph } from './commands/scaffold.js';
import CLI_MAP from './lib/cli-map.js';

const DEBUG = process.argv.includes('--check-isolation');

async function main() {
  const cliKeys = Object.keys(CLI_MAP);
  const cliList = cliKeys.map(keyItem => keyItem).join(', ');

  console.log('\nSupported CLIs: ' + cliList);
  const cliAnswer = await ask('Which AI coding CLI you want to use for Ralph? (empty for default "claude"): ');
  const cliName = cliAnswer.trim().toLowerCase() || 'claude';

  if (!CLI_MAP[cliName]) {
    console.error('Unknown CLI: ' + cliName + '. Supported: ' + cliKeys.join(', '));
    rl.close();
    process.exit(1);
  }

  console.log('\n   Ralph operates with elevated permissions and proceeds without confirmations (--dangerously-skip-permissions).');
  console.log('   Risks of hallucinations and prompt injections could result in accidental file deletion, exposure of SSH keys/credentials');
  console.log('   and corruption of other local projects. Isolation is recommended\n');

  const isolateAnswer = await ask('Set up VS Code Dev Container for isolation? [Y/n]: ');
  const wantsIsolation = isolateAnswer.trim().toLowerCase() !== 'n';

  if (!wantsIsolation) {
    console.log('\n  ⚠️  Proceeding without isolation. Be careful.\n');
    rl.close();
    scaffoldRalph(cliName);
  } else {
    await setupDevContainer(DEBUG);
    // Note: rl was already closed inside selectMenu
    scaffoldRalph(cliName);
  }
}

main();
