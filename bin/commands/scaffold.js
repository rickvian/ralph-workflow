/**
 * Ralph file scaffolding command.
 *
 * Copies the bundled `templates/scripts/` directory into `<cwd>/scripts/`, then
 * overlays the selected CLI template from `templates/cli/<cli>/`.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import CLI_MAP from '../lib/cli-map.js';
import { confirm, info, spinner } from '../lib/ui.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { version: RALPH_VERSION } = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../../package.json'), 'utf-8')
);

/** Absolute path to the bundled templates/scripts directory (two levels up from commands/). */
const SOURCE_DIR = path.resolve(__dirname, '../../templates/scripts');
const CLI_TEMPLATES_DIR = path.resolve(__dirname, '../../templates/cli');

/**
 * Copy common Ralph files, then overlay files for the chosen CLI.
 * @param {string} [cliName='claude'] - CLI key from cli-map.js and templates/cli/
 */
export async function scaffoldRalph(cliName = 'claude') {
  if (!CLI_MAP[cliName]) {
    const supported = Object.keys(CLI_MAP).join(', ');
    throw new Error('Unknown CLI "' + cliName + '". Supported: ' + supported);
  }

  const targetScriptsDir = path.resolve(process.cwd(), 'scripts');
  const targetRalphDir = path.join(targetScriptsDir, 'ralph');
  const cliTemplateDir = path.join(CLI_TEMPLATES_DIR, cliName);

  const existingDirs = [targetScriptsDir, targetRalphDir].filter(d => fs.existsSync(d));
  if (existingDirs.length > 0) {
    const shouldOverwrite = await confirm(
      `Overwrite existing Ralph files in ${existingDirs.map(dir => path.basename(dir)).join(' and ')}?`,
      false
    );
    if (!shouldOverwrite) {
      info('Existing Ralph files were left unchanged.');
      return;
    }
  }

  const progress = spinner();
  progress.start('Creating Ralph workflow files');

  if (!fs.existsSync(SOURCE_DIR)) {
    console.error('Error: template directory not found at ' + SOURCE_DIR);
    process.exit(1);
  }
  if (!fs.existsSync(cliTemplateDir)) {
    console.error('Error: CLI template directory not found at ' + cliTemplateDir);
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

    try {
      if (fs.cpSync) {
        fs.cpSync(cliTemplateDir, process.cwd(), { recursive: true, force: true });
      } else {
        _copyRecursive(cliTemplateDir, process.cwd());
      }
    } catch {
      _copyRecursive(cliTemplateDir, process.cwd());
    }

    const ralphShPath = path.join(targetScriptsDir, 'ralph', 'ralph.sh');
    fs.chmodSync(ralphShPath, 0o755);

    // Record the scaffolding version so users can tell which release was used
    const versionFilePath = path.join(targetRalphDir, '.ralph-version');
    fs.writeFileSync(versionFilePath, 'ralph-workflow@' + RALPH_VERSION + '\n', 'utf-8');

    progress.stop("Created 'scripts' directory");
  } catch (err) {
    progress.stop('Could not create Ralph workflow files');
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
