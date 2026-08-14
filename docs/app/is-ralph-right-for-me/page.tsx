import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Is Ralph Right for Me?',
  description:
    'Decide when Ralph Workflow is a better fit than an interactive or one-shot AI coding session.',
}

const fitCases = [
  'You have 3–15 small stories with concrete acceptance criteria.',
  'Your project has checks the agent can run to validate each story.',
  'You want a resumable sequence of small commits to review later.',
]

const antiFitCases = [
  'You need a quick one-off fix or an exploratory conversation.',
  'The product, design, or technical direction is still unclear.',
  'The work is high-risk and requires continuous human judgment.',
]

export default function IsRalphRightForMePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <header className="max-w-3xl mb-12">
        <p className="text-brand-purple text-sm font-semibold mb-3">DECISION GUIDE</p>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Is Ralph right for this task?</h1>
        <p className="text-gray-400 text-lg leading-relaxed">
          Ralph is an execution loop for a prepared, testable backlog. It complements your AI coding CLI;
          it does not replace interactive engineering judgment.
        </p>
      </header>

      <section className="grid md:grid-cols-2 gap-6 mb-14" aria-label="Task fit guidance">
        <div className="border border-green-400/30 bg-green-400/5 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-green-300 mb-4">Use Ralph when</h2>
          <ul className="space-y-3 text-sm text-gray-300">
            {fitCases.map((item) => (
              <li key={item} className="flex gap-3">
                <span aria-hidden="true" className="text-green-300">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="border border-amber-300/30 bg-amber-300/5 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-amber-200 mb-4">Choose another workflow when</h2>
          <ul className="space-y-3 text-sm text-gray-300">
            {antiFitCases.map((item) => (
              <li key={item} className="flex gap-3">
                <span aria-hidden="true" className="text-amber-200">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mb-14">
        <h2 className="text-2xl font-semibold mb-5">One-shot session or Ralph loop?</h2>
        <div className="overflow-x-auto border border-white/10 rounded-lg">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="bg-white/5 text-gray-200">
              <tr>
                <th scope="col" className="p-4 font-semibold">Choose based on</th>
                <th scope="col" className="p-4 font-semibold">One-shot / interactive</th>
                <th scope="col" className="p-4 font-semibold">Ralph Workflow</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-gray-400">
              <tr>
                <th scope="row" className="p-4 text-gray-200 font-medium">Best task shape</th>
                <td className="p-4">One small change or an open-ended investigation.</td>
                <td className="p-4">Several independent stories with explicit acceptance criteria.</td>
              </tr>
              <tr>
                <th scope="row" className="p-4 text-gray-200 font-medium">Human involvement</th>
                <td className="p-4">Frequent direction and real-time review.</td>
                <td className="p-4">Prepare the backlog, then review tested commits at checkpoints.</td>
              </tr>
              <tr>
                <th scope="row" className="p-4 text-gray-200 font-medium">Working state</th>
                <td className="p-4">Conversation context is the main coordination mechanism.</td>
                <td className="p-4"><code>prd.yaml</code> and <code>progress.txt</code> make work resumable.</td>
              </tr>
              <tr>
                <th scope="row" className="p-4 text-gray-200 font-medium">Output</th>
                <td className="p-4">A completed change to inspect now.</td>
                <td className="p-4">A sequence of small commits with checks run per story.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="border border-brand-purple/40 bg-brand-purple/10 rounded-lg p-6 max-w-3xl">
        <h2 className="text-xl font-semibold mb-2">Your review still matters</h2>
        <p className="text-gray-300 text-sm leading-relaxed mb-4">
          Treat Ralph&apos;s commits as work submitted for review. Confirm the acceptance criteria, inspect the diff,
          run the checks you trust, and merge only what you accept.
        </p>
        <div className="flex flex-wrap gap-4 text-sm">
          <Link href="/how-it-works" className="text-brand-purple hover:underline">See the loop →</Link>
          <Link href="/safety-and-control" className="text-brand-purple hover:underline">Review safety controls →</Link>
        </div>
      </section>
    </div>
  )
}
