import { ensureUserRecord } from '@/lib/auth'

export default async function DashboardPage() {
  const user = await ensureUserRecord()

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
      <p className="mb-6">Your app database user record is connected.</p>

      <div className="rounded-xl border p-4">
        <p><strong>Database User ID:</strong> {user?.id ?? 'Not found'}</p>
        <p><strong>Clerk User ID:</strong> {user?.clerk_user_id ?? 'Not found'}</p>
        <p><strong>Email:</strong> {user?.email ?? 'Not found'}</p>
      </div>
    </main>
  )
}