import puppeteer from 'puppeteer';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2', timeout: 30000 });

  // Wait for animations to settle
  await new Promise(r => setTimeout(r, 12000));

  // Full page screenshot
  await page.screenshot({
    path: 'dashboard_full_page.png',
    fullPage: true
  });
  console.log('Saved: dashboard_full_page.png');

  // Individual section screenshots
  const sections = ['hero', 'explore', 'compare', 'discoveries', 'quiz', 'footer'];
  for (const id of sections) {
    const el = await page.$(`#${id}, section:has(h2)`);
    if (el) {
      try {
        await el.screenshot({ path: `screenshot_${id}.png` });
        console.log(`Saved: screenshot_${id}.png`);
      } catch (e) {
        console.log(`Skipped ${id}: ${e.message}`);
      }
    }
  }

  // Generate PDF from the page
  await page.pdf({
    path: 'Life_Milestones_Dashboard_Visual.pdf',
    format: 'A4',
    printBackground: true,
    margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' }
  });
  console.log('Saved: Life_Milestones_Dashboard_Visual.pdf');

  await browser.close();
  console.log('Done!');
}

capture().catch(e => { console.error('Error:', e.message); process.exit(1); });
