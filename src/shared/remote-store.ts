import { RemoteSettings, remoteServerUrl, remoteSettingsKey } from '@/src/shared/remote-types';
import { readStorageLocal } from '@/src/shared/extension-api';

const readSeed = (): RemoteSettings => ({ debugForeground: false, remoteEnabled: true, serverUrl: remoteServerUrl, updatedAt: 0 });
const readLocal = <T,>(key: string) => new Promise<T>((resolve, reject) => {
    readStorageLocal().get(key, (items) => {
        if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
        else resolve(items[key] as T);
    });
});
const writeLocal = (value: Record<string, unknown>) => new Promise<void>((resolve, reject) => {
    readStorageLocal().set(value, () => {
        if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
        else resolve();
    });
});

export const readRemoteSettings = async (): Promise<RemoteSettings> => {
    const saved = await readLocal<Partial<RemoteSettings>>(remoteSettingsKey);
    let settings = { ...readSeed(), ...saved };
    if (saved) {
        if (!saved.updatedAt && !saved.remoteEnabled) settings = { ...settings, remoteEnabled: true };
        if (!saved.updatedAt && saved.debugForeground === undefined) settings = { ...settings, debugForeground: false };
        if (saved.debugForeground !== settings.debugForeground || saved.serverUrl !== settings.serverUrl || saved.remoteEnabled !== settings.remoteEnabled || saved.updatedAt !== settings.updatedAt) await writeLocal({ [remoteSettingsKey]: settings });
        return settings;
    }
    await writeLocal({ [remoteSettingsKey]: settings });
    return settings;
};

export const saveRemoteSettings = async (settings: RemoteSettings): Promise<RemoteSettings> => {
    const next = { ...settings, updatedAt: Date.now() };
    await writeLocal({ [remoteSettingsKey]: next });
    return next;
};

export { remoteSettingsKey };
