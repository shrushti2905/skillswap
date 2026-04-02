const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5500/');
  await new Promise(r => setTimeout(r, 2000));
  const rootHtml = await page.evaluate(() => document.getElementById('root').innerHTML);
  console.log('Root HTML:', rootHtml);
  await browser.close();
})();