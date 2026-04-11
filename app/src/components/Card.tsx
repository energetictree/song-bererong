import type { Card as CardType } from '@/types/game';
import { cn } from '@/lib/utils';

interface CardProps {
  card?: CardType;
  faceDown?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
}

export function Card({ card, faceDown = false, size = 'md', className, style }: CardProps) {
  const isRed = card && (card.suit === '♥' || card.suit === '♦');
  
  const sizeClasses = {
    sm: 'w-12 h-16 text-lg',
    md: 'w-20 h-28 text-2xl',
    lg: 'w-28 h-40 text-4xl'
  };

  if (faceDown) {
    return (
      <div
        className={cn(
          sizeClasses[size],
          'rounded-lg shadow-xl border-2 border-amber-700',
          'bg-gradient-to-br from-amber-800 via-red-900 to-amber-900',
          'flex items-center justify-center relative overflow-hidden',
          className
        )}
        style={style}
      >
        {/* Barong pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 0L12 5L17 3L14 8L20 10L14 12L17 17L12 15L10 20L8 15L3 17L6 12L0 10L6 8L3 3L8 5L10 0Z' fill='%23FFD700'/%3E%3C/svg%3E")`,
            backgroundSize: '20px 20px'
          }}
        />
        <div className="w-3/4 h-3/4 border-2 border-amber-500/40 rounded-md flex items-center justify-center relative z-10">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
            <span className="text-amber-900 font-bold text-xs">B</span>
          </div>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div
        className={cn(
          sizeClasses[size],
          'rounded-lg border-2 border-dashed border-gray-400',
          'bg-gray-100/50',
          className
        )}
        style={style}
      />
    );
  }

  return (
    <div
      className={cn(
        sizeClasses[size],
        'rounded-lg shadow-xl border border-gray-300',
        'bg-white flex flex-col items-center justify-center',
        'select-none',
        className
      )}
      style={style}
    >
      <span className={cn(
        'font-bold',
        isRed ? 'text-red-500' : 'text-gray-900'
      )}>
        {card.rank}
      </span>
      <span className={cn(
        isRed ? 'text-red-500' : 'text-gray-900'
      )}>
        {card.suit}
      </span>
    </div>
  );
}
