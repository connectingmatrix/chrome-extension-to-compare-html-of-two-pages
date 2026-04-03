const message = 'Reload the installed extension from chrome://extensions, then reopen this page so Chrome APIs and storage are available.';

const readError = () => new Error(message);

export const readStorageLocal = () => {
    if (!chrome.storage || !chrome.storage.local) throw readError();
    return chrome.storage.local;
};

export const readTabsApi = () => {
    if (!chrome.tabs || !chrome.tabs.query) throw readError();
    return chrome.tabs;
};

export const readCurrentTab = () => new Promise<chrome.tabs.Tab | undefined>((resolve, reject) => {
    const tabs = readTabsApi();
    if (!tabs.getCurrent) reject(readError());
    else tabs.getCurrent((tab) => {
        if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
        else resolve(tab);
    });
});

export const readScriptingApi = () => {
    if (!chrome.scripting || !chrome.scripting.executeScript) throw readError();
    return chrome.scripting;
};

export const readRuntimeApi = () => {
    if (!chrome.runtime || !chrome.runtime.getURL) throw readError();
    return chrome.runtime;
};

export const readSidePanelApi = () => {
    if (!chrome.sidePanel || !chrome.sidePanel.setPanelBehavior) throw readError();
    return chrome.sidePanel;
};
