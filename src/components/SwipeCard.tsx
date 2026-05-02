'use client';

import { useRef, useState } from 'react';

export interface Pet {
  id: number;
  name: string;
  species: string;
  breed: string;
  age: number | null;
  description: string;
  photo_url: string;
  owner_name: string;
  owner_location: string;
  owner_bio: string;
}

interface SwipeCardProps {
  pet: Pet;
  onSwipe: (petId: number, direction: 'like' | 'pass') => void;
  isTop: boolean;
}

export default function SwipeCard({ pet, onSwipe, isTop }: SwipeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const currentX = useRef(0);
  const isDragging = useRef(false);
  const [dragX, setDragX] = useState(0);
  const [gone, setGone] = useState(false);

  function onPointerDown(e: React.PointerEvent) {
    if (!isTop) return;
    isDragging.current = true;
    startX.current = e.clientX;
    startY.current = e.clientY;
    cardRef.current?.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!isDragging.current || !isTop) return;
    const dx = e.clientX - startX.current;
    currentX.current = dx;
    setDragX(dx);
  }

  function onPointerUp() {
    if (!isDragging.current || !isTop) return;
    isDragging.current = false;

    const threshold = 100;
    if (currentX.current > threshold) {
      flyOut('like');
    } else if (currentX.current < -threshold) {
      flyOut('pass');
    } else {
      setDragX(0);
    }
  }

  function flyOut(direction: 'like' | 'pass') {
    if (gone) return;
    setGone(true);
    setDragX(direction === 'like' ? 600 : -600);
    setTimeout(() => onSwipe(pet.id, direction), 300);
  }

  const rotate = dragX * 0.08;
  const likeOpacity = Math.min(Math.max(dragX / 100, 0), 1);
  const passOpacity = Math.min(Math.max(-dragX / 100, 0), 1);

  const speciesEmoji: Record<string, string> = {
    dog: '🐶', cat: '🐱', bird: '🐦', rabbit: '🐰',
    hamster: '🐹', fish: '🐟', reptile: '🦎', other: '🐾',
  };
  const emoji = speciesEmoji[pet.species.toLowerCase()] || '🐾';

  return (
    <div
      ref={cardRef}
      className="swipe-card absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{
        transform: `translateX(${dragX}px) rotate(${rotate}deg)`,
        transition: isDragging.current ? 'none' : 'transform 0.3s ease',
        zIndex: isTop ? 10 : 5,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <div className="w-full h-full bg-white rounded-3xl shadow-2xl overflow-hidden select-none">
        {/* Pet photo */}
        <div className="relative w-full" style={{ height: '65%' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pet.photo_url}
            alt={pet.name}
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />

          {/* Like / Pass overlay badges */}
          <div
            className="absolute top-8 left-6 bg-green-400 text-white font-black text-2xl px-4 py-2 rounded-xl border-4 border-green-500 rotate-[-15deg]"
            style={{ opacity: likeOpacity }}
          >
            WOOF! ❤️
          </div>
          <div
            className="absolute top-8 right-6 bg-red-400 text-white font-black text-2xl px-4 py-2 rounded-xl border-4 border-red-500 rotate-[15deg]"
            style={{ opacity: passOpacity }}
          >
            NOPE 💨
          </div>

          {/* Gradient overlay */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-3 left-4 text-white font-bold text-2xl">
            {emoji} {pet.name}
            {pet.age && <span className="text-lg font-normal ml-2 opacity-90">{pet.age}y</span>}
          </div>
        </div>

        {/* Pet details */}
        <div className="p-5 space-y-2" style={{ height: '35%', overflowY: 'auto' }}>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium capitalize">
              {pet.species}
            </span>
            {pet.breed && (
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                {pet.breed}
              </span>
            )}
          </div>
          {pet.description && (
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">{pet.description}</p>
          )}
          <p className="text-gray-400 text-xs">
            Owner: <span className="font-medium text-gray-600">{pet.owner_name}</span>
            {pet.owner_location && <span> · {pet.owner_location}</span>}
          </p>
        </div>
      </div>
    </div>
  );
}
