/**
 * Terminal UI helpers — readline prompt and interactive arrow-key menu.
 */

import readline from 'readline';

export const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

/**
 * Prompt the user for a single line of input.
 * @param {string} question - Text displayed before the cursor.
 * @returns {Promise<string>}
 */
export function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

/**
 * Display an interactive arrow-key menu and resolve with the chosen index.
 * Closes the shared `rl` interface before taking over stdin raw mode,
 * then restores normal stdin state when the user presses Enter.
 * @param {string[]} options - Menu items to display.
 * @returns {Promise<number>} Zero-based index of the selected option.
 */
export function selectMenu(options) {
  return new Promise((resolve) => {
    let selected = 0;

    // Close readline — it holds stdin and blocks raw keypress events.
    rl.close();

    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.resume();

    function render() {
      options.forEach((opt, i) => {
        const cursor = i === selected ? '\x1b[36m>\x1b[0m ' : '  ';
        const label = i === selected ? `\x1b[1;34m${opt}\x1b[0m` : opt;
        process.stdout.write(`\r${cursor}${label}\x1b[K\n`);
      });
      process.stdout.write(`\x1b[${options.length}A`);
    }

    render();

    function onKeypress(str, key) {
      if (!key) return;

      if (key.name === 'up') {
        selected = (selected - 1 + options.length) % options.length;
        render();
      } else if (key.name === 'down') {
        selected = (selected + 1) % options.length;
        render();
      } else if (key.name === 'return') {
        process.stdin.removeListener('keypress', onKeypress);
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdout.write(`\x1b[${options.length}B\n`);
        resolve(selected);
      } else if (key.ctrl && key.name === 'c') {
        process.stdin.setRawMode(false);
        process.stdout.write('\n');
        process.exit(0);
      }
    }

    process.stdin.on('keypress', onKeypress);
  });
}
