# HTML-Inspect

HTML-Inspect is a Chrome extension plus local server for live page sessions, trusted browser control, DOM/style diffs, screenshots, and script-driven inspection.

Every non-`/api` HTTP route returns this file as `text/markdown`, so AI systems can discover the integration contract from:
- `GET /`
- `GET /docs`
- `GET /anything-not-api`

## Start

1. `npm install`
2. `npm run build`
3. Load `/Users/abeer/dev/chrome_extension_utils/dist` as an unpacked extension
4. `npm run server`
5. Open the extension page with `npm run open:extension`
6. Keep the extension page open until `GET http://127.0.0.1:4017/api/instances` shows at least one connected item

## Main Routes

Live session routes:
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

Legacy one-shot routes:
- `POST /api/compare/pages`
- `POST /api/compare/selector`
- `POST /api/inspect/selector`

Utility routes:
- `GET /api/health`
- `GET /api/instances`

Live event socket:
- `ws://127.0.0.1:4017/api/live`

## Open Pages

Open one or two pages and keep their `pageId`s:

```json
{
  "pages": [
    { "role": "left", "url": "http://127.0.0.1:4017/examples/compare-left.html", "width": 1440, "height": 900, "waitUntil": "load" },
    { "role": "right", "url": "http://127.0.0.1:4017/examples/compare-right.html", "width": 1440, "height": 900, "waitUntil": "load" }
  ]
}
```

Response:

```json
{
  "ok": true,
  "sessionId": "session-id",
  "pages": [
    {
      "pageId": "page-id",
      "role": "left",
      "url": "http://127.0.0.1:4017/examples/compare-left.html",
      "width": 1440,
      "height": 900,
      "status": "ready",
      "instanceId": "extension-instance-id",
      "recordingIds": []
    }
  ]
}
```

## Action Arrays

Send ordered actions with `POST /api/pages/actions`:

```json
{
  "actions": [
    { "type": "wait_for_selector", "pageId": "page-id", "selector": "textarea[name='q']", "visible": true, "timeoutMs": 30000 },
    { "type": "type_text", "pageId": "page-id", "selector": "textarea[name='q']", "value": "html inspect", "clearFirst": true },
    { "type": "click", "pageId": "page-id", "selector": "[role='option']", "index": 2, "waitUntil": "load" },
    { "type": "scroll", "pageId": "page-id", "deltaY": 900 }
  ]
}
```

When `actions` are passed to `POST /api/pages/open` or to legacy compare routes, each action may use `role` instead of `pageId`.

## Action Reference

`click`
- request:
  `{ "type": "click", "pageId": "page-id", "selector": ".button", "index": 0, "button": "left", "waitUntil": "load" }`
- SDK:
  `await page.click('.button', { index: 0, waitUntil: 'load' })`

`type_text`
- request:
  `{ "type": "type_text", "pageId": "page-id", "selector": "input[name='q']", "value": "hello", "clearFirst": true }`
- SDK:
  `await page.type("input[name='q']", 'hello', { clearFirst: true })`
  `await page.locator("input[name='q']").fill('hello')`

`send_key`
- request:
  `{ "type": "send_key", "pageId": "page-id", "selector": "input[name='q']", "key": "Enter" }`
- SDK:
  `await page.keyboard.press('Enter')`
  `await page.locator("input[name='q']").press('Enter')`

`select_option`
- request:
  `{ "type": "select_option", "pageId": "page-id", "selector": "select[name='country']", "value": "jp" }`
- SDK:
  `await page.select("select[name='country']", 'jp')`

`drag_drop`
- request:
  `{ "type": "drag_drop", "pageId": "page-id", "sourceSelector": ".card", "targetSelector": "#target" }`
- SDK:
  `await page.dragAndDrop('.card', '#target')`

`scroll`
- request:
  `{ "type": "scroll", "pageId": "page-id", "deltaY": 900 }`
- SDK:
  `await page.scroll({ deltaY: 900 })`

`submit`
- request:
  `{ "type": "submit", "pageId": "page-id", "selector": "form" }`
- SDK:
  `await page.submit('form')`

`wait_for_selector`
- request:
  `{ "type": "wait_for_selector", "pageId": "page-id", "selector": "#ready", "visible": true, "timeoutMs": 30000 }`
- SDK:
  `await page.locator('#ready').wait({ timeoutMs: 30000 })`

`reload_page`
- request:
  `{ "type": "reload_page", "pageId": "page-id", "waitUntil": "networkidle2" }`
- SDK:
  `await page.reload({ waitUntil: 'networkidle2' })`

`change_screen_size`
- request:
  `{ "type": "change_screen_size", "pageId": "page-id", "width": 1024, "height": 700 }`
- SDK:
  `await page.setViewport({ width: 1024, height: 700 })`

`navigate_to_url`
- request:
  `{ "type": "navigate_to_url", "pageId": "page-id", "url": "https://example.com", "waitUntil": "load" }`
- SDK:
  `await page.goto('https://example.com', { waitUntil: 'load' })`

`get_page_diff`
- request:
  `{ "type": "get_page_diff", "leftPageId": "left-page-id", "rightPageId": "right-page-id", "selector": ".card", "snapshot": true }`
- SDK:
  `await leftPage.compare(rightPage, { selector: '.card', snapshot: true })`

