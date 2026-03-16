/**
 * Map of supported AI coding CLIs to their invocation details.
 *
 * Each entry describes how ralph.sh should invoke that CLI:
 * - `cmd`: the shell command fragment that replaces the pipe line in ralph.sh
 * - `label`: human-readable name for menus/logs
 *
 * CLIs that read from stdin use a `cat prompt | cli` pattern.
 * CLIs that read from a file use their own flag to point at prompt.md.
 */

const CLI_MAP = {
  claude: {
    label: 'Claude Code',
    // --dangerously-skip-permissions: Bypasses all confirmation prompts for tool use.
    cmd: 'cat "$SCRIPT_DIR/prompt.md" \\\n    | claude --dangerously-skip-permissions 2>&1 \\\n    | tee /dev/stderr',
  },
  codex: {
    label: 'Codex CLI',
    // -y or --yes: Standard flag for many terminal wrappers to auto-accept changes.
    cmd: 'cat "$SCRIPT_DIR/prompt.md" \\\n    | codex --quiet --yes 2>&1 \\\n    | tee /dev/stderr',
  },
  gemini: {
    label: 'Gemini CLI',
    // --yolo: The specific Gemini CLI flag to bypass safety and execution confirmations.
    cmd: 'cat "$SCRIPT_DIR/prompt.md" \\\n    | gemini --yolo 2>&1 \\\n    | tee /dev/stderr',
  },
  opencode: {
    label: 'OpenCode',
    // --non-interactive: Prevents the CLI from opening a TTY for user input.
    cmd: 'cat "$SCRIPT_DIR/prompt.md" \\\n    | opencode --non-interactive 2>&1 \\\n    | tee /dev/stderr',
  },
};

export default CLI_MAP;
