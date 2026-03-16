# Agent Instructions

## Project Structure

This is the **ralph-workflow** npm package repo. Two top-level directories have distinct purposes:

- `templates/` — files that get **injected into the user's project** when they run `npx ralph-workflow`. Changes here affect what users receive.
- `scripts/` — the **ralph setup for this repo itself** (prd.yaml, prompt.md, progress.txt, ralph.sh). This is where the agent operates.

Do not conflate the two. When implementing stories related to the package's scaffolding output, edit files under `templates/`. When updating the ralph agent config for this project, edit files under `scripts/ralph/`.
