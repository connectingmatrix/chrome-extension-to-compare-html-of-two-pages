import { requestJson } from './http.mjs';
import { Locator } from './locator.mjs';

class Keyboard {
    constructor(page) {
        this.page = page;
    }
    press(key, options = {}) {
        return this.page.run([{ ...options, key, type: 'send_key' }]);
    }
}

export class Page {
    constructor(browser, item, frameId = 0) {
        this.baseUrl = browser.baseUrl;
        this.browser = browser;
        this.frameId = frameId;
        this.keyboard = new Keyboard(this);
        this.pageId = item.pageId;
        this.sessionId = item.sessionId || browser.sessionId;
        this.url = item.url || '';
    }
    run(actions) {
        const items = [];
        for (const action of actions) items.push({ ...action, frameId: action.frameId || this.frameId, pageId: action.pageId || this.pageId });
        return requestJson(this.baseUrl, '/api/pages/actions', 'POST', { actions: items });
    }
    on(name, handler) {
        return this.browser.listen(name, this.pageId, handler);
    }
    locator(selector) {
        return new Locator(this, selector);
    }
    goto(url, options = {}) {
        return this.run([{ ...options, type: 'navigate_to_url', url }]);
    }
    reload(options = {}) {
        return this.run([{ ...options, type: 'reload_page' }]);
    }
    setViewport(size) {
        return this.run([{ height: size.height, type: 'change_screen_size', width: size.width }]);
    }
    click(selector, options = {}) {
        return this.run([{ ...options, selector, type: 'click' }]);
    }
    type(selector, value, options = {}) {
        return this.run([{ ...options, clearFirst: options.clearFirst || false, selector, type: 'type_text', value }]);
    }
    select(selector, value, options = {}) {
        return this.run([{ ...options, selector, type: 'select_option', value }]);
    }
    dragAndDrop(sourceSelector, targetSelector, options = {}) {
        return this.run([{ ...options, sourceSelector, targetSelector, type: 'drag_drop' }]);
    }
    scroll(options = {}) {
        return this.run([{ ...options, type: 'scroll' }]);
    }
    submit(selector, options = {}) {
        return this.run([{ ...options, selector, type: 'submit' }]);
    }
    evaluate(script, ...args) {
        return this.run([{ args, script: typeof script === 'function' ? `return (${script.toString()})(...(args || []));` : `${script}`, type: 'execute_script' }]);
    }
    html(selector = '', options = {}) {
        return requestJson(this.baseUrl, '/api/pages/html', 'POST', { frameId: this.frameId, index: options.index || 0, pageId: this.pageId, selector });
    }
    data(selector, options = {}) {
        return requestJson(this.baseUrl, '/api/pages/data', 'POST', { pageId: this.pageId, path: options.path || 'root', selector, snapshot: options.snapshot || false });
    }
    screenshot(options = {}) {
        return requestJson(this.baseUrl, '/api/pages/screenshot', 'POST', { fullPage: options.fullPage || false, pageId: this.pageId, selector: options.selector || '' });
    }
    compare(page, options = {}) {
        return requestJson(this.baseUrl, '/api/pages/diff', 'POST', { leftPageId: this.pageId, path: options.path || 'root', rightPageId: page.pageId, selector: options.selector || 'body', snapshot: options.snapshot || false });
    }
    compareSelector(selector, page, options = {}) {
        return requestJson(this.baseUrl, '/api/pages/diff', 'POST', { leftPageId: this.pageId, leftSelector: selector, path: options.path || 'root', rightPageId: page.pageId, rightSelector: page.selector || selector, selector, snapshot: options.snapshot || false });
    }
    selectorTree(selector) {
        return { pageId: this.pageId, selector };
    }
    async frames() {
        const data = await requestJson(this.baseUrl, '/api/pages/frames', 'POST', { pageId: this.pageId });
        return data.items || [];
    }
    frame(frameId) {
        return new Page(this.browser, this, frameId);
    }
    iframes() {
        return this.frames();
    }
    close() {
        return requestJson(this.baseUrl, '/api/pages/close', 'POST', { pageId: this.pageId });
    }
}
