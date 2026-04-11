// Game Configuration
export const config = {
  // Room settings
  maxRooms: 3,
  minPlayers: 2,
  maxPlayers: 10,
  
  // Game settings
  shuffleDuration: 3000, // ms
  revealDuration: 4000,  // ms (base, will be adjusted by player count)
  revealDurationPerPlayer: 500, // ms added per player
  revealMaxDuration: 6000, // ms cap
  
  // Calculate dynamic reveal duration based on player count
  // Multiplied by 3 for slower, more dramatic reveal
  getRevealDuration: (playerCount) => {
    const duration = config.revealDuration + (playerCount * config.revealDurationPerPlayer);
    return Math.min(duration, config.revealMaxDuration) * 3;
  },
  
  // Scoreboard settings
  maxScoreboardEntries: 100,
  scoreboardFile: './data/scoreboard.json',
  
  // Server settings
  port: process.env.PORT || 3001,
  
  // Feature flags
  enableScoreboard: true,
  enableSound: true,
};

// Room name word lists
export const adjectives = [
  'Lucky', 'Golden', 'Silver', 'Royal', 'Magic', 'Wild', 'Crazy', 'Happy',
  'Epic', 'Super', 'Mega', 'Ultra', 'Dark', 'Light', 'Fire', 'Ice',
  'Storm', 'Thunder', 'Shadow', 'Mystic', 'Cosmic', 'Neon', 'Crystal',
  'Diamond', 'Emerald', 'Ruby', 'Sapphire', 'Brave', 'Swift', 'Fierce'
];

export const nouns = [
  'Dragon', 'Phoenix', 'Tiger', 'Wolf', 'Eagle', 'Shark', 'Lion', 'Bear',
  'Castle', 'Tower', 'Palace', 'Temple', 'Arena', 'Stadium', 'Garden',
  'Forest', 'Ocean', 'Mountain', 'Valley', 'River', 'Storm', 'Comet',
  'Star', 'Moon', 'Sun', 'Galaxy', 'Universe', 'Kingdom', 'Empire',
  'Legend', 'Hero', 'Champion', 'Master', 'Knight', 'Wizard', 'Ninja'
];
