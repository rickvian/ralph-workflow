/**
 * Shared interactive UI, powered by Clack.
 *
 * Clack gives every prompt the connected timeline, coloured status glyphs,
 * cancellation handling, and accessible non-TTY fallback used by skills.sh.
 */

import * as p from '@clack/prompts';

const isTTY = Boolean(process.stdout.isTTY);
const paint = (code, text) => isTTY ? `\x1b[${code}m${text}\x1b[0m` : text;

const RALPH_WORDMARK = [
  '██████╗  █████╗ ██╗     ██████╗ ██╗  ██╗',
  '██╔══██╗██╔══██╗██║     ██╔══██╗██║  ██║',
  '██████╔╝███████║██║     ██████╔╝███████║',
  '██╔══██╗██╔══██║██║     ██╔═══╝ ██╔══██║',
  '██║  ██║██║  ██║███████╗██║     ██║  ██║',
  '╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝  ╚═╝',
].join('\n');

function unwrap(value) {
  if (p.isCancel(value)) {
    p.cancel('Setup cancelled. No files were changed.');
    process.exit(0);
  }
  return value;
}

export function intro(version) {
  console.log('');
  console.log(paint('38;5;141', RALPH_WORDMARK));
  console.log('');
  p.intro(paint('48;5;135;38;5;231;1', ` ralph-workflow v${version} `));
}

export function outro(message) {
  p.outro(message);
}

export function info(message) {
  p.log.info(message);
}

export function warn(message) {
  p.log.warn(message);
}

export function note(message, title) {
  p.note(message, title);
}

export async function select(message, options) {
  return unwrap(await p.select({ message, options }));
}

export async function confirm(message, initialValue = true) {
  return unwrap(await p.confirm({ message, initialValue }));
}

export async function password(message) {
  return unwrap(await p.password({ message, validate: value => value.trim() ? undefined : 'A token is required.' }));
}

export function spinner() {
  return p.spinner();
}
