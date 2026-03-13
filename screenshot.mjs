import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotDir = path.join(__dirname, 'temporary screenshots');

// Ensure screenshot directory exists
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

// Get next auto-incremented filename
function getNextFilename(label) {
  const files = fs.existsSync(screenshotDir) ? fs.readdirSync(screenshotDir) : [];
  const nums = files
    .map(f => f.match(/^screenshot-(\d+)/))
    .filter(Boolean)
    .map(m => parseInt(m[1], 10));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  const suffix = label ? `-${label}` : '';
  return path.join(screenshotDir, `screenshot-${next}${suffix}.png`);
}

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

// Scroll through the page to trigger IntersectionObserver-based animations
await page.evaluate(async () => {
  const totalHeight = document.body.scrollHeight;
  const step = 600;
  for (let y = 0; y < totalHeight; y += step) {
    window.scrollTo(0, y);
    await new Promise(r => setTimeout(r, 60));
  }
  window.scrollTo(0, 0);
});

// Force all reveal elements visible (for full-page screenshot)
await page.evaluate(() => {
  document.querySelectorAll('.r').forEach(el => el.classList.add('on'));
});

// Wait for animations to settle
await new Promise(r => setTimeout(r, 600));

const outputPath = getNextFilename(label);
await page.screenshot({ path: outputPath, fullPage: true });
await browser.close();

console.log(`Screenshot saved: ${outputPath}`);
