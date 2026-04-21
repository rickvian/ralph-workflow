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

/**
 * Git repository, GitHub repo creation, and PAT token setup flow.
 * Devcontainer writing is handled by the caller.
 */
export async function setupGitHubAccess() {
  const projectName = path.basename(process.cwd());
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q) => new Promise(resolve => rl.question(q, resolve));

  console.log(`\nSetting up GitHub isolation for project: ${projectName}`);

  _ensureGitRepo();

  const userName = await _getGitHubUsername(ask);

  console.log('Note: a private GitHub repository will be created automatically using the gh CLI.');
  await _createGitHubRepo(projectName, userName, ask);

  const token = await _promptForPAT(ask, projectName, userName);
  rl.close();

  _storeToken(token);
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
 * Retries on failure until the user succeeds or declines.
 * @param {function} ask
 * @returns {Promise<string>}
 */
async function _getGitHubUsername(ask) {
  while (true) {
    try {
      return execSync('gh api user -q .login', { encoding: 'utf8', stdio: 'pipe' }).trim();
    } catch (err) {
      const stderr = (err.stderr || '').toString().trim();
      console.error(`\nFailed to reach GitHub: ${stderr || 'unknown error'}`);
      console.error('Ensure gh is authenticated (gh auth login) and you have internet access.');
      const answer = await ask('Would you like to retry? (y/n): ');
      if (answer.trim().toLowerCase() !== 'y') {
        console.error('\nCannot continue without GitHub access. Run `gh auth login` and try again.');
        process.exit(1);
      }
    }
  }
}

/**
 * Create a private GitHub repo for the current project and ensure a remote is set.
 * Retries on failure until the user succeeds or declines.
 * @param {string}   projectName
 * @param {string}   userName
 * @param {function} ask
 */
async function _createGitHubRepo(projectName, userName, ask) {
  console.log('Creating private GitHub repository...');
  while (true) {
    try {
      execSync(
        `gh repo create "${projectName}" --private --source=. --push`,
        { stdio: 'pipe' }
      );
      break;
    } catch (err) {
      const stderr = (err.stderr || '').toString();
      if (stderr.toLowerCase().includes('already exists')) {
        console.log('Repository already exists, continuing...');
        break;
      }
      console.error(`\nFailed to create GitHub repository: ${stderr.trim() || 'unknown error'}`);
      const answer = await ask('Would you like to retry? (y/n): ');
      if (answer.trim().toLowerCase() !== 'y') {
        console.error('\nCannot continue without a GitHub repository. Before re-running, check:');
        console.error('  • gh auth status  — ensure you are authenticated');
        console.error('  • The repository name is not already taken under a different account');
        console.error('  • You have permission to create repositories on this account');
        process.exit(1);
      }
    }
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
