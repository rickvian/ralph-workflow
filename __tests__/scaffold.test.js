import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const mockQuestion = vi.fn();
const mockClose = vi.fn();
vi.mock("readline", () => ({
  default: {
    createInterface: vi.fn(() => ({
      question: mockQuestion,
      close: mockClose,
    })),
  },
}));

import { scaffoldRalph } from "../bin/commands/scaffold.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import os from "os";
import CLI_MAP from "../bin/lib/cli-map.js";

const TEST_DIR = path.join(os.tmpdir(), ".test-scaffold-vitest");

describe("scaffoldRalph", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQuestion.mockImplementation((_prompt, cb) => cb("y"));
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

  it("should scaffold scripts directory with required files", async () => {
    const originalCwd = process.cwd();
    try {
      process.chdir(TEST_DIR);
      await scaffoldRalph("claude");

      const scriptsDir = path.join(TEST_DIR, "scripts");
      expect(fs.existsSync(scriptsDir)).toBe(true);

      const ralphDir = path.join(scriptsDir, "ralph");
      expect(fs.existsSync(ralphDir)).toBe(true);
    } finally {
      process.chdir(originalCwd);
    }
  });

  it("should create ralph.sh file", async () => {
    const originalCwd = process.cwd();
    try {
      process.chdir(TEST_DIR);
      await scaffoldRalph("claude");

      const ralphShPath = path.join(TEST_DIR, "scripts", "ralph", "ralph.sh");
      expect(fs.existsSync(ralphShPath)).toBe(true);
    } finally {
      process.chdir(originalCwd);
    }
  });

  it("should make ralph.sh executable with chmod 755", async () => {
    const originalCwd = process.cwd();
    try {
      process.chdir(TEST_DIR);
      await scaffoldRalph("claude");

      const ralphShPath = path.join(TEST_DIR, "scripts", "ralph", "ralph.sh");
      const stats = fs.statSync(ralphShPath);
      const mode = stats.mode & parseInt("777", 8);

      expect(mode & parseInt("111", 8)).not.toBe(0);
      expect(mode).toBe(parseInt("755", 8));
    } finally {
      process.chdir(originalCwd);
    }
  });

  it("should contain bash shebang in ralph.sh", async () => {
    const originalCwd = process.cwd();
    try {
      process.chdir(TEST_DIR);
      await scaffoldRalph("claude");

      const ralphShPath = path.join(TEST_DIR, "scripts", "ralph", "ralph.sh");
      const content = fs.readFileSync(ralphShPath, "utf-8");
      expect(content.startsWith("#!/bin/bash")).toBe(true);
    } finally {
      process.chdir(originalCwd);
    }
  });

  it("should overlay the selected CLI ralph.sh template", async () => {
    const originalCwd = process.cwd();
    try {
      process.chdir(TEST_DIR);
      await scaffoldRalph("codex");

      const ralphShPath = path.join(TEST_DIR, "scripts", "ralph", "ralph.sh");
      const promptPath = path.join(TEST_DIR, "scripts", "ralph", "prompt.md");
      const usageGuidePath = path.join(
        TEST_DIR,
        "scripts",
        "ralph",
        "ralph-usage-guide.md",
      );
      const content = fs.readFileSync(ralphShPath, "utf-8");
      const prompt = fs.readFileSync(promptPath, "utf-8");
      const usageGuide = fs.readFileSync(usageGuidePath, "utf-8");

      expect(content).toContain("MAX_ITERATIONS=${1:-10}");
      expect(content).toContain(
        "| codex exec --dangerously-bypass-approvals-and-sandbox - 2>&1) || CODEX_STATUS=$?",
      );
      expect(content).toContain('COMPLETION_TAG="<promise>COMPLETE</promise>"');
      expect(content).toContain(
        'grep -Eiq "usage limit|purchase more credits"',
      );
      expect(content).toContain('printf \'%s\\n\' "$OUTPUT"');
      expect(content).toContain('if [ "$LAST_LINE" = "$COMPLETION_TAG" ]; then');
      expect(content).toContain(
        'echo "❌ Codex usage limit reached; stopping Ralph"',
      );
      expect(content).not.toContain("AGENT_CMD=");
      expect(content).not.toContain("codex --quiet --yes");
      expect(content).not.toContain("tee /dev/stderr");
      expect(prompt).toContain("implementation files committed");
      expect(prompt).toContain(
        "Do not stage or commit `scripts/ralph/prd.yaml`",
      );
      expect(prompt).not.toContain(
        "stage implementation files + prd.yaml + progress.txt",
      );
      expect(usageGuide).toContain("prompts Codex");
      expect(usageGuide).toContain(
        "Codex template uses this runner pattern",
      );
    } finally {
      process.chdir(originalCwd);
    }
  });

  it("should keep non-Codex CLI scripts as predefined templates", async () => {
    const originalCwd = process.cwd();
    try {
      process.chdir(TEST_DIR);
      await scaffoldRalph("gemini");

      const ralphShPath = path.join(TEST_DIR, "scripts", "ralph", "ralph.sh");
      const content = fs.readFileSync(ralphShPath, "utf-8");

      expect(content).toContain("gemini --yolo");
      expect(content).toContain("tee /dev/stderr");
      expect(content).not.toContain("AGENT_CMD=");
    } finally {
      process.chdir(originalCwd);
    }
  });

  it("should have ralph.sh, prompt.md, and usage guide templates for every supported CLI", () => {
    const rootDir = path.resolve(__dirname, "..");

    for (const cliName of Object.keys(CLI_MAP)) {
      const templateDir = path.join(
        rootDir,
        "templates",
        "cli",
        cliName,
        "scripts",
        "ralph",
      );
      const ralphShPath = path.join(templateDir, "ralph.sh");
      const promptPath = path.join(templateDir, "prompt.md");
      const usageGuidePath = path.join(templateDir, "ralph-usage-guide.md");

      expect(fs.existsSync(ralphShPath)).toBe(true);
      expect(fs.existsSync(promptPath)).toBe(true);
      expect(fs.existsSync(usageGuidePath)).toBe(true);
    }
  });

  it("should document the exact ralph.sh template in each CLI usage guide", () => {
    const rootDir = path.resolve(__dirname, "..");

    for (const cliName of Object.keys(CLI_MAP)) {
      const templateDir = path.join(
        rootDir,
        "templates",
        "cli",
        cliName,
        "scripts",
        "ralph",
      );
      const ralphSh = fs
        .readFileSync(path.join(templateDir, "ralph.sh"), "utf-8")
        .trim();
      const usageGuide = fs.readFileSync(
        path.join(templateDir, "ralph-usage-guide.md"),
        "utf-8",
      );
      const bashBlock = usageGuide.match(/```bash\n([\s\S]*?)\n```/);

      expect(
        bashBlock,
        cliName + " usage guide should include a bash block",
      ).not.toBeNull();
      expect(bashBlock[1].trim()).toBe(ralphSh);
    }
  });

  it("should create .raplh-workflow-version file with package version", async () => {
    const originalCwd = process.cwd();
    try {
      process.chdir(TEST_DIR);
      await scaffoldRalph("claude");

      const versionFilePath = path.join(
        TEST_DIR,
        "scripts",
        "ralph",
        ".raplh-workflow-version",
      );
      expect(fs.existsSync(versionFilePath)).toBe(true);

      const content = fs.readFileSync(versionFilePath, "utf-8").trim();
      expect(content).toMatch(/^ralph-workflow@\d+\.\d+\.\d+$/);
    } finally {
      process.chdir(originalCwd);
    }
  });

  it("should warn and prompt when scripts/ already exists, then overwrite on confirm", async () => {
    mockQuestion.mockImplementation((_prompt, cb) => cb("y"));
    const originalCwd = process.cwd();
    try {
      process.chdir(TEST_DIR);
      fs.mkdirSync(path.join(TEST_DIR, "scripts"), { recursive: true });
      await scaffoldRalph("claude");

      expect(mockQuestion).toHaveBeenCalledWith(
        expect.stringContaining("Proceed and overwrite?"),
        expect.any(Function),
      );
      expect(
        fs.existsSync(path.join(TEST_DIR, "scripts", "ralph", "ralph.sh")),
      ).toBe(true);
    } finally {
      process.chdir(originalCwd);
    }
  });

  it("should abort scaffold when user declines overwrite prompt", async () => {
    mockQuestion.mockImplementation((_prompt, cb) => cb("n"));
    const originalCwd = process.cwd();
    try {
      process.chdir(TEST_DIR);
      fs.mkdirSync(path.join(TEST_DIR, "scripts", "ralph"), {
        recursive: true,
      });
      const sentinelPath = path.join(TEST_DIR, "scripts", "ralph", "custom.sh");
      fs.writeFileSync(sentinelPath, "# custom");

      await scaffoldRalph("claude");

      expect(fs.existsSync(sentinelPath)).toBe(true);
      expect(
        fs.existsSync(path.join(TEST_DIR, "scripts", "ralph", "ralph.sh")),
      ).toBe(false);
    } finally {
      process.chdir(originalCwd);
    }
  });
});
