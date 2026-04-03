import { LivePage } from '@/src/shared/page-session';

const pages = new Map<string, LivePage>();
const records = new Map<string, Record<string, unknown>>();

export const listLivePages = () => {
    const items: LivePage[] = [];
    for (const page of pages.values()) items.push({ ...page, recordingIds: [...page.recordingIds] });
    return items;
};

export const readLivePage = (pageId: string) => pages.get(pageId) || null;

export const readTabPage = (tabId: number) => {
    for (const page of pages.values()) if (page.tabId === tabId) return { ...page, recordingIds: [...page.recordingIds] };
    return null;
};

export const saveLivePage = (page: LivePage) => {
    pages.set(page.pageId, { ...page, recordingIds: [...page.recordingIds] });
    return readLivePage(page.pageId);
};

export const saveTabPage = (tabId: number, values: Partial<LivePage>) => {
    const page = readTabPage(tabId);
    if (!page) return null;
    pages.set(page.pageId, { ...page, ...values, recordingIds: values.recordingIds || page.recordingIds });
    return readLivePage(page.pageId);
};

export const patchLivePage = (pageId: string, values: Partial<LivePage>) => {
    const page = pages.get(pageId);
    if (!page) return null;
    const next = { ...page, ...values, recordingIds: values.recordingIds || page.recordingIds };
    pages.set(pageId, next);
    return readLivePage(pageId);
};

export const dropLivePage = (pageId: string) => {
    pages.delete(pageId);
    records.delete(pageId);
};

export const saveRecord = (pageId: string, recordId: string, value: unknown) => {
    const items = records.get(pageId) || {};
    records.set(pageId, { ...items, [recordId]: value });
};

export const readRecord = (pageId: string, recordId: string) => {
    const items = records.get(pageId) || {};
    return items[recordId] || null;
};
