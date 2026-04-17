import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How It Works — Ralph Workflow',
}

const steps = [
  {
    id: '01',
    title: 'Read prd.yaml',
    description:
      'Each iteration Ralph reads prd.yaml and picks the highest-priority story where passes: false.',
    file: 'prd.yaml',
  },
  {
    id: '02',
    title: 'Load codebase context',
    description:
      'progress.txt is read for accumulated patterns and gotchas from previous iterations, giving Ralph growing institutional knowledge.',
    file: 'progress.txt',
  },
  {
    id: '03',
    title: 'Pipe prompt to AI CLI',
    description:
      'ralph.sh pipes prompt.md through the chosen AI CLI (claude, codex, gemini, or opencode) with --dangerously-skip-permissions so it can read, write, and run commands autonomously.',
    file: 'ralph.sh',
  },
  {
    id: '04',
    title: 'Implement & test',
    description:
      'The agent implements the story, runs typecheck and tests. If they fail, it fixes and retries within the same iteration.',
    file: 'prompt.md',
  },
  {
    id: '05',
    title: 'Commit the change',
    description:
      'On passing checks the agent commits with the message format feat: [ID] - [Title], creating a clean, traceable history.',
    file: 'ralph.sh',
  },
  {
    id: '06',
    title: 'Mark done & log learnings',
    description:
      'prd.yaml is updated to passes: true and new patterns are appended to progress.txt for future iterations.',
    file: 'progress.txt',
  },
  {
    id: '07',
    title: 'Check completion',
    description:
      'If all stories pass, the agent outputs <promise>COMPLETE</promise> and ralph.sh exits successfully. Otherwise the loop repeats.',
    file: 'ralph.sh',
  },
]

