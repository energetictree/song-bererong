import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ShuffleAnimationProps {
  onComplete?: () => void;
}

export function ShuffleAnimation({ onComplete }: ShuffleAnimationProps) {
  const [cards, setCards] = useState<Array<{ id: number; x: number; y: number; rotation: number }>>([]);

  useEffect(() => {
    // Generate initial card positions
    const initialCards = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      x: 0,
      y: 0,
      rotation: (i - 5) * 5
    }));
    setCards(initialCards);

    // Animate cards
    const interval = setInterval(() => {
      setCards(prev => prev.map(card => ({
        ...card,
        x: (Math.random() - 0.5) * 200,
        y: (Math.random() - 0.5) * 100,
        rotation: (Math.random() - 0.5) * 360
      })));
    }, 200);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      onComplete?.();
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [onComplete]);

  return (
    <div className="relative w-full h-64 flex items-center justify-center">
      <div className="absolute inset-0 flex items-center justify-center">
        {cards.map((card) => (
          <div
            key={card.id}
            className={cn(
              'absolute w-16 h-22 rounded-lg shadow-lg border-2 border-amber-700',
              'bg-gradient-to-br from-amber-800 via-red-900 to-amber-900',
              'transition-all duration-200 ease-out'
            )}
            style={{
              transform: `translate(${card.x}px, ${card.y}px) rotate(${card.rotation}deg)`,
              zIndex: card.id
            }}
          >
            <div className="w-full h-full border border-amber-500/30 rounded-md flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500" />
            </div>
          </div>
        ))}
      </div>
      <div className="absolute bottom-4 text-amber-200 text-lg font-medium animate-pulse">
        The Barong shuffles the cards...
      </div>
    </div>
  );
}
