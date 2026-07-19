/**
 * Map of supported AI coding CLIs.
 *
 * Each key must have a matching template directory at templates/cli/<key>/.
 */

const CLI_MAP = {
  claude: {
    label: 'Claude Code',
  },
  codex: {
    label: 'Codex CLI',
  },
  gemini: {
    label: 'Gemini CLI',
  },
  opencode: {
    label: 'OpenCode',
  },
};

export default CLI_MAP;
