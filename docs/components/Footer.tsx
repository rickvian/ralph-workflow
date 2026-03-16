export default function Footer() {
  return (
    <footer className="border-t border-white/10 text-gray-400 text-sm mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span>🔄 ralph-workflow — AI-driven dev loop</span>
        <div className="flex gap-5">
          <a
            href="https://www.npmjs.com/package/ralph-workflow"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-brand-purple transition-colors"
          >
            npm ↗
          </a>
          <a
            href="https://github.com/rickvian/ralph-workflow"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-brand-purple transition-colors"
          >
            GitHub ↗
          </a>
        </div>
      </div>
    </footer>
  )
}
