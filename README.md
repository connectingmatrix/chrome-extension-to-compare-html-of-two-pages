# CTM Puppet

CTM Puppet is a Chrome extension plus local server for trusted browser control, live page sessions, DOM/style diffs, screenshots, and scriptable inspection. Every non-`/api` route returns this file as `text/markdown`, so AI clients can discover the contract from `GET /`, `GET /docs`, or any other non-API path.

## Quick Start

1. `npm install`
2. `npm run build`
3. Load `/Users/abeer/dev/chrome_extension_utils/dist` as an unpacked Chrome extension
4. `npm run server`
5. `npm run open:extension -- chrome-extension://YOUR_EXTENSION_ID/sidepanel.html`
6. Keep the extension page open until `GET http://127.0.0.1:4017/api/instances` shows a connected item

## SDK First

```js
import server from 'ctm-puppet';

await server.start();
const page = await browser.newPage();
await page.goto('https://developer.chrome.com/', { waitUntil: 'load' });
await page.setViewport({ width: 1080, height: 1024 });
await page.keyboard.press('/');
await page.locator('::-p-aria(Search)').fill('automate beyond recorder');
await page.locator('.devsite-result-item-link').click({ waitUntil: 'networkidle2' });
const titleHandle = await page.locator('::-p-text(Customize and automate)').waitHandle();
const title = await titleHandle.evaluate((node) => node.textContent);
page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
await page.evaluate(() => console.log(`url is ${location.href}`));
await browser.close();
```

### More SDK patterns

```js
await page.setRequestInterception(true);
page.on('request', async (request) => {
  if (request.isInterceptResolutionHandled()) return;
  if (request.url().endsWith('.png') || request.url().endsWith('.jpg')) await request.abort();
  else await request.continue();
});
await page.goto('https://example.com', { waitUntil: 'networkidle2' });
await page.screenshot({ path: '/tmp/example.png' });
const fileInput = await page.waitForSelector('input[type=file]');
await fileInput.uploadFile(['/absolute/path/file.txt']);
const frames = await page.iframes();
await page.iframe[frames[0].frameId].click('#frame-button');
```

## Main SDK Surface

- `await server.start()` starts or reuses the local listener and installs `globalThis.browser`
- `await browser.newPage(url?, options?)`
- `await browser.pages()`
- `await browser.close()`
- `await page.goto(url, options?)`
- `await page.reload(options?)`
- `await page.setViewport({ width, height })`
- `await page.setRequestInterception(true | false)`
- `page.on('console' | 'request' | 'navigation' | 'network.request', handler)`
- `page.locator(selector)`
- `await page.waitForSelector(selector, options?)`
- `await page.click(selector, options?)`
- `await page.type(selector, value, options?)`
- `await page.keyboard.press(key, options?)`
- `await page.select(selector, value, options?)`
- `await page.dragAndDrop(sourceSelector, targetSelector, options?)`
- `await page.scroll(options?)`
- `await page.submit(selector, options?)`
- `await page.evaluate(scriptOrFunction, ...args)`
- `await page.html(selector?)`
- `await page.data(selector, { snapshot })`
- `await page.screenshot({ selector, fullPage, path })`
- `await page.compare(otherPage, options?)`
- `await page.compareSelector(selector, otherPage.selectorTree(selector), { snapshot: true })`
- `await page.frames()`
- `await page.iframes()`
- `page.frame(frameId)` and `page.iframe[frameId]`
- `await page.close()`

## REST Routes

Live routes:
- `POST /api/pages/open`
- `GET /api/pages/active`
- `POST /api/pages/actions`
- `POST /api/pages/diff`
- `POST /api/pages/data`
- `POST /api/pages/html`
- `POST /api/pages/frames`
- `POST /api/pages/screenshot`
- `POST /api/pages/run`
- `POST /api/pages/close`

Legacy routes:
- `POST /api/compare/pages`
- `POST /api/compare/selector`
- `POST /api/inspect/selector`

Utility routes:
- `GET /api/health`
- `GET /api/instances`

Live socket:
- `ws://127.0.0.1:4017/api/live`

