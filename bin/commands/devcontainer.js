/**
 * Dev Container setup command.
 *
 * Presents the template selection menu and returns the chosen template.
 * Orchestration (GitHub setup, writeDevContainer) is handled by cli.js.
 */

import { selectMenu } from '../lib/ui.js';
import { TEMPLATES } from '../lib/devcontainer-templates.js';

/**
 * Show the interactive template menu and return the selected template.
 * Note: selectMenu closes the shared readline interface.
 * @returns {Promise<object>} The chosen template object.
 */
export async function selectTemplate() {
  console.log('\nSelect a Dev Container template (use arrow keys, Enter to confirm):\n');
  const idx = await selectMenu(TEMPLATES.map(t => t.label));
  return TEMPLATES[idx];
}
