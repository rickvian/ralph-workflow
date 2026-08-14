# Ralph Workflow Marketing Improvement Plan

## Decision from a developer's perspective

I would try Ralph Workflow for a well-scoped backlog that can run unattended: exploratory prototypes, a bounded feature slice, maintenance work, or a sequence of independently testable stories. Its meaningful advantage over a one-shot coding prompt is not that it produces code once; it gives an agent a repeatable operating loop: select the next story, retain project learnings, run checks, commit the result, and continue while I am away. Multi-CLI support and an optional isolated Dev Container make that loop more practical for developers who cannot safely grant an autonomous agent their normal machine credentials.

I would not choose it for a tiny change, ambiguous product work, a codebase without dependable checks, or any task requiring frequent human product/design judgment. A one-shot agent session is quicker and cheaper to supervise in those cases. Ralph should say this plainly: it is an execution system for a prepared backlog, not a replacement for developer judgment or a promise of hands-free software delivery.

## Current first impression

The documentation home page is unlikely to make most developers stop reading immediately, but it does make the wrong promise first. The hero says the package “scaffold[s] everything” and foregrounds VS Code Dev Containers and isolated GitHub credentials. A developer who came to learn why they should use a Ralph loop instead of Codex/Claude in a normal terminal has to infer the product outcome from later feature cards.

The safety story is a strong differentiator, but it is presented before the value story. The long simulated install transcript also exposes four optional choices, PAT creation, RTK, and a container before a reader has seen a feature successfully completed. The result is cognitive load and risk anxiety before motivation. The usage guide reinforces this by presenting setup and credential mechanics before a fast path, a concrete example, operating limits, or expected results. “How It Works” does explain the loop clearly, but it begins with security and has copy-quality issues that reduce trust. The navigation has only Home, Usage Guide, and How It Works; there is no “When to use Ralph,” demo, examples, safety model summary, or troubleshooting path.

There is also a credibility issue to resolve before promotion: checked-in `docs/out/` text appears to describe an older experience (including a different feature order and token location) than `docs/app/`. Generated deployment artifacts must be rebuilt or removed from version control so published copy always matches the CLI.

Critical truth gaps to fix before publishing new copy:

- The home-page PAT claim is narrower than the generator's requested permissions; document the exact permissions the current setup asks for, or reduce the implementation to match the claim.
- The wizard can initialize Git, create an initial commit, and create a private GitHub repository. Surface these state-changing effects before consent, ideally in a final confirmation and a dry-run/plan preview.
- The product claims four CLIs, while the guide's authentication section is Claude-only and parts of the prose still say “Claude.” Add provider-specific setup and mark any unsupported behavior.
- A Dev Container limits credential exposure; it is not an absolute “hard boundary,” and a repo/workspace agent can still alter files, consume resources, access any explicitly mounted material, and make network requests allowed by its environment.

## Marketing objective

Make Ralph Workflow the obvious choice for developers who already use an AI coding CLI and need to convert a clearly specified, multi-story backlog into reviewable, tested progress without manually re-prompting every task.

The primary activation event is: a developer scaffolds Ralph, runs a small example or their first real backlog, and sees a committed, passing story. The product message must lead to this result before asking users to evaluate optional isolation and remote-Git setup.

## Positioning

### Category and promise

**Category:** a safe autonomous feature-execution workflow for existing AI coding CLIs.

**Core promise:** Turn a prepared feature backlog into tested, commit-by-commit progress while you are away.

**Support statement:** Ralph Workflow gives Claude, Codex, Gemini, or OpenCode a repeatable loop: choose the next testable story, carry forward repository learnings, implement, verify, commit, and continue. Optional Dev Container isolation restricts autonomous access to the repository and credentials you explicitly provide.

### Proposed home-page hero

