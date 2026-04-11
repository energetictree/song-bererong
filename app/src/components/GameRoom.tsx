import { useState, useCallback, useEffect } from 'react';
import { useSocket, type ScoreboardEntry, type RoomStats, type RoomListItem } from '@/hooks/useSocket';
import appVersion from '../../version.json';
import { useSound } from '@/hooks/useSound';
import { Card } from '@/components/Card';
import { ShuffleAnimation } from '@/components/ShuffleAnimation';
import { DramaticReveal } from '@/components/DramaticReveal';
import { ConfettiEffect } from '@/components/ConfettiEffect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Card as CardType, Player, Room, GameState } from '@/types/game';
import { cn } from '@/lib/utils';
import { 
  Users, 
  Lock, 
  Unlock, 
  Play, 
  Eye, 
  RotateCcw, 
  LogOut,
  Crown,
  CheckCircle2,
  Loader2,
  Volume2,
  VolumeX,
  Trophy,
  Home,
  BarChart3
} from 'lucide-react';

export function GameRoom() {
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [room, setRoom] = useState<Room | null>(null);
  const [myId, setMyId] = useState<string | null>(null);
  const [myCard, setMyCard] = useState<CardType | null>(null);
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [showCardCount, setShowCardCount] = useState(0);
  const [playAgainCount, setPlayAgainCount] = useState(0);
  const [isPeeking, setIsPeeking] = useState(false);
  const [hasClickedShowCard, setHasClickedShowCard] = useState(false);
  const [hasClickedPlayAgain, setHasClickedPlayAgain] = useState(false);
  const [revealedPlayers, setRevealedPlayers] = useState<Player[]>([]);
  const [winner, setWinner] = useState<Player | null>(null);
  const [revealDuration, setRevealDuration] = useState<number | undefined>();
  const [error, setError] = useState('');
  const [view, setView] = useState<'home' | 'create' | 'join' | 'game' | 'scoreboard'>('home');
  
  // Room stats and scoreboard
  const [roomStats, setRoomStats] = useState<RoomStats>({ activeRooms: 0, maxRooms: 3 });
  const [scoreboard, setScoreboard] = useState<ScoreboardEntry[]>([]);
  
  // Sound manager
  const sound = useSound();
  
  // Play theme on home page
  useEffect(() => {
    if (view === 'home') {
      sound.playTheme();
    }
  }, [view, sound]);

  const handleRoomCreated = useCallback((data: { roomId: string; roomName: string; playerId: string }) => {
    setMyId(data.playerId);
    setView('game');
  }, []);

  const handleRoomJoined = useCallback((data: { roomId: string; roomName: string; playerId: string }) => {
    setMyId(data.playerId);
    setView('game');
  }, []);

  const handleRoomUpdated = useCallback((updatedRoom: Room) => {
    setRoom(updatedRoom);
    setGameState(updatedRoom.gameState);
  }, []);

  const handleGameStarted = useCallback(() => {
    sound.playGameStart();
    sound.playCardShuffle();
    setGameState('shuffling');
    setHasClickedShowCard(false);
    setHasClickedPlayAgain(false);
    setShowCardCount(0);
    setPlayAgainCount(0);
    setWinner(null);
    setRevealedPlayers([]);
  }, [sound]);

  const handleCardsDealt = useCallback(() => {
    sound.playCardDeal();
    setGameState('peeking');
  }, [sound]);

  const handleYourCard = useCallback((data: { card: CardType }) => {
    setMyCard(data.card);
  }, []);

  const handleShowCardCount = useCallback((data: { count: number; total: number }) => {
    setShowCardCount(data.count);
  }, []);
  
  const handleRoomStats = useCallback((data: RoomStats) => {
    setRoomStats(data);
  }, []);
  
  const handleScoreboard = useCallback((data: ScoreboardEntry[]) => {
    setScoreboard(data);
  }, []);

  const handleRevealingCards = useCallback((data: { revealDuration?: number; playerCount?: number }) => {
    sound.playDrumroll();
    setGameState('revealing');
    setIsPeeking(false);
    setRevealDuration(data.revealDuration);
  }, [sound]);

  const handleCardsRevealed = useCallback((data: { gameState: GameState; winner: Player | null; players: Player[] }) => {
    setGameState('revealed');
    setWinner(data.winner);
    setRevealedPlayers(data.players);
    if (data.winner) {
      setTimeout(() => sound.playWinner(), 500);
    }
  }, [sound]);

  const handlePlayAgainCount = useCallback((data: { count: number; total: number }) => {
    setPlayAgainCount(data.count);
  }, []);

  const handleGameReset = useCallback(() => {
    setGameState('waiting');
    setMyCard(null);
    setHasClickedShowCard(false);
    setHasClickedPlayAgain(false);
    setShowCardCount(0);
    setPlayAgainCount(0);
    setWinner(null);
    setRevealedPlayers([]);
    setRevealDuration(undefined);
    setIsPeeking(false);
  }, []);

  const handleError = useCallback((data: { message: string }) => {
    setError(data.message);
    setTimeout(() => setError(''), 3000);
  }, []);

  const socket = useSocket({
    onRoomCreated: handleRoomCreated,
    onRoomJoined: handleRoomJoined,
    onRoomUpdated: handleRoomUpdated,
    onGameStarted: handleGameStarted,
    onCardsDealt: handleCardsDealt,
    onYourCard: handleYourCard,
    onShowCardCount: handleShowCardCount,
    onRevealingCards: handleRevealingCards,
    onCardsRevealed: handleCardsRevealed,
    onPlayAgainCount: handlePlayAgainCount,
    onGameReset: handleGameReset,
    onRoomStats: handleRoomStats,
    onScoreboard: handleScoreboard,
    onError: handleError
  });

  const handleCreateRoom = () => {
    sound.playButtonClick();
    if (playerName.trim()) {
      socket.createRoom(playerName.trim());
    }
  };

  const handleJoinRoom = () => {
    sound.playButtonClick();
    if (playerName.trim() && roomId.trim()) {
      socket.joinRoom(roomId.trim(), playerName.trim());
    }
  };

  const handleLockRoom = () => {
    sound.playButtonClick();
    if (room) {
      socket.lockRoom(room.id);
    }
  };

  const handleStartGame = () => {
    sound.playButtonClick();
    if (room) {
      socket.startGame(room.id);
    }
  };

  const handleShowCard = () => {
    sound.playButtonClick();
    if (room && !hasClickedShowCard) {
      setHasClickedShowCard(true);
      socket.showCardClicked(room.id);
    }
  };

  const handlePlayAgain = () => {
    sound.playButtonClick();
    if (room && !hasClickedPlayAgain) {
      setHasClickedPlayAgain(true);
      socket.playAgainClicked(room.id);
    }
  };

  const handleLeaveRoom = () => {
    sound.playButtonClick();
    if (room) {
      socket.leaveRoom(room.id);
      setRoom(null);
      setMyId(null);
      setMyCard(null);
      setGameState('waiting');
      setView('home');
    }
  };
  
  const handlePeekCard = () => {
    if (!isPeeking) {
      sound.playCardFlip();
    }
    setIsPeeking(!isPeeking);
  };
  
  const handleSetView = (newView: 'home' | 'create' | 'join' | 'game' | 'scoreboard') => {
    sound.playButtonClick();
    setView(newView);
  };

  const isOwner = room?.owner === myId;

  // Home view - Barong Theme
  if (view === 'home') {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Barong-themed background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950 via-red-950 to-amber-900" />
        
        {/* Ornate pattern overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L35 10L45 5L40 15L50 20L40 25L45 35L35 30L30 40L25 30L15 35L20 25L10 20L20 15L15 5L25 10L30 0Z' fill='%23FFD700' fill-opacity='0.5'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}
        />
        
        {/* Golden glow effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-3xl" />
        
        {/* Sound toggle */}
        <div className="absolute top-4 right-4 z-20">
          <Button
            variant="ghost"
            size="icon"
            onClick={sound.toggleMute}
            className="text-amber-300/60 hover:text-amber-300 hover:bg-amber-900/30"
          >
            {sound.isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </Button>
        </div>
        
        {/* Main content */}
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
          {/* Barong Image */}
          <div className="mb-6 relative">
            <div className="absolute inset-0 bg-amber-400/30 rounded-full blur-2xl scale-110" />
            <img 
              src="/barong-hero.png" 
              alt="Barong" 
              className="relative w-48 h-48 md:w-64 md:h-64 object-contain drop-shadow-2xl animate-pulse-slow"
            />
          </div>
          
          {/* Title */}
          <div className="text-center space-y-4 mb-10">
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 drop-shadow-lg">
                Song
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-red-500 to-red-600 drop-shadow-lg mx-2">
                Bererong
              </span>
            </h1>
            <div className="flex items-center justify-center gap-4">
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
              <p className="text-amber-200/80 text-lg md:text-xl font-medium tracking-widest uppercase">
                The Sacred Card Battle
              </p>
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-3 h-3 bg-amber-400 rotate-45" />
            <div className="w-2 h-2 bg-red-400 rotate-45" />
            <div className="w-3 h-3 bg-amber-400 rotate-45" />
          </div>
          
          {/* Room Status */}
          <div className="flex items-center gap-2 px-6 py-3 bg-black/30 rounded-full border border-amber-500/30">
            <div className={cn(
              "w-3 h-3 rounded-full animate-pulse",
              roomStats.activeRooms >= roomStats.maxRooms ? "bg-red-500" : "bg-green-500"
            )} />
            <span className="text-amber-200 text-sm">
              {roomStats.activeRooms} / {roomStats.maxRooms} Rooms Online
            </span>
          </div>
          
          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              onClick={() => handleSetView('create')}
              disabled={roomStats.activeRooms >= roomStats.maxRooms}
              className="relative group bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-600 hover:from-amber-500 hover:via-yellow-500 hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-6 text-lg rounded-xl shadow-xl shadow-amber-900/50 border-2 border-amber-400/50 overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative flex items-center gap-2">
                <Crown className="w-5 h-5" />
                Create Room
              </span>
            </Button>
            <Button
              size="lg"
              onClick={() => handleSetView('join')}
              className="relative group bg-gradient-to-r from-red-700 via-red-600 to-red-700 hover:from-red-600 hover:via-red-500 hover:to-red-600 text-white px-8 py-6 text-lg rounded-xl shadow-xl shadow-red-900/50 border-2 border-red-400/50 overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative flex items-center gap-2">
                <Users className="w-5 h-5" />
                Join Room
              </span>
            </Button>
            <Button
              size="lg"
              onClick={() => handleSetView('scoreboard')}
              className="relative group bg-gradient-to-r from-purple-700 via-purple-600 to-purple-700 hover:from-purple-600 hover:via-purple-500 hover:to-purple-600 text-white px-8 py-6 text-lg rounded-xl shadow-xl shadow-purple-900/50 border-2 border-purple-400/50 overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Scoreboard
              </span>
            </Button>
          </div>
          
          {roomStats.activeRooms >= roomStats.maxRooms && (
            <p className="text-red-400 text-sm">
              All rooms are full. Please wait for a room to become available.
            </p>
          )}
          
          {/* Footer text */}
          <p className="mt-8 text-amber-300/50 text-sm">
            2-10 Players • Sacred Card Game • v{appVersion.version}
          </p>
        </div>
        
        {/* Corner decorations */}
        <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-amber-500/30 rounded-tl-lg" />
        <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-amber-500/30 rounded-tr-lg" />
        <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-amber-500/30 rounded-bl-lg" />
        <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-amber-500/30 rounded-br-lg" />
      </div>
    );
  }

  // Create room view
  if (view === 'create') {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Barong-themed background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950 via-red-950 to-amber-900" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
        
        {/* Sound toggle */}
        <div className="absolute top-4 right-4 z-20">
          <Button
            variant="ghost"
            size="icon"
            onClick={sound.toggleMute}
            className="text-amber-300/60 hover:text-amber-300 hover:bg-amber-900/30"
          >
            {sound.isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </Button>
        </div>
        
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md space-y-6">
            <Button 
              variant="ghost" 
              onClick={() => handleSetView('home')} 
              className="text-amber-300/60 hover:text-amber-300 hover:bg-amber-900/20"
            >
              ← Back
            </Button>
            
            <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-8 space-y-6 border border-amber-500/20">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400">
                  Create Room
                </h2>
                <p className="text-amber-200/50 mt-1">Start a new sacred battle</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-amber-200/80 text-sm">Your Name</label>
                <Input
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  className="bg-black/30 border-amber-500/30 text-amber-100 placeholder:text-amber-500/40 focus:border-amber-400"
                  maxLength={20}
                />
              </div>
              
              <Button
                onClick={handleCreateRoom}
                disabled={!playerName.trim()}
                className="w-full bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-600 hover:from-amber-500 hover:via-yellow-500 hover:to-amber-500 disabled:opacity-50 text-white py-6 rounded-xl shadow-lg shadow-amber-900/30"
              >
                <Crown className="w-5 h-5 mr-2" />
                Create Room
              </Button>
            </div>
            
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-xl text-center">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Join room view
  if (view === 'join') {
    const availableRooms = roomStats.rooms?.filter(r => !r.locked && r.gameState === 'waiting') || [];
    
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Barong-themed background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950 via-red-950 to-amber-900" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
        
        {/* Sound toggle */}
        <div className="absolute top-4 right-4 z-20">
          <Button
            variant="ghost"
            size="icon"
            onClick={sound.toggleMute}
            className="text-amber-300/60 hover:text-amber-300 hover:bg-amber-900/30"
          >
            {sound.isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </Button>
        </div>
        
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md space-y-6">
            <Button 
              variant="ghost" 
              onClick={() => handleSetView('home')} 
              className="text-amber-300/60 hover:text-amber-300 hover:bg-amber-900/20"
            >
              ← Back
            </Button>
            
            {/* Available Rooms List */}
            {availableRooms.length > 0 && (
              <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-6 border border-amber-500/20">
                <h3 className="text-lg font-semibold text-amber-200 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Available Rooms ({availableRooms.length})
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableRooms.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => setRoomId(room.id)}
                      className={cn(
                        "w-full text-left p-3 rounded-xl transition-all",
                        roomId === room.id
                          ? "bg-amber-500/30 border-2 border-amber-400"
                          : "bg-black/30 border border-amber-500/20 hover:bg-amber-900/20"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-amber-100 font-medium">{room.name}</p>
                          <p className="text-amber-300/60 text-sm">ID: {room.id}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-amber-200 text-sm">
                            {room.playerCount}/{room.maxPlayers} players
                          </p>
                          {room.locked && (
                            <span className="text-red-400 text-xs">🔒 Locked</span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-8 space-y-6 border border-amber-500/20">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-400">
                  Join Room
                </h2>
                <p className="text-amber-200/50 mt-1">
                  {availableRooms.length > 0 
                    ? "Select a room above or enter ID manually" 
                    : "Enter the sacred arena"}
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-amber-200/80 text-sm">Your Name</label>
                <Input
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  className="bg-black/30 border-amber-500/30 text-amber-100 placeholder:text-amber-500/40 focus:border-amber-400"
                  maxLength={20}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-amber-200/80 text-sm">Room ID</label>
                <Input
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="Enter room ID"
                  className="bg-black/30 border-amber-500/30 text-amber-100 placeholder:text-amber-500/40 focus:border-amber-400"
                />
              </div>
              
              <Button
                onClick={handleJoinRoom}
                disabled={!playerName.trim() || !roomId.trim()}
                className="w-full bg-gradient-to-r from-red-700 via-red-600 to-red-700 hover:from-red-600 hover:via-red-500 hover:to-red-600 disabled:opacity-50 text-white py-6 rounded-xl shadow-lg shadow-red-900/30"
              >
                Join Room
              </Button>
            </div>
          
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-xl text-center">
              {error}
            </div>
          )}
          </div>
        </div>
      </div>
    );
  }

  // Scoreboard view
  if (view === 'scoreboard') {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Barong-themed background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950 via-red-950 to-amber-900" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
        
        {/* Sound toggle */}
        <div className="absolute top-4 right-4 z-20">
          <Button
            variant="ghost"
            size="icon"
            onClick={sound.toggleMute}
            className="text-amber-300/60 hover:text-amber-300 hover:bg-amber-900/30"
          >
            {sound.isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </Button>
        </div>
        
        <div className="relative z-10 min-h-screen p-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <Button 
                variant="ghost" 
                onClick={() => handleSetView('home')} 
                className="text-amber-300/60 hover:text-amber-300 hover:bg-amber-900/20"
              >
                <Home className="w-5 h-5 mr-2" /> Back
              </Button>
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400">
                <Trophy className="w-8 h-8 inline mr-2 text-amber-400" />
                Hall of Champions
              </h2>
              <div className="w-24" /> {/* Spacer for centering */}
            </div>
            
            {/* Scoreboard */}
            <div className="bg-black/30 backdrop-blur-lg rounded-2xl border border-amber-500/20 overflow-hidden">
              {scoreboard.length === 0 ? (
                <div className="p-12 text-center">
                  <Trophy className="w-16 h-16 text-amber-500/30 mx-auto mb-4" />
                  <p className="text-amber-200/60 text-lg">No games played yet</p>
                  <p className="text-amber-200/40 text-sm mt-2">Be the first champion!</p>
                </div>
              ) : (
                <div className="divide-y divide-amber-500/20">
                  {scoreboard.slice(0, 20).map((entry, index) => (
                    <div 
                      key={entry.id} 
                      className={cn(
                        "p-4 flex items-center gap-4",
                        index === 0 ? "bg-amber-500/10" : ""
                      )}
                    >
                      {/* Rank */}
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg",
                        index === 0 ? "bg-yellow-400 text-yellow-900" :
                        index === 1 ? "bg-gray-300 text-gray-900" :
                        index === 2 ? "bg-amber-600 text-amber-100" :
                        "bg-black/50 text-amber-300"
                      )}>
                        {index + 1}
                      </div>
                      
                      {/* Winner info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-amber-100 font-semibold text-lg">
                            {entry.winner?.name || 'No Winner'}
                          </span>
                          {entry.winner?.card && (
                            <span className="text-amber-400 text-sm">
                              {entry.winner.card.rank}{entry.winner.card.suit}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-amber-200/60">
                          <span>{entry.roomName}</span>
                          <span>•</span>
                          <span>{entry.date}</span>
                          <span>•</span>
                          <span>{entry.players.length} players</span>
                        </div>
                      </div>
                      
                      {/* Players list */}
                      <div className="hidden md:flex items-center gap-2">
                        {entry.players.slice(0, 5).map((player, i) => (
                          <div 
                            key={i}
                            className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-red-500 flex items-center justify-center text-white text-xs font-bold"
                            title={`${player.name}: ${player.card?.rank}${player.card?.suit}`}
                          >
                            {player.name[0].toUpperCase()}
                          </div>
                        ))}
                        {entry.players.length > 5 && (
                          <div className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-amber-300 text-xs">
                            +{entry.players.length - 5}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Stats summary */}
            {scoreboard.length > 0 && (
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="bg-black/30 backdrop-blur-lg rounded-xl p-4 text-center border border-amber-500/20">
                  <BarChart3 className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-amber-100">{scoreboard.length}</p>
                  <p className="text-amber-200/60 text-sm">Total Games</p>
                </div>
                <div className="bg-black/30 backdrop-blur-lg rounded-xl p-4 text-center border border-amber-500/20">
                  <Users className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-amber-100">
                    {scoreboard.reduce((acc, entry) => acc + entry.players.length, 0)}
                  </p>
                  <p className="text-amber-200/60 text-sm">Total Players</p>
                </div>
                <div className="bg-black/30 backdrop-blur-lg rounded-xl p-4 text-center border border-amber-500/20">
                  <Trophy className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-amber-100">
                    {new Set(scoreboard.map(e => e.winner?.name).filter(Boolean)).size}
                  </p>
                  <p className="text-amber-200/60 text-sm">Unique Champions</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Game view
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Sacred card game background */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-950 via-red-950 to-amber-900" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
      
      {/* Sound toggle */}
      <div className="absolute top-4 right-4 z-20">
        <Button
          variant="ghost"
          size="icon"
          onClick={sound.toggleMute}
          className="text-amber-300/60 hover:text-amber-300 hover:bg-amber-900/30"
        >
          {sound.isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
        </Button>
      </div>
      
      <div className="relative z-10 min-h-screen p-4">
        <ConfettiEffect active={gameState === 'revealed' && !!winner} />
        
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400">
                {room?.name}
              </h1>
              <p className="text-amber-200/60">Room ID: {room?.id}</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-black/30 rounded-full px-4 py-2 border border-amber-500/30">
                <Users className="w-5 h-5 text-amber-400/60" />
                <span className="text-amber-100">
                  {room?.players.length || 0}/10
                </span>
              </div>
              
              {room?.locked && (
                <div className="flex items-center gap-2 bg-red-500/20 rounded-full px-4 py-2 border border-red-500/30">
                  <Lock className="w-5 h-5 text-red-400" />
                  <span className="text-red-400">Locked</span>
                </div>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLeaveRoom}
                className="text-amber-200/60 hover:text-amber-100 hover:bg-amber-900/30"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main game area */}
        <div className="max-w-6xl mx-auto">
          {/* Waiting state */}
          {gameState === 'waiting' && (
            <div className="space-y-8">
              {/* Players list */}
              <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-6 border border-amber-500/20">
                <h3 className="text-xl font-semibold text-amber-200 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Players ({room?.players.length})
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {room?.players.map((player) => (
                    <div
                      key={player.id}
                      className={cn(
                        'bg-black/30 rounded-xl p-4 flex items-center gap-3 border border-amber-500/20',
                        player.id === myId && 'ring-2 ring-amber-400'
                      )}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-red-500 flex items-center justify-center text-white font-bold">
                        {player.name[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-amber-100 font-medium truncate">{player.name}</p>
                        {player.isOwner && (
                          <p className="text-yellow-400 text-xs flex items-center gap-1">
                            <Crown className="w-3 h-3" /> Owner
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Owner controls */}
              {isOwner && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={handleLockRoom}
                    variant={room?.locked ? 'destructive' : 'outline'}
                    className={cn(
                      'px-6 py-5 rounded-xl',
                      !room?.locked && 'border-amber-500/30 text-amber-200 hover:bg-amber-900/20'
                    )}
                  >
                    {room?.locked ? (
                      <><Unlock className="w-5 h-5 mr-2" /> Unlock Room</>
                    ) : (
                      <><Lock className="w-5 h-5 mr-2" /> Lock Room</>
                    )}
                  </Button>
                  
                  <Button
                    onClick={handleStartGame}
                    disabled={!room || room.players.length < 2}
                    className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-600 hover:from-amber-500 hover:via-yellow-500 hover:to-amber-500 text-white px-8 py-5 rounded-xl shadow-lg shadow-amber-900/30"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Start Game
                  </Button>
                </div>
              )}
              
              {!isOwner && (
                <div className="text-center text-amber-200/60">
                  Waiting for room owner to start the game...
                </div>
              )}
            </div>
          )}

          {/* Shuffling state */}
          {gameState === 'shuffling' && (
            <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-8 border border-amber-500/20">
              <ShuffleAnimation />
            </div>
          )}

          {/* Dealing state */}
          {gameState === 'dealing' && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center space-y-4">
                <Loader2 className="w-12 h-12 text-amber-400 animate-spin mx-auto" />
                <p className="text-amber-200 text-lg">Dealing cards...</p>
              </div>
            </div>
          )}

          {/* Peeking state */}
          {gameState === 'peeking' && (
            <div className="space-y-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400 mb-2">
                  Peek at your card!
                </h3>
                <p className="text-amber-200/60">Click the card to peek, then click "Show Card" when ready</p>
              </div>
              
              {/* My card */}
              <div className="flex justify-center">
                <div
                  className="relative cursor-pointer"
                  onClick={handlePeekCard}
                >
                  <div className={cn(
                    'transition-all duration-500',
                    isPeeking ? 'scale-110' : 'scale-100'
                  )}>
                    <Card 
                      card={isPeeking ? myCard || undefined : undefined} 
                      faceDown={!isPeeking}
                      size="lg"
                    />
                  </div>
                  
                  {!isPeeking && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black/50 rounded-full p-3">
                        <Eye className="w-8 h-8 text-amber-400" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            
              {/* Show card button */}
              <div className="flex justify-center">
                <Button
                  onClick={handleShowCard}
                  disabled={hasClickedShowCard}
                  className={cn(
                    'px-8 py-6 text-lg rounded-xl',
                    hasClickedShowCard
                      ? 'bg-amber-500/50 text-amber-100'
                      : 'bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-600 hover:from-amber-500 hover:via-yellow-500 hover:to-amber-500 text-white shadow-lg shadow-amber-900/30'
                  )}
                >
                  {hasClickedShowCard ? (
                    <><CheckCircle2 className="w-5 h-5 mr-2" /> Waiting for others...</>
                  ) : (
                    `Show Card (${showCardCount}/${room?.players.length || 0})`
                  )}
                </Button>
              </div>
              
              {/* Players status */}
              <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-6 border border-amber-500/20">
                <div className="flex flex-wrap justify-center gap-4">
                  {room?.players.map((player) => (
                    <div
                      key={player.id}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-full',
                        player.showCardClicked
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-black/30 text-amber-200/60 border border-amber-500/20'
                      )}
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-red-500 flex items-center justify-center text-white text-xs font-bold">
                        {player.name[0].toUpperCase()}
                      </div>
                      <span className="text-sm">{player.name}</span>
                      {player.showCardClicked && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Revealing state */}
          {gameState === 'revealing' && room && (
            <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-6 md:p-10 border border-amber-500/20">
              <DramaticReveal 
                players={room.players}
                revealDuration={revealDuration}
                onRevealComplete={() => {
                  // Animation complete - socket will handle state change
                }}
              />
            </div>
          )}

          {/* Revealed state */}
          {gameState === 'revealed' && (
            <div className="space-y-8">
              {/* Winner announcement */}
              {winner && (
                <div className="text-center space-y-4">
                  <div className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500">
                    <h2 className="text-4xl md:text-6xl font-bold">🏆 Winner! 🏆</h2>
                  </div>
                  <div className="text-2xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400 font-semibold">
                    {winner.name}
                  </div>
                  <div className="flex justify-center">
                    <Card card={winner.card || undefined} size="lg" />
                  </div>
                </div>
              )}
              
              {/* All players cards */}
              <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-6 border border-amber-500/20">
                <h3 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400 mb-6 text-center">
                  All Cards Revealed
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  {revealedPlayers.map((player, index) => (
                    <div
                      key={player.id}
                      className={cn(
                        'flex flex-col items-center gap-3 p-4 rounded-xl border',
                        player.id === winner?.id
                          ? 'bg-amber-500/20 ring-2 ring-amber-400 border-amber-500/50'
                          : 'bg-black/30 border-amber-500/20'
                      )}
                      style={{
                        animation: `fadeInUp 0.5s ease-out ${index * 0.3}s both`
                    }}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                      {player.name[0].toUpperCase()}
                    </div>
                    <p className="text-amber-100 font-medium text-center">{player.name}</p>
                    <Card card={player.card || undefined} size="md" />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Play again button */}
            <div className="flex justify-center gap-4">
              <Button
                onClick={handlePlayAgain}
                disabled={hasClickedPlayAgain}
                className={cn(
                  'px-8 py-6 text-lg rounded-xl',
                  hasClickedPlayAgain
                    ? 'bg-amber-500/50 text-amber-100'
                    : 'bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-600 hover:from-amber-500 hover:via-yellow-500 hover:to-amber-500 text-white shadow-lg shadow-amber-900/30'
                )}
              >
                {hasClickedPlayAgain ? (
                  <><CheckCircle2 className="w-5 h-5 mr-2" /> Waiting...</>
                ) : (
                  <><RotateCcw className="w-5 h-5 mr-2" /> Play Again ({playAgainCount}/{room?.players.length || 0})</>
                )}
              </Button>
              
              <Button
                onClick={handleLeaveRoom}
                variant="outline"
                className="border-amber-500/30 text-amber-200 hover:bg-amber-900/30 hover:text-amber-100 px-8 py-6 text-lg rounded-xl"
              >
                <LogOut className="w-5 h-5 mr-2" /> Exit
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
        
        @keyframes pulse-once {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        
        .animate-pulse-once {
          animation: pulse-once 0.5s ease-in-out;
        }
      `}</style>
      </div>
    </div>
  );
}
