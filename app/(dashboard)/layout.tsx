import { redirect } from 'next/navigation'
import { getSigmaSession } from '@/lib/auth'
import DashboardShell from '@/components/dashboard/DashboardShell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSigmaSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <DashboardShell userEmail={session.email}>
      {children}
    </DashboardShell>
  )
}
