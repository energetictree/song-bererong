const puppeteer = require('/home/ubuntu/dev/beehive/app/node_modules/puppeteer');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/usr/bin/chromium-browser',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Set viewport to desktop size
  await page.setViewport({
    width: 1280,
    height: 800,
    deviceScaleFactor: 1
  });
  
  const baseUrl = 'http://localhost:5175';
  
  console.log('Taking screenshots of Song Bererong...');
  
  // 1. Home Screen
  console.log('Navigating to home...');
  await page.goto(baseUrl, { waitUntil: 'networkidle2', timeout: 60000 });
  await delay(3000);
  
  await page.screenshot({ path: 'screenshots/01-home.png', fullPage: false });
  console.log('Screenshot saved: 01-home.png');
  
  // 2. Create Room View
  console.log('Clicking Create Room...');
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(e => e.textContent, btn);
    if (text && text.includes('Create Room')) {
      await btn.click();
      break;
    }
  }
  await delay(2000);
  
  await page.screenshot({ path: 'screenshots/02-create-room.png', fullPage: false });
  console.log('Screenshot saved: 02-create-room.png');
  
  // Enter name and create room
  const inputs = await page.$$('input');
  if (inputs.length > 0) {
    await inputs[0].type('Player1');
    await delay(500);
  }
  
  // Click create room button
  const createButtons = await page.$$('button');
  for (const btn of createButtons) {
    const text = await page.evaluate(e => e.textContent, btn);
    if (text && text.includes('Create Room') && !text.includes('Back')) {
      await btn.click();
      break;
    }
  }
  await delay(3000);
  
  await page.screenshot({ path: 'screenshots/03-game-waiting.png', fullPage: false });
  console.log('Screenshot saved: 03-game-waiting.png');
  
  // Get room ID from page
  const pageContent = await page.content();
  const roomIdMatch = pageContent.match(/Room ID:\s*([a-zA-Z0-9]+)/);
  const roomId = roomIdMatch ? roomIdMatch[1] : null;
  console.log('Room ID:', roomId);
  
  // 4. Join Room View (new tab)
  console.log('Opening Join Room view...');
  const page2 = await browser.newPage();
  await page2.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
  await page2.goto(baseUrl, { waitUntil: 'networkidle2', timeout: 60000 });
  await delay(2000);
  
  // Click Join Room
  const buttons2 = await page2.$$('button');
  for (const btn of buttons2) {
    const text = await page2.evaluate(e => e.textContent, btn);
    if (text && text.includes('Join Room')) {
      await btn.click();
      break;
    }
  }
  await delay(3000);
  
  await page2.screenshot({ path: 'screenshots/04-join-room.png', fullPage: false });
  console.log('Screenshot saved: 04-join-room.png');
  
  // Join the room if room ID was found
  if (roomId) {
    const joinInputs = await page2.$$('input');
    if (joinInputs.length >= 2) {
      await joinInputs[0].type('Player2'); // Name
      await delay(300);
      await joinInputs[1].type(roomId); // Room ID
      await delay(500);
    }
    
    await page2.screenshot({ path: 'screenshots/05-join-room-filled.png', fullPage: false });
    console.log('Screenshot saved: 05-join-room-filled.png');
  }
  
  // Close join tab
  await page2.close();
  
  // 6. Scoreboard view
  console.log('Navigating to Scoreboard...');
  await page.goto(`${baseUrl}`, { waitUntil: 'networkidle2' });
  await delay(2000);
  
  const homeButtons = await page.$$('button');
  for (const btn of homeButtons) {
    const text = await page.evaluate(e => e.textContent, btn);
    if (text && text.includes('Scoreboard')) {
      await btn.click();
      break;
    }
  }
  await delay(2000);
  
  await page.screenshot({ path: 'screenshots/06-scoreboard.png', fullPage: false });
  console.log('Screenshot saved: 06-scoreboard.png');
  
  await browser.close();
  console.log('All screenshots saved to screenshots/ folder!');
})();
