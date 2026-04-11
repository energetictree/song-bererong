export interface Card {
  suit: '♠' | '♥' | '♦' | '♣';
  rank: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
  id: string;
}

export interface Player {
  id: string;
  name: string;
  isOwner: boolean;
  card: Card | null;
  showCardClicked: boolean;
  playAgainClicked: boolean;
}

export type GameState = 'waiting' | 'shuffling' | 'dealing' | 'peeking' | 'revealing' | 'revealed' | 'ended';

export interface Room {
  id: string;
  name: string;
  owner: string;
  players: Player[];
  locked: boolean;
  gameState: GameState;
  deck: Card[];
  winner: Player | null;
}

export interface GameStore {
  room: Room | null;
  myCard: Card | null;
  myId: string | null;
  showCardCount: number;
  playAgainCount: number;
  isConnected: boolean;
}
