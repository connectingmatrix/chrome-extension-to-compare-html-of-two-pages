---
name: CTM-puppet
description: Use when you need live page sessions, trusted browser control, screenshots, diffs, or SDK-driven page automation through the local CTM Puppet Chrome extension service.
---

# CTM Puppet

Run `skills/CTM-puppet/scripts/start_ctm_puppet.sh` first. Pass the extension page URL if it is not saved yet. Pass a second argument if you want a custom server port.

Use this skill for:
- opening one or two persistent pages and keeping their `pageId`s
- binding existing browser tabs through `browser.pages()`
- driving pages with clicks, typing, keys, drag/drop, scroll, navigation, resize, screenshots, uploads, and scripts
- diffing DOM trees, classes, styles, and layout data across two live pages
- running Puppeteer-style `browser/page/locator` scripts through the SDK or `POST /api/pages/run`

Workflow:
1. Start the server and open the extension page:
   `skills/CTM-puppet/scripts/start_ctm_puppet.sh chrome-extension://efnpdobifdpehhodkecgddbplgkkeogo/sidepanel.html`
2. For another Chrome instance use a custom port:
   `skills/CTM-puppet/scripts/start_ctm_puppet.sh chrome-extension://efnpdobifdpehhodkecgddbplgkkeogo/sidepanel.html 4021`
3. Keep the extension page open until `GET http://127.0.0.1:4017/api/instances` or the matching custom-port URL shows a connected instance.
4. For persistent work call `POST /api/pages/open`, keep the returned `sessionId` and `pageId`s, then use:
- `POST /api/pages/actions`
- `POST /api/pages/data`
- `POST /api/pages/diff`
- `POST /api/pages/html`
- `POST /api/pages/frames`
- `POST /api/pages/screenshot`
- `POST /api/pages/run`
- `POST /api/pages/close`
5. For one-shot compare flows you can still use:
- `POST /api/compare/pages`
- `POST /api/compare/selector`
- `POST /api/inspect/selector`

SDK shape:
- `import server from 'ctm-puppet'`
- `const browser = await server.start({ port: 4017 })`
- `if (!browser) throw new Error('Please open the CTM Puppet Extension in new tab.')`
- `await browser.pages()` for all open browser tabs
- `await browser.sessionPages()` for CTM Puppet session tabs only
- `const page = await browser.newPage()`
- `await page.goto(url)`
- `await page.locator(selector).fill(value)`
- `await page.waitForSelector(selector)`
- `page.on('console', msg => msg.text())`
- `page.on('request', request => request.abort() || request.continue() || request.respond(...))`
- `await browser.close()`

Selector support:
- CSS selectors
- `::-p-text(...)`
- `::-p-aria(...)`

How to read output:
- `classes`, `snapshot.classes`, `snapshot.style`, `diff.classes_diff`, `diff.styles_diff`, tree `styles`, and tree diff `styles` are key-value objects.
- `diff.classes_diff[className]` is `applied` or `missing class`.
- `diff.styles_diff[propertyName]` is that side's changed computed value.
- `snapshot.tree` is keyed by labels like `< span >.classA.classB`.
- `diff.tree_diff` contains only changed nodes and changed styles.
- `runs` is keyed by viewport like `runs["1024x700"]`.
- `snapshot` is omitted unless you pass `"snapshot": true`.

Useful routes:
- `GET /api/health`
- `GET /api/instances`
- `GET /api/pages/active`
- `GET /` or `GET /docs` for the full integration guide

Useful files:
- `/Users/abeer/dev/chrome_extension_utils/README.md`
- `/Users/abeer/dev/chrome_extension_utils/examples/google-suite.mjs`
- `/Users/abeer/dev/chrome_extension_utils/examples/boilerplate/run.mjs`

Notes:
- The opener resolves the extension URL from the explicit argument, `CTM_PUPPET_EXTENSION_URL`, live `/api/instances`, or `.ctm-puppet.local.json`.
- `server.start({ port: CUSTOM_PORT })` lets you target a different CTM Puppet server for another Chrome instance.
- `skills/CTM-puppet/scripts/start_ctm_puppet.sh EXTENSION_URL CUSTOM_PORT` starts and opens the matching port pair.
- Each open extension page is a separate live instance.
- Page sessions are in memory and disappear if the server restarts or the extension page closes.
