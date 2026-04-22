'use client'

import { useEffect } from 'react'
import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import yaml from 'highlight.js/lib/languages/yaml'
import markdown from 'highlight.js/lib/languages/markdown'
import 'highlight.js/styles/github-dark.css'

hljs.registerLanguage('bash', bash)
hljs.registerLanguage('yaml', yaml)
hljs.registerLanguage('markdown', markdown)

function CodeBlock({ lang, children }: { lang: string; children: string }) {
  const highlighted = hljs.highlight(children.trim(), { language: lang }).value
  return (
    <pre className="rounded-lg overflow-x-auto text-sm my-4 border border-white/10">
      <code
        className={`hljs language-${lang}`}
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
    </pre>
  )
}

const prdYamlCode = `branchName: ralph/feature
userStories:
  - id: US-001
    title: Add login form
    acceptanceCriteria:
      - Email/password fields
      - Validates email format
      - typecheck passes
    priority: 1
    passes: false
    notes: ""`

const progressTxtCode = `# Ralph Progress Log

## Codebase Patterns
- Migrations: IF NOT EXISTS
- Types: Export from actions.ts

## Key Files
- db/schema.ts
- app/auth/actions.ts
---`

const promptMdCode = `# Ralph Agent Instructions

## Your Task

1. Read \`scripts/ralph/prd.yaml\`
2. Read \`scripts/ralph/progress.txt\`
3. Pick highest priority story where \`passes: false\`
4. Implement that ONE story
5. Run typecheck and tests
6. Commit: \`feat: [ID] - [Title]\`
7. Update prd.yaml: \`passes: true\`
8. Append learnings to progress.txt`

const projectStructureCode = `bin/
├── cli.js                          # entry point — orchestrates prompts and setup steps
├── commands/
│   ├── devcontainer.js             # template picker (selectTemplate)
│   ├── github-access.js            # git repo + GitHub repo + PAT setup (with retry)
│   └── scaffold.js                 # copies templates into scripts/ralph/ (with overwrite prompt)
├── lib/
│   ├── ui.js                       # ask() and selectMenu() terminal helpers
│   ├── devcontainer-templates.js   # the 5 container image definitions
│   └── write-devcontainer.js       # builds devcontainer.json — RTK install, per-CLI rtk init,
│                                   #   optional Caveman / subagents (Claude only)
└── scripts/
    ├── validate-isolation.sh.js    # embedded shell script (quick token check)
    └── check-isolation.sh.js       # embedded shell script (full isolation audit)

templates/
└── scripts/ralph/                  # scaffolded into the user's project
    ├── ralph.sh
    ├── prompt.md
    ├── prd.yaml
    └── ralph-usage-guide.md`

