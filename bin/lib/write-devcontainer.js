/**
 * Writes `.devcontainer/devcontainer.json` for the current project.
 *
 * Always applies credential-isolation settings (blanks out VS Code git
 * forwarding env vars and disables git auth helpers). When GitHub setup is
 * requested, also mounts the scoped PAT token and configures `gh auth`.
 */

import fs from 'fs';
import path from 'path';

/**
 * RTK install script (universal Linux/macOS). Idempotent — re-running
 * upgrades RTK in place.
 */
// Pinned to v0.37.2 (80a6fe606f73b19e52b0b330d242e62a6c07be42) to prevent supply-chain risk from a mutable branch ref.
const RTK_INSTALL = 'curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/80a6fe606f73b19e52b0b330d242e62a6c07be42/install.sh | sh';

/**
 * Per-CLI `rtk init` invocation. RTK is universal but the init flag
 * selects which tool's config it rewrites.
 */
const RTK_INIT_BY_CLI = {
  claude: 'rtk init -g',
  codex: 'rtk init -g --codex',
  gemini: 'rtk init -g --gemini',
  opencode: 'rtk init -g --opencode',
};

/**
 * Caveman install command (Claude Code only). Guarded so the plugin
 * marketplace registration and install are skipped when the `.claude`
 * volume already contains the plugin from a prior build.
 */
const CAVEMAN_INSTALL_CLAUDE =
  '[ -d "$HOME/.claude/plugins/caveman" ] || (claude plugin marketplace add JuliusBrussee/caveman && claude plugin install caveman@caveman)';

/**
 * Shallow-clones the VoltAgent awesome-claude-code-subagents list into
 * the project-scoped `.claude/agents` volume. Guarded so a second
 * container build doesn't re-clone into an already-populated directory
 * and break the `&&` chain.
 */
const SUBAGENTS_CLONE =
  '[ -d "$HOME/.claude/agents/awesome-subagents" ] || (mkdir -p "$HOME/.claude/agents" && git clone --depth=1 https://github.com/VoltAgent/awesome-claude-code-subagents "$HOME/.claude/agents/awesome-subagents")';

/**
 * VS Code settings that prevent the host's git credentials from being
 * forwarded into the container.
 */
const ISOLATION_VSCODE_SETTINGS = {
  'git.terminalAuthentication': false,
  'github.gitAuthentication': false,
  'dev.containers.copyGitConfig': false,
  'dev.containers.gitCredentialHelperConfigLocation': 'none',
};

/**
 * Container environment overrides that blank out VS Code credential-
 * forwarding variables injected automatically at container start.
 */
const ISOLATION_ENV = {
  SSH_AUTH_SOCK: '',
  GIT_ASKPASS: '',
  VSCODE_GIT_ASKPASS_NODE: '',
  VSCODE_GIT_ASKPASS_MAIN: '',
  VSCODE_GIT_IPC_HANDLE: '',
  GITHUB_TOKEN: '',
  GH_TOKEN: '',
  GCM_INTERACTIVE: 'never',
  GIT_TERMINAL_PROMPT: '0',
};

/**
 * Derive a Docker-safe slug from the current project directory name.
 * Used to scope named volumes per project so multiple ralph projects
 * can coexist without overwriting each other's gh / claude state.
 *
 * @returns {string} e.g. "my-project"
 */
function _projectSlug() {
  return path.basename(process.cwd())
    .toLowerCase()
    .replace(/^\.+/, '')            // strip leading dots
    .replace(/[^a-z0-9]+/g, '-')   // non-alphanumeric runs → single dash
    .replace(/^-+|-+$/g, '');      // trim edge dashes
}

/**
 * Build and write `.devcontainer/devcontainer.json`.
 *
 * @param {object}  config           - Base devcontainer config from a template.
 * @param {string}  templateName     - Human-readable template name for log output.
 * @param {boolean} setupGitHub      - Whether to mount a PAT token and configure gh CLI.
 * @param {string|null} _tokenPath   - Unused; kept for backward compatibility.
 * @param {string}  cliName          - The AI CLI selected by the user (e.g. 'claude').
 * @param {object}  [tools]          - Optional tool opt-ins.
 * @param {boolean} [tools.caveman]  - Install the Caveman debugging plugin.
 * @param {boolean} [tools.subagents] - Clone the awesome-claude-code-subagents list.
 */
