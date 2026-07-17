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
import { intro, outro, info, note, confirm, select } from './lib/ui.js';
import { selectTemplate } from './commands/devcontainer.js';
import { setupGitHubAccess } from './commands/github-access.js';
import { writeDevContainer } from './lib/write-devcontainer.js';
import { scaffoldRalph } from './commands/scaffold.js';
import CLI_MAP from './lib/cli-map.js';

const require = createRequire(import.meta.url);
const { version } = require('../package.json');

const DEBUG = process.argv.includes('--check-isolation');

async function main() {
  intro(version);

  const cliKeys = Object.keys(CLI_MAP);
  const cliName = await select('Choose your AI coding CLI', cliKeys.map(name => ({
    value: name,
    label: CLI_MAP[name].label ?? name,
    hint: name === 'claude' ? 'Recommended default' : undefined,
  })));

  note(
    'Ralph runs with elevated permissions and can change files without asking. A Dev Container keeps its access isolated from the rest of your machine.',
    'Workspace isolation'
  );
  const wantsIsolation = await confirm('Set up a VS Code Dev Container?', true);

  note(
    'Creates a private repository, then guides you through creating a project-scoped GitHub token.',
    'GitHub isolation'
  );
  const wantsGitHub = await confirm('Set up GitHub with an isolated token?', true);

  // Caveman and the awesome-subagents list are Claude-specific — skip their
  // prompts for other CLIs so the flow stays short.
  let wantsCaveman = false;
  let wantsSubagents = false;
  if (cliName === 'claude') {
    wantsCaveman = await confirm('Install the Caveman debugging plugin?', false);
    wantsSubagents = await confirm('Install the curated subagents collection?', false);
  }

  let wantsPlaywrightMcp = false;
  if (cliName === 'claude') {
    wantsPlaywrightMcp = await confirm('Install the Playwright MCP server?', false);
  }

  // Template selection uses raw keypress mode and closes rl — must come after all ask() calls.
  let template = null;
  if (wantsIsolation) {
    template = await selectTemplate();
  }

  const tools = { caveman: wantsCaveman, subagents: wantsSubagents, playwrightMcp: wantsPlaywrightMcp };

  if (!wantsIsolation && !wantsGitHub) {
    info('Proceeding without isolation. Work only in a project you can safely change.');
  } else if (wantsGitHub) {
    await setupGitHubAccess();
    if (wantsIsolation) {
      writeDevContainer(template.config, template.name, true, null, DEBUG, cliName, tools);
    }
  } else {
    writeDevContainer(template.config, template.name, false, null, DEBUG, cliName, tools);
  }

  await scaffoldRalph(cliName);
  outro(`Ralph workflow is ready — ${cliName}${wantsIsolation ? ` in ${template.name}` : ''}.\nRead scripts/ralph/ralph-usage-guide.md to get started.`);
}

main();
