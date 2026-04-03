import { Browser } from '../sdk/browser.mjs';

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

const readConsole = (logs) => ({
    error: (...args) => logs.push({ level: 'error', text: args.join(' ') }),
    log: (...args) => logs.push({ level: 'log', text: args.join(' ') }),
    warn: (...args) => logs.push({ level: 'warn', text: args.join(' ') })
});

export const runScript = async (baseUrl, payload) => {
    const browser = new Browser(baseUrl);
    const logs = [];
    const control = { start: async () => (globalThis.browser = browser, true), stop: async () => (delete globalThis.browser, true) };
    browser.sessionId = payload.sessionId || '';
    await control.start();
    if (payload.pages && payload.pages.length) {
        for (const page of payload.pages) await browser.newPage(page.url, page);
    } else if (browser.sessionId) {
        browser.live.open(browser.sessionId);
    }
    const run = new AsyncFunction('args', 'browser', 'server', 'console', payload.script || '');
    try {
        const result = await Promise.race([
            run(payload.args || [], browser, control, readConsole(logs)),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timed out while running the script.')), payload.timeoutMs || 120000))
        ]);
        const pages = await browser.pages();
        if (payload.closeOnExit) await browser.close();
        await control.stop();
        const pageIds = [];
        for (const page of pages) pageIds.push(page.pageId);
        return { logs, pageIds, result, sessionId: browser.sessionId };
    } catch (error) {
        if (payload.closeOnExit) await browser.close();
        await control.stop();
        throw error;
    }
};
