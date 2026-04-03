import { closeDebugTab, ensureDebugTab } from '@/src/background/debugger-work';
import { watchGraphql } from '@/src/background/graphql-wait';
import { runPageDomAction } from '@/src/background/page-dom-work';
import { waitForPageRoot } from '@/src/background/page-wait';
import { readNodeDetail, readDomSnapshot } from '@/src/sidepanel/lib/page-readers';

const rootWaitMs = 30000;
const rootSettleMs = 700;
const rootPollMs = 250;
const readWaitError = (selector: string, state: { loading: boolean; title: string; url: string }) => state.loading
    ? `The page is still showing a loading shell while waiting for ${selector}. Final URL: ${state.url}. Final title: ${state.title}.`
    : `No visible element matches ${selector} after waiting for GraphQL and page render. Final URL: ${state.url}. Final title: ${state.title}.`;

const waitForTab = (tabId: number) => new Promise<void>((resolve) => {
    let done = false;
    const finish = () => {
        if (done) return;
        done = true;
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
    };
    const listener = (updatedId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
        if (updatedId !== tabId || changeInfo.status !== 'complete') return;
        finish();
    };
    chrome.tabs.onUpdated.addListener(listener);
    chrome.tabs.get(tabId).then((tab) => { if (tab.status === 'complete') finish(); });
});

const runScript = async <T,>(tabId: number, func: (...args: any[]) => T, args: any[] = []) => {
    const result = await chrome.scripting.executeScript({ args, func, target: { tabId } });
    return result[0].result as T;
};

export const openPageTab = async (url: string, active: boolean) => {
    const tab = await chrome.tabs.create({ active, url });
    const tabId = tab.id || 0;
    await waitForTab(tabId);
    await ensureDebugTab(tabId);
    return tabId;
};

export const updatePageTab = async (tabId: number, url: string) => {
    await chrome.tabs.update(tabId, { url });
    await waitForTab(tabId);
};

export const reloadPageTab = async (tabId: number) => {
    await chrome.tabs.reload(tabId);
    await waitForTab(tabId);
};

export const capturePageTab = async (tabId: number, selector: string, path: string, size = null) => {
    const graphql = watchGraphql(tabId);
    try {
        await graphql.wait();
        const state = await runScript(tabId, waitForPageRoot, [selector, rootWaitMs, rootSettleMs, rootPollMs]);
        if (!state.found) throw new Error(readWaitError(selector, state));
        const snapshot = await runScript(tabId, readDomSnapshot, [selector]);
        const detail = await runScript(tabId, readNodeDetail, [selector, path]);
        return { detail, size, snapshot, tabId };
    } finally {
        graphql.close();
    }
};

export const runPageAction = async (tabId: number, action) => runScript(tabId, runPageDomAction, [action]);

export const readPageHtml = async (tabId: number, selector = '') => runScript(tabId, runPageDomAction, [{ selector, type: 'get_page_html' }]);

export const readPageBox = async (tabId: number, selector: string) => (await runScript(tabId, readNodeDetail, [selector, 'root'])).box;

export const readTabMeta = async (tabId: number) => {
    const tab = await chrome.tabs.get(tabId);
    return { height: tab.height || 0, title: tab.title || '', url: tab.url || '', width: tab.width || 0 };
};

export const closePageTab = async (tabId: number) => {
    await closeDebugTab(tabId);
    await chrome.tabs.remove(tabId);
};
