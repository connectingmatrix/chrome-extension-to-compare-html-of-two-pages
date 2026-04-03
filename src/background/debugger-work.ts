import { ScreenSize } from '@/src/shared/remote-types';

const attached = new Set<number>();
const version = '1.3';
const readTarget = (tabId: number) => ({ tabId });

export const ensureDebugTab = async (tabId: number) => {
    if (attached.has(tabId)) return;
    await chrome.debugger.attach(readTarget(tabId), version);
    attached.add(tabId);
};

export const sendDebug = async (tabId: number, method: string, command = {}) => {
    await ensureDebugTab(tabId);
    return chrome.debugger.sendCommand(readTarget(tabId), method, command);
};

export const resizeViewport = async (tabId: number, size: ScreenSize) => {
    await sendDebug(tabId, 'Emulation.setDeviceMetricsOverride', {
        deviceScaleFactor: 1,
        dontSetVisibleSize: false,
        height: size.height,
        mobile: false,
        screenHeight: size.height,
        screenWidth: size.width,
        width: size.width
    });
};

export const clearViewport = async (tabId: number) => {
    if (!attached.has(tabId)) return;
    await chrome.debugger.sendCommand(readTarget(tabId), 'Emulation.clearDeviceMetricsOverride');
};

export const captureScreenshot = async (tabId: number, clip = null) => {
    const command = clip ? { clip, format: 'png' } : { format: 'png' };
    const result = await sendDebug(tabId, 'Page.captureScreenshot', command);
    return result.data || '';
};

export const closeDebugTab = async (tabId: number) => {
    if (!attached.has(tabId)) return;
    await clearViewport(tabId);
    await chrome.debugger.detach(readTarget(tabId));
    attached.delete(tabId);
};
