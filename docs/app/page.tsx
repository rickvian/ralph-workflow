import Link from 'next/link'

const proofArtifacts = [
  'Starting commit and the complete PRD',
  'Command and explicit iteration cap',
  'Terminal record of the run and any retries',
  'Commit history and final diff',
  'Checks run for each completed story',
  'Human review decisions before merge',
]

const loopSteps = [
  {
    title: 'Prepare small stories',
    description: 'Describe testable acceptance criteria in prd.yaml before the loop starts.',
  },
  {
    title: 'Run the loop',
    description: 'Ralph selects the next unfinished story, carries forward project context, and runs your AI CLI.',
  },
  {
    title: 'Review commits',
    description: 'Inspect the tested changes and keep or reject them as you would any other submitted work.',
  },
]

export default function Home() {
  return (
    <>
      <section className="py-20 px-4 border-b border-white/10">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-brand-purple text-sm font-semibold mb-4">AUTONOMOUS FEATURE EXECUTION FOR YOUR AI CLI</p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-5 tracking-tight max-w-4xl mx-auto">
            Ship a prepared feature backlog while you&apos;re away.
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed">
            Ralph Workflow drives Claude, Codex, Gemini, or OpenCode through small, testable stories—preserving
            context, running checks, and creating reviewable commits. It is built for a bounded backlog, not a
            replacement for engineering judgment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/is-ralph-right-for-me"
              className="inline-block bg-brand-purple text-brand-bg font-semibold px-6 py-3 rounded hover:bg-brand-purple-light transition-colors"
            >
              Is Ralph right for me?
            </Link>
            <Link
              href="/how-it-works"
              className="inline-block border border-white/20 text-gray-200 font-semibold px-6 py-3 rounded hover:border-brand-purple hover:text-brand-purple transition-colors"
            >
              See the loop in action
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-white/10">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-3xl mb-8">
            <p className="text-brand-purple text-sm font-semibold mb-3">PROOF, NOT PROMISES</p>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Know what to inspect in a real Ralph run.</h2>
            <p className="text-gray-400 leading-relaxed">
              A credible autonomous run is reproducible and reviewable. Before relying on one, ask for these
              artifacts—not a polished claim that an agent “built an app.”
            </p>
          </div>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" aria-label="Proof artifacts">
            {proofArtifacts.map((artifact) => (
              <li key={artifact} className="border border-white/10 bg-white/5 rounded-lg p-4 text-sm text-gray-300 flex gap-3">
                <span aria-hidden="true" className="text-brand-purple">✓</span>
                <span>{artifact}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-white/10">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">A loop with clear checkpoints</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {loopSteps.map((step, index) => (
              <article key={step.title} className="border border-white/10 bg-white/5 rounded-lg p-6">
                <p className="font-mono text-brand-purple text-sm mb-4">0{index + 1}</p>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
              </article>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/how-it-works" className="text-brand-purple hover:underline">Explore the Ralph loop →</Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-white/10">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-[1.25fr_1fr] gap-10 items-start">
          <div>
            <p className="text-brand-purple text-sm font-semibold mb-3">START WITH TASK FIT</p>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ralph is not the right tool for every task.</h2>
            <p className="text-gray-400 leading-relaxed mb-5">
              Use an interactive session for a one-off change or unclear direction. Use Ralph when you have several
              independently verifiable stories and want a resumable sequence of commits to review.
            </p>
            <Link href="/is-ralph-right-for-me" className="text-brand-purple hover:underline">
              Compare Ralph with a one-shot session →
            </Link>
          </div>
          <aside className="border border-brand-purple/40 bg-brand-purple/10 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3">Add isolation when you need it</h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              Start locally to evaluate the loop. Add a Dev Container and a scoped GitHub token only when your
              unattended run needs that access.
            </p>
            <Link href="/safety-and-control" className="text-brand-purple hover:underline text-sm">
              Review safety and control options →
            </Link>
          </aside>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to prepare a backlog?</h2>
          <p className="text-gray-400 mb-7">
            Start with a small, local run. Keep stories testable, cap iterations, and review every commit before merge.
          </p>
          <Link
            href="/usage-guide"
            className="inline-block border border-brand-purple text-brand-purple font-semibold px-6 py-3 rounded hover:bg-brand-purple hover:text-brand-bg transition-colors"
          >
            Read the setup guide →
          </Link>
        </div>
      </section>
    </>
  )
}
