'use client';

import { useEffect, useState, useCallback } from 'react';
import SwipeCard, { Pet } from '@/components/SwipeCard';
import Link from 'next/link';

interface MatchData {
  name: string;
  photo_url: string;
  owner_name: string;
}

export default function DiscoverClient({ userId }: { userId: number }) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [hasPet, setHasPet] = useState(true);

  const loadPets = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/pets');
    if (res.ok) {
      const data = await res.json();
      setPets(data.pets);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Check if user has a pet
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      setHasPet(!!d.pet);
    });
    loadPets();
  }, [loadPets]);

  async function handleSwipe(petId: number, direction: 'like' | 'pass') {
    setPets(prev => prev.filter(p => p.id !== petId));

    const res = await fetch('/api/swipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pet_id: petId, direction }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.matched && data.matchData) {
        setMatchData(data.matchData);
      }
    }
  }

  function dismissMatch() {
    setMatchData(null);
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">🐾</div>
          <p className="text-gray-500">Finding cute pets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center py-6 px-4">
      {!hasPet && (
        <div className="w-full max-w-sm mb-4 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
          <p className="text-amber-700 text-sm font-medium">
            Add your pet first to get matches! 🐾
          </p>
          <Link href="/profile" className="text-amber-600 underline text-sm font-bold">
            Add my pet →
          </Link>
        </div>
      )}

      {pets.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-xs">
            <div className="text-7xl mb-6">🐕</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">All caught up!</h2>
            <p className="text-gray-500 mb-6">
              You&apos;ve seen all available pets. Check back later for more furry friends!
            </p>
            <button
              onClick={loadPets}
              className="px-6 py-3 bg-pink-500 text-white font-bold rounded-full hover:bg-pink-600 transition"
            >
              Refresh 🔄
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Card stack */}
          <div className="relative w-full max-w-sm" style={{ height: '520px' }}>
            {pets.slice(0, 3).map((pet, i) => (
              <div
                key={pet.id}
                className="absolute inset-0"
                style={{
                  transform: `scale(${1 - i * 0.04}) translateY(${i * 12}px)`,
                  zIndex: 3 - i,
                  transition: 'transform 0.3s ease',
                }}
              >
                <SwipeCard
                  pet={pet}
                  onSwipe={handleSwipe}
                  isTop={i === 0}
                />
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-6 mt-8">
            <button
              onClick={() => pets[0] && handleSwipe(pets[0].id, 'pass')}
              className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition border-2 border-gray-100 hover:border-red-200"
              title="Pass"
            >
              ✕
            </button>
            <button
              onClick={() => pets[0] && handleSwipe(pets[0].id, 'like')}
              className="w-20 h-20 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full shadow-lg flex items-center justify-center text-3xl hover:scale-110 transition"
              title="Like"
            >
              ❤️
            </button>
          </div>

          <p className="text-gray-400 text-sm mt-4">
            {pets.length} pet{pets.length !== 1 ? 's' : ''} to discover
          </p>
        </>
      )}

      {/* Match modal */}
      {matchData && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={dismissMatch}
        >
          <div
            className="bg-white rounded-3xl p-8 text-center max-w-sm w-full match-pop"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-black text-pink-500 mb-2">It&apos;s a Match!</h2>
            <p className="text-gray-600 mb-6">
              <strong>{matchData.owner_name}</strong> also liked your pet!
              You and <strong>{matchData.name}</strong> could be great friends!
            </p>
            <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-6 border-4 border-pink-300">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={matchData.photo_url} alt={matchData.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-3">
              <button
                onClick={dismissMatch}
                className="flex-1 py-3 border-2 border-gray-200 rounded-full font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                Keep Swiping
              </button>
              <Link
                href="/matches"
                className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full font-bold hover:opacity-90 transition text-center"
                onClick={dismissMatch}
              >
                See Matches ❤️
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
