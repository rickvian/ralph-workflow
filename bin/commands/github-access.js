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
import { execSync } from 'child_process';
import { confirm, info, note, password, spinner } from '../lib/ui.js';

/**
 * Git repository, GitHub repo creation, and PAT token setup flow.
 * Devcontainer writing is handled by the caller.
 */
export async function setupGitHubAccess() {
  const projectName = path.basename(process.cwd());
  info(`Setting up GitHub isolation for ${projectName}`);

  _ensureGitRepo();
  _ensureInitialCommit(projectName);

  const userName = await _getGitHubUsername();

  note('A private GitHub repository will be created automatically with the gh CLI.', 'GitHub repository');
  await _createGitHubRepo(projectName, userName);

  const token = await _promptForPAT(projectName, userName);

  _storeToken(token);
}

/** Initialise a git repo in cwd if one does not already exist. */
function _ensureGitRepo() {
  try {
    execSync('git rev-parse --git-dir', { stdio: 'pipe' });
  } catch {
    info('Initializing git repository');
    execSync('git init -b main 2>/dev/null || git init 2>/dev/null', { stdio: 'inherit' });
  }
}

/**
 * Ensure the repo has at least one commit so `gh repo create --push` succeeds.
 *
 * `gh repo create --source=. --push` refuses to run when the local repo has
 * zero commits ("--push enabled but no commits found"). On a fresh `npx
 * ralph-workflow` run against an empty directory, the working tree may be
 * empty or only contain unstaged files, so we create a README placeholder
 * if needed and create an initial commit.
 *
 * @param {string} projectName
 */
function _ensureInitialCommit(projectName) {
  try {
    execSync('git rev-parse HEAD', { stdio: 'pipe' });
    return; // at least one commit already exists
  } catch {
    // no commits yet — fall through
  }

  const readmePath = path.join(process.cwd(), 'README.md');
  if (!fs.existsSync(readmePath)) {
    const hasAnyTrackable = execSync('git status --porcelain', { encoding: 'utf8' }).trim().length > 0;
    if (!hasAnyTrackable) {
      fs.writeFileSync(readmePath, `# ${projectName}\n`);
    }
  }

  info('Creating an initial commit so the new repository has something to push');
  execSync('git add -A', { stdio: 'inherit' });
  execSync('git commit -m "chore: initial commit"', { stdio: 'inherit' });
}

/**
 * Resolve the authenticated GitHub username via the gh CLI.
 * Retries on failure until the user succeeds or declines.
 * @returns {Promise<string>}
 */
async function _getGitHubUsername() {
  while (true) {
    try {
      return execSync('gh api user -q .login', { encoding: 'utf8', stdio: 'pipe' }).trim();
    } catch (err) {
      const stderr = (err.stderr || '').toString().trim();
      note(`Failed to reach GitHub: ${stderr || 'unknown error'}\n\nRun \`gh auth login\`, then try again.`, 'GitHub needs attention');
      if (!await confirm('Retry GitHub connection?', false)) {
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
 */
async function _createGitHubRepo(projectName, userName) {
  const progress = spinner();
  progress.start('Creating private GitHub repository');
  while (true) {
    try {
      execSync(
        `gh repo create "${projectName}" --private --source=. --push`,
        { stdio: 'pipe' }
      );
      progress.stop('Private GitHub repository created');
      break;
    } catch (err) {
      const stderr = (err.stderr || '').toString();
      if (stderr.toLowerCase().includes('already exists')) {
        progress.stop('Private GitHub repository already exists');
        break;
      }
      progress.stop('Could not create GitHub repository');
      note(stderr.trim() || 'Unknown error', 'GitHub repository error');
      if (!await confirm('Retry repository creation?', false)) {
        console.error('\nCannot continue without a GitHub repository. Before re-running, check:');
        console.error('  • gh auth status  — ensure you are authenticated');
        console.error('  • The repository name is not already taken under a different account');
        console.error('  • You have permission to create repositories on this account');
        process.exit(1);
      }
      progress.start('Creating private GitHub repository');
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
 * @param {string}   projectName
 * @param {string}   userName
 * @returns {Promise<string>} The raw token string.
 */
async function _promptForPAT(projectName, userName) {
  const patUrl =
    `https://github.com/settings/personal-access-tokens/new` +
    `?name=Ralph-${projectName}&target_name=${userName}&expires_in=1` +
    `&contents=write&pull_requests=write&issues=write&notifications=read&metadata=read`;

  note(
    `Under “Repository access”, choose “Only select repositories”, then select ${projectName}. Set an expiration, generate the token, and paste it below.`,
    "Create Ralph's GitHub token"
  );
  // Do not put this URL inside p.note(): its box renderer hard-wraps long
  // lines, which makes the query string awkward to copy from the terminal.
  console.log(`\n${patUrl}\n`);

  const token = await password('Paste the GitHub token');

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

  info(`GitHub token stored at ${tokenPath}`);
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
