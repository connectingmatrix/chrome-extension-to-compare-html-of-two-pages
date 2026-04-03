# Google Sample Suite

This sample uses `google.com` only. It does not reference any product-specific app.

## 1. Open One Live Page

```bash
curl -s -X POST http://127.0.0.1:4017/api/pages/open \
  -H 'content-type: application/json' \
  --data '{
    "pages": [
      { "role": "page", "url": "https://www.google.com/", "width": 1440, "height": 900 }
    ]
  }'
```

Save the returned `pageId`.

## 2. Search From The Home Page

```bash
curl -s -X POST http://127.0.0.1:4017/api/pages/actions \
  -H 'content-type: application/json' \
  --data '{
    "actions": [
      { "type": "wait_for_selector", "pageId": "PAGE_ID", "selector": "textarea[name='\''q'\'']", "visible": true, "timeoutMs": 30000 },
      { "type": "type_text", "pageId": "PAGE_ID", "selector": "textarea[name='\''q'\'']", "value": "html inspect chrome extension", "clearFirst": true },
      { "type": "wait_for_selector", "pageId": "PAGE_ID", "selector": "[role='\''listbox'\'']", "visible": true, "timeoutMs": 30000 },
      { "type": "click", "pageId": "PAGE_ID", "selector": "[role='\''option'\'']", "index": 2 },
      { "type": "wait_for_selector", "pageId": "PAGE_ID", "selector": "a h3", "visible": true, "timeoutMs": 30000 }
    ]
  }'
```

## 3. Scroll And Resize

```bash
curl -s -X POST http://127.0.0.1:4017/api/pages/actions \
  -H 'content-type: application/json' \
  --data '{
    "actions": [
      { "type": "scroll", "pageId": "PAGE_ID", "y": 900, "behavior": "smooth" },
      { "type": "change_screen_size", "pageId": "PAGE_ID", "width": 1024, "height": 700 }
    ]
  }'
```

## 4. Read DOM Data

```bash
curl -s -X POST http://127.0.0.1:4017/api/pages/data \
  -H 'content-type: application/json' \
  --data '{
    "pageId": "PAGE_ID",
    "selector": "#search",
    "snapshot": true
  }'
```

## 5. Read HTML

```bash
curl -s -X POST http://127.0.0.1:4017/api/pages/html \
  -H 'content-type: application/json' \
  --data '{
    "pageId": "PAGE_ID",
    "selector": "#search"
  }'
```

## 6. Record And Diff A Selector

```bash
curl -s -X POST http://127.0.0.1:4017/api/pages/actions \
  -H 'content-type: application/json' \
  --data '{
    "actions": [
      { "type": "record_start", "pageId": "PAGE_ID", "recordId": "search-box", "selector": "textarea[name='\''q'\'']", "include": ["classes", "styles", "tree", "box"] },
      { "type": "type_text", "pageId": "PAGE_ID", "selector": "textarea[name='\''q'\'']", "value": " updated", "clearFirst": false },
      { "type": "record_stop", "pageId": "PAGE_ID", "recordId": "search-box" }
    ]
  }'
```

## 7. Screenshot

```bash
curl -s -X POST http://127.0.0.1:4017/api/pages/screenshot \
  -H 'content-type: application/json' \
  --data '{
    "pageId": "PAGE_ID",
    "fullPage": true
  }'
```

## 8. Close The Page

```bash
curl -s -X POST http://127.0.0.1:4017/api/pages/close \
  -H 'content-type: application/json' \
  --data '{
    "pageId": "PAGE_ID"
  }'
```