> **Ship a prepared feature backlog while you are away.**
>
> Ralph Workflow runs your AI coding CLI through small, testable stories—preserving context, running checks, and committing each completed change. Start locally, or add an isolated Dev Container when the agent needs unattended permissions.

Primary CTA: **Run the 10-minute example**

Secondary CTA: **See the loop in action**

Keep a third, quiet link for security-minded visitors: **How isolation works**.

### Message hierarchy

1. Outcome: a prepared backlog becomes tested, reviewable commits.
2. Mechanism: a durable task loop with `prd.yaml`, `progress.txt`, tests, and commits.
3. Fit: best for several small, independently verifiable stories—not one-off or ambiguous work.
4. Trust: inspectable files, explicit limits, commits per story, and test gates.
5. Safety: optional container isolation and least-privilege GitHub access.
6. Compatibility: Claude, Codex, Gemini, and OpenCode.

Do not lead with “scaffold,” “Dev Container,” or `--dangerously-skip-permissions`; they explain the product but are not the reason to desire it.

## Target audiences and objections

| Audience | Job to be done | Likely objection | Message / proof needed |
| --- | --- | --- | --- |
| AI-native solo developer | Make progress on a defined side-project backlog overnight. | “Why not ask Codex/Claude once?” | Show reduced re-prompting and a sequence of independently tested commits. |
| Senior engineer / tech lead | Delegate low-risk, well-specified maintenance or feature slices. | “Can I review and control it?” | Explain task granularity, test gates, branches/commits, iteration caps, and stop conditions. |
| Security-conscious developer | Try autonomous coding without exposing host credentials. | “`dangerously-skip-permissions` is unacceptable.” | Lead them to a concise threat model, optional isolation setup, and explicit non-guarantees. |
| Early adopter of a supported CLI | Reuse an existing CLI rather than adopt another agent platform. | “Will it work with my tool and repo?” | CLI compatibility matrix, prerequisites, and one verified example per supported CLI. |

## Site and documentation plan

### 1. Redesign the home page around the decision

Replace the current feature-first, setup-heavy home page with this sequence:

1. Outcome-led hero and two CTAs.
2. A 30–60 second terminal/video/GIF proof: input stories → agent iterations → tests → git log with completed commits.
3. “Ralph vs. a one-shot prompt” comparison focused on use cases, not claims of universal superiority.
4. “Use Ralph when / do not use Ralph when” card.
5. A compact three-step journey: prepare stories, run loop, review commits.
6. Trust section: transparent files, supported CLIs, optional isolation, and explicit boundaries.
7. Example gallery and links to the fast start, safety model, and full reference.

The home-page quick start should have two paths:

- **Fast local trial:** scaffold the workflow and run a toy/example backlog without remote GitHub access.
- **Safe unattended setup:** opt into the Dev Container and scoped PAT when the agent needs remote access.

This makes the lowest-risk activation path visible and treats isolation as a selectable capability, not a prerequisite to understand value.

### 2. Add decision-oriented pages

Create these pages and add them to navigation:

- **Is Ralph right for this task?** A decision table covering story count, acceptance criteria, testability, expected supervision, cost/time expectations, and red flags.
- **Example runs:** at least two complete, reproducible before/after examples: a greenfield mini-feature and a maintenance/refactor slice. Include input PRD, iteration cap, resulting commits, tests run, human review needed, elapsed time, and known failures/retries.
- **Safety model:** concise threat model explaining what isolation protects, what it does not protect, why `--dangerously-skip-permissions` is used, local-only vs. remote-Git modes, and credential storage/lifecycle.
- **CLI compatibility:** supported CLI, install/auth prerequisite, generated template path, and known differences for Claude, Codex, Gemini, and OpenCode.
- **Operating Ralph:** iteration limits, stopping safely, recovering from failures, reviewing/reverting commits, cost management, and how to escalate a story back to a human.

Keep the current Usage Guide as a reference document, but split it into a fast-start guide and the operating/reference material above. Put full CLI commands and container/pnpm details behind clear progressive-disclosure sections.

