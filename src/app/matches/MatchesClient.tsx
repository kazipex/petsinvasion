'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Match {
  id: number;
  created_at: string;
  other_user_name: string;
  other_user_bio: string;
  my_pet_name: string;
  my_pet_photo: string;
  their_pet_name: string;
  their_pet_photo: string;
  their_pet_species: string;
  their_pet_breed: string;
}

export default function MatchesClient() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/matches')
      .then(r => r.json())
      .then(d => {
        setMatches(d.matches || []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-6xl animate-bounce">❤️</div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Your Matches ❤️
        <span className="ml-2 text-lg font-normal text-gray-400">({matches.length})</span>
      </h1>

      {matches.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-7xl mb-6">🐾</div>
          <h2 className="text-xl font-bold text-gray-600 mb-2">No matches yet</h2>
          <p className="text-gray-400 mb-6">Start swiping to find your pet&apos;s new friends!</p>
          <Link
            href="/discover"
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-full hover:opacity-90 transition"
          >
            Start Discovering 🔥
          </Link>
        </div>
      ) : (
        <div className="space-y-4 fade-in">
          {matches.map(match => (
            <div
              key={match.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4"
            >
              {/* Pet photos */}
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-pink-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={match.their_pet_photo} alt={match.their_pet_name} className="object-cover w-full h-full" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full overflow-hidden border-2 border-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={match.my_pet_photo} alt={match.my_pet_name} className="object-cover w-full h-full" />
                </div>
              </div>

              {/* Match info */}
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-800">
                  {match.their_pet_name}
                  <span className="text-pink-400 mx-1">❤️</span>
                  {match.my_pet_name}
                </div>
                <p className="text-sm text-gray-500 truncate">
                  Owner: <span className="font-medium">{match.other_user_name}</span>
                </p>
                {match.their_pet_breed && (
                  <p className="text-xs text-gray-400 capitalize">
                    {match.their_pet_species} · {match.their_pet_breed}
                  </p>
                )}
                <p className="text-xs text-gray-300 mt-1">
                  Matched {new Date(match.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="text-2xl flex-shrink-0">🐾</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