`get_page_data`
- request:
  `{ "type": "get_page_data", "pageId": "page-id", "selector": ".card", "snapshot": true }`
- SDK:
  `await page.data('.card', { snapshot: true })`

`get_page_html`
- request:
  `{ "type": "get_page_html", "pageId": "page-id", "selector": "#main" }`
- SDK:
  `await page.html('#main')`

`screenshot_page`
- request:
  `{ "type": "screenshot_page", "pageId": "page-id", "selector": "#main", "fullPage": false }`
- SDK:
  `await page.screenshot({ selector: '#main', fullPage: false })`

`close_page`
- request:
  `{ "type": "close_page", "pageId": "page-id" }`
- SDK:
  `await page.close()`

`intercept_request`
- request:
  `{ "type": "intercept_request", "pageId": "page-id", "ruleId": "observe-all", "mode": "observe", "match": { "urlPattern": "*", "method": "GET" } }`
- SDK:
  `await page.run([{ type: 'intercept_request', pageId: page.pageId, ruleId: 'observe-all', mode: 'observe', match: { urlPattern: '*' } }])`

`record_start`
- request:
  `{ "type": "record_start", "pageId": "page-id", "recordId": "header", "selector": ".header", "include": ["classes", "styles", "tree"] }`
- SDK:
  `await page.run([{ type: 'record_start', pageId: page.pageId, recordId: 'header', selector: '.header', include: ['classes', 'styles', 'tree'] }])`

`record_stop`
- request:
  `{ "type": "record_stop", "pageId": "page-id", "recordId": "header" }`
- SDK:
  `await page.run([{ type: 'record_stop', pageId: page.pageId, recordId: 'header' }])`

`execute_script`
- request:
  `{ "type": "execute_script", "pageId": "page-id", "script": "return { href: location.href, title: document.title };" }`
- SDK:
  `await page.evaluate(() => ({ href: location.href, title: document.title }))`

`upload_files`
- request:
  `{ "type": "upload_files", "pageId": "page-id", "selector": "#file-input", "files": ["/absolute/path/file.txt"] }`
- SDK:
  `await page.locator('#file-input').uploadFile(['/absolute/path/file.txt'])`

Supported selector inputs for actions and SDK locators:
- CSS selectors
- `::-p-text(...)`
- `::-p-aria(...)`

## `/api/pages/run`

Run JS directly against the live session service:

```json
{
  "pages": [{ "url": "http://127.0.0.1:4017/examples/search.html", "waitUntil": "load" }],
  "script": "const page = (await browser.pages())[0]; await page.locator('::-p-aria(Search)').fill('gamma'); await page.click(\"[role='option']\", { index: 2, waitUntil: 'load' }); return await page.data('#search', { snapshot: true });",
  "closeOnExit": true
}
```

Response:
- `sessionId`
- `pageIds`
- `logs`
- `result`

## SDK

Local scripts can import the SDK from this repo:

```js
import { browser, server } from './sdk/index.mjs';

await server.start();
const page = await browser.newPage('https://developer.chrome.com/', { waitUntil: 'load' });
page.on('console', (event) => console.log('PAGE LOG:', event.text));
await page.setViewport({ width: 1080, height: 1024 });
await page.locator('::-p-aria(Search)').fill('automate beyond recorder');
await page.locator('.devsite-result-item-link').click({ waitUntil: 'load' });
const title = await page.evaluate(() => document.title);
console.log(title);
await browser.close();
server.stop();
```

Available SDK methods:
- `server.start()`
- `server.stop()`
- `browser.newPage()`
- `browser.pages()`
- `browser.close()`
- `page.goto()`
- `page.reload()`
- `page.setViewport()`
- `page.locator()`
- `page.click()`
- `page.type()`
- `page.keyboard.press()`
- `page.select()`
- `page.dragAndDrop()`
- `page.scroll()`
- `page.submit()`
- `page.evaluate()`
- `page.html()`
- `page.data()`
- `page.screenshot()`
- `page.compare()`
- `page.compareSelector()`
- `page.frames()`
- `page.frame(id)`
- `page.close()`

## Output Shape

Object-based fields stay object-based everywhere:
- `classes`
- `snapshot.classes`
- `snapshot.style`
- `diff.classes_diff`
- `diff.styles_diff`
- tree `styles`
- tree diff `styles`

Diff rules:
- `diff.classes_diff[className]` is `applied` or `missing class`
- `diff.styles_diff[propertyName]` is that side’s changed computed value
- `snapshot.tree` is keyed by node labels such as `< span >.title`
- `diff.tree_diff` contains only changed nodes and changed styles
- `runs` is keyed by viewport, for example `runs["1024x700"]`
- `snapshot` is omitted unless `"snapshot": true`

## Sample Pages

Repo-local test pages are served from `/examples`:
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
- `/Users/abeer/dev/chrome_extension_utils/examples/boilerplate/run.mjs`

## Google Example

The Google suite demonstrates the intended search flow:
- open `https://www.google.com/`
- wait for the search field
- type the query
- wait for the suggestion list
- click a visible suggestion
- wait for the results state
- scroll the results page
- capture a screenshot

## Notes

- Page sessions are in memory and disappear if the server restarts or the extension page closes.
- Each open extension page registers as a separate live instance.
- The extension page lamp is the live connection indicator.
- The server-side script runner and the local SDK both talk to the same live REST/socket API.
