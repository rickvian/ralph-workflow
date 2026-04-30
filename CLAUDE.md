# CLAUDE.md

## PR: fix devcontainer mount path + volume ownership (2.0.5)

PR #29 fixed the `/home/vscode` hardcode by switching mount targets to `${containerEnv:HOME}`. That broke container rebuilds: Docker resolves `mounts` *before* the container exists, so `containerEnv:*` is unresolved at mount time and Docker rejects the path as non-absolute (`mount path must be absolute`).

**Fix:** introduce a per-template `{user, home}` map in `write-devcontainer.js` and write literal absolute paths into `mounts.target` plus a matching `remoteUser`. Node.js template → `node`/`/home/node`; Python / Minimal Ubuntu / Full Dev / Python+Node → `vscode`/`/home/vscode`.

**Second-order fix:** named volumes are created root-owned, so the non-root `remoteUser` couldn't write into `~/.claude` or `~/.config/gh` (e.g., `claude plugin install`, `gh auth login` failed with permission denied). Prepend `sudo chown -R <user>:<user> <mounted paths>` to `postCreateCommand`. MS base images grant passwordless sudo to their default user for exactly this kind of one-time setup. Considered a Dockerfile-based alternative (cleaner output, no runtime chown) but rejected — it forces a custom local image build per consumer project, which is too much friction for a scaffolder.

**Tests:** updated existing assertions to expect literal paths; added regression guard that iterates all 5 templates and asserts mount targets are absolute and contain no `${...}` variables; added `remoteUser` assertions per template.

## When a test is failing

Before changing implementation code, check `git log`/`git blame` to understand why it was written that way. Fix the test to match the implementation unless the implementation is clearly wrong.
