---
name: HTML-DIFF
description: Use when you need DOM, CSS, bounding-box, or hierarchy diffs across one or two URLs through the local HTML-DIFF Chrome extension service.
---

# HTML-DIFF

Run `scripts/start_html_diff.sh` first.
If the extension URL is not already known, pass it as the first argument.

Use this skill for:
- comparing DOM trees between two URLs
- comparing a selector across two URLs
- comparing layouts across screen sizes
- inspecting one selector for computed styles, bounding box, x/y, and HTML

Workflow:
1. Start the local server and open the extension page.
   Example:
   `skills/HTML-DIFF/scripts/start_html_diff.sh chrome-extension://ldpkppejogcegpleikpbngjmeeppinei/sidepanel.html`
2. In the extension UI, open settings, keep the default server URL, enable remote control, and save.
3. Check `GET http://127.0.0.1:4017/api/instances`. Do not run compare requests until one instance is listed.
4. Use the API that matches the task:
- `POST /api/compare/pages` with `leftUrl`, `rightUrl`, `selector`, optional `path`, optional `sizes`
- `POST /api/compare/selector` with `leftUrl`, `rightUrl`, `selector`, optional `sizes`
- `POST /api/inspect/selector` with `url`, `selector`, optional `path`
5. `sizes` behavior:
- omit `sizes` to run one default compare only
- pass `"all"` to run the built-in `desktop`, `tablet`, and `mobile` presets
- pass an array like `[{"name":"laptop","width":1366,"height":768},{"name":"phone","width":390,"height":844}]` for custom runs
6. For hierarchy issues, inspect `structureMarks`. For selector problems, inspect `classRows`, `styleRows`, `box`, `html`, and `styles`.
7. If `sizes` was passed, read `runs[]` and compare each named viewport separately.

Notes:
- The extension opens target pages in background tabs, processes them, and returns results through the server.
- The opener script resolves the extension URL in this order: explicit argument, `HTML_DIFF_EXTENSION_URL`, live `/api/instances`, saved local config.
- If the API returns no active instance, the extension is not live yet.
