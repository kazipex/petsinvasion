import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProfileClient from './ProfileClient';

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect('/login');

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#fff8f0' }}>
      <Navbar userName={session.name} />
      <ProfileClient userName={session.name} />
    </div>
  );
}
