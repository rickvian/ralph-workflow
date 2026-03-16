import Link from 'next/link'

const features = [
  {
    title: 'Scaffold ralph script fast',
    description:
      'Works with Claude, Codex, Gemini, and Opencode. Pick your AI CLI during setup; ralph.sh pipes the same prompt loop to whichever you choose.',
  },
  {
    title: 'Dev Container Templates',
    description:
      'Leveraging VSCode Dev container to provide isolation for ralph loop. scaffold template pre-configures isolation, dependency, scripts to start coding immediately.',
  },
  {
    title: 'Credential Isolation',
    description:
      'ralph-workflow provides convenience to passing github PAT token if ralph needs it, perform credential cleaning within container programmatically',
  },
  {
    title: 'Ralph Task Loop',
    description:
      'Define stories in prd.yaml, run ralph.sh, and watch the agent implement, test, commit, and mark each story done — all without you touching the keyboard.',
  },
]

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="py-20 px-4 border-b border-white/10">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight">
            🔄 ralph-workflow
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Scaffold everything you need to run Ralph safely inside a VS Code Dev Container
            with isolated GitHub credentials and an autonomous AI coding loop.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/usage-guide"
              className="inline-block bg-brand-purple text-brand-bg font-semibold px-6 py-3 rounded hover:bg-brand-purple-light transition-colors"
            >
              Get Started
            </Link>
            <a
              href="https://github.com/rickvian/ralph-workflow"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block border border-white/20 text-gray-200 font-semibold px-6 py-3 rounded hover:border-brand-purple hover:text-brand-purple transition-colors"
            >
              GitHub ↗
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 border-b border-white/10">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">
            Why ralph-workflow?
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white/5 rounded-lg border border-white/10 p-6">
                <h3 className="text-lg font-semibold mb-2 text-brand-purple">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-10">
            <Link href="/how-it-works" className="text-brand-purple hover:underline">
              More about how it works ➡️
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">
            Quick Start
          </h2>
          <pre className="bg-black/40 border border-white/10 text-green-400 rounded-lg p-6 overflow-x-auto text-sm leading-relaxed">
            <code>{`$ npx ralph-workflow

? Set up VS Code Dev Container for isolation? (Y/n) Y
? Choose a Dev Container template: Node 20
? Set up GitHub repository with isolated PAT? (Y/n) Y
  → Open https://github.com/settings/personal-access-tokens/new
  → Select only this repository, grant Contents: write
? Paste your PAT: **********************************

✓ .devcontainer/devcontainer.json written
✓ scripts/ralph/ scaffolded
✓ PAT stored at ~/.ralph-pat

Reopen this folder in the Dev Container to start.`}</code>
          </pre>
          <p className="text-center mt-6 text-gray-400 text-sm">
            Then edit <code className="bg-white/10 text-brand-purple px-1 rounded">scripts/ralph/prd.yaml</code>,
            run{' '}
            <code className="bg-white/10 text-brand-purple px-1 rounded">./scripts/ralph/ralph.sh 25</code>,
            and let Ralph do the rest, safely in isolated environment{' '}
            <Link href="/usage-guide" className="text-brand-purple hover:underline">
              Full guide →
            </Link>
          </p>
        </div>
      </section>
    </>
  )
}
