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
import { rl, ask, wizardBanner, stage, step, note, success } from './lib/ui.js';
import { selectTemplate } from './commands/devcontainer.js';
import { setupGitHubAccess } from './commands/github-access.js';
import { writeDevContainer } from './lib/write-devcontainer.js';
import { scaffoldRalph } from './commands/scaffold.js';
import CLI_MAP from './lib/cli-map.js';

const require = createRequire(import.meta.url);
const { version } = require('../package.json');

const DEBUG = process.argv.includes('--check-isolation');

async function main() {
  wizardBanner(`ralph-workflow v${version}`, 4, 3);

  const cliKeys = Object.keys(CLI_MAP);
  stage(1, 4, 'Choose your AI coding CLI', 3);
  note(`Available: ${cliKeys.join(', ')}. Claude is the default.`);
  const cliAnswer = await ask('  CLI [claude]: ');
  const cliName = cliAnswer.trim().toLowerCase() || 'claude';

  if (!CLI_MAP[cliName]) {
    console.error('Unknown CLI: ' + cliName + '. Supported: ' + cliKeys.join(', '));
    rl.close();
    process.exit(1);
  }

  stage(2, 4, 'Protect your workspace', 2);
  step('Ralph runs with elevated permissions and can change files without asking.');
  step('A Dev Container keeps that access isolated from the rest of your machine.');

  const isolateAnswer = await ask('  Set up a VS Code Dev Container? [Y/n]: ');
  const wantsIsolation = isolateAnswer.trim().toLowerCase() !== 'n';

  stage(3, 4, 'Connect GitHub (optional)', 1);
  note('Creates a private repository, then opens a pre-scoped token setup link.');
  const githubAnswer = await ask('  Set up GitHub with an isolated token? [Y/n]: ');
  const wantsGitHub = githubAnswer.trim().toLowerCase() !== 'n';

  // Caveman and the awesome-subagents list are Claude-specific — skip their
  // prompts for other CLIs so the flow stays short.
  let wantsCaveman = false;
  let wantsSubagents = false;
  if (cliName === 'claude') {
    console.log('');
    step('Optional Claude additions');
    const cavemanAnswer = await ask('  Install Caveman debugging plugin? [y/N]: ');
    wantsCaveman = cavemanAnswer.trim().toLowerCase() === 'y';

    const subagentsAnswer = await ask('  Install curated subagents collection? [y/N]: ');
    wantsSubagents = subagentsAnswer.trim().toLowerCase() === 'y';
  }

  let wantsPlaywrightMcp = false;
  if (cliName === 'claude') {
    const playwrightAnswer = await ask('  Install Playwright MCP server? [y/N]: ');
    wantsPlaywrightMcp = playwrightAnswer.trim().toLowerCase() === 'y';
  }

  // Template selection uses raw keypress mode and closes rl — must come after all ask() calls.
  let template = null;
  if (wantsIsolation) {
    stage(4, 4, 'Choose a Dev Container', 0);
    template = await selectTemplate();
  } else {
    rl.close();
    stage(4, 4, 'Create your Ralph workflow', 0);
  }

  const tools = { caveman: wantsCaveman, subagents: wantsSubagents, playwrightMcp: wantsPlaywrightMcp };

  if (!wantsIsolation && !wantsGitHub) {
    console.log('\n  ⚠ Proceeding without isolation. Work only in a project you can safely change.\n');
  } else if (wantsGitHub) {
    await setupGitHubAccess();
    if (wantsIsolation) {
      writeDevContainer(template.config, template.name, true, null, DEBUG, cliName, tools);
    }
  } else {
    writeDevContainer(template.config, template.name, false, null, DEBUG, cliName, tools);
  }

  await scaffoldRalph(cliName);
  success('Your Ralph workflow is ready.');
  step(`AI coding CLI: ${cliName}`);
  step(wantsIsolation
    ? `Dev Container: ${template.name}`
    : 'Dev Container: skipped');
  step(wantsGitHub
    ? 'GitHub isolation: configured'
    : 'GitHub isolation: skipped');
  note('Next: read scripts/ralph/ralph-usage-guide.md, then run scripts/ralph/ralph.sh.');
}

main();
