#!/usr/bin/env node

/**
 * ralph-workflow CLI entry point.
 *
 * Usage:
 *   npx ralph-workflow          — interactive setup
 *   npx ralph-workflow --check-isolation  — also inject isolation-check scripts into the container
 *
 * Flow:
 *   1. Print the current package version.
 *   2. Ask which AI coding CLI to use.
 *   3. Ask whether to set up a VS Code Dev Container for isolation.
 *   4a. Yes → pick a container template → optionally set up a scoped GitHub PAT.
 *   4b. No  → confirm the user understands the risk, then proceed directly.
 *   5. Copy Ralph template files and generate ralph.sh for the chosen CLI.
 */

import { createRequire } from 'module';
import { rl, ask } from './lib/ui.js';
import { setupDevContainer } from './commands/devcontainer.js';
import { scaffoldRalph } from './commands/scaffold.js';
import CLI_MAP from './lib/cli-map.js';

const require = createRequire(import.meta.url);
const { version } = require('../package.json');

const DEBUG = process.argv.includes('--check-isolation');

// Interpolates two RGB colours across the characters of a string using ANSI true-colour codes.
function gradient(text, [r1, g1, b1], [r2, g2, b2]) {
  const len = text.length;
  return text.split('').map((ch, i) => {
    const t = len > 1 ? i / (len - 1) : 0;
    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);
    return `\x1b[38;2;${r};${g};${b}m${ch}`;
  }).join('') + '\x1b[0m';
}

function printBanner() {
  const name = 'ralph-workflow';
  const ver  = `v${version}`;
  const sub  = 'autonomous AI coding loop';

  // Use plain strings to measure visible widths (ANSI codes are zero-width)
  const plain1 = `  ✦ ${name}  ${ver}  `;
  const plain2 = `  ${sub}  `;
  const w   = Math.max(plain1.length, plain2.length);
  const bar = '─'.repeat(w);

  const gName = gradient(name, [200, 160, 255], [100, 40, 180]);
  const gVer  = gradient(ver,  [180, 130, 240], [120, 60, 200]);
  const dim   = '\x1b[2m';
  const reset = '\x1b[0m';

  // Build rows with ANSI content, padded to exact visible width
  const row1 = `  ✦ ${gName}  ${gVer}  ` + ' '.repeat(w - plain1.length);
  const row2 = plain2 + ' '.repeat(w - plain2.length);

  console.log('');
  console.log(`  ${dim}╭${bar}╮${reset}`);
  console.log(`  ${dim}│${reset}${row1}${dim}│${reset}`);
  console.log(`  ${dim}│${reset}${row2}${dim}│${reset}`);
  console.log(`  ${dim}╰${bar}╯${reset}`);
  console.log('');
}

async function main() {
  printBanner();

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
    await scaffoldRalph(cliName);
    rl.close();
  } else {
    await setupDevContainer(DEBUG, cliName);
    // Note: rl was already closed inside selectMenu
    await scaffoldRalph(cliName);
  }
}

main();
