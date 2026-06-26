About Ralph
Ralph is simple loop that prompts Codex until it finishes work.
https://ghuntley.com/ralph/

This ralph setup is based on https://x.com/ryancarson/status/2008548371712135632

This is a guide for humans. AI agents should ignore this file.

### How It Works
A bash loop that:
Pipes a prompt into Codex
Codex picks the next story from prd.yaml
Codex implements it
Codex runs typecheck + tests
Codex commits implementation files
Codex marks story done
Codex logs learnings
Loop repeats until done

### Memory persists only through:
Git commits
progress.txt (learnings)
prd.yaml (task status)

```
scripts/ralph/
├── ralph.sh
├── prompt.md
├── prd.yaml
└── progress.txt
```

## ralph.sh

The Codex template uses this quiet runner pattern:

```bash
#!/bin/bash
set -e

MAX_ITERATIONS=${1:-10}
SCRIPT_DIR="$(cd "$(dirname \
  "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Starting Ralph"

for i in $(seq 1 $MAX_ITERATIONS); do
  echo "═══ Iteration $i ═══"

  OUTPUT=$(cat "$SCRIPT_DIR/prompt.md" \
    | codex exec --dangerously-bypass-approvals-and-sandbox - 2>&1) || true

  if [ "$(printf '%s' "$OUTPUT" | tr -d '\r')" = "<promise>COMPLETE</promise>" ]; then
    echo "✅ Done!"
    exit 0
  fi

  sleep 2
done

echo "⚠️ Max iterations reached"
exit 1
```

## prompt.md

The Codex prompt avoids committing ignored local Ralph run-state files:

```markdown
10. Commit implementation files in ONE commit: `feat: [ID] - [Title]`
    Do not stage or commit `scripts/ralph/prd.yaml`,
    `scripts/ralph/progress.txt`, `scripts/ralph/prompt.md`,
    or ignored `scripts/ralph/` files. These are local Ralph
    run state. Never use `git add -f` unless the user explicitly asks.
```

## Running Ralph

```bash
./scripts/ralph/ralph.sh 25
```
