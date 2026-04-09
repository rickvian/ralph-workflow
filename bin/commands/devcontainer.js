/**
 * Dev Container setup command.
 *
 * Presents the template selection menu, asks whether to configure GitHub
 * isolation, then delegates to the appropriate sub-command.
 */

import readline from 'readline';
import { selectMenu } from '../lib/ui.js';
import { TEMPLATES } from '../lib/devcontainer-templates.js';
import { writeDevContainer } from '../lib/write-devcontainer.js';
import { setupGitHubAccess } from './github-access.js';

/**
 * Run the interactive Dev Container setup flow.
 * @param {boolean} debug - If true, isolation-check scripts are injected.
 */
export async function setupDevContainer(debug = false, cliName = 'claude') {
  console.log('\nSelect a Dev Container template (use arrow keys, Enter to confirm):\n');

  const idx = await selectMenu(TEMPLATES.map(t => t.label));
  const template = TEMPLATES[idx];

  // Recreate readline after selectMenu closed it
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const githubAnswer = await new Promise(resolve =>
    rl.question('\nSet up GitHub repository with isolated PAT token? [Y/n]: ', resolve)
  );
  rl.close();

  const wantsGitHub = githubAnswer.trim().toLowerCase() !== 'n';

  if (wantsGitHub) {
    await setupGitHubAccess(template.config, template.name, debug, cliName);
  } else {
    writeDevContainer(template.config, template.name, false, null, debug, cliName);
  }
}
