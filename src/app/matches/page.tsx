import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import MatchesClient from './MatchesClient';

export default async function MatchesPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#fff8f0' }}>
      <Navbar userName={session.name} />
      <MatchesClient />
    </div>
  );
}
