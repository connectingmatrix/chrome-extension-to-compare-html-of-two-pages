import { requestJson } from './http.mjs';
import { Locator } from './locator.mjs';
import { runAction, runActions } from './action.mjs';
import { ConsoleMessage, RequestHandle } from './event.mjs';
import { saveBase64 } from './file.mjs';

class Keyboard {
    constructor(page) {
        this.page = page;
    }
    press(key, options = {}) {
        return runAction(this.page, { ...options, key, type: 'send_key' });
    }
}

const readEvent = (page, name, event) => name === 'console' ? new ConsoleMessage(event) : name === 'request' ? new RequestHandle(page, event) : event;
const readScript = (script) => typeof script === 'function' ? `return (${script.toString()})(...(args||[]));` : `${script}`;

export class Page {
    constructor(browser, item, frameId = 0) {
        this.baseUrl = browser.baseUrl;
        this.browser = browser;
        this.frameId = frameId;
        this.iframe = new Proxy((value) => this.frame(value), { get: (_target, key) => this.frame(Number(key) || 0) });
        this.keyboard = new Keyboard(this);
        this.pageId = item.pageId;
        this.pageName = item.pageName || item.title || '';
        this.pageStats = item.pageStats || { cpu: 0, heapUsage: 0, ram: 0 };
        this.pageUrl = item.pageUrl || item.url || '';
        this.sessionId = item.sessionId || browser.sessionId;
        this.tabId = item.tabId || 0;
        this.url = item.url || '';
    }
    run(actions) {
        return runActions(this, actions);
    }
    on(name, handler) {
        return this.browser.listen(name, this.pageId, (event) => handler(readEvent(this, name, event)));
    }
    locator(selector, index = 0) {
        return new Locator(this, selector, index);
    }
    waitForSelector(selector, options = {}) {
        return this.locator(selector, options.index || 0).waitHandle(options);
    }
    goto(url, options = {}) {
        return runAction(this, { ...options, type: 'navigate_to_url', url });
    }
    reload(options = {}) {
        return runAction(this, { ...options, type: 'reload_page' });
    }
    setViewport(size) {
        return runAction(this, { height: size.height, type: 'change_screen_size', width: size.width });
    }
    setRequestInterception(enabled) {
        return runAction(this, { enabled, type: 'set_request_interception' });
    }
    click(selector, options = {}) {
        return this.locator(selector, options.index || 0).click(options);
    }
    type(selector, value, options = {}) {
        return runAction(this, { ...options, clearFirst: options.clearFirst || false, selector, type: 'type_text', value });
    }
    select(selector, value, options = {}) {
        return runAction(this, { ...options, selector, type: 'select_option', value });
    }
    dragAndDrop(sourceSelector, targetSelector, options = {}) {
        return runAction(this, { ...options, sourceSelector, targetSelector, type: 'drag_drop' });
    }
    scroll(options = {}) {
        return runAction(this, { ...options, type: 'scroll' });
    }
    submit(selector, options = {}) {
        return runAction(this, { ...options, selector, type: 'submit' });
    }
    evaluate(script, ...args) {
        return runAction(this, { args, script: readScript(script), type: 'execute_script' });
    }
    html(selector = '', options = {}) {
        return requestJson(this.baseUrl, '/api/pages/html', 'POST', { frameId: this.frameId, index: options.index || 0, pageId: this.pageId, selector });
    }
    data(selector, options = {}) {
        return requestJson(this.baseUrl, '/api/pages/data', 'POST', { pageId: this.pageId, path: options.path || 'root', selector, snapshot: options.snapshot || false });
    }
    async screenshot(options = {}) {
        const data = await requestJson(this.baseUrl, '/api/pages/screenshot', 'POST', { fullPage: options.fullPage || false, pageId: this.pageId, selector: options.selector || '' });
        await saveBase64(options.path || '', data.dataBase64 || '');
        return data;
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
        return new Page(this.browser, this, Number(frameId) || 0);
    }
    iframes() {
        return this.frames();
    }
    close() {
        return requestJson(this.baseUrl, '/api/pages/close', 'POST', { pageId: this.pageId });
    }
}
