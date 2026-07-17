/**
 * Dev Container setup command.
 *
 * Presents the template selection menu and returns the chosen template.
 * Orchestration (GitHub setup, writeDevContainer) is handled by cli.js.
 */

import { select } from '../lib/ui.js';
import { TEMPLATES } from '../lib/devcontainer-templates.js';

/**
 * Show the interactive template menu and return the selected template.
 * Note: selectMenu closes the shared readline interface.
 * @returns {Promise<object>} The chosen template object.
 */
export async function selectTemplate() {
  const name = await select('Choose a Dev Container', TEMPLATES.map(t => ({
    value: t.name,
    label: t.label,
    hint: t.description,
  })));
  return TEMPLATES.find(t => t.name === name);
}
