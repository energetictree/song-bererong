import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { config, adjectives, nouns } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure data directory exists
const dataDir = join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const scoreboardPath = join(dataDir, 'scoreboard.json');
if (!fs.existsSync(scoreboardPath)) {
  fs.writeFileSync(scoreboardPath, '[]');
}

// Load app version
let appVersion = { version: '1.0.0', buildDate: new Date().toISOString() };
try {
  const versionPath = join(__dirname, 'version.json');
  if (fs.existsSync(versionPath)) {
    appVersion = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
  }
} catch (e) {
  console.error('Failed to load version:', e);
}

const httpServer = createServer((req, res) => {
  // API endpoint for room count
  if (req.url === '/api/rooms' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      activeRooms: rooms.size,
      maxRooms: config.maxRooms,
      roomIds: Array.from(rooms.keys())
    }));
    return;
  }
  
  // API endpoint for app version
  if (req.url === '/api/version' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(appVersion));
    return;
  }
  
  // API endpoint for scoreboard
  if (req.url === '/api/scoreboard' && req.method === 'GET') {
    try {
      const scoreboard = JSON.parse(fs.readFileSync(scoreboardPath, 'utf8'));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(scoreboard));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to load scoreboard' }));
    }
    return;
  }
  
  // Serve static files
  const distPath = join(__dirname, 'dist');
  let filePath = join(distPath, req.url === '/' ? 'index.html' : req.url);
  
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      filePath = join(distPath, 'index.html');
    }
    
    const ext = filePath.split('.').pop();
    const contentTypes = {
      'html': 'text/html',
      'js': 'application/javascript',
      'css': 'text/css',
      'json': 'application/json',
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'gif': 'image/gif',
      'svg': 'image/svg+xml',
      'ico': 'image/x-icon',
      'mp3': 'audio/mpeg'
    };
    
    const contentType = contentTypes[ext] || 'application/octet-stream';
    
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });
});

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Game state
const rooms = new Map();
const players = new Map();

