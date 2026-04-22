import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const mockQuestion = vi.fn();
const mockClose = vi.fn();
vi.mock('readline', () => ({
  default: {
    createInterface: vi.fn(() => ({
      question: mockQuestion,
      close: mockClose,
    })),
  },
}));

import { scaffoldRalph } from '../bin/commands/scaffold.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import os from 'os';

const TEST_DIR = path.join(os.tmpdir(), '.test-scaffold-vitest');

describe('scaffoldRalph', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQuestion.mockImplementation((_prompt, cb) => cb('y'));
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true });
    }
    fs.mkdirSync(TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true });
    }
  });

  it('should scaffold scripts directory with required files', async () => {
    const originalCwd = process.cwd();
    try {
      process.chdir(TEST_DIR);
      await scaffoldRalph('claude');

      const scriptsDir = path.join(TEST_DIR, 'scripts');
      expect(fs.existsSync(scriptsDir)).toBe(true);

      const ralphDir = path.join(scriptsDir, 'ralph');
      expect(fs.existsSync(ralphDir)).toBe(true);
    } finally {
      process.chdir(originalCwd);
    }
  });

  it('should create ralph.sh file', async () => {
    const originalCwd = process.cwd();
    try {
      process.chdir(TEST_DIR);
      await scaffoldRalph('claude');

      const ralphShPath = path.join(TEST_DIR, 'scripts', 'ralph', 'ralph.sh');
      expect(fs.existsSync(ralphShPath)).toBe(true);
    } finally {
      process.chdir(originalCwd);
    }
  });

  it('should make ralph.sh executable with chmod 755', async () => {
    const originalCwd = process.cwd();
    try {
      process.chdir(TEST_DIR);
      await scaffoldRalph('claude');

      const ralphShPath = path.join(TEST_DIR, 'scripts', 'ralph', 'ralph.sh');
      const stats = fs.statSync(ralphShPath);
      const mode = stats.mode & parseInt('777', 8);

      expect((mode & parseInt('111', 8))).not.toBe(0);
      expect(mode).toBe(parseInt('755', 8));
    } finally {
      process.chdir(originalCwd);
    }
  });

  it('should contain bash shebang in ralph.sh', async () => {
    const originalCwd = process.cwd();
    try {
      process.chdir(TEST_DIR);
      await scaffoldRalph('claude');

      const ralphShPath = path.join(TEST_DIR, 'scripts', 'ralph', 'ralph.sh');
      const content = fs.readFileSync(ralphShPath, 'utf-8');
      expect(content.startsWith('#!/bin/bash')).toBe(true);
    } finally {
      process.chdir(originalCwd);
    }
  });

  it('should warn and prompt when scripts/ already exists, then overwrite on confirm', async () => {
    mockQuestion.mockImplementation((_prompt, cb) => cb('y'));
    const originalCwd = process.cwd();
    try {
      process.chdir(TEST_DIR);
      fs.mkdirSync(path.join(TEST_DIR, 'scripts'), { recursive: true });
      await scaffoldRalph('claude');

      expect(mockQuestion).toHaveBeenCalledWith(expect.stringContaining('Proceed and overwrite?'), expect.any(Function));
      expect(fs.existsSync(path.join(TEST_DIR, 'scripts', 'ralph', 'ralph.sh'))).toBe(true);
    } finally {
      process.chdir(originalCwd);
    }
  });

  it('should abort scaffold when user declines overwrite prompt', async () => {
    mockQuestion.mockImplementation((_prompt, cb) => cb('n'));
    const originalCwd = process.cwd();
    try {
      process.chdir(TEST_DIR);
      fs.mkdirSync(path.join(TEST_DIR, 'scripts', 'ralph'), { recursive: true });
      const sentinelPath = path.join(TEST_DIR, 'scripts', 'ralph', 'custom.sh');
      fs.writeFileSync(sentinelPath, '# custom');

      await scaffoldRalph('claude');

      expect(fs.existsSync(sentinelPath)).toBe(true);
      expect(fs.existsSync(path.join(TEST_DIR, 'scripts', 'ralph', 'ralph.sh'))).toBe(false);
    } finally {
      process.chdir(originalCwd);
    }
  });
});
