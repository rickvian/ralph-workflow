# Agent Instructions

## Project Structure

This is the **ralph-workflow** npm package repo. Two top-level directories have distinct purposes:

- `templates/` — files that get **injected into the user's project** when they run `npx ralph-workflow`. Changes here affect what users receive.
- `scripts/` — the **ralph setup for this repo itself** (prd.yaml, prompt.md, progress.txt, ralph.sh). This is where the agent operates.

Do not conflate the two. When implementing stories related to the package's scaffolding output, edit files under `templates/`. When updating the ralph agent config for this project, edit files under `scripts/ralph/`.

## Branch → Issue Convention

Branch names follow the pattern `<type>/<issue-number>-<short-description>` (e.g. `fix/13-auth-claude-persist`).

**At the start of every session**, check the current branch name for an issue number and run `gh issue view <number>` to load the full context — problem statement, requirements, and acceptance criteria — before writing any code. This prevents working blind after a context reset.
