import { useState, useEffect, useMemo } from 'react';
import type { Player } from '@/types/game';
import { Card } from './Card';
import { cn } from '@/lib/utils';

interface DramaticRevealProps {
  players: Player[];
  revealDuration?: number;
  onRevealComplete?: () => void;
}

export function DramaticReveal({ players, revealDuration: serverDuration, onRevealComplete }: DramaticRevealProps) {
  const [phase, setPhase] = useState<'prepare' | 'flip' | 'slide' | 'complete'>('prepare');
  
  // Calculate reveal duration based on player count (more players = slower = more suspense)
  // Use server-provided duration if available, otherwise calculate locally
  // Base 2 seconds + 0.5s per player, capped at 6 seconds, then multiplied by 3 for slower animation
  const revealDuration = useMemo(() => {
    if (serverDuration) return serverDuration * 3;
    const baseDuration = 2000;
    const perPlayerDelay = 500;
    return Math.min(baseDuration + (players.length * perPlayerDelay), 6000) * 3;
  }, [players.length, serverDuration]);
  
  useEffect(() => {
    // Phase 1: Prepare (cards hidden under flip cards)
    const prepareTimer = setTimeout(() => {
      setPhase('flip');
    }, 300);
    
    // Phase 2: Flip animation starts
    const flipTimer = setTimeout(() => {
      setPhase('slide');
    }, 800);
    
    // Phase 3: Sliding up to reveal
    const slideTimer = setTimeout(() => {
      setPhase('complete');
      onRevealComplete?.();
    }, 800 + revealDuration);
    
    return () => {
      clearTimeout(prepareTimer);
      clearTimeout(flipTimer);
      clearTimeout(slideTimer);
    };
  }, [revealDuration, onRevealComplete]);
  
  return (
    <div className="w-full">
      {/* Drama text */}
      <div className="text-center mb-8">
        <h3 
          className={cn(
            "text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 transition-all duration-500",
            phase === 'slide' && "scale-110"
          )}
        >
          {phase === 'prepare' && "Prepare..."}
          {phase === 'flip' && "Revealing!"}
          {phase === 'slide' && "The Cards!"}
          {phase === 'complete' && "Revealed!"}
        </h3>
        <p className="text-amber-200/60 mt-2">
          {players.length} players • {((revealDuration + 800) / 1000).toFixed(1)}s suspense
        </p>
      </div>
      
      {/* Player cards with dramatic reveal */}
      <div className="flex flex-wrap justify-center gap-4 md:gap-6">
        {players.map((player, index) => (
          <DramaticPlayerCard
            key={player.id}
            player={player}
            index={index}
            phase={phase}
            revealDuration={revealDuration}
            totalPlayers={players.length}
          />
        ))}
      </div>
    </div>
  );
}

interface DramaticPlayerCardProps {
  player: Player;
  index: number;
  phase: 'prepare' | 'flip' | 'slide' | 'complete';
  revealDuration: number;
  totalPlayers: number;
}

function DramaticPlayerCard({ 
  player, 
  index, 
  phase, 
  revealDuration,
  totalPlayers 
}: DramaticPlayerCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [slideProgress, setSlideProgress] = useState(0);
  
  // Stagger the flip slightly for each player (very small delay for drama)
  const flipDelay = index * 50; // 50ms stagger
  
  useEffect(() => {
    if (phase === 'flip') {
      const timer = setTimeout(() => {
        setIsFlipped(true);
      }, flipDelay);
      return () => clearTimeout(timer);
    }
  }, [phase, flipDelay]);
  
  useEffect(() => {
    if (phase === 'slide') {
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / revealDuration, 1);
        // Ease out cubic for smooth deceleration
        const eased = 1 - Math.pow(1 - progress, 3);
        setSlideProgress(eased);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }
  }, [phase, revealDuration]);
  
  // Calculate slide down amount (moves completely below the card to reveal)
  const slideDownAmount = 120 * slideProgress; // 120px down
  
  return (
    <div className="flex flex-col items-center gap-2">
      {/* Player info */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm">
          {player.name[0].toUpperCase()}
        </div>
        <span className="text-amber-100 font-medium text-sm">{player.name}</span>
      </div>
      
      {/* Card container */}
      <div className="relative">
        {/* The actual card (revealed underneath) */}
        <div 
          className={cn(
            "transition-all duration-300",
            phase === 'complete' && "animate-pulse-once"
          )}
          style={{
            filter: phase === 'complete' ? 'none' : 'brightness(0.7)',
            transform: phase === 'complete' ? 'scale(1)' : 'scale(0.95)'
          }}
        >
          <Card card={player.card || undefined} size="md" />
        </div>
        
        {/* The flip card cover (slides down to reveal) */}
        <div
          className={cn(
            "absolute inset-0 will-change-transform",
            isFlipped && "scale-x-[-1]"
          )}
          style={{
            transform: `
              translateY(${slideDownAmount}px) 
              ${isFlipped ? 'scaleX(-1)' : 'scaleX(1)'}
            `,
            opacity: slideProgress >= 0.95 ? 0 : 1,
            transformOrigin: 'center center'
          }}
        >
          <Card faceDown size="md" />
        </div>
        
        {/* Glow effect during reveal */}
        {phase === 'slide' && (
          <div 
            className="absolute inset-0 rounded-lg pointer-events-none"
            style={{
              boxShadow: `0 0 ${30 + (slideProgress * 20)}px ${10 + (slideProgress * 10)}px rgba(251, 191, 36, ${0.3 + (slideProgress * 0.4)})`,
              opacity: 1 - slideProgress
            }}
          />
        )}
      </div>
      
      {/* Card value hint (shows after reveal) */}
      <div 
        className={cn(
          "text-center transition-all duration-500",
          phase === 'complete' ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        )}
        style={{ transitionDelay: `${index * 100}ms` }}
      >
        {player.card && (
          <span className={cn(
            "text-lg font-bold",
            (player.card.suit === '♥' || player.card.suit === '♦') ? 'text-red-400' : 'text-amber-100'
          )}>
            {player.card.rank}{player.card.suit}
          </span>
        )}
      </div>
    </div>
  );
}