export default function UsageGuidePage() {
  useEffect(() => {
    hljs.highlightAll()
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl sm:text-4xl font-bold mb-2">Usage Guide</h1>

      {/* Prerequisites */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3 text-brand-purple">Prerequisites</h2>
        <ul className="list-disc pl-5 space-y-1 text-gray-400 text-sm">
          <li>Node.js 18+ and npm installed on your host machine</li>
          <li>VS Code with the <strong className="text-gray-200">Dev Containers</strong> extension and Docker / Colima (optional for isolation)</li>
          <li>A GitHub account with CLI logged in (optional — only needed for remote push)</li>
        </ul>
      </section>

      {/* Getting Started */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3 text-brand-purple">Getting Started</h2>
        <p className="text-gray-400 text-sm mb-3">
          Create a new empty project folder, open a terminal inside it, then run:
        </p>
        <CodeBlock lang="bash">{`mkdir my-project && cd my-project
npx ralph-workflow`}</CodeBlock>
        <p className="text-gray-400 text-sm mb-2">The wizard will ask, in order:</p>
        <ol className="list-decimal pl-5 space-y-2 text-gray-400 text-sm">
          <li><strong className="text-gray-200">AI CLI</strong> — pick claude, codex, gemini, or opencode. This choice drives the matching <code className="bg-white/10 text-brand-purple px-1 rounded">rtk init</code> flag below.</li>
          <li><strong className="text-gray-200">Dev Container isolation</strong> — set up a VS Code Dev Container so the host's credentials are not forwarded in.</li>
          <li><strong className="text-gray-200">GitHub access</strong> — optionally create a fine-grained PAT scoped to one repo. This is now <em>independent</em> of the Dev Container choice, so you can have isolation without a PAT, a PAT without isolation, both, or neither.</li>
          <li><strong className="text-gray-200">Claude extras</strong> (only if you picked <code className="bg-white/10 text-brand-purple px-1 rounded">claude</code>) — opt in to the <a href="https://github.com/JuliusBrussee/caveman" className="text-brand-purple underline">Caveman</a> debugging plugin and/or the <a href="https://github.com/VoltAgent/awesome-claude-code-subagents" className="text-brand-purple underline">awesome-claude-code-subagents</a> collection. Both default to no.</li>
          <li><strong className="text-gray-200">Dev Container template</strong> (only if isolation is enabled) — choose Node, Python, Ubuntu, etc.</li>
        </ol>
        <p className="text-gray-400 text-sm mt-3">
          If <code className="bg-white/10 text-brand-purple px-1 rounded">scripts/</code> already exists in your project, the scaffold step
          warns you and asks for confirmation before overwriting anything.
        </p>
      </section>

      {/* Set up isolation */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3 text-brand-purple">Set Up Isolation via Dev Container <span className="text-gray-500 text-base font-normal">(Optional)</span></h2>
        <p className="text-gray-400 text-sm mb-3">
          You will be prompted whether you want to set up a VS Code Dev Container for isolation.
          If yes, you can select from available Dev Container templates (e.g. Node, Python, Ubuntu).
          Git access is configured before <code className="bg-white/10 text-brand-purple px-1 rounded">devcontainer.json</code> is created.
        </p>
        <p className="text-gray-400 text-sm mb-3">
          After the wizard completes, open the folder in VS Code and reopen it in a container:
        </p>
        <ol className="list-decimal pl-5 space-y-2 text-gray-400 text-sm">
          <li>Open the project folder in VS Code.</li>
          <li>Install the <strong className="text-gray-200">Dev Containers</strong> extension if not already installed.</li>
          <li>Click the <code className="bg-white/10 text-brand-purple px-1 rounded">&gt;&lt;</code> icon in the bottom-left corner, then select <em>Reopen in Container</em> (or use <code className="bg-white/10 text-brand-purple px-1 rounded">Cmd+Shift+P</code> → <em>Dev Containers: Reopen in Container</em>).</li>
        </ol>
        <p className="text-gray-400 text-sm mt-3">
          A <code className="bg-white/10 text-brand-purple px-1 rounded">postStart</code> script runs automatically to clean up any credentials VS Code may have forwarded from your host machine.
          VS Code's Dev Containers extension <a href="https://code.visualstudio.com/remote/advancedcontainers/sharing-git-credentials" className="text-brand-purple underline">automatically forwards git credentials</a> by default.
          By default <code className="bg-white/10 text-brand-purple px-1 rounded">ralph-workflow</code> applies aggressive cleanup so you are explicitly in control of what credentials Ralph can access.
        </p>
      </section>

      {/* Configuring Git access */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3 text-brand-purple">Configuring Git Granular Access <span className="text-gray-500 text-base font-normal">(Optional)</span></h2>
        <p className="text-gray-400 text-sm mb-3">
          Giving Ralph access to a remote GitHub repository is optional — Ralph works fine with local git only.
          If you want Ralph to push to a remote repo, set up a fine-grained PAT during the wizard:
        </p>
        <ol className="list-decimal pl-5 space-y-2 text-gray-400 text-sm">
          <li>The wizard creates a GitHub repo using your current local git credential (you can retry or skip if it fails).</li>
          <li>The shell provides a GitHub link to create a PAT with the recommended minimum permissions pre-filled in the URL parameters.</li>
          <li>Open the link, manually select the repository you want Ralph to access, and generate the token.</li>
          <li>
            Paste the token back into the shell — it is written to{' '}
            <code className="bg-white/10 text-brand-purple px-1 rounded">.ralph/token</code> inside your project
            directory (mode 0600) and <code className="bg-white/10 text-brand-purple px-1 rounded">.ralph/</code> is
            added to <code className="bg-white/10 text-brand-purple px-1 rounded">.gitignore</code> automatically so
            the token is never committed.
          </li>
        </ol>
        <p className="text-gray-400 text-sm mt-3">
          This gives Ralph access to only that one repo with granular permissions, reducing blast radius if something goes wrong.
        </p>
        <p className="text-gray-400 text-sm mt-2">
          The token is mounted into the container via{' '}
          <code className="bg-white/10 text-brand-purple px-1 rounded">${'{localWorkspaceFolder}'}/.ralph/token</code>,
          a devcontainer variable that resolves correctly on macOS, Linux, and Windows —
          no OS-specific paths are baked into your{' '}
          <code className="bg-white/10 text-brand-purple px-1 rounded">devcontainer.json</code>.
          Each project also gets its own isolated Docker volume for gh and Claude config, so switching
          between multiple ralph projects never overwrites each other's auth state.
        </p>
      </section>

      {/* Setting up code CLI */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3 text-brand-purple">(Important) Setting Up Your AI CLI</h2>
        <p className="text-gray-400 text-sm mb-3">
          <code className="bg-white/10 text-brand-purple px-1 rounded">ralph-workflow</code> is designed to automatically install your chosen AI CLI in the container.
          You must configure it once before Ralph can run it unattended.
        </p>
        <p className="text-gray-400 text-sm mb-2">For Claude Code:</p>
        <CodeBlock lang="bash">{`# Inside the container terminal:
claude                                     # log in
claude --dangerously-skip-permissions      # accept the warning once`}</CodeBlock>
        <p className="text-gray-400 text-sm">
          The <code className="bg-white/10 text-brand-purple px-1 rounded">--dangerously-skip-permissions</code> acceptance only needs to happen once per container.
        </p>
      </section>

      {/* RTK + Claude extras */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3 text-brand-purple">RTK and Claude-only Extras</h2>
        <p className="text-gray-400 text-sm mb-3">
          Every generated <code className="bg-white/10 text-brand-purple px-1 rounded">devcontainer.json</code> auto-installs
          {' '}<a href="https://github.com/rtk-ai/rtk" className="text-brand-purple underline">RTK</a> and runs the per-CLI{' '}
          <code className="bg-white/10 text-brand-purple px-1 rounded">rtk init</code> variant via
          {' '}<code className="bg-white/10 text-brand-purple px-1 rounded">postCreateCommand</code>. The install script is pinned to a
          specific commit SHA to avoid supply-chain drift, and the init command is idempotent — re-running a container rebuild
          won't duplicate anything.
        </p>
        <CodeBlock lang="bash">{`# Per-CLI rtk init selected automatically
claude    → rtk init -g
codex     → rtk init -g --codex
gemini    → rtk init -g --gemini
opencode  → rtk init -g --opencode`}</CodeBlock>
        <p className="text-gray-400 text-sm mb-3">
          If you picked <code className="bg-white/10 text-brand-purple px-1 rounded">claude</code> as your CLI, two optional extras are available:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-gray-400 text-sm">
          <li>
            <strong className="text-gray-200">Caveman</strong> — the <a href="https://github.com/JuliusBrussee/caveman" className="text-brand-purple underline">Caveman</a> plugin is registered and installed via{' '}
            <code className="bg-white/10 text-brand-purple px-1 rounded">claude plugin install caveman@caveman</code>. Guarded so an existing install in the{' '}
            <code className="bg-white/10 text-brand-purple px-1 rounded">.claude</code> volume is not reinstalled on rebuild.
          </li>
          <li>
            <strong className="text-gray-200">awesome-claude-code-subagents</strong> — a shallow clone of{' '}
            <a href="https://github.com/VoltAgent/awesome-claude-code-subagents" className="text-brand-purple underline">VoltAgent's curated list</a> into{' '}
            <code className="bg-white/10 text-brand-purple px-1 rounded">/home/vscode/.claude/agents/awesome-subagents</code>, which lives
            inside the project-scoped <code className="bg-white/10 text-brand-purple px-1 rounded">.claude</code> Docker volume and persists across rebuilds.
          </li>
        </ul>
        <p className="text-gray-400 text-sm mt-3">
          Both extras default to <em>no</em> and are gated on <code className="bg-white/10 text-brand-purple px-1 rounded">cliName === 'claude'</code>; the prompts
          are simply skipped for other CLIs.
        </p>
      </section>

      {/* Writing prd.yaml */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3 text-brand-purple">Writing <code className="bg-white/10 text-brand-purple px-1 rounded">prd.yaml</code> Stories</h2>
        <p className="text-gray-400 text-sm mb-3">
          Open <code className="bg-white/10 text-brand-purple px-1 rounded">scripts/ralph/prd.yaml</code> and define your stories.
          Use your AI assistant or write them manually:
        </p>
        <CodeBlock lang="yaml">{prdYamlCode}</CodeBlock>
        <ul className="list-disc pl-5 space-y-1 text-gray-400 text-sm">
          <li><code className="bg-white/10 text-brand-purple px-1 rounded">branchName</code> — Ralph will commit to this branch.</li>
          <li><code className="bg-white/10 text-brand-purple px-1 rounded">priority</code> — lower number = implemented first.</li>
          <li><code className="bg-white/10 text-brand-purple px-1 rounded">passes</code> — Ralph sets this to <code className="bg-white/10 text-brand-purple px-1 rounded">true</code> when the story is complete.</li>
          <li><code className="bg-white/10 text-brand-purple px-1 rounded">acceptanceCriteria</code> — concrete, testable conditions Ralph must satisfy.</li>
        </ul>
      </section>

      {/* main_prd.md */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3 text-brand-purple">Defining Project Direction with <code className="bg-white/10 text-brand-purple px-1 rounded">main_prd.md</code> <span className="text-gray-500 text-base font-normal">(Optional)</span></h2>
        <p className="text-gray-400 text-sm mb-3">
          A <code className="bg-white/10 text-brand-purple px-1 rounded">main_prd.md</code> template is scaffolded for you. It acts as your "product manager" document —
          containing basic guidelines, user identification, requirements, and high-level objectives.
        </p>
        <p className="text-gray-400 text-sm mb-3">
          If you have rough ideas, ask your AI assistant to help turn them into a <code className="bg-white/10 text-brand-purple px-1 rounded">main_prd.md</code>.
          Polish this document yourself before running Ralph so it doesn't build in the wrong direction.
          If you already have clear requirements or just want to dive in, you can ignore this file.
        </p>
        <p className="text-gray-400 text-sm">
          Once your direction is clear, break goals into smaller stories in <code className="bg-white/10 text-brand-purple px-1 rounded">scripts/ralph/prd.yaml</code>.
        </p>
      </section>

      {/* Seeding progress.txt */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3 text-brand-purple">Seeding <code className="bg-white/10 text-brand-purple px-1 rounded">progress.txt</code></h2>
        <p className="text-gray-400 text-sm mb-3">
          Before the first run, seed <code className="bg-white/10 text-brand-purple px-1 rounded">scripts/ralph/progress.txt</code> with codebase context.
          Ralph appends a new entry after every story — patterns accumulate across iterations and are visible on the next run.
        </p>
        <CodeBlock lang="markdown">{progressTxtCode}</CodeBlock>
      </section>

      {/* Running ralph.sh */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3 text-brand-purple">Running <code className="bg-white/10 text-brand-purple px-1 rounded">ralph.sh</code></h2>
        <p className="text-gray-400 text-sm mb-3">
          Inside the container terminal, make the script executable and run it:
        </p>
        <CodeBlock lang="bash">{`chmod +x scripts/ralph/ralph.sh
./scripts/ralph/ralph.sh 25   # up to 25 iterations`}</CodeBlock>
        <p className="text-gray-400 text-sm mb-3">Each iteration Ralph will:</p>
        <ol className="list-decimal pl-5 space-y-1 text-gray-400 text-sm">
          <li>Read <code className="bg-white/10 text-brand-purple px-1 rounded">prd.yaml</code> for the next incomplete story.</li>
          <li>Read <code className="bg-white/10 text-brand-purple px-1 rounded">progress.txt</code> for accumulated codebase patterns.</li>
          <li>Implement the story, run typechecks and tests.</li>
          <li>Commit the change.</li>
          <li>Mark the story <code className="bg-white/10 text-brand-purple px-1 rounded">passes: true</code> and append learnings to <code className="bg-white/10 text-brand-purple px-1 rounded">progress.txt</code>.</li>
          <li>Output <code className="bg-white/10 text-brand-purple px-1 rounded">{'<promise>COMPLETE</promise>'}</code> when all stories are done.</li>
        </ol>
        <p className="text-gray-400 text-sm mt-3">
          The loop exits with code <code className="bg-white/10 text-brand-purple px-1 rounded">0</code> on completion,
          or code <code className="bg-white/10 text-brand-purple px-1 rounded">1</code> if MAX_ITERATIONS is reached first.
        </p>
      </section>

      {/* Scaffolded files */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3 text-brand-purple">Scaffolded Files</h2>
        <CodeBlock lang="bash">{`scripts/ralph/
├── ralph.sh          # the iteration loop
├── prompt.md         # per-iteration instructions for Claude
├── prd.yaml          # your task list (edit this before running)
└── progress.txt      # accumulated learnings (start with codebase context)`}</CodeBlock>
        <p className="text-gray-400 text-sm mb-3">The <code className="bg-white/10 text-brand-purple px-1 rounded">prompt.md</code> instructs Ralph on each iteration:</p>
        <CodeBlock lang="markdown">{promptMdCode}</CodeBlock>
      </section>



      {/* pnpm in Dev Containers */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3 text-brand-purple">Using pnpm in Dev Containers</h2>
        <p className="text-gray-400 text-sm mb-3">
          If your project uses <strong className="text-gray-200">pnpm</strong>, you'll hit a common friction point:
          every time the container is rebuilt, pnpm re-downloads and reinstalls all packages from scratch.
          Dev Containers are ephemeral — the container filesystem is discarded on rebuild, so nothing in
          <code className="bg-white/10 text-brand-purple px-1 mx-1 rounded">node_modules</code> or the pnpm store persists between rebuilds unless you explicitly mount a volume.
        </p>

        <h3 className="text-lg font-medium mb-2 text-gray-200">Option 1 — Named Docker Volume <span className="text-gray-500 text-sm font-normal">(easiest)</span></h3>
        <p className="text-gray-400 text-sm mb-2">
          Mount a named volume for both the pnpm store and <code className="bg-white/10 text-brand-purple px-1 rounded">node_modules</code>.
          Docker manages the volume lifecycle; it survives rebuilds automatically.
        </p>
        <CodeBlock lang="yaml">{`# Inside .devcontainer/devcontainer.json
"mounts": [
  "source=project-pnpm-store,target=/home/node/.local/share/pnpm/store,type=volume",
  "source=project-node-modules,target=\${containerWorkspaceFolder}/node_modules,type=volume"
],
"postCreateCommand": "pnpm install"`}</CodeBlock>

        <h3 className="text-lg font-medium mb-2 text-gray-200">Option 2 — Bind Mount Your Host's pnpm Store</h3>
        <p className="text-gray-400 text-sm mb-2">
          Reuse the pnpm store that already lives on your host machine. This means packages already cached
          on the host are available immediately inside the container — no re-download needed.
        </p>
        <CodeBlock lang="yaml">{`# Inside .devcontainer/devcontainer.json
"mounts": [
  "source=\${localEnv:HOME}/.local/share/pnpm/store,target=/home/node/.pnpm-store,type=bind,consistency=cached"
],
"postCreateCommand": "pnpm config set store-dir /home/node/.pnpm-store && pnpm install"`}</CodeBlock>

        <h3 className="text-lg font-medium mb-2 mt-4 text-gray-200">Key Considerations</h3>
        <ul className="list-disc pl-5 space-y-2 text-gray-400 text-sm">
          <li>
            <strong className="text-gray-200">Hard link limitations</strong> — pnpm normally saves disk space by hard-linking packages from its store into{' '}
            <code className="bg-white/10 text-brand-purple px-1 rounded">node_modules</code>.
            Hard links only work within the same filesystem. When the pnpm store and{' '}
            <code className="bg-white/10 text-brand-purple px-1 rounded">node_modules</code> are on different mounts inside the container,
            pnpm falls back to copying files instead. To avoid this, keep both on the same mount point.
          </li>
          <li>
            <strong className="text-gray-200">Permissions</strong> — if you bind-mount a host directory, the container user (usually{' '}
            <code className="bg-white/10 text-brand-purple px-1 rounded">node</code> or{' '}
            <code className="bg-white/10 text-brand-purple px-1 rounded">vscode</code>) must own it.
            Add a <code className="bg-white/10 text-brand-purple px-1 rounded">postCreateCommand</code> to fix ownership if needed:
            <CodeBlock lang="bash">{`sudo chown -R node:node /home/node/.pnpm-store`}</CodeBlock>
          </li>
          <li>
            <strong className="text-gray-200">Named volume vs bind mount</strong> — named volumes are simpler and require no host-side setup, but you lose
            visibility into the store contents. Bind mounts give you full access from the host but require the host path to exist and have correct permissions.
          </li>
        </ul>
      </section>

      {/* Tips */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3 text-brand-purple">Tips</h2>
        <h3 className="text-lg font-medium mb-2 text-gray-200">Running Docker</h3>
        <p className="text-gray-400 text-sm mb-4">
          Use <a href="https://github.com/abiosoft/colima" className="text-brand-purple underline">Colima</a> to provide a Docker runtime — it's open source and commercially safe.
          Docker Desktop works too, but be aware of its commercial licensing terms.
        </p>
        <h3 className="text-lg font-medium mb-2 text-gray-200">Container Resource Defaults</h3>
        <p className="text-gray-400 text-sm">
          When running in container mode, resources are often restricted by default.
          It's recommended to bump up CPU and memory allocation to prevent a slow isolated development environment.
        </p>
      </section>

      <p className="text-gray-600 text-sm italic mt-16">
        Honestly, we all need to learn from Ralph. It may be clueless, but it is very persistent.
      </p>
    </div>
  )
}
