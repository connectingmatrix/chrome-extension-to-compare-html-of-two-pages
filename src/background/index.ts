import { remoteAlarmName, remoteSettingsKey, runRemoteCycle, syncRemoteAlarm } from '@/src/background/remote-sync';

const openSidePanel = async () => chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
const boot = async () => { await openSidePanel(); await syncRemoteAlarm(); };

chrome.runtime.onInstalled.addListener(() => { void boot(); });
chrome.runtime.onStartup.addListener(() => { void boot(); });
chrome.alarms.onAlarm.addListener((alarm) => { if (alarm.name === remoteAlarmName) void runRemoteCycle(); });
chrome.storage.onChanged.addListener((changes, areaName) => { if (areaName === 'local' && changes[remoteSettingsKey]) void syncRemoteAlarm(); });
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!message || message.type !== 'remote-settings-saved') return;
    syncRemoteAlarm().then(() => sendResponse({ ok: true }));
    return true;
});
