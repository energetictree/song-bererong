import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Card, Player, Room, GameState } from '@/types/game';

export interface ScoreboardEntry {
  id: string;
  roomName: string;
  winner: { name: string; card: Card } | null;
  players: { name: string; card: Card | null }[];
  timestamp: string;
  date: string;
}

export interface RoomListItem {
  id: string;
  name: string;
  playerCount: number;
  maxPlayers: number;
  locked: boolean;
  gameState: string;
}

export interface RoomStats {
  activeRooms: number;
  maxRooms: number;
  rooms?: RoomListItem[];
}

interface SocketEvents {
  onRoomCreated?: (data: { roomId: string; roomName: string; playerId: string }) => void;
  onRoomJoined?: (data: { roomId: string; roomName: string; playerId: string }) => void;
  onRoomUpdated?: (room: Room) => void;
  onGameStarted?: (data: { gameState: GameState }) => void;
  onCardsDealt?: (data: { gameState: GameState }) => void;
  onYourCard?: (data: { card: Card }) => void;
  onShowCardCount?: (data: { count: number; total: number }) => void;
  onRevealingCards?: (data: { gameState: GameState; revealDuration?: number; playerCount?: number }) => void;
  onCardsRevealed?: (data: { gameState: GameState; winner: Player | null; players: Player[] }) => void;
  onPlayAgainCount?: (data: { count: number; total: number }) => void;
  onGameReset?: (data: { gameState: GameState }) => void;
  onRoomStats?: (data: RoomStats) => void;
  onScoreboard?: (data: ScoreboardEntry[]) => void;
  onError?: (data: { message: string }) => void;
}

export function useSocket(events: SocketEvents) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Use relative path to leverage Vite proxy in dev, or window.location in prod
    // This ensures it works both in Docker and outside
    const socket = io('/', {
      path: '/socket.io',
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('room-created', events.onRoomCreated || (() => {}));
    socket.on('room-joined', events.onRoomJoined || (() => {}));
    socket.on('room-updated', events.onRoomUpdated || (() => {}));
    socket.on('game-started', events.onGameStarted || (() => {}));
    socket.on('cards-dealt', events.onCardsDealt || (() => {}));
    socket.on('your-card', events.onYourCard || (() => {}));
    socket.on('show-card-count', events.onShowCardCount || (() => {}));
    socket.on('revealing-cards', events.onRevealingCards || (() => {}));
    socket.on('cards-revealed', events.onCardsRevealed || (() => {}));
    socket.on('play-again-count', events.onPlayAgainCount || (() => {}));
    socket.on('game-reset', events.onGameReset || (() => {}));
    socket.on('room-stats', events.onRoomStats || (() => {}));
    socket.on('scoreboard', events.onScoreboard || (() => {}));
    socket.on('error', events.onError || (() => {}));

    return () => {
      socket.disconnect();
    };
  }, []);

  const createRoom = useCallback((playerName: string) => {
    socketRef.current?.emit('create-room', { playerName });
  }, []);

  const joinRoom = useCallback((roomId: string, playerName: string) => {
    socketRef.current?.emit('join-room', { roomId, playerName });
  }, []);

  const lockRoom = useCallback((roomId: string) => {
    socketRef.current?.emit('lock-room', { roomId });
  }, []);

  const startGame = useCallback((roomId: string) => {
    socketRef.current?.emit('start-game', { roomId });
  }, []);

  const showCardClicked = useCallback((roomId: string) => {
    socketRef.current?.emit('show-card-clicked', { roomId });
  }, []);

  const playAgainClicked = useCallback((roomId: string) => {
    socketRef.current?.emit('play-again-clicked', { roomId });
  }, []);

  const leaveRoom = useCallback((roomId: string) => {
    socketRef.current?.emit('leave-room', { roomId });
  }, []);

  return {
    isConnected,
    createRoom,
    joinRoom,
    lockRoom,
    startGame,
    showCardClicked,
    playAgainClicked,
    leaveRoom
  };
}
