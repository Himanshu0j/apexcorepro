const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function run() {
  const outDir = path.join(__dirname, '../screenshots');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Test Desktop 1440x900
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(outDir, 'audit_desktop_current.png'), fullPage: true });

  // Test Mobile 390x844
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(outDir, 'audit_mobile_current.png'), fullPage: true });

  await browser.close();
  console.log('Current audit screenshots captured.');
}

run().catch(console.error);
