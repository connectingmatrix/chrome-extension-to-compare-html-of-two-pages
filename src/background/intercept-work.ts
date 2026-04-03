import { sendDebug } from '@/src/background/debugger-work';
import { PageAction } from '@/src/shared/page-action';

const rules = new Map<number, PageAction[]>();
let emit = (_name: string, _data: Record<string, unknown>, _sessionId = '') => {};
let ready = false;

const readParts = (value: string) => value.split('*').filter(Boolean);
const matchUrl = (pattern = '', url = '') => {
    if (!pattern || pattern === '*') return true;
    let offset = 0;
    for (const part of readParts(pattern)) {
        const index = url.indexOf(part, offset);
        if (index < 0) return false;
        offset = index + part.length;
    }
    return true;
};
const matchRule = (action: PageAction, request: chrome.debugger.DebuggeeEvent['params']) => {
    const match = action.match || {};
    if (match.method && match.method !== request.request.method) return false;
    if (match.resourceTypes && match.resourceTypes.length && !match.resourceTypes.includes((request.resourceType || '').toLowerCase())) return false;
    return matchUrl(match.urlPattern || '*', request.request.url || '');
};
const readHeaders = (items = {}) => {
    const headers = [];
    for (const name of Object.keys(items)) headers.push({ name, value: `${items[name]}` });
    return headers;
};
const syncRules = async (tabId: number) => {
    const items = rules.get(tabId) || [];
    const patterns = [];
    for (const item of items) patterns.push({ requestStage: 'Request', urlPattern: item.match && item.match.urlPattern || '*' });
    await sendDebug(tabId, 'Fetch.enable', { patterns: patterns.length ? patterns : [{ requestStage: 'Request', urlPattern: '*' }] });
};

export const setInterceptEmitter = (next: typeof emit) => { emit = next; };

export const saveInterceptRule = async (tabId: number, action: PageAction, sessionId: string) => {
    rules.set(tabId, [...(rules.get(tabId) || []), action]);
    if (!ready) {
        ready = true;
        chrome.debugger.onEvent.addListener(async (source, method, params) => {
            if (method !== 'Fetch.requestPaused' || !source.tabId) return;
            const items = rules.get(source.tabId) || [];
            const rule = items.find((item) => matchRule(item, params));
            if (!rule) return chrome.debugger.sendCommand(source, 'Fetch.continueRequest', { requestId: params.requestId });
            emit('intercept.hit', { pageId: rule.pageId || '', requestId: params.requestId, ruleId: rule.ruleId || '', url: params.request.url || '' }, sessionId);
            if (rule.mode === 'abort') return chrome.debugger.sendCommand(source, 'Fetch.failRequest', { errorReason: 'Failed', requestId: params.requestId });
            if (rule.mode === 'fulfill') return chrome.debugger.sendCommand(source, 'Fetch.fulfillRequest', { body: rule.fulfill && rule.fulfill.bodyBase64 || '', requestId: params.requestId, responseCode: rule.fulfill && rule.fulfill.status || 200, responseHeaders: readHeaders(rule.fulfill && rule.fulfill.headers || {}) });
            return chrome.debugger.sendCommand(source, 'Fetch.continueRequest', { requestId: params.requestId });
        });
    }
    await syncRules(tabId);
};

export const dropInterceptRules = (tabId: number) => {
    rules.delete(tabId);
};
