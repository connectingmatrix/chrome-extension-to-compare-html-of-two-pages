import { requestJson, readBaseUrl } from './http.mjs';
import { LiveSocket } from './live.mjs';
import { Page } from './page.mjs';

export class Browser {
    constructor(baseUrl = '') {
        this.baseUrl = readBaseUrl(baseUrl);
        this.live = new LiveSocket(this.baseUrl);
        this.listeners = [];
        this.sessionId = '';
        this.live.listen('', (event) => {
            for (const item of this.listeners) if ((!item.name || item.name === event.type || item.name === event.name) && (!item.pageId || item.pageId === event.pageId)) item.handler(event);
        });
    }
    setBaseUrl(baseUrl = '') {
        const next = readBaseUrl(baseUrl);
        if (this.baseUrl !== next) {
            this.live.close();
            this.sessionId = '';
        }
        this.baseUrl = next;
        this.live.baseUrl = this.baseUrl;
    }
    listen(name, pageId, handler) {
        this.listeners.push({ handler, name, pageId });
        return () => { this.listeners = this.listeners.filter((item) => item.handler !== handler || item.name !== name || item.pageId !== pageId); };
    }
    async newPage(url = 'about:blank', options = {}) {
        const data = await requestJson(this.baseUrl, '/api/pages/open', 'POST', {
            pages: [{ height: options.height, role: options.role || `page-${Date.now()}`, url, waitUntil: options.waitUntil || 'load', width: options.width }],
            sessionId: this.sessionId || '',
            snapshot: false
        });
        this.sessionId = data.sessionId || this.sessionId;
        this.live.open(this.sessionId);
        return new Page(this, data.pages[0]);
    }
    async pages() {
        const data = await requestJson(this.baseUrl, '/api/pages/browser');
        const items = [];
        for (const item of data.items || []) items.push(new Page(this, item));
        return items;
    }
    async sessionPages() {
        const data = await requestJson(this.baseUrl, `/api/pages/active?sessionId=${encodeURIComponent(this.sessionId || '')}`);
        const items = [];
        for (const item of data.items || []) items.push(new Page(this, item));
        return items;
    }
    async close() {
        const pages = await this.sessionPages();
        for (const page of pages) await page.close();
        this.live.close();
        this.sessionId = '';
    }
}

export const browser = new Browser();
