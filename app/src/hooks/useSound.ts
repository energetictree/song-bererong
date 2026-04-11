import { useRef, useCallback, useState, useEffect } from 'react';

interface SoundManager {
  playTheme: () => void;
  stopTheme: () => void;
  playDrumroll: () => void;
  playWinner: () => void;
  playCardFlip: () => void;
  playCardShuffle: () => void;
  playCardDeal: () => void;
  playGameStart: () => void;
  playButtonClick: () => void;
  isMuted: boolean;
  toggleMute: () => void;
  isThemePlaying: boolean;
}

export function useSound(): SoundManager {
  const themeRef = useRef<HTMLAudioElement | null>(null);
  const drumrollRef = useRef<HTMLAudioElement | null>(null);
  const winnerRef = useRef<HTMLAudioElement | null>(null);
  const cardFlipRef = useRef<HTMLAudioElement | null>(null);
  const cardShuffleRef = useRef<HTMLAudioElement | null>(null);
  const cardDealRef = useRef<HTMLAudioElement | null>(null);
  const gameStartRef = useRef<HTMLAudioElement | null>(null);
  const buttonClickRef = useRef<HTMLAudioElement | null>(null);
  
  const [isMuted, setIsMuted] = useState(false);
  const [isThemePlaying, setIsThemePlaying] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(true); // Start as blocked

  // Initialize audio elements
  useEffect(() => {
    if (isInitialized) return;
    
    themeRef.current = new Audio('/sounds/rindik-theme.mp3');
    themeRef.current.loop = true;
    themeRef.current.volume = 0.4;
    
    drumrollRef.current = new Audio('/sounds/drumroll-suspense.mp3');
    drumrollRef.current.volume = 0.6;
    
    winnerRef.current = new Audio('/sounds/winner-celebration.mp3');
    winnerRef.current.volume = 0.7;
    
    cardFlipRef.current = new Audio('/sounds/card-flip.mp3');
    cardFlipRef.current.volume = 0.5;
    
    cardShuffleRef.current = new Audio('/sounds/card-shuffle.mp3');
    cardShuffleRef.current.volume = 0.6;
    
    cardDealRef.current = new Audio('/sounds/card-deal.mp3');
    cardDealRef.current.volume = 0.5;
    
    gameStartRef.current = new Audio('/sounds/game-start.mp3');
    gameStartRef.current.volume = 0.6;
    
    buttonClickRef.current = new Audio('/sounds/button-click.mp3');
    buttonClickRef.current.volume = 0.3;
    
    setIsInitialized(true);
    
    return () => {
      themeRef.current?.pause();
      drumrollRef.current?.pause();
      winnerRef.current?.pause();
      cardShuffleRef.current?.pause();
    };
  }, [isInitialized]);

  const playTheme = useCallback(() => {
    if (isMuted || !themeRef.current || isThemePlaying) return;
    
    themeRef.current.currentTime = 0;
    themeRef.current.play()
      .then(() => {
        setIsThemePlaying(true);
        setAutoplayBlocked(false);
      })
      .catch(() => {
        // Autoplay blocked, will try on user interaction
        setAutoplayBlocked(true);
      });
  }, [isMuted, isThemePlaying]);

  const stopTheme = useCallback(() => {
    if (!themeRef.current) return;
    themeRef.current.pause();
    themeRef.current.currentTime = 0;
    setIsThemePlaying(false);
  }, []);

  const playDrumroll = useCallback(() => {
    if (isMuted || !drumrollRef.current) return;
    
    drumrollRef.current.currentTime = 0;
    drumrollRef.current.play().catch(() => {});
  }, [isMuted]);

  const playWinner = useCallback(() => {
    if (isMuted || !winnerRef.current) return;
    
    winnerRef.current.currentTime = 0;
    winnerRef.current.play().catch(() => {});
  }, [isMuted]);

  const playCardFlip = useCallback(() => {
    if (isMuted || !cardFlipRef.current) return;
    
    cardFlipRef.current.currentTime = 0;
    cardFlipRef.current.play().catch(() => {});
  }, [isMuted]);

  const playCardShuffle = useCallback(() => {
    if (isMuted || !cardShuffleRef.current) return;
    
    cardShuffleRef.current.currentTime = 0;
    cardShuffleRef.current.play().catch(() => {});
  }, [isMuted]);

  const playCardDeal = useCallback(() => {
    if (isMuted || !cardDealRef.current) return;
    
    cardDealRef.current.currentTime = 0;
    cardDealRef.current.play().catch(() => {});
  }, [isMuted]);

  const playGameStart = useCallback(() => {
    if (isMuted || !gameStartRef.current) return;
    
    gameStartRef.current.currentTime = 0;
    gameStartRef.current.play().catch(() => {});
  }, [isMuted]);

  const playButtonClick = useCallback(() => {
    // Try to start theme on first user interaction if it hasn't started
    if (autoplayBlocked && !isMuted && themeRef.current && !isThemePlaying) {
      themeRef.current.play()
        .then(() => {
          setIsThemePlaying(true);
          setAutoplayBlocked(false);
        })
        .catch(() => {});
    }
    
    if (isMuted || !buttonClickRef.current) return;
    
    buttonClickRef.current.currentTime = 0;
    buttonClickRef.current.play().catch(() => {});
  }, [isMuted, autoplayBlocked, isThemePlaying]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newMuted = !prev;
      
      if (newMuted) {
        // Mute all sounds
        themeRef.current?.pause();
        drumrollRef.current?.pause();
        winnerRef.current?.pause();
        cardFlipRef.current?.pause();
        cardShuffleRef.current?.pause();
        cardDealRef.current?.pause();
        gameStartRef.current?.pause();
        buttonClickRef.current?.pause();
        setIsThemePlaying(false);
      } else {
        // Unmute - start theme if autoplay was blocked or resume if it was playing
        if (autoplayBlocked || !isThemePlaying) {
          // First user interaction - try to start theme
          themeRef.current?.play()
            .then(() => {
              setIsThemePlaying(true);
              setAutoplayBlocked(false);
            })
            .catch(() => {});
        } else {
          themeRef.current?.play().catch(() => {});
        }
      }
      
      return newMuted;
    });
  }, [isThemePlaying, autoplayBlocked]);

  return {
    playTheme,
    stopTheme,
    playDrumroll,
    playWinner,
    playCardFlip,
    playCardShuffle,
    playCardDeal,
    playGameStart,
    playButtonClick,
    isMuted,
    toggleMute,
    isThemePlaying
  };
}
