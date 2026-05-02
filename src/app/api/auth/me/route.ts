import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null });

  const db = getDb();
  const pet = db
    .prepare('SELECT id, name, species, breed, age, description, photo_url FROM pets WHERE user_id = ? ORDER BY created_at DESC LIMIT 1')
    .get(session.id) as { id: number; name: string; species: string; breed: string; age: number; description: string; photo_url: string } | undefined;

  return NextResponse.json({ user: session, pet: pet || null });
}
