import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { scaffoldRalph } from '../bin/commands/scaffold.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEST_DIR = path.join(__dirname, '../.test-scaffold-vitest');

describe('scaffoldRalph', () => {
  beforeEach(() => {
    // Clean up any previous test
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true });
    }
    // Create test directory
    fs.mkdirSync(TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true });
    }
  });

  it('should scaffold scripts directory with required files', () => {
    const originalCwd = process.cwd();
    try {
      process.chdir(TEST_DIR);
      scaffoldRalph('claude');

      const scriptsDir = path.join(TEST_DIR, 'scripts');
      expect(fs.existsSync(scriptsDir)).toBe(true);

      const ralphDir = path.join(scriptsDir, 'ralph');
      expect(fs.existsSync(ralphDir)).toBe(true);
    } finally {
      process.chdir(originalCwd);
    }
  });

  it('should create ralph.sh file', () => {
    const originalCwd = process.cwd();
    try {
      process.chdir(TEST_DIR);
      scaffoldRalph('claude');

      const ralphShPath = path.join(TEST_DIR, 'scripts', 'ralph', 'ralph.sh');
      expect(fs.existsSync(ralphShPath)).toBe(true);
    } finally {
      process.chdir(originalCwd);
    }
  });

  it('should make ralph.sh executable with chmod 755', () => {
    const originalCwd = process.cwd();
    try {
      process.chdir(TEST_DIR);
      scaffoldRalph('claude');

      const ralphShPath = path.join(TEST_DIR, 'scripts', 'ralph', 'ralph.sh');
      const stats = fs.statSync(ralphShPath);
      const mode = stats.mode & parseInt('777', 8);

      // Check that execute bits are set for owner, group, and others
      expect((mode & parseInt('111', 8))).not.toBe(0);
      // Check exact permissions are 755
      expect(mode).toBe(parseInt('755', 8));
    } finally {
      process.chdir(originalCwd);
    }
  });

  it('should contain bash shebang in ralph.sh', () => {
    const originalCwd = process.cwd();
    try {
      process.chdir(TEST_DIR);
      scaffoldRalph('claude');

      const ralphShPath = path.join(TEST_DIR, 'scripts', 'ralph', 'ralph.sh');
      const content = fs.readFileSync(ralphShPath, 'utf-8');
      expect(content.startsWith('#!/bin/bash')).toBe(true);
    } finally {
      process.chdir(originalCwd);
    }
  });
});
