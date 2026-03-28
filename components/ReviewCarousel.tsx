'use client';
import { useEffect, useRef, useState } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

const reviews = [
  {
    name: 'Sarah & Michael Chen',
    location: 'Burlington, ON',
    rating: 5,
    review: 'Roofs Canada did an amazing job on our full roof replacement. The crew was professional, efficient, and left the property spotless. Highly recommend!',
    image: 'https://images.pexels.com/photos/7579360/pexels-photo-7579360.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    service: 'Roof Reshingling',
  },
  {
    name: 'David Thompson',
    location: 'Hamilton, ON',
    rating: 5,
    review: 'After a storm damaged our roof, Roofs Canada responded within hours. Their emergency repair service saved us from serious water damage. Excellent work!',
    image: 'https://images.unsplash.com/photo-1755190897791-7040dfdb988f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NjZ8MHwxfHNlYXJjaHwzfHxoYXBweSUyMGhvbWVvd25lciUyMHRlc3RpbW9uaWFsJTIwcG9ydHJhaXR8ZW58MHx8fHwxNzc0NjU3NzYzfDA&ixlib=rb-4.1.0&q=85',
    service: 'Leak & Roof Repair',
  },
  {
    name: 'Jennifer & Robert Martinez',
    location: 'Oakville, ON',
    rating: 5,
    review: 'We got quotes from three companies and Roofs Canada offered the best value with premium materials. The metal roof installation was flawless.',
    image: 'https://images.pexels.com/photos/8292843/pexels-photo-8292843.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    service: 'Metal Roof Installation',
  },
  {
    name: 'Patricia Nguyen',
    location: 'Mississauga, ON',
    rating: 5,
    review: 'Had skylights installed and the difference in natural light is incredible. The team was tidy, on time, and the finish looks beautiful. Very happy!',
    image: 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    service: 'Skylights & Solar Tubes',
  },
  {
    name: 'Mark & Lisa Kowalski',
    location: 'Milton, ON',
    rating: 5,
    review: 'Our flat roof was leaking for years. Roofs Canada diagnosed the issue immediately and had it fixed in one day. No mess, no fuss — just great work.',
    image: 'https://images.pexels.com/photos/5384445/pexels-photo-5384445.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    service: 'Flat Roof Installation',
  },
  {
    name: 'Tom Andersen',
    location: 'St. Catharines, ON',
    rating: 5,
    review: 'The Euroshield rubber shingles look fantastic and I love knowing they\'re made from recycled tires. The crew was knowledgeable and the cleanup was perfect.',
    image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    service: 'Euroshield Rubber Shingles',
  },
  {
    name: 'Angela & Chris Patel',
    location: 'Burlington, ON',
    rating: 5,
    review: 'New gutters and gutter guards installed — no more clogged downspouts. The team was fast, professional, and the price was very fair. Would use again.',
    image: 'https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    service: 'Gutters & Gutter Guard',
  },
  {
    name: 'Kevin O\'Brien',
    location: 'Hamilton, ON',
    rating: 5,
    review: 'Had the siding replaced on the whole house. The crew worked quickly and the result looks brand new. Neighbours keep asking who did the work!',
    image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    service: 'Siding Installation',
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < count ? 'fill-yellow-500 text-yellow-500' : 'text-slate-300'}`} />
      ))}
    </div>
  );
}

export function ReviewCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const visibleCount = 3; // cards visible at once on desktop
  const total = reviews.length;

  const next = () => setCurrent((c) => (c + 1) % total);
  const prev = () => setCurrent((c) => (c - 1 + total) % total);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(next, 4000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, current]);

  // Build the visible window — wraps around
  const getCard = (offset: number) => reviews[(current + offset) % total];

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Cards */}
      <div className="overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[0, 1, 2].map((offset) => {
            const r = getCard(offset);
            return (
              <div
                key={`${current}-${offset}`}
                className="bg-slate-50 border border-slate-100 p-6 md:p-8 rounded-lg flex flex-col animate-slide-in"
                style={{ animationDelay: `${offset * 60}ms` }}
              >
                <Quote className="text-red-600 h-7 w-7 mb-4 shrink-0" />
                <div className="mb-3"><Stars count={r.rating} /></div>
                <p className="text-sm sm:text-base leading-relaxed text-slate-700 mb-6 flex-1">"{r.review}"</p>
                <div className="flex items-center gap-3">
                  <img src={r.image} alt={r.name} className="w-11 h-11 rounded-full object-cover shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{r.name}</p>
                    <p className="text-xs text-slate-500">{r.location}</p>
                    <p className="text-xs text-red-600 mt-0.5">{r.service}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          onClick={prev}
          className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:border-red-600 hover:text-red-600 transition-colors"
          aria-label="Previous"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Dots */}
        <div className="flex gap-2">
          {reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-300 ${i === current ? 'w-6 bg-red-600' : 'w-2 bg-slate-300'}`}
              aria-label={`Go to review ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:border-red-600 hover:text-red-600 transition-colors"
          aria-label="Next"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
