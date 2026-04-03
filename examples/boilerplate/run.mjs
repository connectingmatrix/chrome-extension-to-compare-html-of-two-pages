import { browser, server } from '../../sdk/index.mjs';

await server.start();
const page = await browser.newPage('http://127.0.0.1:4017/examples/search.html', { waitUntil: 'load' });
page.on('console', (event) => console.log('PAGE LOG:', event.text || ''));
await page.locator("::-p-aria(Search)").fill('gamma');
await page.locator("[role='listbox']").wait();
await page.click("[role='option']", { index: 2 });
await page.locator('#search').wait();
const data = await page.data('#search', { snapshot: true });
console.log(JSON.stringify(data, null, 2));
await browser.close();
server.stop();
