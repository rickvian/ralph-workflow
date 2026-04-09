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
 * Build and write `.devcontainer/devcontainer.json`.
 *
 * @param {object}  config        - Base devcontainer config from a template.
 * @param {string}  templateName  - Human-readable template name for log output.
 * @param {boolean} setupGitHub   - Whether to mount a PAT token and configure gh CLI.
 * @param {string|null} tokenPath - Absolute path to the stored PAT token file.
 * @param {string}      cliName   - The AI CLI selected by the user (e.g. 'claude').
 */
export function writeDevContainer(config, templateName, setupGitHub = false, tokenPath = null, _debug = false, cliName = 'claude') {
  const devcontainerDir = path.resolve(process.cwd(), '.devcontainer');
  const devcontainerFile = path.join(devcontainerDir, 'devcontainer.json');

  if (!fs.existsSync(devcontainerDir)) {
    fs.mkdirSync(devcontainerDir, { recursive: true });
  }

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
    // this help persist claude configuration e.g agents installations
    finalConfig.mounts = [
      ...(finalConfig.mounts || []),
      { source: 'claude-agents-vol', target: '/home/vscode/.claude', type: 'volume' },
    ];
  }

  if (setupGitHub && tokenPath) {
    finalConfig.features = {
      ...finalConfig.features,
      'ghcr.io/devcontainers/features/github-cli:1': {},
    };

    finalConfig.mounts = [
      ...(finalConfig.mounts || []),
      { source: tokenPath, target: '/tmp/ralph_token', type: 'bind' },
    ];

    const existingCommand = finalConfig.postCreateCommand || '';
    const cleanupCommand = 'git config --global --unset-all credential.helper || true';
    finalConfig.postCreateCommand = existingCommand
      ? `${existingCommand} && ${cleanupCommand}`
      : cleanupCommand;

    finalConfig.postStartCommand =
      'unset VSCODE_GIT_IPC_HANDLE GIT_ASKPASS VSCODE_GIT_ASKPASS_NODE VSCODE_GIT_ASKPASS_MAIN' +
      ' && git config --global --unset-all credential.helper || true' +
      ' && gh auth login --with-token < /tmp/ralph_token && gh auth setup-git';
  } else {
    finalConfig.postCreateCommand = finalConfig.postCreateCommand || '';
  }

  fs.writeFileSync(devcontainerFile, JSON.stringify(finalConfig, null, 2));

  _printSummary(templateName, setupGitHub);
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
