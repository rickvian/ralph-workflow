import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { writeDevContainer } from '../bin/lib/write-devcontainer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEST_DIR = path.join(__dirname, '../.test-write-devcontainer-vitest');

// Matches the slug logic in write-devcontainer.js _projectSlug()
// basename: ".test-write-devcontainer-vitest" → strip leading dot → replace non-alphanum runs with "-"
const TEST_SLUG = 'test-write-devcontainer-vitest';

const BASE_CONFIG = {
  name: 'Node.js',
  image: 'mcr.microsoft.com/devcontainers/javascript-node:24',
  postCreateCommand: 'npm install -g @anthropic-ai/claude-code',
  remoteEnv: { ANTHROPIC_API_KEY: '${localEnv:ANTHROPIC_API_KEY}' },
  customizations: { vscode: { extensions: ['dbaeumer.vscode-eslint'] } },
};

describe('writeDevContainer', () => {
  beforeEach(() => {
    if (fs.existsSync(TEST_DIR)) fs.rmSync(TEST_DIR, { recursive: true });
    fs.mkdirSync(TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(TEST_DIR)) fs.rmSync(TEST_DIR, { recursive: true });
  });

  function readGenerated() {
    return JSON.parse(
      fs.readFileSync(path.join(TEST_DIR, '.devcontainer', 'devcontainer.json'), 'utf-8')
    );
  }

  function readGeneratedScript(name) {
    return fs.readFileSync(path.join(TEST_DIR, '.devcontainer', name), 'utf-8');
  }

  it('adds project-scoped claude-agents-vol mount when cliName is claude', () => {
    const originalCwd = process.cwd();
    try {
      process.chdir(TEST_DIR);
      writeDevContainer(BASE_CONFIG, 'Node.js', false, null, false, 'claude');
      const config = readGenerated();
      const claudeMount = config.mounts?.find(m => m.source === `claude-agents-vol-${TEST_SLUG}`);
      expect(claudeMount).toBeDefined();
      expect(claudeMount.target).toBe('/home/node/.claude');
      expect(claudeMount.type).toBe('volume');
    } finally {
      process.chdir(originalCwd);
    }
  });

  it('does not add claude-agents-vol mount when cliName is not claude', () => {
    const originalCwd = process.cwd();
    try {
      process.chdir(TEST_DIR);
      writeDevContainer(BASE_CONFIG, 'Node.js', false, null, false, 'cursor');
      const config = readGenerated();
      const claudeMount = config.mounts?.find(m => m.source?.startsWith('claude-agents-vol'));
      expect(claudeMount).toBeUndefined();
    } finally {
      process.chdir(originalCwd);
    }
  });

  it('adds project-scoped gh-config volume and workspace-relative token mount when setupGitHub is true', () => {
    const originalCwd = process.cwd();
    try {
      process.chdir(TEST_DIR);

      writeDevContainer(BASE_CONFIG, 'Node.js', true, null, false, 'claude');
      const config = readGenerated();
      const ghMount = config.mounts?.find(m => m.source === `gh-config-${TEST_SLUG}`);
      expect(ghMount).toBeDefined();
      expect(ghMount.target).toBe('/home/node/.config/gh');
      expect(ghMount.type).toBe('volume');
    } finally {
      process.chdir(originalCwd);
    }
  });

  it('does not add gh-config volume mount when setupGitHub is false', () => {
    const originalCwd = process.cwd();
    try {
      process.chdir(TEST_DIR);
      writeDevContainer(BASE_CONFIG, 'Node.js', false, null, false, 'claude');
      const config = readGenerated();
      const ghMount = config.mounts?.find(m => m.source?.startsWith('gh-config'));
      expect(ghMount).toBeUndefined();
    } finally {
      process.chdir(originalCwd);
    }
  });

  it('includes both project-scoped gh-config and claude-agents-vol when GitHub + claude are selected', () => {
    const originalCwd = process.cwd();
    try {
      process.chdir(TEST_DIR);

      writeDevContainer(BASE_CONFIG, 'Node.js', true, null, false, 'claude');
      const config = readGenerated();
      const sources = config.mounts?.map(m => m.source) ?? [];
      expect(sources).toContain(`gh-config-${TEST_SLUG}`);
      expect(sources).toContain(`claude-agents-vol-${TEST_SLUG}`);
    } finally {
      process.chdir(originalCwd);
    }
  });

  it('sets postCreateCommand to the short script invocation', () => {
    const originalCwd = process.cwd();
    try {
      process.chdir(TEST_DIR);
      writeDevContainer(BASE_CONFIG, 'Node.js', false, null, false, 'claude');
      expect(readGenerated().postCreateCommand).toBe('bash .devcontainer/post-create.sh');
    } finally {
      process.chdir(originalCwd);
    }
  });

  it('always installs RTK and runs the claude-flavored init for claude', () => {
    const originalCwd = process.cwd();
    try {
      process.chdir(TEST_DIR);
      writeDevContainer(BASE_CONFIG, 'Node.js', false, null, false, 'claude');
      const script = readGeneratedScript('post-create.sh');
      expect(script).toContain('rtk-ai/rtk');
      expect(script).toMatch(/rtk init -g(?!\s--)/);
    } finally {
      process.chdir(originalCwd);
    }
  });

  it('uses the per-CLI rtk init flag for non-claude CLIs', () => {
    const originalCwd = process.cwd();
    try {
      process.chdir(TEST_DIR);
      writeDevContainer(BASE_CONFIG, 'Node.js', false, null, false, 'gemini');
      expect(readGeneratedScript('post-create.sh')).toContain('rtk init -g --gemini');
    } finally {
      process.chdir(originalCwd);
    }
  });

  it('appends caveman install only when opted in and cliName is claude', () => {
    const originalCwd = process.cwd();
    try {
      process.chdir(TEST_DIR);

      writeDevContainer(BASE_CONFIG, 'Node.js', false, null, false, 'claude', { caveman: true });
      expect(readGeneratedScript('post-create.sh')).toContain('claude plugin install caveman@caveman');

      writeDevContainer(BASE_CONFIG, 'Node.js', false, null, false, 'claude');
      expect(readGeneratedScript('post-create.sh')).not.toContain('caveman');

      writeDevContainer(BASE_CONFIG, 'Node.js', false, null, false, 'gemini', { caveman: true });
      expect(readGeneratedScript('post-create.sh')).not.toContain('caveman');
    } finally {
      process.chdir(originalCwd);
    }
  });

  it('appends subagents clone only when opted in and cliName is claude', () => {
    const originalCwd = process.cwd();
    try {
      process.chdir(TEST_DIR);

      writeDevContainer(BASE_CONFIG, 'Node.js', false, null, false, 'claude', { subagents: true });
      expect(readGeneratedScript('post-create.sh')).toContain('awesome-claude-code-subagents');

      writeDevContainer(BASE_CONFIG, 'Node.js', false, null, false, 'claude');
      expect(readGeneratedScript('post-create.sh')).not.toContain('awesome-claude-code-subagents');

      writeDevContainer(BASE_CONFIG, 'Node.js', false, null, false, 'gemini', { subagents: true });
      expect(readGeneratedScript('post-create.sh')).not.toContain('awesome-claude-code-subagents');
    } finally {
      process.chdir(originalCwd);
    }
  });

  it('writes remoteUser matching the template base image (Node.js → node)', () => {
    const originalCwd = process.cwd();
    try {
      process.chdir(TEST_DIR);
      writeDevContainer(BASE_CONFIG, 'Node.js', true, null, false, 'claude');
      expect(readGenerated().remoteUser).toBe('node');
    } finally {
      process.chdir(originalCwd);
    }
  });

  it('writes remoteUser=vscode for templates based on the python/base images', () => {
    const originalCwd = process.cwd();
    try {
      process.chdir(TEST_DIR);
      writeDevContainer(BASE_CONFIG, 'Python', false, null, false, 'claude');
      expect(readGenerated().remoteUser).toBe('vscode');
      writeDevContainer(BASE_CONFIG, 'Minimal Ubuntu', false, null, false, 'claude');
      expect(readGenerated().remoteUser).toBe('vscode');
    } finally {
      process.chdir(originalCwd);
    }
  });

  // Regression guard for the bug where ${containerEnv:HOME} was used as a
  // mount target — Docker rejects mount paths that aren't absolute, because
  // mounts are resolved before the container exists.
  it('always writes absolute mount targets (no unresolved variables)', () => {
    const originalCwd = process.cwd();
    try {
      process.chdir(TEST_DIR);
      for (const tpl of ['Node.js', 'Python', 'Python + Node', 'Minimal Ubuntu', 'Full Dev Environment']) {
        writeDevContainer(BASE_CONFIG, tpl, true, null, false, 'claude');
        const config = readGenerated();
        for (const m of config.mounts ?? []) {
          expect(m.target, `${tpl} mount ${m.source}`).toMatch(/^\//);
          expect(m.target, `${tpl} mount ${m.source}`).not.toContain('${');
        }
      }
    } finally {
      process.chdir(originalCwd);
    }
  });

  it('still writes credential.helper cleanup into post-create.sh when GitHub is enabled', () => {
    const originalCwd = process.cwd();
    try {
      process.chdir(TEST_DIR);
      writeDevContainer(BASE_CONFIG, 'Node.js', true, null, false, 'claude', { caveman: true });
      const script = readGeneratedScript('post-create.sh');
      expect(script).toContain('rtk init -g');
      expect(script).toContain('credential.helper');
      expect(script).toContain('caveman');
    } finally {
      process.chdir(originalCwd);
    }
  });

  it('creates post-start.sh and sets postStartCommand when GitHub is enabled', () => {
    const originalCwd = process.cwd();
    try {
      process.chdir(TEST_DIR);
      writeDevContainer(BASE_CONFIG, 'Node.js', true, null, false, 'claude');
      const config = readGenerated();
      expect(config.postStartCommand).toBe('bash .devcontainer/post-start.sh ${containerWorkspaceFolder}');
      const script = readGeneratedScript('post-start.sh');
      expect(script).toContain('gh auth login --with-token');
      expect(script).toContain('gh auth setup-git');
      expect(script).toContain('.ralph/token');
    } finally {
      process.chdir(originalCwd);
    }
  });

  it('does not create post-start.sh when GitHub is not enabled', () => {
    const originalCwd = process.cwd();
    try {
      process.chdir(TEST_DIR);
      writeDevContainer(BASE_CONFIG, 'Node.js', false, null, false, 'claude');
      expect(fs.existsSync(path.join(TEST_DIR, '.devcontainer', 'post-start.sh'))).toBe(false);
      expect(readGenerated().postStartCommand).toBeUndefined();
    } finally {
      process.chdir(originalCwd);
    }
  });
});
