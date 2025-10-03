import puppeteer from 'puppeteer';
import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure screenshots directory exists
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir);
}

async function takeScreenshot() {
  try {
    const browser = await puppeteer.launch({ headless: true }); // Headless mode for automation
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 }); // Set a wide viewport for full standings view
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2', timeout: 30000 }); // Load local site, wait for content
    const timestamp = new Date().toISOString().replace(/:/g, '-'); // Safe filename
    const filePath = path.join(screenshotsDir, `standings_${timestamp}.png`);
    await page.screenshot({ path: filePath, fullPage: true }); // Capture full page
    await browser.close();
    console.log(`Screenshot saved: ${filePath}`);
  } catch (error) {
    console.error('Screenshot failed:', error);
  }
}

// Schedule to run every hour (adjust cron pattern as needed, e.g., '*/5 * * * *' for every 5 minutes)
cron.schedule('*/5 * * * *', () => {
  takeScreenshot();
});

console.log('Screenshot scheduler running... Press Ctrl+C to stop.');
