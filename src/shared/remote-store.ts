import { RemoteSettings, remoteServerUrl, remoteSettingsKey } from '@/src/shared/remote-types';

const readSeed = (): RemoteSettings => ({ instanceId: crypto.randomUUID(), remoteEnabled: false, serverUrl: remoteServerUrl });
const readLocal = <T,>(key: string) => new Promise<T>((resolve, reject) => {
    chrome.storage.local.get(key, (items) => {
        if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
        else resolve(items[key] as T);
    });
});
const writeLocal = (value: Record<string, unknown>) => new Promise<void>((resolve, reject) => {
    chrome.storage.local.set(value, () => {
        if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
        else resolve();
    });
});

export const readRemoteSettings = async (): Promise<RemoteSettings> => {
    const saved = await readLocal<Partial<RemoteSettings>>(remoteSettingsKey);
    const settings = { ...readSeed(), ...saved };
    if (saved && saved.instanceId) return settings;
    await writeLocal({ [remoteSettingsKey]: settings });
    return settings;
};

export const saveRemoteSettings = async (settings: RemoteSettings): Promise<RemoteSettings> => {
    await writeLocal({ [remoteSettingsKey]: settings });
    return settings;
};

export { remoteSettingsKey };