export default function HowItWorksPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6">How It Works</h1>

      <section className="mb-16">
        <h2 className="text-xl font-semibold mb-4 text-brand-purple">Ralph workflow idea</h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-4">
          Ralph runs with <code className="bg-white/10 text-brand-purple px-1 rounded">--dangerously-skip-permissions</code> (or similar),
          which means it has full access to whatever credentials are available inside
          the container. The Dev Container setup limits blast radius by:
        </p>


        <p className="text-gray-400 text-sm leading-relaxed mb-6">
          The Dev Container acts as a hard boundary. VS Code credential-forwarding is neutralized by a
          <code className="bg-white/10 text-brand-purple px-1 mx-1 rounded">postStart</code>
          hook before Ralph runs. The only credential Ralph ever sees is a fine-grained PAT you mount
          from your host — scoped to one repo.
        </p>

        <p className="text-gray-400 text-sm leading-relaxed mb-6">
          VSCode dev container is well integrated with VSCode IDE which makes it convenient to quickly reopens project in container anytime.
        </p>


        <p className="text-gray-400 text-sm leading-relaxed mb-4">
          <p>ralph-workflow provide convenience for you to scaffolds those things up</p>
        </p>
        <div className="overflow-x-auto mb-2">
          <svg
            viewBox="0 0 760 310"
            className="w-full max-w-3xl"
            aria-label="Dev Container isolation diagram"
          >
            <defs>
              <marker id="arr-green" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
                <path d="M0,0 L7,3.5 L0,7 Z" fill="#4ade80" fillOpacity="0.8" />
              </marker>
              <marker id="arr-purple" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
                <path d="M0,0 L7,3.5 L0,7 Z" fill="#b39aff" fillOpacity="0.7" />
              </marker>
            </defs>

            {/* Host machine outer boundary */}
            <rect x="4" y="4" width="752" height="300" rx="12"
              fill="none" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="1.5" strokeDasharray="7 5" />
            <text x="18" y="22" fill="#ffffff" fillOpacity="0.25" fontSize="10" fontFamily="monospace" fontWeight="bold">HOST MACHINE</text>

            {/* Host-only credentials panel (left, outside container) */}
            <rect x="14" y="34" width="158" height="255" rx="8"
              fill="#1f0f0f" stroke="#ff6b6b" strokeOpacity="0.25" strokeWidth="1" />
            <text x="93" y="56" textAnchor="middle" fill="#ff6b6b" fillOpacity="0.6"
              fontSize="9.5" fontFamily="monospace" fontWeight="bold">HOST ONLY</text>
            {[
              '🔑  SSH keys',
              '🐙  Full GitHub session',
              '☁️  Cloud credentials',
              '🏢  All org repos',
            ].map((item, i) => (
              <text key={i} x="93" y={78 + i * 18} textAnchor="middle"
                fill="#aaa" fontSize="9" fontFamily="monospace">{item}</text>
            ))}
            {/* blocked label */}
            <rect x="28" y="162" width="130" height="22" rx="4" fill="#ff6b6b" fillOpacity="0.12" />
            <text x="93" y="177" textAnchor="middle" fill="#ff6b6b" fillOpacity="0.7"
              fontSize="9" fontFamily="monospace" fontWeight="bold">✗  NOT accessible in container</text>

            {/* PAT mount arrow (only thing that flows into container) */}
            <text x="93" y="218" textAnchor="middle" fill="#4ade80" fillOpacity="0.7"
              fontSize="9" fontFamily="monospace">Fine-grained PAT</text>
            <text x="93" y="232" textAnchor="middle" fill="#4ade80" fillOpacity="0.5"
              fontSize="8" fontFamily="monospace">(mount from host)</text>
            <line x1="173" y1="225" x2="188" y2="225"
              stroke="#4ade80" strokeOpacity="0.7" strokeWidth="1.5" markerEnd="url(#arr-green)" />

            {/* Dev Container box */}
            <rect x="190" y="22" width="560" height="275" rx="10"
              fill="#0f0a1e" stroke="#b39aff" strokeOpacity="0.55" strokeWidth="1.5" />
            <text x="208" y="42" fill="#b39aff" fillOpacity="0.85"
              fontSize="11" fontFamily="monospace" fontWeight="bold">Dev Container</text>

            {/* postStart blanked section (right side inside container) */}
            <rect x="420" y="52" width="315" height="230" rx="8"
              fill="#1f0f0f" stroke="#ff6b6b" strokeOpacity="0.3" strokeWidth="1" />
            <text x="577" y="72" textAnchor="middle" fill="#ff6b6b" fillOpacity="0.65"
              fontSize="9.5" fontFamily="monospace" fontWeight="bold">Blanked by postStart hook</text>
            {[
              'GIT_ASKPASS',
              'VSCODE_GIT_ASKPASS',
              'VSCODE_GIT_IPC_HANDLE',
              'SSH_AUTH_SOCK',
              'GITHUB_TOKEN  (VS Code session)',
            ].map((env, i) => (
              <g key={i} transform={`translate(435, ${92 + i * 32})`}>
                <rect width="285" height="24" rx="4" fill="#2a0f0f" />
                <text x="12" y="16" fill="#ff6b6b" fillOpacity="0.5" fontSize="9" fontFamily="monospace">✗</text>
                <text x="26" y="16" fill="#ccc" fillOpacity="0.5" fontSize="9" fontFamily="monospace">{env}</text>
              </g>
            ))}

            {/* Ralph process box */}
            <rect x="205" y="52" width="195" height="85" rx="8"
              fill="#2a1f4a" stroke="#b39aff" strokeOpacity="0.45" strokeWidth="1" />
            <text x="302" y="74" textAnchor="middle" fill="#b39aff"
              fontSize="11" fontFamily="monospace" fontWeight="bold">Ralph + AI CLI</text>
            <text x="302" y="91" textAnchor="middle" fill="#b39aff" fillOpacity="0.55"
              fontSize="8.5" fontFamily="monospace">--dangerously-skip-permissions</text>
            <text x="302" y="107" textAnchor="middle" fill="#b39aff" fillOpacity="0.55"
              fontSize="8.5" fontFamily="monospace">reads/writes/runs commands freely</text>
            <text x="302" y="122" textAnchor="middle" fill="#b39aff" fillOpacity="0.4"
              fontSize="8" fontFamily="monospace">inside container only</text>

            {/* Accessible resources box */}
            <rect x="205" y="152" width="195" height="130" rx="8"
              fill="#0f2a0f" stroke="#4ade80" strokeOpacity="0.4" strokeWidth="1" />
            <text x="302" y="172" textAnchor="middle" fill="#4ade80" fillOpacity="0.75"
              fontSize="9.5" fontFamily="monospace" fontWeight="bold">Accessible to Ralph</text>

            {/* PAT item */}
            <rect x="218" y="180" width="169" height="38" rx="5" fill="#0a1f0a" />
            <text x="302" y="196" textAnchor="middle" fill="#4ade80" fillOpacity="0.8"
              fontSize="9" fontFamily="monospace" fontWeight="bold">Fine-grained PAT</text>
            <text x="302" y="210" textAnchor="middle" fill="#4ade80" fillOpacity="0.55"
              fontSize="8.5" fontFamily="monospace">scope: 1 repo • Contents: write</text>

            {/* Repo item */}
            <rect x="218" y="224" width="169" height="38" rx="5" fill="#0a1f0a" />
            <text x="302" y="240" textAnchor="middle" fill="#4ade80" fillOpacity="0.8"
              fontSize="9" fontFamily="monospace" fontWeight="bold">Repo code (cloned)</text>
            <text x="302" y="254" textAnchor="middle" fill="#4ade80" fillOpacity="0.55"
              fontSize="8.5" fontFamily="monospace">read + write within container</text>

            {/* Ralph → accessible arrow */}
            <line x1="302" y1="138" x2="302" y2="150"
              stroke="#4ade80" strokeOpacity="0.5" strokeWidth="1.5" markerEnd="url(#arr-green)" />

            {/* Blast radius label */}
            <rect x="205" y="292" width="565" height="0" />
          </svg>
        </div>
        {/* blast radius callout below diagram */}
        <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm max-w-3xl mb-3">
          <span className="text-brand-purple font-bold flex-shrink-0">Credential blanking</span>
          <span className="text-gray-400">
            <span>
              A <code className="bg-white/10 text-brand-purple px-1 rounded">postStart</code> script clears
              VS Code's credential-forwarding env vars (<code className="bg-white/10 text-brand-purple px-1 rounded">GIT_ASKPASS</code>,{' '}
              <code className="bg-white/10 text-brand-purple px-1 rounded">VSCODE_GIT_*</code>,{' '}
              <code className="bg-white/10 text-brand-purple px-1 rounded">SSH_AUTH_SOCK</code>,{' '}
              <code className="bg-white/10 text-brand-purple px-1 rounded">GITHUB_TOKEN</code>) before
              Ralph ever runs.
            </span>
          </span>
        </div>

        <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm max-w-3xl mb-3">
          <span className="text-brand-purple font-bold flex-shrink-0">Fine-grained PAT</span>
          <span className="text-gray-400">
            Even with full freedom inside the container, Ralph can only push to the single repository
            the PAT is scoped to. Your host SSH keys, other GitHub repos, cloud accounts, and
            org-wide access are never reachable.
          </span>
        </div>

        <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm max-w-3xl mb-3">
          <span className="text-brand-purple font-bold flex-shrink-0">Blast radius limitation</span>
          <span className="text-gray-400">
            Even if Ralph goes off-script, it can only push to the single repository
            the PAT is scoped to. No access to other repos, cloud accounts, or host
            SSH keys.
          </span>
        </div>

        <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm max-w-3xl mb-3">
          <span className="text-brand-purple font-bold flex-shrink-0">Multi-project isolation</span>
          <span className="text-gray-400">
            Each project gets its own Docker volumes —{' '}
            <code className="bg-white/10 text-brand-purple px-1 rounded">gh-config-&lt;project&gt;</code> and{' '}
            <code className="bg-white/10 text-brand-purple px-1 rounded">claude-agents-vol-&lt;project&gt;</code>.
            Switching between ralph projects never overwrites another project{"'"}s gh or Claude auth state.
            The PAT is stored in{' '}
            <code className="bg-white/10 text-brand-purple px-1 rounded">.ralph/token</code> inside the project
            directory and mounted via{' '}
            <code className="bg-white/10 text-brand-purple px-1 rounded">${'{localWorkspaceFolder}'}/.ralph/token</code>,
            so the same <code className="bg-white/10 text-brand-purple px-1 rounded">devcontainer.json</code> works on macOS, Linux, and Windows.
          </span>
        </div>

      </section>

      {/* Step-by-step */}
      <section className="mb-16">
        <h2 className="text-xl font-semibold mb-4 text-brand-purple">The Ralph Loop</h2>
        <p className="text-gray-400 mb-12 text-lg">
          Ralph is a bash loop that drives an AI CLI through your task list until
          every story is marked done.
        </p>
        {/* Flow diagram — inline SVG */}
        <div className="overflow-x-auto mb-10">
          <svg
            viewBox="0 0 680 90"
            className="w-full max-w-2xl"
            aria-label="Ralph loop flow diagram"
          >
            {/* boxes */}
            {[
              'Read\nprd.yaml',
              'Load\ncontext',
              'Pipe to\nAI CLI',
              'Implement\n& test',
              'Commit',
              'Mark done\n& log',
              'All done?',
            ].map((label, i) => (
              <g key={i} transform={`translate(${i * 97 + 2}, 10)`}>
                <rect width="88" height="50" rx="6" fill="#2a1f4a" stroke="#b39aff" strokeWidth="1" strokeOpacity="0.4" />
                {label.split('\n').map((line, li) => (
                  <text
                    key={li}
                    x="44"
                    y={li === 0 ? 20 : 36}
                    textAnchor="middle"
                    fill="#b39aff"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {line}
                  </text>
                ))}
              </g>
            ))}
            {/* arrows between boxes */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <line
                key={i}
                x1={i * 97 + 91}
                y1="35"
                x2={i * 97 + 99}
                y2="35"
                stroke="#b39aff"
                strokeOpacity="0.5"
                strokeWidth="1.5"
                markerEnd="url(#arr)"
              />
            ))}
            {/* loop-back arrow under boxes */}
            <path
              d="M 665 60 Q 665 80 340 80 Q 15 80 15 60"
              fill="none"
              stroke="#b39aff"
              strokeOpacity="0.4"
              strokeWidth="1.5"
              strokeDasharray="4 3"
              markerEnd="url(#arr)"
            />
            <text x="340" y="77" textAnchor="middle" fill="#b39aff" fillOpacity="0.5" fontSize="9" fontFamily="monospace">
              not done → repeat
            </text>
            <defs>
              <marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="#b39aff" fillOpacity="0.5" />
              </marker>
            </defs>
          </svg>
        </div>

        {/* Steps list */}
        <ol className="space-y-6">
          {steps.map((step) => (
            <li key={step.id} className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-brand-purple text-brand-bg rounded-full flex items-center justify-center text-xs font-mono font-bold">
                {step.id}
              </span>
              <div>
                <h3 className="font-semibold mb-1 text-gray-100">
                  {step.title}{' '}
                  <code className="text-xs bg-white/10 text-brand-purple px-1.5 py-0.5 rounded">
                    {step.file}
                  </code>
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Key files */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-brand-purple">Key Files</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          {[
            {
              name: 'ralph.sh',
              role: 'The iteration loop. Pipes prompt.md into the AI CLI and checks for the COMPLETE marker.',
            },
            {
              name: 'prompt.md',
              role: 'Per-iteration instructions. Tells the agent which story to pick, how to commit, and when to stop.',
            },
            {
              name: 'prd.yaml',
              role: 'Your task list. Stories with passes: false are picked up; Ralph flips them to true when done.',
            },
            {
              name: 'progress.txt',
              role: 'Accumulated codebase patterns. Ralph reads this at the start of each iteration and appends new learnings at the end.',
            },
          ].map((f) => (
            <div key={f.name} className="border border-white/10 bg-white/5 rounded-lg p-4">
              <code className="font-mono font-semibold text-brand-purple">{f.name}</code>
              <p className="text-gray-400 mt-1">{f.role}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
