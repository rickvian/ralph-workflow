import type { Metadata } from 'next'
import './globals.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export const metadata: Metadata = {
  title: {
    default: 'Ralph Workflow',
    template: '%s | Ralph Workflow',
  },
  description:
    'Turn a prepared feature backlog into tested, reviewable commits with your AI coding CLI.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-brand-bg text-gray-100">
        <Navbar />
        <main className="flex-1 pt-14">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