### 3. Repair and simplify existing copy

Before changing visual design, complete a copy pass across `readme.md`, `docs/app/page.tsx`, `docs/app/how-it-works/page.tsx`, and `docs/app/usage-guide/page.tsx`:

- Use direct, grammatical English and define Ralph in the first sentence.
- Change absolute wording such as “fastest way” to evidence-based, scoped claims.
- State that isolation and GitHub setup are optional wherever setup is introduced.
- Describe the tool as scaffolded, inspectable scripts rather than autonomous magic.
- Make test behavior conditional on project configuration; do not imply every repo has typecheck and tests.
- Replace “all without you touching the keyboard” and the “clueless but persistent” joke with a review-first operating promise.
- Ensure the same current facts appear in README, app source, package description, and generated site output.
- Update package metadata: replace the generic description and expand keywords around autonomous coding workflow, AI coding CLI, task loop, Dev Container, and safe agent execution.

### 4. Add proof before amplification

Claims about unattended feature delivery need evidence. Produce and maintain:

- A versioned demo repository for every supported CLI, with a fixed PRD and expected commit history.
- Short captured terminal demos, plus a readable transcript for accessibility and indexing.
- A “results and limits” page that reports scenarios rather than misleading aggregate benchmarks: story count, completion/review rate, retries, tests, tokens/cost where available, environment, and human intervention.
- Three early user case studies or quotes only after permission, each documenting task fit and review process.
- Screenshots of `prd.yaml`, `progress.txt`, and git history that visually connect the loop to its output.

Do not publish unsupported claims such as “builds while AFK” without pairing them with the constraints: prepared requirements, agent capability, available credentials, test coverage, and human code review.

## Acquisition and community plan

### Channels

Prioritize channels where developers already compare agent workflows:

- GitHub README, Releases, Discussions, and issue templates.
- Short technical posts showing a real completed backlog, including failures and recovery—not generic AI-agent thought leadership.
- CLI-specific communities for Codex, Claude Code, Gemini CLI, and OpenCode; tailor examples rather than cross-posting identical copy.
- Developer newsletters or communities after the demo and decision page are credible.

Avoid paid acquisition until activation instrumentation shows that visitors understand task fit and complete the first run.

### Content sequence

1. “One-shot prompt or Ralph loop? A developer’s decision guide.”
2. “From five acceptance criteria to five reviewable commits: a full Ralph run.”
3. “Running autonomous coding safely: what a Dev Container does—and does not—protect.”
4. One implementation post per supported CLI, based on verified differences.
5. Postmortems of failed or partially successful runs to establish credibility.

Every item should lead to a corresponding decision, demo, or fast-start page rather than a generic homepage.

## Activation and measurement

Instrument a privacy-respecting funnel or, if telemetry is not appropriate, use documented release/manual measurement:

| Stage | Signal | Initial success criterion |
| --- | --- | --- |
| Interest | Hero CTA click to example or fast start | Visitors choose a path rather than immediately leave. |
| Intent | `npx ralph-workflow` / package install | Track by npm downloads, segmented by release period. |
| Setup | CLI completes scaffolding | Optional, anonymous opt-in event or demo-repo feedback. |
| Activation | First passing, committed story | Primary product activation metric. |
| Retention | Second real run or multiple stories completed | Indicates the loop, not novelty, delivered value. |
| Trust | Safety-page completion, questions, and setup-path choice | Reveals whether isolation helps conversion or creates friction. |

Set numeric targets only after a two-week baseline. Segment results by entry page, chosen CLI, local vs. container setup, new vs. returning users, and docs version. Do not infer product value from npm downloads alone.

## 90-day implementation sequence

### Phase 0 — Establish a truthful baseline (week 1)

