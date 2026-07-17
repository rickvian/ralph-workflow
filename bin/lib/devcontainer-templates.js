/**
 * Dev Container template definitions.
 *
 * Each template provides a base `config` object that is later merged with
 * isolation settings in `write-devcontainer.js`.
 */

const claudeInstall = 'npm install -g @anthropic-ai/claude-code';
const remoteEnv = { ANTHROPIC_API_KEY: '${localEnv:ANTHROPIC_API_KEY}' };

/** @typedef {{ name: string, label: string, description: string, config: object }} Template */

/** @type {Template[]} */
export const TEMPLATES = [
  {
    name: 'Node.js',
    label: 'Node.js',
    description: 'Node.js projects with ESLint',
    config: {
      name: 'Node.js',
      image: 'mcr.microsoft.com/devcontainers/javascript-node:24',
      postCreateCommand: claudeInstall,
      remoteEnv,
      customizations: { vscode: { extensions: ['dbaeumer.vscode-eslint'] } },
    },
  },
  {
    name: 'Python',
    label: 'Python',
    description: 'Python projects with Node available for AI tooling',
    config: {
      name: 'Python',
      image: 'mcr.microsoft.com/devcontainers/python:3.11',
      features: { 'ghcr.io/devcontainers/features/node:1': {} },
      postCreateCommand: claudeInstall,
      remoteEnv,
      customizations: { vscode: { extensions: ['ms-python.python'] } },
    },
  },
  {
    name: 'Python + Node',
    label: 'Python + Node',
    description: 'General automation and full-stack work',
    config: {
      name: 'Python + Node',
      image: 'mcr.microsoft.com/devcontainers/python:3.11',
      features: { 'ghcr.io/devcontainers/features/node:1': {} },
      postCreateCommand: claudeInstall,
      remoteEnv,
      customizations: { vscode: { extensions: ['ms-python.python', 'dbaeumer.vscode-eslint'] } },
    },
  },
  {
    name: 'Minimal Ubuntu',
    label: 'Minimal Ubuntu',
    description: 'The lightest footprint',
    config: {
      name: 'Minimal Ubuntu',
      image: 'mcr.microsoft.com/devcontainers/base:ubuntu',
      features: { 'ghcr.io/devcontainers/features/node:1': {} },
      postCreateCommand: claudeInstall,
      remoteEnv,
    },
  },
  {
    name: 'Full Dev Environment',
    label: 'Full Dev Environment',
    description: 'Node, Python, Git, and common VS Code extensions',
    config: {
      name: 'Full Dev Environment',
      image: 'mcr.microsoft.com/devcontainers/base:ubuntu',
      features: {
        'ghcr.io/devcontainers/features/node:1': {},
        'ghcr.io/devcontainers/features/python:1': {},
        'ghcr.io/devcontainers/features/git:1': {},
      },
      postCreateCommand: claudeInstall,
      remoteEnv,
      customizations: { vscode: { extensions: ['ms-python.python', 'dbaeumer.vscode-eslint'] } },
    },
  },
];
