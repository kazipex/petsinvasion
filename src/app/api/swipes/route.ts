import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { pet_id, direction } = await req.json();

  if (!pet_id || !['like', 'pass'].includes(direction)) {
    return NextResponse.json({ error: 'Invalid swipe data' }, { status: 400 });
  }

  const db = getDb();

  // Record swipe
  db.prepare(
    'INSERT OR IGNORE INTO swipes (swiper_user_id, swiped_pet_id, direction) VALUES (?, ?, ?)'
  ).run(session.id, pet_id, direction);

  let matched = false;
  let matchData = null;

  if (direction === 'like') {
    // Check if the owner of this pet has liked any of the current user's pets
    const myPet = db
      .prepare('SELECT id FROM pets WHERE user_id = ? ORDER BY created_at DESC LIMIT 1')
      .get(session.id) as { id: number } | undefined;

    if (myPet) {
      const theirPet = db
        .prepare('SELECT p.user_id FROM pets p WHERE p.id = ?')
        .get(pet_id) as { user_id: number } | undefined;

      if (theirPet) {
        const mutualLike = db.prepare(`
          SELECT s.id FROM swipes s
          JOIN pets p ON s.swiped_pet_id = p.id
          WHERE s.swiper_user_id = ?
            AND p.user_id = ?
            AND s.direction = 'like'
        `).get(theirPet.user_id, session.id);

        if (mutualLike) {
          // Check no existing match
          const existingMatch = db.prepare(`
            SELECT id FROM matches
            WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
          `).get(session.id, theirPet.user_id, theirPet.user_id, session.id);

          if (!existingMatch) {
            db.prepare(
              'INSERT INTO matches (user1_id, user2_id, pet1_id, pet2_id) VALUES (?, ?, ?, ?)'
            ).run(session.id, theirPet.user_id, myPet.id, pet_id);

            matched = true;
            const matchedPet = db
              .prepare('SELECT p.name, p.photo_url, u.name as owner_name FROM pets p JOIN users u ON p.user_id = u.id WHERE p.id = ?')
              .get(pet_id);
            matchData = matchedPet;
          }
        }
      }
    }
  }

  return NextResponse.json({ ok: true, matched, matchData });
}
