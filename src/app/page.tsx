import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await getSession();
  if (session) redirect('/discover');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
         style={{ background: 'linear-gradient(135deg, #ff9a9e 0%, #ffecd2 50%, #a18cd1 100%)' }}>
      <div className="text-center max-w-lg">
        <div className="text-8xl mb-6">🐾</div>
        <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
          PetsInvasion
        </h1>
        <p className="text-xl text-white/90 mb-10 leading-relaxed">
          Swipe right on adorable pets. Find playmates for your furry friend.
          Connect with pet lovers in your area.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="px-8 py-4 bg-white text-pink-500 font-bold rounded-full text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            Get Started 🐶
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 bg-white/20 text-white font-bold rounded-full text-lg border-2 border-white hover:bg-white/30 transition-all"
          >
            Sign In
          </Link>
        </div>
        <div className="mt-16 grid grid-cols-3 gap-6 text-center">
          {[
            { emoji: '📸', title: 'Upload', desc: 'Share your pet\'s cutest photos' },
            { emoji: '❤️', title: 'Swipe', desc: 'Like pets you think are adorable' },
            { emoji: '🤝', title: 'Match', desc: 'Connect when both owners like back' },
          ].map(({ emoji, title, desc }) => (
            <div key={title} className="bg-white/20 rounded-2xl p-4 text-white">
              <div className="text-3xl mb-2">{emoji}</div>
              <div className="font-bold mb-1">{title}</div>
              <div className="text-sm text-white/80">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
