import { browser } from '../sdk/browser.mjs';

const page = await browser.newPage('https://www.google.com/', { waitUntil: 'load' });
await page.locator("textarea[name='q']").wait();
await page.locator("textarea[name='q']").fill('html inspect');
await page.locator("[role='listbox']").wait();
await page.click("[role='option']", { index: 2 });
await page.locator('a h3').wait({ timeoutMs: 30000 });
const state = await page.evaluate(() => ({ href: location.href, title: document.title }));
await page.scroll({ deltaY: 900 });
const shot = await page.screenshot({ fullPage: false });
console.log(JSON.stringify({ ok: true, pageId: page.pageId, screenshotBytes: (shot.dataBase64 || '').length, state }, null, 2));
await browser.close();
