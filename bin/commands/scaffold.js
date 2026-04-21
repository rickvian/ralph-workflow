/**
 * Ralph file scaffolding command.
 *
 * Copies the bundled `templates/scripts/` directory into `<cwd>/scripts/` inside the
 * user's current working directory, then generates ralph.sh for the selected CLI.
 * This ensures all files (ralph/, and any future files added to templates/scripts/)
 * are scaffolded into the user's project.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ask } from '../lib/ui.js';
import { writeRalphSh } from '../lib/generate-ralph-sh.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Absolute path to the bundled templates/scripts directory (two levels up from commands/). */
const SOURCE_DIR = path.resolve(__dirname, '../../templates/scripts');

/**
 * Copy entire scripts directory from templates into `<cwd>/scripts/`,
 * then generate ralph.sh for the chosen CLI.
 * @param {string} [cliName='claude'] - CLI key from cli-map.js
 */
export async function scaffoldRalph(cliName = 'claude') {
  const targetScriptsDir = path.resolve(process.cwd(), 'scripts');
  const targetRalphDir = path.join(targetScriptsDir, 'ralph');

  const existingDirs = [targetScriptsDir, targetRalphDir].filter(d => fs.existsSync(d));
  if (existingDirs.length > 0) {
    console.warn('\nWarning: the following director' + (existingDirs.length > 1 ? 'ies' : 'y') + ' already exist and will be overwritten:');
    existingDirs.forEach(d => console.warn('  ' + d));
    const answer = await ask('\nProceed and overwrite? [y/N]: ');
    if (answer.trim().toLowerCase() !== 'y') {
      console.log('Scaffold cancelled. No files were changed.');
      return;
    }
  }

  console.log('Scaffolding scripts directory...');

  if (!fs.existsSync(SOURCE_DIR)) {
    console.error('Error: template directory not found at ' + SOURCE_DIR);
    process.exit(1);
  }

  try {
    try {
      if (fs.cpSync) {
        fs.cpSync(SOURCE_DIR, targetScriptsDir, { recursive: true });
      } else {
        _copyRecursive(SOURCE_DIR, targetScriptsDir);
      }
    } catch {
      _copyRecursive(SOURCE_DIR, targetScriptsDir);
    }

    // Generate ralph.sh with the selected CLI command
    const ralphShPath = path.join(targetScriptsDir, 'ralph', 'ralph.sh');
    writeRalphSh(ralphShPath, cliName);

    // Make ralph.sh executable
    fs.chmodSync(ralphShPath, 0o755);

    console.log("'scripts' directory has been created");
    console.log('\nYou can now use the Ralph scripts in your workflow.');
    console.log('Read scripts/ralph/ralph-usage-guide.md for more info.');
  } catch (err) {
    console.error('Error scaffolding files:', err);
    process.exit(1);
  }
}

/**
 * Recursively copy `src` to `dest` without relying on fs.cpSync.
 * @param {string} src
 * @param {string} dest
 */
function _copyRecursive(src, dest) {
  const stat = fs.statSync(src);

  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const child of fs.readdirSync(src)) {
      _copyRecursive(path.join(src, child), path.join(dest, child));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}
