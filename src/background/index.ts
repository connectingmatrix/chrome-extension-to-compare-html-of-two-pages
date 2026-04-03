import { readSidePanelApi } from '@/src/shared/extension-api';

const openSidePanel = async () => readSidePanelApi().setPanelBehavior({ openPanelOnActionClick: true });
const boot = async () => { await openSidePanel(); };

chrome.runtime.onInstalled.addListener(() => { void boot(); });
chrome.runtime.onStartup.addListener(() => { void boot(); });
