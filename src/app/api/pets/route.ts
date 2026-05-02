import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();

  // Return pets not owned by the current user and not yet swiped
  const pets = db.prepare(`
    SELECT p.id, p.name, p.species, p.breed, p.age, p.description, p.photo_url,
           u.name as owner_name, u.location as owner_location, u.bio as owner_bio
    FROM pets p
    JOIN users u ON p.user_id = u.id
    WHERE p.user_id != ?
      AND p.id NOT IN (
        SELECT swiped_pet_id FROM swipes WHERE swiper_user_id = ?
      )
    ORDER BY p.created_at DESC
    LIMIT 20
  `).all(session.id, session.id);

  return NextResponse.json({ pets });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, species, breed, age, description, photo_url } = await req.json();

  if (!name || !species || !photo_url) {
    return NextResponse.json({ error: 'Name, species, and photo required' }, { status: 400 });
  }

  const db = getDb();
  const result = db
    .prepare('INSERT INTO pets (user_id, name, species, breed, age, description, photo_url) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(session.id, name, species, breed || '', age || null, description || '', photo_url);

  const pet = db
    .prepare('SELECT * FROM pets WHERE id = ?')
    .get(result.lastInsertRowid);

  return NextResponse.json({ pet });
}
