About Ralph
Ralph is simple loop that prompts Gemini until it finishes work.
https://ghuntley.com/ralph/

This ralph setup is based on https://x.com/ryancarson/status/2008548371712135632

This is a guide for humans. AI agents should ignore this file.

### How It Works
A bash loop that:
Pipes a prompt into Gemini
Gemini picks the next story from prd.yaml
Gemini implements it
Gemini runs typecheck + tests
Gemini commits if passing
Gemini marks story done
Gemini logs learnings
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

The Gemini template uses this runner:

```bash
#!/bin/bash
set -e

MAX_ITERATIONS=${1:-10}
SCRIPT_DIR="$(cd "$(dirname \
  "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Starting Ralph"
echo "⚠️ Ralph can be very token intensive, ensure you have credit limiter!"

for i in $(seq 1 $MAX_ITERATIONS); do
  echo "═══ Iteration $i ═══"

  OUTPUT=$(cat "$SCRIPT_DIR/prompt.md" \
    | gemini --yolo 2>&1 \
    | tee /dev/stderr) || true

  if echo "$OUTPUT" | \
    grep -q "<promise>COMPLETE</promise>"
  then
    echo "✅ Done!"
    exit 0
  fi

  sleep 2
done

echo "⚠️ Max iterations reached"
exit 1
```

Make executable:

```bash
chmod +x scripts/ralph/ralph.sh
```

## prompt.md

Instructions for each iteration:

```markdown
# Ralph Agent Instructions

## Your Task

1. Read `scripts/ralph/prd.yaml`
2. Read `scripts/ralph/progress.txt`
   (check Codebase Patterns first)
3. Check you're on the correct branch
4. Pick highest priority story
   where `passes: false`
5. Implement that ONE story
6. Run typecheck and tests
7. Update AGENTS.md files with learnings
8. Update prd.yaml: `passes: true`
9. Append important learnings to progress.txt only if any were discovered
10. Commit everything together in ONE commit: `feat: [ID] - [Title]`
    (stage implementation files + prd.yaml + progress.txt in the same commit)

## Progress Format

APPEND to progress.txt only when the story produced durable knowledge worth
carrying into future iterations. Do not log routine implementation steps,
file lists, test commands, or obvious facts.

## [Date] - [Story ID]
- **Learnings:**
  - Root causes discovered after debugging or a long resolution process
  - Non-obvious project conventions, constraints, or integration behavior
  - Reusable fixes, gotchas, or commands that would prevent future rework
  - Keep each learning specific, actionable, and tied to this story
---

## Codebase Patterns

Add reusable patterns to the TOP of progress.txt only when they would change
how a future agent implements or debugs similar work:

## Codebase Patterns
- Migrations: Use IF NOT EXISTS
- React: useRef<Timeout | null>(null)

## Stop Condition

If ALL stories pass, reply:
<promise>COMPLETE</promise>

Otherwise end normally.
```

## prd.yaml

Your task list:

```yaml
branchName: ralph/feature
userStories:
  - id: US-001
    title: Add login form
    acceptanceCriteria:
      - Email/password fields
      - Validates email format
      - typecheck passes
    priority: 1
    passes: false
    notes: ""
```

Key fields:
- `branchName` — branch to use
- `priority` — lower = first
- `passes` — set true when done

## progress.txt

Start with context:

```markdown
# Ralph Progress Log
Started: 2024-01-15

## Codebase Patterns
- Migrations: IF NOT EXISTS
- Types: Export from actions.ts

## Key Files
- db/schema.ts
- app/auth/actions.ts
---
```

Ralph appends after each story.
Patterns accumulate across iterations.

## Running Ralph

Run the Ralph script with 25 iterations:

```bash
./scripts/ralph/ralph.sh 25
```

Ralph will:
- Create the feature branch
- Complete stories one by one
- Commit after each
- Stop when all pass