function generateRoomName() {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj}${noun}`;
}

function createDeck() {
  const suits = ['♠', '♥', '♦', '♣'];
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const deck = [];
  
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank, id: `${rank}${suit}` });
    }
  }
  
  return deck;
}

function shuffleDeck(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getCardValue(rank) {
  if (rank === 'A') return 14;
  if (rank === 'K') return 13;
  if (rank === 'Q') return 12;
  if (rank === 'J') return 11;
  return parseInt(rank);
}

function determineWinner(players) {
  let winner = null;
  let maxValue = -1;
  
  for (const player of players) {
    if (player.card) {
      const value = getCardValue(player.card.rank);
      if (value > maxValue) {
        maxValue = value;
        winner = player;
      }
    }
  }
  
  return winner;
}

function saveScoreboardEntry(roomName, winner, players) {
  if (!config.enableScoreboard) return;
  
  try {
    const scoreboard = JSON.parse(fs.readFileSync(scoreboardPath, 'utf8'));
    
    const entry = {
      id: Date.now().toString(),
      roomName,
      winner: winner ? { name: winner.name, card: winner.card } : null,
      players: players.map(p => ({ name: p.name, card: p.card })),
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString()
    };
    
    scoreboard.unshift(entry);
    
    // Keep only max entries
    if (scoreboard.length > config.maxScoreboardEntries) {
      scoreboard.length = config.maxScoreboardEntries;
    }
    
    fs.writeFileSync(scoreboardPath, JSON.stringify(scoreboard, null, 2));
  } catch (e) {
    console.error('Failed to save scoreboard:', e);
  }
}

function getScoreboard() {
  try {
    return JSON.parse(fs.readFileSync(scoreboardPath, 'utf8'));
  } catch (e) {
    return [];
  }
}

// Helper function to get room list for display
function getRoomList() {
  return Array.from(rooms.values()).map(room => ({
    id: room.id,
    name: room.name,
    playerCount: room.players.length,
    maxPlayers: config.maxPlayers,
    locked: room.locked,
    gameState: room.gameState
  }));
}

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);
  
  // Send current room count and list
  socket.emit('room-stats', { 
    activeRooms: rooms.size, 
    maxRooms: config.maxRooms,
    rooms: getRoomList()
  });
  
  // Send scoreboard
  socket.emit('scoreboard', getScoreboard());
  
  // Create room
  socket.on('create-room', ({ playerName }) => {
    // Check room limit
    if (rooms.size >= config.maxRooms) {
      socket.emit('error', { message: `Maximum ${config.maxRooms} rooms allowed. Please try again later.` });
      return;
    }
    
    const roomName = generateRoomName();
    const roomId = Math.random().toString(36).substring(2, 10);
    
    const room = {
      id: roomId,
      name: roomName,
      owner: socket.id,
      players: [{
        id: socket.id,
        name: playerName,
        isOwner: true,
        card: null,
        showCardClicked: false,
        playAgainClicked: false
      }],
      locked: false,
      gameState: 'waiting',
      deck: [],
      winner: null
    };
    
    rooms.set(roomId, room);
    players.set(socket.id, { roomId, playerName });
    socket.join(roomId);
    
    // Broadcast updated room count and list to all clients
    io.emit('room-stats', { 
      activeRooms: rooms.size, 
      maxRooms: config.maxRooms,
      rooms: getRoomList()
    });
    
    socket.emit('room-created', { roomId, roomName, playerId: socket.id });
    io.to(roomId).emit('room-updated', room);
  });
  
  // Join room
  socket.on('join-room', ({ roomId, playerName }) => {
    const room = rooms.get(roomId);
    
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }
    
    if (room.locked) {
      socket.emit('error', { message: 'Room is locked' });
      return;
    }
    
    if (room.players.length >= config.maxPlayers) {
      socket.emit('error', { message: 'Room is full' });
      return;
    }
    
    if (room.gameState !== 'waiting') {
      socket.emit('error', { message: 'Game already in progress' });
      return;
    }
    
    const player = {
      id: socket.id,
      name: playerName,
      isOwner: false,
      card: null,
      showCardClicked: false,
      playAgainClicked: false
    };
    
    room.players.push(player);
    players.set(socket.id, { roomId, playerName });
    socket.join(roomId);
    
    socket.emit('room-joined', { roomId, roomName: room.name, playerId: socket.id });
    io.to(roomId).emit('room-updated', room);
  });
  
  // Lock room
  socket.on('lock-room', ({ roomId }) => {
    const room = rooms.get(roomId);
    
    if (!room || room.owner !== socket.id) {
      socket.emit('error', { message: 'Not authorized' });
      return;
    }
    
    room.locked = !room.locked;
    io.to(roomId).emit('room-updated', room);
  });
  
  // Start game
  socket.on('start-game', ({ roomId }) => {
    const room = rooms.get(roomId);
    
    if (!room || room.owner !== socket.id) {
      socket.emit('error', { message: 'Not authorized' });
      return;
    }
    
    if (room.players.length < config.minPlayers) {
      socket.emit('error', { message: `Need at least ${config.minPlayers} players` });
      return;
    }
    
    room.gameState = 'shuffling';
    room.deck = shuffleDeck(createDeck());
    
    io.to(roomId).emit('game-started', { gameState: room.gameState });
    io.to(roomId).emit('room-updated', room);
    
    // Deal cards after shuffle animation
    setTimeout(() => {
      room.gameState = 'dealing';
      
      // Deal one card to each player
      for (let i = 0; i < room.players.length; i++) {
        room.players[i].card = room.deck[i];
        room.players[i].showCardClicked = false;
        room.players[i].playAgainClicked = false;
      }
      
      room.gameState = 'peeking';
      io.to(roomId).emit('cards-dealt', { gameState: room.gameState });
      io.to(roomId).emit('room-updated', room);
      
      // Send each player their own card
      room.players.forEach(player => {
        io.to(player.id).emit('your-card', { card: player.card });
      });
    }, config.shuffleDuration);
  });
  
  // Show card button clicked
  socket.on('show-card-clicked', ({ roomId }) => {
    const room = rooms.get(roomId);
    
    if (!room) return;
    
    const player = room.players.find(p => p.id === socket.id);
    if (player && room.gameState === 'peeking') {
      player.showCardClicked = true;
      
      const clickedCount = room.players.filter(p => p.showCardClicked).length;
      io.to(roomId).emit('show-card-count', { count: clickedCount, total: room.players.length });
      
      // Check if all players clicked
      if (clickedCount === room.players.length) {
        room.gameState = 'revealing';
        
        // Calculate dynamic reveal duration based on player count
        const revealDuration = config.getRevealDuration(room.players.length);
        
        io.to(roomId).emit('revealing-cards', { 
          gameState: room.gameState,
          revealDuration,
          playerCount: room.players.length
        });
        
        // Reveal cards with dramatic delay (adjusted for player count)
        setTimeout(() => {
          room.gameState = 'revealed';
          room.winner = determineWinner(room.players);
          
          // Save to scoreboard
          saveScoreboardEntry(room.name, room.winner, room.players);
          
          // Broadcast updated scoreboard to all clients
          io.emit('scoreboard', getScoreboard());
          
          io.to(roomId).emit('cards-revealed', { 
            gameState: room.gameState, 
            winner: room.winner,
            players: room.players.map(p => ({ id: p.id, name: p.name, card: p.card }))
          });
        }, revealDuration + 800); // +800ms for flip animation
      }
      
      io.to(roomId).emit('room-updated', room);
    }
  });
  
  // Play again clicked
  socket.on('play-again-clicked', ({ roomId }) => {
    const room = rooms.get(roomId);
    
    if (!room) return;
    
    const player = room.players.find(p => p.id === socket.id);
    if (player && room.gameState === 'revealed') {
      player.playAgainClicked = true;
      
      const clickedCount = room.players.filter(p => p.playAgainClicked).length;
      io.to(roomId).emit('play-again-count', { count: clickedCount, total: room.players.length });
      
      // Check if all players want to play again
      if (clickedCount === room.players.length) {
        // Reset game state
        room.gameState = 'waiting';
        room.winner = null;
        room.deck = [];
        room.players.forEach(p => {
          p.card = null;
          p.showCardClicked = false;
          p.playAgainClicked = false;
        });
        
        io.to(roomId).emit('game-reset', { gameState: room.gameState });
        io.to(roomId).emit('room-updated', room);
      }
      
      io.to(roomId).emit('room-updated', room);
    }
  });
  
  // Leave room
  socket.on('leave-room', ({ roomId }) => {
    const room = rooms.get(roomId);
    
    if (room) {
      room.players = room.players.filter(p => p.id !== socket.id);
      
      // If owner leaves, assign new owner or delete room
      if (room.owner === socket.id && room.players.length > 0) {
        room.owner = room.players[0].id;
        room.players[0].isOwner = true;
      }
      
      if (room.players.length === 0) {
        rooms.delete(roomId);
        
        // Broadcast updated room count
        io.emit('room-stats', { 
          activeRooms: rooms.size, 
          maxRooms: config.maxRooms 
        });
      } else {
        io.to(roomId).emit('room-updated', room);
      }
    }
    
    players.delete(socket.id);
    socket.leave(roomId);
  });
  
  // Disconnect
  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    
    const playerData = players.get(socket.id);
    if (playerData) {
      const { roomId } = playerData;
      const room = rooms.get(roomId);
      
      if (room) {
        room.players = room.players.filter(p => p.id !== socket.id);
        
        if (room.owner === socket.id && room.players.length > 0) {
          room.owner = room.players[0].id;
          room.players[0].isOwner = true;
        }
        
        if (room.players.length === 0) {
          rooms.delete(roomId);
          
          // Broadcast updated room count
          io.emit('room-stats', { 
            activeRooms: rooms.size, 
            maxRooms: config.maxRooms 
          });
        } else {
          io.to(roomId).emit('room-updated', room);
        }
      }
      
      players.delete(socket.id);
    }
  });
});

const PORT = config.port;
httpServer.listen(PORT, () => {
  console.log(`Song Bererong server running on port ${PORT}`);
  console.log(`Max rooms: ${config.maxRooms}`);
  console.log(`Scoreboard: ${config.enableScoreboard ? 'enabled' : 'disabled'}`);
});
