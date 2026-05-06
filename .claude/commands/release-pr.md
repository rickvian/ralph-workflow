---
description: Write release PR notes with linked issues, features, and fixes
allowed-tools: Bash(gh pr view:*), Bash(gh pr diff:*), Bash(gh issue view:*), Bash(gh issue list:*), Bash(gh pr edit:*), Bash(git log:*), Bash(cat:*)
---

Write or update release PR notes for the current branch.

## Steps

1. **Detect PR**: run `gh pr view --json number,title,body,commits` for current branch. If no PR, ask user for PR number.

2. **Extract version**: read `package.json` for `"version"` field.

3. **Map commits to issues**: for each commit:
   - Parse branch names like `feat/31-*` or `fix/33-*` → extract issue number
   - Parse commit message refs like `(#31)`, `Closes #31`, `Refs #31`
   - Collect unique issue numbers

4. **Fetch issue details**: for each issue number, run `gh issue view <number> --json number,title,state`. Use title as description.

5. **Categorize changes**:
   - `feat` commits → Features section
   - `fix` commits → Fixes section
   - `refactor`/`chore`/`docs` → Other Changes section (omit if empty)

6. **Check CI status**: `gh pr view --json statusCheckRollup` → build check table

7. **Write PR body** in this format:

```markdown
## v<VERSION>

### Features

- **<short title>** — <one-sentence description>.
  Closes #<N>

### Fixes

- **<short title>** — <one-sentence description>.
  Closes #<N>

### Checks

| Check | Status |
|-------|--------|
| <check-name> | ✅ passing / ❌ failing / ⏳ in progress |
```

8. **Apply**: run `gh pr edit <number> --body "<body>"` to update the PR.

## Rules

- Every issue referenced in a commit MUST appear under `Closes #N` in the body
- If an issue is CLOSED already, still include `Closes #N` — it's the canonical link
- If no issue exists for a commit, write the commit summary inline without a `Closes` line
- Version comes from `package.json`, not branch name
- Keep descriptions one sentence. No hedging words. No "this PR".
- Check table: show all CI checks. Map status: `SUCCESS` → ✅, `FAILURE` → ❌, `IN_PROGRESS` → ⏳, missing → ⏳

## Trigger

User says: "write release PR notes", "update release PR", "make release details", "/release-pr", or asks to fill in PR body for a release branch.
