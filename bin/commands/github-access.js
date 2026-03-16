/**
 * GitHub repository and PAT token setup command.
 *
 * - Initialises a git repo in the current directory if one doesn't exist.
 * - Creates a private GitHub repo via the gh CLI.
 * - Walks the user through creating a fine-grained PAT scoped only to this repo.
 * - Stores the token at ~/.config/ralph/<project>/token (mode 0600).
 * - Passes the token path to writeDevContainer so it is bind-mounted at runtime.
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { execSync } from 'child_process';
import { writeDevContainer } from '../lib/write-devcontainer.js';

/**
 * Full GitHub isolation setup flow.
 * @param {object}  config       - Base devcontainer config from the selected template.
 * @param {string}  templateName - Human-readable template name.
 * @param {boolean} debug        - Whether to inject isolation-check scripts.
 */
export async function setupGitHubAccess(config, templateName, debug = false) {
  const projectName = path.basename(process.cwd());
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q) => new Promise(resolve => rl.question(q, resolve));

  /** // FIXME: if failed, give option for user to retry
   give notes that github creation is using specific script to create **/
  console.log(`\nSetting up GitHub isolation for project: ${projectName}`);
  

  _ensureGitRepo();

  const userName = _getGitHubUsername();

  _createGitHubRepo(projectName, userName);

  const token = await _promptForPAT(ask, projectName, userName);
  rl.close();

  const tokenPath = _storeToken(token, projectName);

  writeDevContainer(config, templateName, true, tokenPath, debug);
}

/** Initialise a git repo in cwd if one does not already exist. */
function _ensureGitRepo() {
  try {
    execSync('git rev-parse --git-dir', { stdio: 'pipe' });
  } catch {
    console.log('Initializing git repository...');
    execSync('git init -b main 2>/dev/null || git init 2>/dev/null', { stdio: 'inherit' });
  }
}

/**
 * Resolve the authenticated GitHub username via the gh CLI.
 * Exits with an error if gh is not authenticated.
 * @returns {string}
 */
function _getGitHubUsername() {
  try {
    return execSync('gh api user -q .login', { encoding: 'utf8' }).trim();
  } catch {
    console.error('Error: gh CLI not authenticated. Please run: gh auth login');
    process.exit(1);
  }
}

/**
 * Create a private GitHub repo for the current project and ensure a remote is set.
 * @param {string} projectName
 * @param {string} userName
 */
function _createGitHubRepo(projectName, userName) {
  console.log('Creating private GitHub repository...');
  try {
    execSync(
      `gh repo create "${projectName}" --private --source=. --push 2>/dev/null || gh repo create "${projectName}" --private`,
      { stdio: 'inherit' }
    );
  } catch {
    console.error('Warning: Could not create repo. It may already exist.');
  }

  try {
    execSync('git remote get-url origin', { stdio: 'pipe' });
  } catch {
    execSync(`git remote add origin "https://github.com/${userName}/${projectName}.git"`, { stdio: 'inherit' });
  }
}

/**
 * Print PAT creation instructions and read the token from stdin.
 * @param {function} ask
 * @param {string}   projectName
 * @param {string}   userName
 * @returns {Promise<string>} The raw token string.
 */
async function _promptForPAT(ask, projectName, userName) {
  const patUrl =
    `https://github.com/settings/personal-access-tokens/new` +
    `?name=Ralph-${projectName}&target_name=${userName}&expires_in=1` +
    `&contents=write&pull_requests=write&issues=write&notifications=read&metadata=read`;

  console.log("\n── Create Ralph's GitHub Token ───────────────────────────────────────");
  console.log('Open this URL in your browser (name and permissions are pre-filled):');
  console.log('');
  console.log(patUrl);
  console.log('');
  console.log('IMPORTANT: Under "Repository access", select "Only select repositories"');
  console.log(`           then choose: ${projectName}`);
  console.log('');
  console.log('Set an expiration, click Generate, then paste the token below.');

  const token = await ask('Token: ');

  if (!token.trim()) {
    console.error('Error: no token provided. Aborting.');
    process.exit(1);
  }

  return token.trim();
}

/**
 * Write the PAT to disk with restricted permissions.
 * @param {string} token
 * @param {string} projectName
 * @returns {string} Absolute path to the stored token file.
 */
function _storeToken(token, projectName) {
  const tokenPath = path.join(process.env.HOME, '.config', 'ralph', projectName, 'token');
  const tokenDir = path.dirname(tokenPath);

  if (!fs.existsSync(tokenDir)) {
    fs.mkdirSync(tokenDir, { recursive: true });
  }

  fs.writeFileSync(tokenPath, token);
  fs.chmodSync(tokenPath, '0600');

  console.log(`Token stored: ${tokenPath}`);
  return tokenPath;
}
