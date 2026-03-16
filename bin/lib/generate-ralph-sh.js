/**
 * Generates a clean ralph.sh script for a given CLI.
 *
 * The output is always a simple, readable bash script — no case statements
 * or branching logic. Just the loop with the selected CLI's command.
 */

import fs from 'fs';
import CLI_MAP from './cli-map.js';

/**
 * Generate ralph.sh content for the given CLI key.
 * @param {string} cliName - Key from CLI_MAP (e.g. 'claude', 'aider')
 * @returns {string} Complete ralph.sh file content
 */
export function generateRalphSh(cliName) {
  const cli = CLI_MAP[cliName];
  if (!cli) {
    const supported = Object.keys(CLI_MAP).join(', ');
    throw new Error('Unknown CLI "' + cliName + '". Supported: ' + supported);
  }

  const lines = [
    '#!/bin/bash',
    'set -e',
    '',
    'MAX_ITERATIONS=${1:-10}',
    'SCRIPT_DIR="$(cd "$(dirname \\',
    '  "${BASH_SOURCE[0]}")" && pwd)"',
    '',
    'echo "🚀 Starting Ralph"',
    '',
    'for i in $(seq 1 $MAX_ITERATIONS); do',
    '  echo "═══ Iteration $i ═══"',
    '',
    '  OUTPUT=$(' + cli.cmd + ') || true',
    '',
    '  if echo "$OUTPUT" | \\',
    '    grep -q "<promise>COMPLETE</promise>"',
    '  then',
    '    echo "✅ Done!"',
    '    exit 0',
    '  fi',
    '',
    '  sleep 2',
    'done',
    '',
    'echo "⚠️ Max iterations reached"',
    'exit 1',
    '',
  ];

  return lines.join('\n');
}

/**
 * Write ralph.sh to disk for the given CLI.
 * @param {string} targetPath - Absolute path to write ralph.sh
 * @param {string} cliName - Key from CLI_MAP
 */
export function writeRalphSh(targetPath, cliName) {
  fs.writeFileSync(targetPath, generateRalphSh(cliName), 'utf-8');
  try {
    fs.chmodSync(targetPath, '755');
  } catch {
    console.warn('Warning: Could not make ' + targetPath + ' executable.');
  }
}
