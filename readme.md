🔄 Ralph is an autonomous AI coding agent loop based on the workflow by [@ryancarson](https://x.com/ryancarson/status/2008548371712135632).

Ralph workflow scaffolds everything you need to run Ralph safely inside a VS Code Dev Container with isolated GitHub credentials.

This is really suitable for exploratory projects —
provide it with directions and requirements, leave it AFK, and it develops for you.



```bash
npx ralph-workflow
```

📖 **Full usage guide:** https://rickvian.github.io/ralph-workflow/usage-guide

---

## What it does

Running the CLI will:

1. **Optionally set up a VS Code Dev Container** — picks a base image (Node, Python, etc.) and applies credential-isolation settings so the host's SSH keys, GitHub tokens, and cloud credentials are not forwarded into the container.
2. **Optionally create a scoped GitHub PAT** — walks you through generating a fine-grained token restricted to just this repository, so Ralph can only push to one repo.
3. **Scaffold Ralph scripts** into `scripts/ralph/` — the loop script, prompt template, task list, and progress log.

## Why isolation matters

Ralph runs with `--dangerously-skip-permissions`. Without isolation, it operates with your full host credentials — meaning it could access every private repo, cloud account, or service your machine can reach. The Dev Container setup prevents this by:

- Blanking out VS Code's credential-forwarding environment variables (`GIT_ASKPASS`, `VSCODE_GIT_*`, `SSH_AUTH_SOCK`, `GITHUB_TOKEN`, etc.)
- Disabling VS Code's git auth helpers inside the container
- Mounting only a single-repo fine-grained PAT, not your host keychain

---

_Honestly, we all need to learn from Ralph. It may be clueless, but it is very persistent._
