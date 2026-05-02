import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();

  const matches = db.prepare(`
    SELECT
      m.id,
      m.created_at,
      -- Other user's info
      CASE WHEN m.user1_id = ? THEN u2.name ELSE u1.name END as other_user_name,
      CASE WHEN m.user1_id = ? THEN u2.bio ELSE u1.bio END as other_user_bio,
      -- My pet
      CASE WHEN m.user1_id = ? THEN p1.name ELSE p2.name END as my_pet_name,
      CASE WHEN m.user1_id = ? THEN p1.photo_url ELSE p2.photo_url END as my_pet_photo,
      -- Their pet
      CASE WHEN m.user1_id = ? THEN p2.name ELSE p1.name END as their_pet_name,
      CASE WHEN m.user1_id = ? THEN p2.photo_url ELSE p1.photo_url END as their_pet_photo,
      CASE WHEN m.user1_id = ? THEN p2.species ELSE p1.species END as their_pet_species,
      CASE WHEN m.user1_id = ? THEN p2.breed ELSE p1.breed END as their_pet_breed
    FROM matches m
    JOIN users u1 ON m.user1_id = u1.id
    JOIN users u2 ON m.user2_id = u2.id
    JOIN pets p1 ON m.pet1_id = p1.id
    JOIN pets p2 ON m.pet2_id = p2.id
    WHERE m.user1_id = ? OR m.user2_id = ?
    ORDER BY m.created_at DESC
  `).all(
    session.id, session.id, session.id, session.id,
    session.id, session.id, session.id, session.id,
    session.id, session.id
  );

  return NextResponse.json({ matches });
}
