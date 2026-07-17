/**
 * Terminal UI helpers — readline prompt and interactive arrow-key menu.
 */

import readline from 'readline';

export const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const isTTY = Boolean(process.stdout.isTTY);
const paint = (code, text) => isTTY ? `\x1b[${code}m${text}\x1b[0m` : text;

/** Clear only interactive terminals, preserving useful logs in pipes and CI. */
export function clear() {
  if (isTTY) process.stdout.write('\x1b[2J\x1b[3J\x1b[H');
}

/** Opening frame for a short, guided setup. */
export function wizardBanner(title, stages, minutes) {
  clear();
  console.log(`\n${paint('1;36', `  ${title}`)}`);
  console.log(`  ${paint('2', `${stages} stages · about ${minutes} minutes`)}`);
  console.log(`\n  ${paint('2', 'Answer a few questions and we will create the Ralph workflow in this folder.')}`);
  console.log(`  ${paint('2', 'You can stop at any time with Ctrl-C and run this command again later.')}`);
}

/** Print a compact, readable setup stage. Safe to use when output is piped. */
export function stage(current, total, title, minutesLeft, detail = '') {
  clear();
  const remaining = minutesLeft === 1 ? '1 min left' : `~${minutesLeft} min left`;
  console.log(`\n${paint('1;36', `  ▸ Stage ${current}/${total} · ${title}`)}  ${paint('2', `(${remaining})`)}`);
  if (detail) console.log(`  ${paint('2', detail)}`);
}

export function step(message) {
  console.log(`  ${paint('36', '•')} ${message}`);
}

export function note(message) {
  console.log(`  ${paint('2', message)}`);
}

export function success(message) {
  clear();
  console.log(`\n${paint('1;32', '  ✓ Setup complete')}`);
  console.log(`  ${message}`);
}

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
    const labels = options.map(option => typeof option === 'string' ? option : option.label);

    // Raw keypress handling only works in an interactive terminal. Keeping a
    // numbered fallback makes the CLI usable in CI, piped shells, and tests.
    if (!process.stdin.isTTY) {
      rl.close();
      console.log(labels.map((label, i) => `  ${i + 1}. ${label}`).join('\n'));
      resolve(0);
      return;
    }

    // Close readline — it holds stdin and blocks raw keypress events.
    rl.close();

    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.resume();

    function render() {
      labels.forEach((opt, i) => {
        const cursor = i === selected ? `${paint('36', '>')} ` : '  ';
        const label = i === selected ? paint('1;34', opt) : opt;
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
        process.stdout.write(`\x1b[${labels.length}B\n`);
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
