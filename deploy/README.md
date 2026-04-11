# Card Showdown - Multiplayer Card Game

A real-time multiplayer card game room where players can create rooms, join games, and compete to reveal the highest card.

## Features

- **Room Creation**: Create rooms with auto-generated names (Adjective + Noun)
- **2-10 Players**: Support for 2 to 10 players per room
- **Room Lock**: Room owner can lock/unlock the room
- **Card Shuffling**: Animated card shuffling visible to all players
- **Peek at Card**: Players can peek at their dealt card
- **Show Card Button**: Counter shows how many players are ready
- **Dramatic Reveal**: All cards revealed simultaneously with animation
- **Winner Celebration**: Confetti effect and winner announcement
- **Play Again**: Option to play again or exit after each round

## How to Play

1. **Create or Join a Room**
   - Enter your name
   - Create a new room or join an existing one with a room ID

2. **Wait for Players**
   - Room owner can lock/unlock the room
   - Minimum 2 players required to start
   - Maximum 10 players allowed

3. **Start the Game**
   - Room owner clicks "Start Game"
   - Watch the card shuffling animation

4. **Peek at Your Card**
   - Click on your card to peek at it
   - Click "Show Card" when ready

5. **Reveal All Cards**
   - Once all players click "Show Card", cards are revealed
   - Winner is announced with confetti celebration

6. **Play Again or Exit**
   - Click "Play Again" to start a new round
   - All players must agree to play again

## Card Rankings (Highest to Lowest)

- Ace (A) - Highest
- King (K)
- Queen (Q)
- Jack (J)
- 10, 9, 8, 7, 6, 5, 4, 3, 2 - Lowest

## Running the Application

### Development Mode

```bash
# Install dependencies
npm install

# Start the WebSocket server
npm run server

# In another terminal, start the frontend
npm run dev
```

### Production Mode

```bash
# Install dependencies
npm install

# Build the frontend
npm run build

# Start the server (serves both frontend and WebSocket)
npm run server
```

The server will run on port 3001 by default.

## Technologies Used

- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Socket.io for real-time communication
- Canvas Confetti for celebration effects
