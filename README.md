# PetsInvasion

A Tinder-style social app where pet owners upload their pets and swipe to connect with other pet lovers.

## Features

- **Register & Login** – Secure JWT-based authentication
- **Pet Profiles** – Upload photos and details about your pet (name, species, breed, age, description)
- **Swipe to Discover** – Tinder-style card swiping to like or pass on other pets
- **Matching System** – When both owners like each other's pets, it's a match!
- **Matches Page** – View all your pet connections

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS** for styling
- **SQLite** (via `better-sqlite3`) for local data storage
- **JWT** (via `jose`) for session management
- **bcryptjs** for password hashing

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to get started.

## How It Works

1. Create an account and upload your pet's photo and details
2. Browse other people's pets with the swipe interface
3. Swipe right (❤️) to like a pet, or left (✕) to pass
4. When both owners like each other's pets — it's a match!
5. See all your matches on the Matches page