## Open Pages

```json
{
  "pages": [
    { "role": "left", "url": "http://127.0.0.1:4017/examples/compare-left.html", "width": 1440, "height": 900, "waitUntil": "load" },
    { "role": "right", "url": "http://127.0.0.1:4017/examples/compare-right.html", "width": 1440, "height": 900, "waitUntil": "load" }
  ]
}
```

Actions passed to `POST /api/pages/open` may use `role` instead of `pageId`.

## Action Arrays

```json
{
  "actions": [
    { "type": "wait_for_selector", "pageId": "PAGE_ID", "selector": "textarea[name='q']", "visible": true, "timeoutMs": 30000 },
    { "type": "type_text", "pageId": "PAGE_ID", "selector": "textarea[name='q']", "value": "ctm puppet chrome extension", "clearFirst": true },
    { "type": "click", "pageId": "PAGE_ID", "selector": "[role='option']", "index": 1, "waitUntil": "networkidle2" },
    { "type": "scroll", "pageId": "PAGE_ID", "deltaY": 900 }
  ]
}
```

## Action Reference

- `click`: `await page.click('.button', { index: 0, waitUntil: 'load' })`
  raw: `{ "type": "click", "pageId": "PAGE_ID", "selector": ".button", "index": 0, "waitUntil": "load" }`
- `type_text`: `await page.type("input[name='q']", 'hello', { clearFirst: true })`
  raw: `{ "type": "type_text", "pageId": "PAGE_ID", "selector": "input[name='q']", "value": "hello", "clearFirst": true }`
- `send_key`: `await page.keyboard.press('Enter')`
  raw: `{ "type": "send_key", "pageId": "PAGE_ID", "key": "Enter" }`
- `select_option`: `await page.select("select[name='country']", 'jp')`
  raw: `{ "type": "select_option", "pageId": "PAGE_ID", "selector": "select[name='country']", "value": "jp" }`
- `drag_drop`: `await page.dragAndDrop('.card', '#target')`
  raw: `{ "type": "drag_drop", "pageId": "PAGE_ID", "sourceSelector": ".card", "targetSelector": "#target" }`
- `scroll`: `await page.scroll({ deltaY: 900 })`
  raw: `{ "type": "scroll", "pageId": "PAGE_ID", "deltaY": 900 }`
- `submit`: `await page.submit('#demo-form')`
  raw: `{ "type": "submit", "pageId": "PAGE_ID", "selector": "#demo-form" }`
- `wait_for_selector`: `await page.waitForSelector('#ready', { timeoutMs: 30000 })`
  raw: `{ "type": "wait_for_selector", "pageId": "PAGE_ID", "selector": "#ready", "visible": true, "timeoutMs": 30000 }`
- `reload_page`: `await page.reload({ waitUntil: 'networkidle2' })`
  raw: `{ "type": "reload_page", "pageId": "PAGE_ID", "waitUntil": "networkidle2" }`
- `change_screen_size`: `await page.setViewport({ width: 1024, height: 700 })`
  raw: `{ "type": "change_screen_size", "pageId": "PAGE_ID", "width": 1024, "height": 700 }`
- `navigate_to_url`: `await page.goto('https://example.com', { waitUntil: 'load' })`
  raw: `{ "type": "navigate_to_url", "pageId": "PAGE_ID", "url": "https://example.com", "waitUntil": "load" }`
- `get_page_diff`: `await left.compare(right, { selector: '.card', snapshot: true })`
  raw: `{ "type": "get_page_diff", "leftPageId": "LEFT_ID", "rightPageId": "RIGHT_ID", "selector": ".card", "snapshot": true }`
- `get_page_data`: `await page.data('.card', { snapshot: true })`
  raw: `{ "type": "get_page_data", "pageId": "PAGE_ID", "selector": ".card", "snapshot": true }`
- `get_page_html`: `await page.html('#main')`
  raw: `{ "type": "get_page_html", "pageId": "PAGE_ID", "selector": "#main" }`
- `screenshot_page`: `await page.screenshot({ selector: '#main', path: '/tmp/main.png' })`
  raw: `{ "type": "screenshot_page", "pageId": "PAGE_ID", "selector": "#main", "fullPage": false }`
