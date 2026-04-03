import { ScreenSize } from '@/src/shared/remote-types';
import { readNodeDetail, readDomSnapshot } from '@/src/sidepanel/lib/page-readers';

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
    chrome.tabs.get(tabId).then((tab) => {
        if (tab.status === 'complete') finish();
    });
});

const runScript = async <T,>(tabId: number, func: (...args: any[]) => T, args: any[] = []): Promise<T> => {
    const result = await chrome.scripting.executeScript({ target: { tabId }, func, args });
    return result[0].result as T;
};

const readTabTarget = async (url: string, size?: ScreenSize) => {
    if (!size) {
        const tab = await chrome.tabs.create({ url, active: false });
        return { tabId: tab.id || 0, windowId: 0 };
    }
    const window = await chrome.windows.create({ url, focused: false, height: size.height, type: 'normal', width: size.width });
    return { tabId: window.tabs?.[0]?.id || 0, windowId: window.id || 0 };
};

export const readPageData = async (url: string, selector: string, path: string, size?: ScreenSize) => {
    const target = await readTabTarget(url, size);
    await waitForTab(target.tabId);
    try {
        const snapshot = await runScript(target.tabId, readDomSnapshot, [selector]);
        const detail = await runScript(target.tabId, readNodeDetail, [selector, path]);
        return { detail, size: size || null, snapshot, tabId: target.tabId };
    } finally {
        if (target.windowId) await chrome.windows.remove(target.windowId);
        if (!target.windowId) await chrome.tabs.remove(target.tabId);
    }
};
