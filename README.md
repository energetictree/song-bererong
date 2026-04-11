# 🃏 Song Bererong

[![Version](https://img.shields.io/badge/version-1.0.2-blue.svg)](https://github.com/energetictree/songbererong)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

**Song Bererong** is a multiplayer card game with dramatic reveal animations, real-time gameplay, and a sacred battle theme. Play with 2-10 friends online and experience the suspense of the card reveal!

![Song Bererong Banner](./screenshots/banner.png)

## 🎮 Features

- **Real-time Multiplayer**: Play with 2-10 players using Socket.IO
- **Dramatic Card Reveal**: Slow, suspenseful animation where cover cards slide down to reveal all player cards simultaneously
- **Room System**: Create or join game rooms with unique IDs
- **Online Room List**: See available rooms before joining
- **Sound Effects**: Theme music, card sounds, drumroll suspense, and winner celebration
- **Auto-Update Check**: Clients automatically check for new versions and prompt to refresh
- **Scoreboard**: Track game history and champions
- **Responsive Design**: Works on desktop and mobile devices
- **Hot Reload Development**: Docker volume mounting for fast development

## 🖼️ Screenshots

### Home Screen
![Home](./screenshots/home.png)

### Create Room
![Create Room](./screenshots/create-room.png)

### Join Room with Online Room List
![Join Room](./screenshots/join-room.png)

### Game Room - Waiting
![Game Waiting](./screenshots/game-waiting.png)

### Dramatic Card Reveal
![Card Reveal](./screenshots/card-reveal.gif)

### Winner Announcement
![Winner](./screenshots/winner.png)

## 🏗️ Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type-safe development
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - UI component library
- **Socket.IO Client** - Real-time communication
- **Lucide React** - Icon library

### Backend
- **Node.js 20** - Runtime
- **Socket.IO** - WebSocket real-time events
- **Express-style HTTP Server** - API endpoints
- **CORS enabled** - Cross-origin support

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-service orchestration
- **Volume Mounting** - Hot reload for development

## 📁 Project Structure

```
songbererong/
├── app/                      # Main application
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── GameRoom.tsx      # Main game UI
│   │   │   ├── DramaticReveal.tsx # Card reveal animation
│   │   │   ├── UpdateNotification.tsx # Version check modal
│   │   │   └── ui/               # shadcn/ui components
│   │   ├── hooks/            # Custom React hooks
│   │   │   ├── useSocket.ts      # Socket.IO connection
│   │   │   ├── useSound.ts       # Audio management
│   │   │   └── useVersionCheck.ts # Version checking
│   │   ├── types/            # TypeScript types
│   │   └── lib/              # Utilities
│   ├── public/               # Static assets (images, sounds)
│   ├── server.js             # Backend server
│   ├── config.js             # Game configuration
│   ├── version.json          # App version
│   ├── docker-compose.yml    # Docker orchestration
│   └── package.json
└── deploy/                   # Production build
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/energetictree/songbererong.git
cd songbererong
```

### 2. Start with Docker Compose

```bash
docker-compose up -d
```

This will start:
- **Frontend**: http://localhost:5175 (Vite dev server with HMR)
- **Backend**: http://localhost:3003 (Socket.IO server)

### 3. Open in Browser

Navigate to http://localhost:5175

## 🛠️ Development Setup

The project uses Docker volumes for hot reload - any changes to files in `app/src/` are immediately reflected without rebuilding.

### Frontend Development

```bash
cd app
npm install
npm run dev
```

### Backend Development

```bash
cd app
npm install
npm run server
```

### Environment Variables

Create `.env` in the `app/` directory:

```env
PORT=3001
NODE_ENV=development
```

## 🎮 How to Play

1. **Create a Room**
   - Enter your name
   - Click "Create Room"
   - Share the Room ID with friends

2. **Join a Room**
   - Click "Join Room"
   - Select from the online room list or enter Room ID manually
   - Enter your name and join

3. **Start the Game**
   - Room owner clicks "Start Game" (requires 2+ players)
   - Cards are shuffled and dealt

4. **Peek Your Card**
   - Click your card to peek at it
   - Click "Show Card" when ready

5. **Dramatic Reveal**
   - Once all players click "Show Card"
   - Watch the suspenseful card reveal animation
   - Highest card wins!

6. **Play Again**
   - All players click "Play Again" to start a new round

## 📝 Configuration

Edit `app/config.js` to customize game settings:

```javascript
export const config = {
  maxRooms: 3,              // Maximum concurrent rooms
  minPlayers: 2,            // Minimum players to start
  maxPlayers: 10,           // Maximum players per room
  shuffleDuration: 3000,    // Shuffle animation duration (ms)
  revealDuration: 4000,     // Base reveal duration (ms)
  revealDurationPerPlayer: 500, // Additional time per player (ms)
  revealMaxDuration: 6000,  // Max reveal duration cap (ms)
  maxScoreboardEntries: 100 // Scoreboard history limit
};
```

## 🔄 Version Management

The app includes automatic version checking:

1. Update `app/version.json`:
   ```json
   {
     "version": "1.0.3",
     "buildDate": "2026-04-12"
   }
   ```

2. Restart containers:
   ```bash
   docker-compose restart
   ```

3. Connected clients will see an update modal within 30 seconds

## 📱 PWA Support

Song Bererong is a Progressive Web App:
- Installable on mobile devices
- Works offline after first load
- Service worker for caching

## 🐳 Docker Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Restart
docker-compose restart

# Stop
docker-compose down

# Full rebuild
docker-compose down && docker-compose up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [shadcn/ui](https://ui.shadcn.com/) components
- Sound effects from various royalty-free sources
- Inspired by traditional card games

---

**Made with ❤️ by [energetictree](https://github.com/energetictree)**
