import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'petsinvasion.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema(db);
    seedDemoData(db);
  }
  return db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      bio TEXT DEFAULT '',
      location TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      species TEXT NOT NULL,
      breed TEXT DEFAULT '',
      age INTEGER,
      description TEXT DEFAULT '',
      photo_url TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS swipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      swiper_user_id INTEGER NOT NULL,
      swiped_pet_id INTEGER NOT NULL,
      direction TEXT NOT NULL CHECK(direction IN ('like', 'pass')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(swiper_user_id, swiped_pet_id),
      FOREIGN KEY (swiper_user_id) REFERENCES users(id),
      FOREIGN KEY (swiped_pet_id) REFERENCES pets(id)
    );

    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user1_id INTEGER NOT NULL,
      user2_id INTEGER NOT NULL,
      pet1_id INTEGER NOT NULL,
      pet2_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user1_id) REFERENCES users(id),
      FOREIGN KEY (user2_id) REFERENCES users(id),
      FOREIGN KEY (pet1_id) REFERENCES pets(id),
      FOREIGN KEY (pet2_id) REFERENCES pets(id)
    );
  `);
}

const DEMO_PETS = [
  {
    user: { name: 'Sarah M.', email: 'sarah@demo.petsinvasion', location: 'New York', bio: 'Dog mom of 2 🐶' },
    pet: { name: 'Max', species: 'dog', breed: 'Golden Retriever', age: 3, description: 'The friendliest boy you\'ll ever meet! Loves fetch, belly rubs, and stealing socks.', photo_url: 'https://images.dog.ceo/breeds/retriever-golden/n02099601_3004.jpg' },
  },
  {
    user: { name: 'Jake R.', email: 'jake@demo.petsinvasion', location: 'Los Angeles', bio: 'Cat dad & coffee lover ☕' },
    pet: { name: 'Luna', species: 'cat', breed: 'Tabby', age: 2, description: 'Sassy but sweet. Loves knocking things off shelves and cuddling at midnight.', photo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cat03.jpg/640px-Cat03.jpg' },
  },
  {
    user: { name: 'Emma L.', email: 'emma@demo.petsinvasion', location: 'Chicago', bio: 'Bunny parent & plant lover 🐰' },
    pet: { name: 'Coco', species: 'rabbit', breed: 'Holland Lop', age: 1, description: 'Tiny, fluffy, and absolutely adorable. Obsessed with fresh parsley and binkying around the garden.', photo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Oryctolagus_cuniculus_Rcdo.jpg/640px-Oryctolagus_cuniculus_Rcdo.jpg' },
  },
  {
    user: { name: 'Carlos V.', email: 'carlos@demo.petsinvasion', location: 'Miami', bio: 'Birds are life 🦜' },
    pet: { name: 'Rio', species: 'bird', breed: 'Parakeet', age: 2, description: 'Chatty little guy who loves singing along to pop music and learning new words. Currently knows 40!', photo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Monk_Parakeet_Feb_09.jpg/640px-Monk_Parakeet_Feb_09.jpg' },
  },
  {
    user: { name: 'Lily C.', email: 'lily@demo.petsinvasion', location: 'Seattle', bio: 'Multiple pets household 🏡' },
    pet: { name: 'Bella', species: 'dog', breed: 'Labrador', age: 4, description: 'Ball-obsessed, water-loving lab who firmly believes she is a lap dog despite being 35kg.', photo_url: 'https://images.dog.ceo/breeds/labrador/n02099712_3786.jpg' },
  },
  {
    user: { name: 'Owen B.', email: 'owen@demo.petsinvasion', location: 'Boston', bio: 'Rescue advocate 🐾' },
    pet: { name: 'Mochi', species: 'cat', breed: 'Scottish Fold', age: 3, description: 'Round little floof who judges you silently but loves you unconditionally. Adopted from a local shelter!', photo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Cat_November_2010-1a.jpg/640px-Cat_November_2010-1a.jpg' },
  },
  {
    user: { name: 'Priya K.', email: 'priya@demo.petsinvasion', location: 'Austin', bio: 'Husky mom — send help 😅' },
    pet: { name: 'Zeus', species: 'dog', breed: 'Husky', age: 2, description: 'Dramatic, loud, and absolutely loving. He holds full conversations and thinks he can sing. He cannot.', photo_url: 'https://images.dog.ceo/breeds/husky/n02110185_1469.jpg' },
  },
  {
    user: { name: 'Tom W.', email: 'tom@demo.petsinvasion', location: 'Denver', bio: 'Tiny pet, big personality 🐹' },
    pet: { name: 'Peanut', species: 'hamster', breed: 'Syrian', age: 1, description: 'Tiny escape artist extraordinaire. Always stuffing cheeks to maximum capacity and zooming on his wheel at 3am.', photo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Hamster_2702026_1920.jpg/640px-Hamster_2702026_1920.jpg' },
  },
];

function seedDemoData(db: Database.Database) {
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get('sarah@demo.petsinvasion');
  if (existing) return;

  const passwordHash = bcrypt.hashSync('demopassword', 10);

  for (const { user, pet } of DEMO_PETS) {
    const userResult = db
      .prepare('INSERT INTO users (name, email, password_hash, bio, location) VALUES (?, ?, ?, ?, ?)')
      .run(user.name, user.email, passwordHash, user.bio, user.location);

    db.prepare(
      'INSERT INTO pets (user_id, name, species, breed, age, description, photo_url) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(userResult.lastInsertRowid, pet.name, pet.species, pet.breed, pet.age, pet.description, pet.photo_url);
  }
}
