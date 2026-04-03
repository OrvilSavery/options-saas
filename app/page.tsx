import Link from 'next/link'

export default function Home() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-semibold mb-4">Options SaaS</h1>
      <p className="mb-6">Auth is working. Database is set up. Next step is connecting the signed-in user.</p>

      <Link
        href="/dashboard"
        className="inline-flex rounded-full bg-black text-white px-5 py-3"
      >
        Go to Dashboard
      </Link>
    </main>
  )
}