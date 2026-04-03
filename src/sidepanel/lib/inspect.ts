import { BrowserTab, NodeDetail, Snapshot } from '@/src/sidepanel/types';
import { readDomSnapshot, readNodeDetail } from '@/src/sidepanel/lib/page-readers';
import { readScriptingApi, readTabsApi } from '@/src/shared/extension-api';

const canInspect = (url: string) => url.startsWith('http://') || url.startsWith('https://') || url.startsWith('file://');

const runScript = async <T,>(tabId: number, func: (...args: any[]) => T, args: any[] = []): Promise<T> => {
    const result = await readScriptingApi().executeScript({ target: { tabId }, func, args });
    return result[0].result as T;
};

export const listTabs = async (): Promise<BrowserTab[]> => {
    const tabs = await readTabsApi().query({ currentWindow: true });
    return tabs
        .filter((tab) => Boolean(tab.id && tab.url && canInspect(tab.url)))
        .map((tab) => ({ id: tab.id || 0, title: tab.title || tab.url || `Tab ${tab.id}`, url: tab.url || '' }));
};

export const inspectTree = async (tabId: number, selector: string): Promise<Snapshot> =>
    runScript<Snapshot>(tabId, readDomSnapshot, [selector]);

export const inspectNode = async (tabId: number, selector: string, path: string): Promise<NodeDetail> =>
    runScript<NodeDetail>(tabId, readNodeDetail, [selector, path]);