export function writeDevContainer(config, templateName, setupGitHub = false, _tokenPath = null, _debug = false, cliName = 'claude', tools = {}) {
  const devcontainerDir = path.resolve(process.cwd(), '.devcontainer');
  const devcontainerFile = path.join(devcontainerDir, 'devcontainer.json');

  if (!fs.existsSync(devcontainerDir)) {
    fs.mkdirSync(devcontainerDir, { recursive: true });
  }

  const slug = _projectSlug();
  const tokenExists = fs.existsSync(path.join(process.cwd(), '.ralph', 'token'));
  // Mount and configure gh auth whenever a token is present, even if the user
  // skipped the GitHub setup step on a subsequent run.
  const useGitHub = setupGitHub || tokenExists;

  const finalConfig = {
    ...config,
    customizations: {
      ...config.customizations,
      vscode: {
        ...config.customizations?.vscode,
        settings: {
          ...config.customizations?.vscode?.settings,
          ...ISOLATION_VSCODE_SETTINGS,
        },
      },
    },
    containerEnv: {
      ...config.containerEnv,
      ...ISOLATION_ENV,
    },
  };

  if (cliName === 'claude') {
    // Persist claude configuration (e.g. agent installations) in a project-scoped
    // volume so switching between ralph projects doesn't clobber each other's state.
    finalConfig.mounts = [
      ...(finalConfig.mounts || []),
      { source: `claude-agents-vol-${slug}`, target: '${containerEnv:HOME}/.claude', type: 'volume' },
    ];
  }

  if (useGitHub) {
    finalConfig.features = {
      ...finalConfig.features,
      'ghcr.io/devcontainers/features/github-cli:1': {},
    };

    // Use ${localWorkspaceFolder} so the token path is resolved by the devcontainer
    // runtime — works on macOS, Linux, and Windows without any OS-specific logic.
    // The project-scoped volume name prevents cross-project gh auth collisions.
    finalConfig.mounts = [
      ...(finalConfig.mounts || []),
      { source: `gh-config-${slug}`, target: '${containerEnv:HOME}/.config/gh', type: 'volume' },
    ];

    finalConfig.postStartCommand =
      'unset VSCODE_GIT_IPC_HANDLE GIT_ASKPASS VSCODE_GIT_ASKPASS_NODE VSCODE_GIT_ASKPASS_MAIN' +
      ' && git config --global --unset-all credential.helper || true' +
      ' && gh auth login --with-token < ${containerWorkspaceFolder}/.ralph/token && gh auth setup-git';
  }

  const additions = [
    RTK_INSTALL,
    RTK_INIT_BY_CLI[cliName] ?? RTK_INIT_BY_CLI.claude,
  ];
  if (tools.caveman && cliName === 'claude') additions.push(CAVEMAN_INSTALL_CLAUDE);
  if (tools.subagents && cliName === 'claude') additions.push(SUBAGENTS_CLONE);
  if (useGitHub) additions.push('git config --global --unset-all credential.helper || true');

  const existingCommand = finalConfig.postCreateCommand || '';
  finalConfig.postCreateCommand = [existingCommand, ...additions].filter(Boolean).join(' && ');

  fs.writeFileSync(devcontainerFile, JSON.stringify(finalConfig, null, 2));

  _printSummary(templateName, useGitHub);
}

/** @param {string} templateName @param {boolean} setupGitHub */
function _printSummary(templateName, setupGitHub) {
  console.log(`\nDev Container configured with "${templateName}" template.`);
  console.log('   Created: .devcontainer/devcontainer.json');
  console.log('   Isolation enabled: Git credentials are NOT forwarded from host.');
  if (setupGitHub) {
    console.log('   GitHub PAT token will be isolated to this repository only.');
  }
  console.log('\nNext steps:');
  console.log('  1. Open this folder in VS Code');
  console.log('  2. Install the "Dev Containers" extension if not already installed');
  console.log('  3. Click "Reopen in Container" when prompted');
  console.log('     (or use Cmd+Shift+P > "Dev Containers: Reopen in Container")');
  console.log('  4. Run ralph inside the container for a safe, isolated environment\n');
}