- `close_page`: `await page.close()`
  raw: `{ "type": "close_page", "pageId": "PAGE_ID" }`
- `intercept_request`: `await page.run([{ type: 'intercept_request', pageId: page.pageId, ruleId: 'observe-all', mode: 'observe', match: { urlPattern: '*' } }])`
  raw: `{ "type": "intercept_request", "pageId": "PAGE_ID", "ruleId": "observe-all", "mode": "observe", "match": { "urlPattern": "*" } }`
- `record_start`: `await page.run([{ type: 'record_start', pageId: page.pageId, recordId: 'header', selector: '.header', include: ['classes', 'styles', 'tree'] }])`
  raw: `{ "type": "record_start", "pageId": "PAGE_ID", "recordId": "header", "selector": ".header", "include": ["classes", "styles", "tree"] }`
- `record_stop`: `await page.run([{ type: 'record_stop', pageId: page.pageId, recordId: 'header' }])`
  raw: `{ "type": "record_stop", "pageId": "PAGE_ID", "recordId": "header" }`
- `execute_script`: `await page.evaluate(() => ({ href: location.href, title: document.title }))`
  raw: `{ "type": "execute_script", "pageId": "PAGE_ID", "script": "return { href: location.href, title: document.title };" }`
- `upload_files`: `await page.waitForSelector('#file-input').then((handle) => handle.uploadFile(['/absolute/path/file.txt']))`
  raw: `{ "type": "upload_files", "pageId": "PAGE_ID", "selector": "#file-input", "files": ["/absolute/path/file.txt"] }`

Supported selector syntax:
- CSS selectors
- `::-p-text(...)`
- `::-p-aria(...)`

## `/api/pages/run`

```json
{
  "pages": [{ "url": "http://127.0.0.1:4017/examples/search.html", "waitUntil": "load" }],
  "script": "await server.start(); const page = (await browser.pages())[0]; await page.locator('::-p-aria(Search)').fill('gamma'); await page.click(\"[role='option']\", { index: 2 }); return await page.data('#search', { snapshot: true });",
  "closeOnExit": true
}
```

Response keys:
- `sessionId`
- `pageIds`
- `logs`
- `result`

## Output Shape

- `classes`, `snapshot.classes`, `snapshot.style`, `diff.classes_diff`, `diff.styles_diff`, tree `styles`, and tree diff `styles` are key-value objects
- `diff.classes_diff[className]` is `applied` or `missing class`
- `diff.styles_diff[propertyName]` is that side’s changed computed value
- `snapshot.tree` is keyed by labels like `< span >.title`
- `diff.tree_diff` contains only changed nodes and changed styles
- `runs` is keyed by viewport like `runs["1024x700"]`
- `snapshot` is omitted unless you request it

## Included Example Pages

- `/examples/search.html`
- `/examples/form.html`
- `/examples/drag.html`
- `/examples/iframe.html`
- `/examples/upload.html`
- `/examples/intercept.html`
- `/examples/compare-left.html`
- `/examples/compare-right.html`

Runnable examples:
- `npm run test:google`
- `npm run test:sample`
- `/Users/abeer/dev/chrome_extension_utils/examples/google-suite.mjs`
- `/Users/abeer/dev/chrome_extension_utils/examples/sample-suite.mjs`
- `/Users/abeer/dev/chrome_extension_utils/examples/boilerplate/run.mjs`

## Google Suite

The Google suite does this:
- opens `https://www.google.com/`
- waits for the search box
- types the query
- waits for the suggestion list
- clicks a random visible suggestion
- verifies a results selector exists
- scrolls the results page
- writes a screenshot to `/Users/abeer/dev/chrome_extension_utils/artifacts/google-suite.png`

## Notes

- Each open extension page is a separate live instance
- Page sessions are in memory and disappear if the server restarts or the extension page closes
- The extension page must stay open while SDK or REST work is running
- The packaged extension artifact is `/Users/abeer/dev/chrome_extension_utils/artifacts/ctm-puppet.crx`
