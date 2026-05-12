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
 *   4. Ask whether to set up a scoped GitHub PAT (independent of step 3).
 *   5. If isolation: pick a container template (closes readline).
 *   6. Execute the chosen combination, then scaffold Ralph files.
 */

import { createRequire } from 'module';
import { rl, ask } from './lib/ui.js';
import { selectTemplate } from './commands/devcontainer.js';
import { setupGitHubAccess } from './commands/github-access.js';
import { writeDevContainer } from './lib/write-devcontainer.js';
import { scaffoldRalph } from './commands/scaffold.js';
import CLI_MAP from './lib/cli-map.js';

const require = createRequire(import.meta.url);
const { version } = require('../package.json');

const DEBUG = process.argv.includes('--check-isolation');

// Interpolates two RGB colors across the characters of a string using ANSI true-color codes.
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

  const githubAnswer = await ask('Set up GitHub repository with isolated PAT token? [Y/n]: ');
  const wantsGitHub = githubAnswer.trim().toLowerCase() !== 'n';

  // Caveman and the awesome-subagents list are Claude-specific — skip their
  // prompts for other CLIs so the flow stays short.
  let wantsCaveman = false;
  let wantsSubagents = false;
  if (cliName === 'claude') {
    const cavemanAnswer = await ask('Install Caveman debugging plugin? [y/N]: ');
    wantsCaveman = cavemanAnswer.trim().toLowerCase() === 'y';

    const subagentsAnswer = await ask('Install curated awesome-claude-code-subagents collection? [y/N]: ');
    wantsSubagents = subagentsAnswer.trim().toLowerCase() === 'y';
  }

  // Template selection uses raw keypress mode and closes rl — must come after all ask() calls.
  let template = null;
  if (wantsIsolation) {
    template = await selectTemplate();
  } else {
    rl.close();
  }

  const tools = { caveman: wantsCaveman, subagents: wantsSubagents };

  if (!wantsIsolation && !wantsGitHub) {
    console.log('\n  ⚠️  Proceeding without isolation. Be careful.\n');
  } else if (wantsGitHub) {
    await setupGitHubAccess();
    if (wantsIsolation) {
      writeDevContainer(template.config, template.name, true, null, DEBUG, cliName, tools);
    }
  } else {
    writeDevContainer(template.config, template.name, false, null, DEBUG, cliName, tools);
  }

  await scaffoldRalph(cliName);
}

main();
