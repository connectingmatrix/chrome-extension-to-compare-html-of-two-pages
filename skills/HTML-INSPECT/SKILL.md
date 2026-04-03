---
name: HTML-INSPECT
description: Use when you need live page sessions, DOM/style diffs, screenshots, or scripted page actions through the local HTML-Inspect Chrome extension service.
---

# HTML-INSPECT

Run `scripts/start_html_inspect.sh` first. Pass the extension page URL if it is not saved yet.

Use this skill for:
- opening one or two live pages and keeping their `pageId`s
- running action batches like click, input, key, select, drag, scroll, submit, wait, navigate, reload, resize, script, screenshot, and close
- comparing selectors across two live pages or two URLs
- reading DOM trees, computed styles, classes, bounding boxes, and HTML

Workflow:
1. Start the local server and open the extension page.
   Example:
   `skills/HTML-INSPECT/scripts/start_html_inspect.sh chrome-extension://ldpkppejogcegpleikpbngjmeeppinei/sidepanel.html`
2. Reload the installed extension page. Remote control starts enabled and the page socket should go yellow, then green.
3. Confirm `GET http://127.0.0.1:4017/api/instances` returns at least one connected instance before using the API.
4. For persistent work, call `POST /api/pages/open` with one or two URLs. Keep the returned `sessionId` and `pageId`s.
5. Apply interactions with `POST /api/pages/actions` using ordered `actions`.
6. Read results with:
- `POST /api/pages/diff`
- `POST /api/pages/data`
- `POST /api/pages/html`
- `POST /api/pages/screenshot`
- `POST /api/pages/close`
7. Legacy one-shot routes still work:
- `POST /api/compare/pages`
- `POST /api/compare/selector`
- `POST /api/inspect/selector`

How to read output:
- `classes`, `snapshot.classes`, `diff.classes_diff`, `snapshot.style`, `diff.styles_diff`, tree `styles`, and tree diff `styles` are all key-value objects.
- `diff.classes_diff[className]` is `applied` or `missing class`.
- `diff.styles_diff[propertyName]` is that side's changed computed value.
- `snapshot.tree` is keyed by labels like `< span >.classA.classB`.
- `diff.tree_diff` contains only changed nodes and changed styles.
- sized compares return `runs["1024x700"]`, `runs["390x844"]`, and so on.
- `snapshot` is omitted unless you pass `"snapshot": true`.

Useful action types:
- `click`
- `type_text`
- `send_key`
- `select_option`
- `drag_drop`
- `scroll`
- `submit`
- `wait_for_selector`
- `reload_page`
- `change_screen_size`
- `navigate_to_url`
- `get_page_diff`
- `get_page_data`
- `get_page_html`
- `screenshot_page`
- `close_page`
- `intercept_request`
- `record_start`
- `record_stop`
- `execute_script`

Notes:
- The opener resolves the extension URL from the explicit argument, `HTML_INSPECT_EXTENSION_URL`, live `/api/instances`, or the saved local config.
- The local config file is `.html-inspect.local.json`.
- Page sessions are in-memory and disappear if the extension page closes or the server restarts.
- Use the repo `README.md` for the full REST shape, WebSocket events, and examples.
