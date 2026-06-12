const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  // 브릿지 1 (Ch.1 진입)
  await page.evaluate(() => document.querySelectorAll('.bridge')[0].scrollIntoView({block:'center'}));
  await page.waitForTimeout(1300);
  await page.screenshot({ path: 'shot-bridge1.png' });
  // 스크럽 텍스트 (Ch.1 본문)
  await page.evaluate(() => document.getElementById('ch-story').scrollIntoView());
  await page.waitForTimeout(1300);
  await page.screenshot({ path: 'shot-ch1.png' });
  // 브릿지 → 에필로그
  await page.evaluate(() => document.getElementById('ch-end').scrollIntoView({block:'center'}));
  await page.waitForTimeout(1300);
  await page.screenshot({ path: 'shot-epilogue.png' });
  await browser.close();
  console.log('done');
})();
