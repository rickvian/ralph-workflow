Turn a prepared feature backlog into tested, reviewable commits with your existing AI coding CLI.

`ralph-workflow` scaffolds Ralph's iterative execution loop for Claude, Codex, Gemini, or OpenCode. Use it for several small, independently verifiable stories—not for one-off changes, unclear direction, or work that needs continuous human judgment.

[Read the documentation](https://rickvian.github.io/ralph-workflow).

----


🔄 Ralph is an autonomous AI coding agent loop based on https://ghuntley.com/ralph/

Ralph repeatedly selects the next unfinished story, carries forward project context, asks your chosen AI CLI to implement it, runs the configured checks, and records a commit. You prepare the backlog; Ralph produces work for you to inspect and accept.


```bash
npx ralph-workflow
```

---

## When to use Ralph Workflow

Use Ralph Workflow when you have a bounded backlog with concrete acceptance criteria and checks the agent can run. Choose an interactive or one-shot AI coding session when the task is small, ambiguous, high-risk, or requires frequent product and design decisions.

Before relying on a run, inspect the starting commit, PRD, iteration cap, terminal output, git history, checks, and final review decisions. Ralph's commits are submitted work—not an automatic merge decision.

## Optional isolation

Ralph runs with `--dangerously-skip-permissions`. Without isolation, it operates with your full host credentials — meaning it could access every private repo, cloud account, or service your machine can reach. The Dev Container setup prevents this by:

- Blanking out VS Code's credential-forwarding environment variables (`GIT_ASKPASS`, `VSCODE_GIT_*`, `SSH_AUTH_SOCK`, `GITHUB_TOKEN`, etc.)
- Disabling VS Code's git auth helpers inside the container
- Mounting only a single-repo fine-grained PAT, not your host keychain

This reduces credential blast radius; it does not make autonomous code execution inherently safe. Start locally if you only want to evaluate the loop, and add a container or remote GitHub access only when needed.


## What it does

Running the CLI will:

1. **Optionally set up a VS Code Dev Container** — picks a base image (Node, Python, etc.) and applies credential-isolation settings so the host's SSH keys, GitHub tokens, and cloud credentials are not forwarded into the container.
2. **Optionally create a scoped GitHub PAT** — walks you through generating a fine-grained token restricted to just this repository. The token is stored in `.ralph/token` inside your project (automatically gitignored, mode 0600) and reaches the container through the workspace bind — works on macOS, Linux, and Windows. GitHub setup is independent of the Dev Container choice; you can opt into either, both, or neither.
3. **Auto-install [RTK](https://github.com/rtk-ai/rtk)** — RTK is installed into every Dev Container and `rtk init` is run for the CLI you picked (claude, codex, gemini, or opencode) so token-reduction kicks in on first boot.
4. **Optionally install Claude-only extras** — when the selected CLI is `claude`, you can opt in to the [Caveman](https://github.com/JuliusBrussee/caveman) debugging plugin and the [awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents) collection. Both default to off and persist in a project-scoped `.claude` volume across rebuilds.
5. **Scaffold Ralph scripts** into `scripts/ralph/` — the loop script, prompt template, task list, and progress log. If `scripts/` already exists, you'll be asked to confirm before anything is overwritten.

## Get Involved
We welcome issues and pull requests!
- Participate in [GitHub discussions](https://github.com/rickvian/ralph-workflow/discussions)
- Chat with the community on Discord
- See CONTRIBUTING.md for setup instructions

## Contributors

<a href="https://github.com/rickvian/ralph-workflow/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=rickvian/ralph-workflow" />
</a>

---

_Honestly, we all need to learn from Ralph. It may be clueless, but it is very persistent._
