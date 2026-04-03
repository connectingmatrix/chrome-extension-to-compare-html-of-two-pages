# HTML-Inspect

HTML-Inspect is a Chrome extension plus local server for live DOM inspection, two-page comparison, and scriptable page control. It can compare selectors across two URLs, keep page sessions open, apply actions against those pages, and return DOM trees, computed styles, classes, boxes, screenshots, and diffs.

## Install

1. Run `npm install`.
2. Run `npm run build`.
3. Load `/Users/abeer/dev/chrome_extension_utils/dist` as an unpacked Chrome extension.
4. Open `sidepanel.html` from the side panel or as an extension tab.
5. Keep remote control enabled and save the default server URL `http://127.0.0.1:4017`.

## Start

1. Run `npm run server`.
2. Open the extension page with `npm run open:extension -- chrome-extension://<extension-id>/sidepanel.html`.
3. Reload the extension page until the socket lamp goes yellow then green.
4. Check `GET /api/instances`.

## Core API

Persistent page session routes:
- `POST /api/pages/open`
- `GET /api/pages/active`
- `POST /api/pages/actions`
- `POST /api/pages/diff`
- `POST /api/pages/data`
- `POST /api/pages/html`
- `POST /api/pages/screenshot`
- `POST /api/pages/close`

Legacy one-shot routes:
- `POST /api/compare/pages`
- `POST /api/compare/selector`
- `POST /api/inspect/selector`

## Page Open

Request:

```json
{
  "pages": [
    { "role": "left", "url": "http://localhost:3000" },
    { "role": "right", "url": "https://example.com" }
  ]
}
```

Response:

```json
{
  "ok": true,
  "sessionId": "session-id",
  "pages": [
    { "pageId": "left-id", "role": "left", "url": "...", "width": 0, "height": 0, "title": "...", "status": "ready", "instanceId": "instance-id", "recordingIds": [] },
    { "pageId": "right-id", "role": "right", "url": "...", "width": 0, "height": 0, "title": "...", "status": "ready", "instanceId": "instance-id", "recordingIds": [] }
  ]
}
```

## Actions

`POST /api/pages/actions` takes ordered actions and returns `results[]`.

Supported action `type` values:
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

Example:

```json
{
  "actions": [
    { "type": "click", "pageId": "left-id", "selector": ".menu-button" },
    { "type": "wait_for_selector", "pageId": "left-id", "selector": ".sidebar", "visible": true },
    { "type": "type_text", "pageId": "right-id", "selector": "input[name='q']", "value": "john" }
  ]
}
```

## Diff And Data

`POST /api/pages/diff` compares two active pages for one selector.

`POST /api/pages/data` reads one active page for one selector.

Read compare output like this:
- `left.classes` and `right.classes` are `{ className: "applied" }`
- `left.diff.classes_diff` and `right.diff.classes_diff` are `{ className: "applied" | "missing class" }`
- `left.diff.styles_diff` and `right.diff.styles_diff` are `{ propertyName: "value" }`
- `left.diff.tree_diff` and `right.diff.tree_diff` only include changed nodes
- `snapshot.style` is the full computed-style object when requested
- `snapshot.tree` is the full nested tree when requested

Tree shape:

```json
{
  "< span >.className.class2Name": {
    "styles": { "display": "flex" },
    "childeren": {
      "< a >.link": {
        "styles": { "color": "rgb(0, 0, 0)" },
        "childeren": {}
      }
    }
  }
}
```

## Screen Sizes

Legacy compare routes accept:
- omit `sizes` for one run
- pass `"all"` for built-in presets
- pass an array of `{ "name": "...", "width": 1024, "height": 700 }`

Sized compare output is keyed by viewport:

```json
{
  "runs": {
    "1024x700": { "left": {}, "right": {} },
    "390x844": { "left": {}, "right": {} }
  }
}
```

## WebSocket

Server live socket:
- `ws://127.0.0.1:4017/api/live`

Frames you can send:
- `{ "type": "subscribe", "sessionId": "optional-session-id" }`
- `{ "type": "actions.run", "actions": [...] }`

Frames you can receive:
- `session.opened`
- `page.opened`
- `page.navigated`
- `page.reloaded`
- `page.closed`
- `page.resized`
- `action.started`
- `action.completed`
- `action.failed`
- `record.started`
- `record.stopped`
- `intercept.hit`
- `diff.ready`
- `data.ready`

## Recording

Use `record_start` with `pageId` and `selector`, then later `record_stop` with the returned `recordId`. The result includes:
- `before`
- `after`
- `diff`

## Intercept And Script

`intercept_request` supports:
- `observe`
- `abort`
- `fulfill`

`execute_script` runs arbitrary JavaScript inside the page and returns a serializable `result`.

## Notes

- Remote control is enabled by default.
- Each open extension page is a separate live instance.
- Each instance owns its own page sessions.
- Page sessions are in-memory only.
- The debug setting can open capture tabs in the foreground for live inspection.
