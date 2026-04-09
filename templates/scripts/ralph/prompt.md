# Ralph Agent Instructions

## Stop Condition (READ FIRST)

- After completing ONE story (prd.yaml
  updated + progress.txt appended +
  everything committed together), STOP
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
7. Update AGENTS.md files with learnings
8. Update prd.yaml: `passes: true`
9. Append learnings to progress.txt
10. Commit everything together in ONE commit: `feat: [ID] - [Title]`
    (stage implementation files + prd.yaml + progress.txt in the same commit)

## Progress Format

APPEND to progress.txt:

## [Date] - [Story ID]
- What was implemented
- Files changed
- **Learnings:**
  - Patterns discovered
  - Gotchas encountered
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

Add reusable patterns to the TOP
of progress.txt:

## Codebase Patterns
- Migrations: Use IF NOT EXISTS
- React: useRef<Timeout | null>(null)
