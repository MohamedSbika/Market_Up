import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Notification } from '@/models/Notification';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Topbar } from '@/components/dashboard/Topbar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect('/signin?callbackUrl=/dashboard');

  if (session.user.status === 'suspended') {
    redirect('/signin?error=ACCOUNT_SUSPENDED');
  }

  await connectDB();
  const unreadCount = await Notification.countDocuments({
    companyId: session.user.id,
    isRead: false,
  });

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F5F5F5' }}>
      <Sidebar
        userName={session.user.name ?? ''}
        userEmail={session.user.email ?? ''}
        unreadCount={unreadCount}
      />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar title="MARKET-UP" unreadCount={unreadCount} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
