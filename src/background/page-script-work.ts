export const runFrameScript = async <T,>(tabId: number, frameId: number, func: (...args: any[]) => T, args: any[] = []) => {
    const target = frameId ? { frameIds: [frameId], tabId } : { tabId };
    const result = await chrome.scripting.executeScript({ args, func, target });
    return result[0].result as T;
};
