import { readRemoteSettings, remoteSettingsKey } from '@/src/shared/remote-store';
import { runRemoteJob } from '@/src/background/job-runner';

export const remoteAlarmName = 'remote-poll';

const post = async (url: string, body: Record<string, unknown>) => {
    const response = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    if (!response.ok) throw new Error(`Remote request failed: ${response.status}`);
    return response.json();
};

export const syncRemoteAlarm = async () => {
    const settings = await readRemoteSettings();
    if (!settings.remoteEnabled || !settings.serverUrl) return chrome.alarms.clear(remoteAlarmName);
    chrome.alarms.create(remoteAlarmName, { periodInMinutes: 0.5 });
};

export const runRemoteCycle = async () => {
    const settings = await readRemoteSettings();
    if (!settings.remoteEnabled || !settings.serverUrl) return;
    let job: { id: string } | null = null;
    try {
        const data = await post(`${settings.serverUrl}/api/extensions/poll`, { instanceId: settings.instanceId, extensionId: chrome.runtime.id, extensionUrl: chrome.runtime.getURL('sidepanel.html') });
        job = data.job || null;
        if (!data.job) return;
        const result = await runRemoteJob(data.job);
        await post(`${settings.serverUrl}/api/jobs/${data.job.id}/complete`, { instanceId: settings.instanceId, result, success: true });
    } catch (error) {
        if (job) {
            try {
                await post(`${settings.serverUrl}/api/jobs/${job.id}/complete`, { instanceId: settings.instanceId, result: { error: error instanceof Error ? error.message : 'Remote job failed.' }, success: false });
            } catch (reportError) {
                console.error(reportError);
            }
        }
        console.error(error);
    }
};

export { remoteSettingsKey };
