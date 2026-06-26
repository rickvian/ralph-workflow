# Ralph Agent Instructions

## Stop Condition (READ FIRST)

- After completing ONE story (prd.yaml
  updated + progress.txt appended only if important learnings exist +
  implementation files committed), STOP
  immediately. Do NOT
  pick up another story in this
  invocation — the bash loop will
  re-invoke you for the next one.
- Only if ALL stories already have
  `passes: true` when you start, reply
  `<promise>COMPLETE</promise>` and stop.

## Your Task

1. Read `scripts/ralph/prd.yaml`
2. Read `scripts/ralph/progress.txt`
   (check Codebase Patterns first)
3. Check you're on the correct branch
4. Pick highest priority story
   where `passes: false`
5. Implement that ONE story, then STOP.
6. Run typecheck and tests
7. Update AGENTS.md files with learnings from this story only
8. Update prd.yaml: `passes: true`
9. Append important learnings to progress.txt only if any were discovered
10. Commit implementation files in ONE commit with format: `[commit type]: [ID] - [Title]` e.g `feat: US-123 - create submit form`. Do not stage or commit `scripts/ralph/prd.yaml` or `scripts/ralph/progress.txt`.

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

## prd.yaml format

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

## Codebase Patterns

Add only reusable patterns learned from the current story to the TOP
of progress.txt. Include a pattern only if it would change how a future agent
implements or debugs similar work. Do not add patterns from unrelated
exploration, routine edits, or one-off implementation details:

## Codebase Patterns
- Migrations: Use IF NOT EXISTS
- React: useRef<Timeout | null>(null)
