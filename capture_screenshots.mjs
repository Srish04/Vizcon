import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_DIR = path.join(__dirname, 'screenshots');

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log('Loading page...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 4000));

  async function scrollHeroTo(pct) {
    await page.evaluate((p) => {
      const hero = document.getElementById('hero');
      const heroH = hero.offsetHeight - window.innerHeight;
      window.scrollTo(0, heroH * p);
    }, pct);
    await new Promise(r => setTimeout(r, 1500));
  }

  // === HERO ===
  console.log('\n=== HERO ===');
  await scrollHeroTo(0.05); await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: path.join(OUT_DIR, '01_hero_title.png') });
  console.log('01');

  await scrollHeroTo(0.35);
  await page.screenshot({ path: path.join(OUT_DIR, '02_hero_timeline.png') });
  console.log('02');

  await scrollHeroTo(0.52);
  await page.screenshot({ path: path.join(OUT_DIR, '03_hero_sequences.png') });
  console.log('03');

  await scrollHeroTo(0.7);
  await page.screenshot({ path: path.join(OUT_DIR, '04_hero_race_mid.png') });
  console.log('04');

  await scrollHeroTo(0.84);
  await page.screenshot({ path: path.join(OUT_DIR, '05_hero_race_end.png') });
  console.log('05');

  await scrollHeroTo(0.93); await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(OUT_DIR, '06_hero_facts.png') });
  console.log('06');

  // === EXPLORE ===
  console.log('\n=== EXPLORE ===');
  await page.evaluate(() => document.getElementById('explore').scrollIntoView());
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(OUT_DIR, '07_explore_scatter.png') });
  console.log('07');

  await page.evaluate(() => {
    const b = [...document.querySelectorAll('#explore button')].find(b => b.textContent.includes('Rankings'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => window.scrollBy(0, 200));
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(OUT_DIR, '08_explore_rankings.png') });
  console.log('08');

  // === COMPARE ===
  console.log('\n=== COMPARE ===');
  await page.evaluate(() => document.getElementById('compare').scrollIntoView());
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(OUT_DIR, '09_compare_picker.png') });
  console.log('09');

  await page.evaluate(() => {
    const b = [...document.querySelectorAll('#compare button')].find(b => b.textContent.includes('Compare'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(OUT_DIR, '10_compare_header.png') });
  console.log('10');

  await page.evaluate(() => window.scrollBy(0, 500));
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUT_DIR, '11_compare_timeline.png') });
  console.log('11');

  await page.evaluate(() => window.scrollBy(0, 600));
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUT_DIR, '12_compare_outcomes.png') });
  console.log('12');

  await page.evaluate(() => window.scrollBy(0, 600));
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUT_DIR, '13_compare_connections.png') });
  console.log('13');

  await page.evaluate(() => window.scrollBy(0, 500));
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUT_DIR, '14_compare_insights.png') });
  console.log('14');

  // === DISCOVERIES ===
  console.log('\n=== DISCOVERIES ===');
  await page.evaluate(() => document.getElementById('discoveries').scrollIntoView());
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(OUT_DIR, '15_discovery1_sequence_drag.png') });
  console.log('15');

  // Scroll to Discovery 2 (dark section)
  await page.evaluate(() => window.scrollBy(0, 900));
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(OUT_DIR, '16_discovery2_marriage_75pct.png') });
  console.log('16');

  await page.evaluate(() => window.scrollBy(0, 600));
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUT_DIR, '17_discovery2_scatter.png') });
  console.log('17');

  // Scroll to Discovery 3 (longevity)
  await page.evaluate(() => window.scrollBy(0, 800));
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(OUT_DIR, '18_discovery3_longevity_title.png') });
  console.log('18');

  await page.evaluate(() => window.scrollBy(0, 500));
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUT_DIR, '19_discovery3_bars.png') });
  console.log('19');

  // === QUIZ ===
  console.log('\n=== QUIZ ===');
  await page.evaluate(() => document.getElementById('quiz').scrollIntoView());
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(OUT_DIR, '20_quiz.png') });
  console.log('20');

  await page.evaluate(() => {
    const b = [...document.querySelectorAll('#quiz button')].find(b => b.textContent.includes('India'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUT_DIR, '21_quiz_answered.png') });
  console.log('21');

  // === FOOTER ===
  console.log('\n=== FOOTER ===');
  await page.evaluate(() => document.getElementById('footer').scrollIntoView());
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUT_DIR, '22_footer.png') });
  console.log('22');

  // === PDF ===
  console.log('\n=== GENERATING PDF ===');
  const pdfPage = await browser.newPage();
  await pdfPage.setViewport({ width: 1440, height: 900 });

  const screenshots = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.png')).sort();
  const imagesHtml = screenshots.map((f, i) => {
    const name = f.replace(/^\d+_/, '').replace('.png', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const b64 = fs.readFileSync(path.join(OUT_DIR, f)).toString('base64');
    return `<div style="page-break-inside:avoid;margin-bottom:20px;${i > 0 ? 'padding-top:12px;' : ''}">
      <h3 style="font-family:Inter,sans-serif;font-size:13px;color:#264653;margin:0 0 6px;">${i+1}. ${name}</h3>
      <img src="data:image/png;base64,${b64}" style="width:100%;border-radius:6px;box-shadow:0 1px 6px rgba(0,0,0,0.08);"/>
    </div>`;
  }).join('\n');

  const html = `<!DOCTYPE html><html><head><style>
    body{margin:0;padding:24px;font-family:Inter,sans-serif;background:#fff;}
    h1{font-size:24px;color:#264653;margin:0 0 4px;}
    p.sub{font-size:13px;color:#475569;margin:0 0 24px;}
  </style></head><body>
    <h1>Life Milestones: How the World Grows Up</h1>
    <p class="sub">Dashboard Screenshots - VizCon 2026</p>
    ${imagesHtml}
  </body></html>`;

  await pdfPage.setContent(html, { waitUntil: 'networkidle0' });
  await pdfPage.pdf({
    path: path.join(__dirname, 'Life_Milestones_Screenshots.pdf'),
    format: 'A4', printBackground: true,
    margin: { top: '12mm', bottom: '12mm', left: '12mm', right: '12mm' }
  });
  console.log('PDF saved');

  await browser.close();
  console.log(`\nDone: ${screenshots.length} screenshots + PDF`);
}

capture().catch(e => { console.error('Error:', e.message); process.exit(1); });
