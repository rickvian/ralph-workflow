'use client'

import Link from 'next/link'
import { useState } from 'react'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/is-ralph-right-for-me', label: 'Is Ralph for me?' },
  { href: '/usage-guide', label: 'Usage Guide' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/safety-and-control', label: 'Safety & Control' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm bg-brand-bg/10 border-b border-white/10 text-white">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/" className="font-bold text-lg tracking-tight flex items-center gap-2">
          🔄 ralph-workflow
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className="text-gray-300 hover:text-brand-purple transition-colors">
              {l.label}
            </Link>
          ))}
          <a
            href="https://github.com/rickvian/ralph-workflow"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-brand-purple transition-colors"
          >
            GitHub ↗
          </a>
        </div>

        {/* Hamburger button */}
        <button
          className="md:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand-purple"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-brand-bg/95 border-t border-white/10 px-4 pb-4 flex flex-col gap-3 text-sm">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-gray-300 hover:text-brand-purple transition-colors"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <a
            href="https://github.com/rickvian/ralph-workflow"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-brand-purple transition-colors"
            onClick={() => setOpen(false)}
          >
            GitHub ↗
          </a>
        </div>
      )}
    </nav>
  )
}
