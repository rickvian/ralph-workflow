# CLAUDE.md

## When a test is failing

Before changing implementation code, check `git log`/`git blame` to understand why it was written that way. Fix the test to match the implementation unless the implementation is clearly wrong.

## PR: fix: auto-create initial commit before `gh repo create --push`

### Summary
- `setupGitHubAccess` ran `gh repo create "<name>" --private --source=. --push` against fresh project directories that had a freshly-`git init`'d repo with zero commits. `gh` aborts in that case with `--push enabled but no commits found in <path>`, which made `npx ralph-workflow` against an empty directory fail.
- Added `_ensureInitialCommit(projectName)` in `bin/commands/github-access.js`. It runs after `_ensureGitRepo()` and before any `gh` calls: if `git rev-parse HEAD` shows no commits, it stages everything (creating a `README.md` placeholder when the working tree is also empty) and creates a `chore: initial commit`.
- Bumped `package.json` to `2.0.6`.

### Test plan
- [ ] `npx ralph-workflow` in an empty directory → repo gets created, initial commit pushed, no `--push enabled but no commits found` error.
- [ ] `npx ralph-workflow` in a directory that already has commits → no extra commit created.
- [ ] `npx ralph-workflow` in a directory with unstaged files but no commits → those files end up in the initial commit (no placeholder README written).
