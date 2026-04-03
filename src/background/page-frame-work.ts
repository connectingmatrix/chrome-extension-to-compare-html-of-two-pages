export const readPageFrames = async (tabId: number) => {
    const items = await chrome.webNavigation.getAllFrames({ tabId });
    const frames = [];
    for (const item of items || []) frames.push({ frameId: item.frameId || 0, parentFrameId: item.parentFrameId || 0, url: item.url || '' });
    return frames;
};
