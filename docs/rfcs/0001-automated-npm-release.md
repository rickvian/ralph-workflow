# RFC 0001: Automated npm Release via GitHub Actions

- **Status:** Draft
- **Date:** 2026-05-06
- **Author:** Rickvian
- **Branch:** `claude/cicd-npm-publish-plan-4K2BP`

## Summary

Replace the current manual `npm publish` workflow with an automated, tag-driven
release pipeline running in GitHub Actions. Versioning, changelog, GitHub
Release, and `npm publish` (with provenance) all happen from a single click /
merge — no local publishing, no shared `NPM_TOKEN` on a developer machine.

## Motivation

Today releases are cut by hand:

1. Bump `version` in `package.json` locally.
2. `npm publish` from a developer machine.
3. Tag / release notes done ad-hoc (or skipped).

Problems:

- Publishing identity lives on a laptop (token leak risk, "works on my
  machine" 2FA friction).
- No provenance — consumers can't verify the tarball came from this repo.
- Version bumps and changelogs drift from the commit history.
- No reproducible build environment; whatever is in the working tree ships.
- Easy to forget to push tags, create a GitHub Release, or run tests first.

## Goals

- One canonical path to publish: merge a release PR → published to npm.
- Tests must pass on the exact commit that gets published.
- Versioning derived from commit history (no manual edits to `package.json`).
- Auto-generated `CHANGELOG.md` and matching GitHub Release.
- npm **provenance** attestation enabled (supply-chain hardening).
- No long-lived `NPM_TOKEN` if avoidable — prefer npm Trusted Publishing (OIDC).
- Manual override path for hotfixes / pre-releases.

## Non-Goals

- Multi-package / monorepo publishing (single package today).
- Publishing the `docs/` Next.js app to npm (it's deployed separately via
  `deploy-docs.yml`).
- Canary/nightly auto-publishes on every `main` push.

## Proposal

### High-level flow (recommended: `release-please`)

```
feat/fix commits land on main (Conventional Commits)
        │
        ▼
release-please action opens / updates a "Release PR"
   - bumps package.json version
   - regenerates CHANGELOG.md
        │
   maintainer reviews & merges Release PR
        │
        ▼
release-please tags vX.Y.Z + creates GitHub Release
        │
        ▼
publish.yml (triggered by the GitHub Release)
   - checkout tag, npm ci, npm test
   - npm publish --provenance --access public
```

Two workflows total:

- `.github/workflows/release-please.yml` — runs on push to `main`, manages the
  Release PR and tagging.
- `.github/workflows/publish.yml` — runs on `release: published`, runs tests
  on the tagged commit, then `npm publish` with provenance.

### Why split into two workflows?

- `release-please` only needs `contents: write` + `pull-requests: write`.
- `publish` needs `id-token: write` (OIDC) + npm credentials. Keeping it in a
  separate file lets us scope the secret/environment narrowly (GitHub
  Environment `npm-publish` with required reviewer if desired).

### Versioning rules (Conventional Commits → semver)

| Commit prefix | Bump  |
|---------------|-------|
| `fix:`        | patch |
| `feat:`       | minor |
| `feat!:` or `BREAKING CHANGE:` footer | major |
| `chore:`, `docs:`, `test:`, `refactor:` | none  |

This matches the prefixes already documented in `CONTRIBUTING.md`
(`fix/`, `feat/`, `chore/` branch types), so no contributor retraining needed
beyond commit-message discipline.

### Authentication: npm Trusted Publishing (OIDC) — preferred

- Configure the npm package on npmjs.com to trust this repo + the
  `publish.yml` workflow.
- Workflow requests an OIDC token (`id-token: write`) and exchanges it for a
  short-lived publish token. **No `NPM_TOKEN` secret needed.**
- Falls back to a classic `NPM_TOKEN` automation token stored as a repo secret
  if Trusted Publishing isn't available for the account.

### Provenance

`npm publish --provenance` will emit a signed SLSA attestation tying the
tarball to this repo + commit + workflow run. Visible on the npm package page.
Free, automatic when publishing from GitHub Actions with OIDC.

### Manual / hotfix path

`publish.yml` will also accept `workflow_dispatch` with inputs:
- `tag` (e.g. `v2.0.7`) — checked out and published as-is.
- `dist-tag` (default `latest`, e.g. `next` for pre-release).

Use case: cherry-pick fix on `release/*` branch, tag manually, dispatch
publish. Rare but needs an escape hatch.

## Detailed design

### `release-please.yml` (sketch)

```yaml
name: release-please
on:
  push:
    branches: [main]
permissions:
  contents: write
  pull-requests: write
jobs:
  release-please:
    runs-on: ubuntu-latest
    steps:
      - uses: googleapis/release-please-action@v4
        with:
          release-type: node
          package-name: ralph-workflow
```

### `publish.yml` (sketch)

```yaml
name: publish
on:
  release:
    types: [published]
  workflow_dispatch:
    inputs:
      tag:
        description: Git tag to publish (e.g. v2.0.7)
        required: true
      dist-tag:
        description: npm dist-tag
        default: latest
jobs:
  publish:
    runs-on: ubuntu-latest
    environment: npm-publish
    permissions:
      contents: read
      id-token: write   # OIDC for npm Trusted Publishing + provenance
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ inputs.tag || github.ref }}
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm test
      - run: npm publish --provenance --access public --tag ${{ inputs.dist-tag || 'latest' }}
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}  # only used if OIDC unavailable
```

### Required repo configuration

- **Branch protection** on `main`: require `Test` workflow to pass.
- **GitHub Environment** `npm-publish`: optionally require manual approval
  before the publish job runs.
- **npm package settings**: enable Trusted Publishing for this repo +
  workflow, OR add `NPM_TOKEN` (automation token, 2FA-bypass) as a repo
  secret scoped to the environment.
- **Add `CHANGELOG.md`** to the repo root (release-please will manage it).

## Alternatives considered

1. **Changesets (`@changesets/cli`)** — contributors add a `.changeset/*.md`
   file per PR describing the bump. More explicit, better for monorepos and
   when commit messages are unreliable. Heavier contributor overhead for a
   small project. *Reject for now; revisit if the project grows.*
2. **Tag-triggered publish, manual version bump** — simplest possible: push
   `vX.Y.Z` tag, action publishes. No automation around version/changelog;
   we'd still be hand-editing `package.json`. *Reject — doesn't solve the
   "manual" pain point.*
3. **`semantic-release`** — fully automatic publish on every push to `main`.
   Powerful but no review gate before a version ships, and harder to dry-run.
   release-please's "Release PR" gate is preferable here.
4. **Keep manual `npm publish`, just add provenance via a script** — doesn't
   address tokens-on-laptop or test-on-tag guarantees.

## Migration plan

1. Land this RFC.
2. Add `release-please.yml` + an initial `CHANGELOG.md` + a
   `.release-please-manifest.json` seeded at the current version (`2.0.6`).
3. Switch all future commits / PRs to Conventional Commits style; update
   `CONTRIBUTING.md` with examples.
4. Configure npm Trusted Publishing on npmjs.com (or add `NPM_TOKEN` secret).
5. Add `publish.yml`. Test once via `workflow_dispatch` against a `next`
   dist-tag (`2.0.7-rc.0`) to verify end-to-end before relying on it.
6. Document the new flow in `CONTRIBUTING.md` ("How releases work").
7. Stop publishing from laptops. Revoke any personal npm tokens previously
   used.

## Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Bad commit messages → wrong version bump | Release PR is reviewed before merge; bump is visible in the PR title/body. |
| OIDC misconfig → publish fails | Keep `NPM_TOKEN` secret as fallback during migration; remove after first green release. |
| Accidental publish from a fork PR | `publish.yml` triggers only on `release: published` and `workflow_dispatch` from this repo; OIDC trust scoped to workflow path. |
| `npm test` flaky on the tag | Same tests already gate `main`; tag is cut from a green commit. |
| Need to yank a release | `npm deprecate` + cut a new patch via the same flow. `npm unpublish` is intentionally not automated. |

## Open questions

- Do we want a required-reviewer gate on the `npm-publish` environment, or is
  the merged Release PR sufficient approval?
- Pre-release strategy: cut from `release/*` branches with `next` dist-tag, or
  not bother until needed?
- Should `npm test` in `publish.yml` also run `npm run docs:build` as a smoke
  check, or keep publish minimal?
