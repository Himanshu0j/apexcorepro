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

  // Desktop 1440x900
  console.log('Capturing Desktop 1440x900...');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: path.join(outDir, '01_desktop_1440.png'), fullPage: true });

  // Laptop 1366x768
  console.log('Capturing Laptop 1366x768...');
  await page.setViewport({ width: 1366, height: 768 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: path.join(outDir, '02_laptop_1366.png'), fullPage: true });

  // Tablet 768x1024
  console.log('Capturing Tablet 768x1024...');
  await page.setViewport({ width: 768, height: 1024 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: path.join(outDir, '03_tablet_768.png'), fullPage: true });

  // Mobile 390x844
  console.log('Capturing Mobile 390x844...');
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: path.join(outDir, '04_mobile_390.png'), fullPage: true });

  // Small Mobile 320x568
  console.log('Capturing Small Mobile 320x568...');
  await page.setViewport({ width: 320, height: 568 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: path.join(outDir, '05_mobile_320.png'), fullPage: true });

  // Test form submission & post-submission confirmation state
  console.log('Testing and capturing Post-Submission state...');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.type('#customerEmail', 'enterprise-buyer@acme-corp.com');
  await page.type('#customerName', 'Acme Corporation');
  // 64-hex dummy tx hash
  const sampleTx = 'e7a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcde';
  await page.type('#txHash', sampleTx);

  // Click both checkboxes
  const checkboxes = await page.$$('input[type="checkbox"]');
  for (const box of checkboxes) {
    await box.click();
  }

  // Click submit
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 2000));
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: path.join(outDir, '10_submitted_confirmation.png'), fullPage: true });

  // Admin Dashboard
  console.log('Logging into Admin Dashboard...');
  await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle0' });
  await page.type('input[type="password"]', 'AdminSecure2026!');
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 1500));
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: path.join(outDir, '12_admin_dashboard.png'), fullPage: true });

  // Switch to License Keys tab in Admin
  console.log('Capturing Admin License Keys tab...');
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const keyTab = tabs.find(t => t.textContent.includes('License Keys'));
    if (keyTab) keyTab.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: path.join(outDir, '13_admin_keys_pool.png'), fullPage: true });

  // Switch to Settings tab in Admin
  console.log('Capturing Admin Settings tab...');
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const setTab = tabs.find(t => t.textContent.includes('Settings'));
    if (setTab) setTab.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: path.join(outDir, '14_admin_settings.png'), fullPage: true });

  await browser.close();
  console.log('All QA captures complete.');
}

run().catch(console.error);
