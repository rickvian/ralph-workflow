import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Safety & Control',
  description:
    'Understand local, isolated, and remote-Git Ralph Workflow setups before running an autonomous coding loop.',
}

const modes = [
  {
    title: 'Local-only trial',
    description: 'Scaffold Ralph and work with local Git. Use this to evaluate the loop without remote repository access.',
  },
  {
    title: 'Isolated container',
    description: 'Run in a VS Code Dev Container that clears common forwarded credentials before the agent starts.',
  },
  {
    title: 'Scoped remote access',
    description: 'Add a repository-scoped GitHub token only when the agent needs to push. Review the requested permissions before creating it.',
  },
]

export default function SafetyAndControlPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <header className="max-w-3xl mb-12">
        <p className="text-brand-purple text-sm font-semibold mb-3">SAFETY & CONTROL</p>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Choose the access Ralph needs—and no more.</h1>
        <p className="text-gray-400 text-lg leading-relaxed">
          Ralph runs an AI coding CLI with broad permission inside its chosen environment. The workflow gives you
          explicit setup choices; it does not make autonomous code execution risk-free.
        </p>
      </header>

      <section className="mb-14">
        <h2 className="text-2xl font-semibold mb-5">Start with the smallest mode that works</h2>
        <div className="grid md:grid-cols-3 gap-5">
          {modes.map((mode) => (
            <article key={mode.title} className="border border-white/10 bg-white/5 rounded-lg p-5">
              <h3 className="text-lg font-semibold text-brand-purple mb-2">{mode.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{mode.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-6 mb-14">
        <div>
          <h2 className="text-2xl font-semibold mb-4">What isolation helps with</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-400 text-sm leading-relaxed">
            <li>Reduces accidental exposure of common VS Code-forwarded credentials.</li>
            <li>Lets you provide a repository-scoped token instead of your normal host session.</li>
            <li>Separates project-specific container configuration from your daily development environment.</li>
          </ul>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">What isolation does not guarantee</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-400 text-sm leading-relaxed">
            <li>Does not make unreviewed code, dependencies, or network access inherently safe.</li>
            <li>Does not prevent the agent from changing files or consuming resources available in its workspace.</li>
            <li>Does not replace least-privilege credentials, iteration limits, or human review.</li>
          </ul>
        </div>
      </section>

      <section className="border border-white/10 bg-white/5 rounded-lg p-6 max-w-3xl">
        <h2 className="text-2xl font-semibold mb-4">Keep the loop under review</h2>
        <ol className="list-decimal pl-5 space-y-2 text-gray-400 text-sm leading-relaxed">
          <li>Keep stories small and acceptance criteria testable.</li>
          <li>Set an explicit iteration cap when running <code>ralph.sh</code>.</li>
          <li>Inspect the branch and commit history before merging or pushing further changes.</li>
          <li>Stop the loop and return to an interactive session when the task becomes ambiguous.</li>
        </ol>
      </section>

      <p className="mt-8 text-sm text-gray-400">
        Need the setup details? <Link href="/usage-guide" className="text-brand-purple hover:underline">Read the usage guide →</Link>
      </p>
    </div>
  )
}