- Audit source docs, README, package metadata, CLI prompts, and deployed `docs/out/` for factual consistency.
- Rebuild deployment artifacts or change the deployment process so generated output cannot become stale.
- Run and record one end-to-end demo with the current release; log every prerequisite and failure point.
- Interview 5–8 developers who use an AI coding CLI. Ask them to choose between a one-shot session and Ralph for concrete tasks, then test the proposed hero without explaining it.

**Exit:** one canonical capability matrix, one verified demo run, and a ranked list of onboarding blockers.

### Phase 1 — Clarify the offer (weeks 2–3)

- Rewrite README and the home-page hero using the approved positioning and use-case boundaries.
- Add fast local trial and safe unattended setup paths.
- Publish the “Is Ralph right for this task?” and Safety Model pages.
- Move deep setup details out of the first-reading path and repair copy quality.
- Update title, meta description, Open Graph image, and npm metadata for the new promise.

**Exit:** a first-time developer can answer what Ralph is, when to use it, how it differs from one-shot prompting, and how to start a low-risk trial in under two minutes of reading.

### Phase 2 — Demonstrate the outcome (weeks 4–6)

- Create the reproducible demo repository and two documented example runs.
- Add a short terminal capture and an accessible transcript to the home page.
- Publish CLI compatibility and operating/recovery guides.
- Add issue/discussion templates for demo failures, use cases, and feature requests.
- Add a final wizard confirmation that lists files and Git/GitHub actions about to occur; offer a dry-run preview where feasible.

**Exit:** every headline claim has a linked, inspectable demonstration; a skeptical developer can evaluate a real run before configuring credentials.

### Phase 3 — Learn from distribution (weeks 7–10)

- Publish the decision-guide and full-run articles.
- Share CLI-specific examples in relevant communities, disclose limitations, and invite feedback on task fit.
- Collect opt-in qualitative feedback at the first-pass and first-failure points.
- Test two hero variants: outcome-led versus safety-led for security-oriented referrers only.

**Exit:** a documented channel/task-fit matrix and enough feedback to prioritize product onboarding changes.

### Phase 4 — Convert proof into trust (weeks 11–13)

- Publish user stories only where the user can review the exact claims.
- Add a concise results-and-limits section based on repeatable scenarios.
- Refine the setup wizard and docs based on the highest drop-off stage.
- Establish a release checklist that requires docs, demo, compatibility matrix, and generated-site verification to be updated together.

**Exit:** messaging, setup, proof, and release documentation stay consistent as the package evolves.

## Ownership and release checklist

Assign one accountable owner per release for messaging/docs, demo verification, CLI compatibility, and generated-site deployment. Before a release, verify:

- The README, npm description, docs source, generated site, and CLI behavior describe the same version.
- One demo per supported CLI still completes or its limitation is explicitly documented.
- The home page includes task-fit guidance and does not overstate autonomy or security.
- Links, CTA destinations, copy, and Open Graph metadata work in the deployed site.
- A human has reviewed the runnable example and its resulting commits.

## Risks and guardrails

- **Overpromising autonomy:** Always pair outcome claims with task-fit boundaries and human review expectations.
- **Security theater:** Document isolation’s limits, use least privilege, and never imply a Dev Container is an absolute security boundary.
- **Setup friction:** Maintain the local trial path; measure whether container/PAT configuration is preventing activation.
- **Stale proof:** Treat demos and generated documentation as release artifacts, not one-time marketing assets.
- **Unsupported multi-CLI parity:** Market only verified behavior; present differences openly instead of flattening them into a generic compatibility claim.

## Immediate next actions

1. Confirm the canonical current CLI behavior and fix the `docs/out/` versus `docs/app/` mismatch.
2. Produce one small, repeatable demo and record its terminal output and commit history.
3. Rewrite the hero, README opening, and primary CTA around the prepared-backlog outcome.
4. Publish the task-fit and safety-model pages before broader promotion.
5. Interview the first 5–8 target developers and revise the plan using observed objections and activation friction.
