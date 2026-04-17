/**
 * GitHub repository and PAT token setup command.
 *
 * - Initialises a git repo in the current directory if one doesn't exist.
 * - Creates a private GitHub repo via the gh CLI.
 * - Walks the user through creating a fine-grained PAT scoped only to this repo.
 * - Stores the token at .ralph/token inside the project directory (mode 0600).
 *   Using a project-local path means the devcontainer bind mount can reference
 *   ${localWorkspaceFolder}/.ralph/token — no OS-specific absolute path needed,
 *   so the same devcontainer.json works on macOS, Linux, and Windows.
 * - Adds .ralph/ to .gitignore so the token is never committed.
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
export async function setupGitHubAccess(config, templateName, debug = false, cliName = 'claude') {
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

  _storeToken(token);

  writeDevContainer(config, templateName, true, null, debug, cliName);
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
 * Write the PAT to .ralph/token inside the project directory with restricted
 * permissions, and ensure .ralph/ is listed in .gitignore.
 *
 * Storing the token relative to the project (rather than in ~/.config/ralph/)
 * lets devcontainer.json reference ${localWorkspaceFolder}/.ralph/token, which
 * the devcontainer runtime resolves correctly on macOS, Linux, and Windows.
 *
 * @param {string} token
 */
function _storeToken(token) {
  const tokenDir = path.join(process.cwd(), '.ralph');
  const tokenPath = path.join(tokenDir, 'token');

  if (!fs.existsSync(tokenDir)) {
    fs.mkdirSync(tokenDir, { recursive: true });
  }

  fs.writeFileSync(tokenPath, token, { mode: 0o600 });

  _ensureGitignore('.ralph/');

  console.log(`Token stored: ${tokenPath}`);
}

/**
 * Append an entry to .gitignore if it is not already present.
 * @param {string} entry
 */
function _ensureGitignore(entry) {
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  const existing = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, 'utf8') : '';
  const lines = existing.split('\n').map(l => l.trim());
  if (!lines.includes(entry.trim())) {
    const separator = existing.length > 0 && !existing.endsWith('\n') ? '\n' : '';
    fs.appendFileSync(gitignorePath, `${separator}${entry}\n`);
  }
}
