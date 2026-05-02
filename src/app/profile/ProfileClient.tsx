'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Pet {
  id: number;
  name: string;
  species: string;
  breed: string;
  age: number | null;
  description: string;
  photo_url: string;
}

const SPECIES = ['dog', 'cat', 'bird', 'rabbit', 'hamster', 'fish', 'reptile', 'other'];

export default function ProfileClient({ userName }: { userName: string }) {
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '',
    species: 'dog',
    breed: '',
    age: '',
    description: '',
  });

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        if (d.pet) {
          setPet(d.pet);
          setForm({
            name: d.pet.name,
            species: d.pet.species,
            breed: d.pet.breed || '',
            age: d.pet.age?.toString() || '',
            description: d.pet.description || '',
          });
          setPreview(d.pet.photo_url);
          setUploadedUrl(d.pet.photo_url);
        }
        setLoading(false);
      });
  }, []);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);
    setError('');

    const fd = new FormData();
    fd.append('file', file);

    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json();
    setUploading(false);

    if (!res.ok) {
      setError(data.error || 'Upload failed');
      setPreview(pet?.photo_url || null);
    } else {
      setUploadedUrl(data.url);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!uploadedUrl) {
      setError('Please upload a photo of your pet');
      return;
    }

    setSaving(true);
    setError('');

    const body = {
      name: form.name,
      species: form.species,
      breed: form.breed,
      age: form.age ? parseInt(form.age) : null,
      description: form.description,
      photo_url: uploadedUrl,
    };

    const res = await fetch('/api/pets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error || 'Failed to save pet');
    } else {
      setPet(data.pet);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-6xl animate-bounce">🐾</div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">
        {pet ? 'Update Your Pet' : 'Add Your Pet 🐾'}
      </h1>
      <p className="text-gray-500 mb-6">
        Hi <strong>{userName}</strong>! {pet ? 'Edit your pet\'s profile below.' : 'Tell us about your furry friend!'}
      </p>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 mb-4 text-sm font-medium">
          🎉 Pet profile saved! Start discovering!
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Photo upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Pet Photo *</label>
          <div
            className="relative w-full h-64 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50 cursor-pointer hover:border-pink-300 transition"
            onClick={() => fileRef.current?.click()}
          >
            {preview ? (
              <Image
                src={preview}
                alt="Pet preview"
                fill
                className="object-cover"
                unoptimized={preview.startsWith('blob:')}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                <div className="text-5xl mb-2">📷</div>
                <p className="font-medium">Click to upload photo</p>
                <p className="text-sm">JPEG, PNG, GIF, WebP · Max 5MB</p>
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <p className="text-white font-bold">Uploading...</p>
              </div>
            )}
            {preview && !uploading && (
              <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-lg">
                Click to change
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Pet Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pet Name *</label>
          <input
            type="text"
            required
            placeholder="Buddy, Whiskers, Tweety..."
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition"
          />
        </div>

        {/* Species */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Species *</label>
          <div className="grid grid-cols-4 gap-2">
            {SPECIES.map(s => {
              const emojis: Record<string, string> = {
                dog: '🐶', cat: '🐱', bird: '🐦', rabbit: '🐰',
                hamster: '🐹', fish: '🐟', reptile: '🦎', other: '🐾',
              };
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, species: s }))}
                  className={`py-2 rounded-xl text-center capitalize text-sm font-medium transition
                    ${form.species === s
                      ? 'bg-pink-500 text-white shadow-md'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-pink-300'}`}
                >
                  <div className="text-lg">{emojis[s]}</div>
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {/* Breed & Age */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
            <input
              type="text"
              placeholder="Golden Retriever..."
              value={form.breed}
              onChange={e => setForm(f => ({ ...f, breed: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age (years)</label>
            <input
              type="number"
              min="0"
              max="50"
              placeholder="3"
              value={form.age}
              onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">About your pet</label>
          <textarea
            rows={3}
            placeholder="Tell others what makes your pet special..."
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={saving || uploading}
          className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-xl hover:opacity-90 transition disabled:opacity-60 text-lg"
        >
          {saving ? 'Saving...' : pet ? 'Update Pet Profile ✨' : 'Save Pet & Start Swiping 🐾'}
        </button>
      </form>

      {pet && (
        <div className="mt-6 text-center">
          <Link
            href="/discover"
            className="text-pink-500 font-semibold hover:underline"
          >
            Back to discovering → 🔥
          </Link>
        </div>
      )}
    </div>
  );
}
