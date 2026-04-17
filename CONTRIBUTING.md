# Contributing to Ralph Workflow

We welcome contributions! Whether you're fixing bugs, improving docs, or adding features.

## Setup

```bash
git clone https://github.com/YOUR_USERNAME/ralph-workflow.git
cd ralph-workflow
npm install
```

Create a branch for your work, including the issue number:
```bash
git checkout -b fix/13-short-description   # bug fix for issue #13
git checkout -b feat/7-short-description   # feature for issue #7
```

Branch naming pattern: `<type>/<issue-number>-<short-description>`
- `fix/` — bug fixes
- `feat/` — new features
- `chore/` — maintenance, docs, tooling

This embeds the issue number in the branch so both humans and AI agents can find the full context with `gh issue view <number>` without needing to search.

## Development

### Run Tests
```bash
npm test
```

### Build Docs
The docs are in the `docs/` folder. To build them:
```bash
npm run docs:build
```

## Code Style

- Follow existing patterns in the project
- Keep functions focused and modular
- Meaningful variable names
- Add comments for non-obvious logic

## Submitting a PR

1. Commit with clear messages: `git commit -m "feat: description"`
2. Push to your fork: `git push origin feature/your-feature-name`
3. Open a PR with:
   - Clear title describing the change
   - Description of what and why
   - Reference related issues (e.g., "Closes #4")

## Found a Bug?

Open an issue with:
- Clear title and description
- Steps to reproduce
- Expected vs actual behavior

---

Need help? Check [Discussions](https://github.com/rickvian/ralph-workflow/discussions) or [CONTRIBUTORS.md](CONTRIBUTORS.md) to see who's been involved.
