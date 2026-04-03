import { useEffect, useState } from 'react';
import { readRemoteSettings, saveRemoteSettings } from '@/src/shared/remote-store';
import { RemoteSettings } from '@/src/shared/remote-types';

const emptySettings: RemoteSettings = { instanceId: '', remoteEnabled: false, serverUrl: '' };
const notifyBackground = () => new Promise<void>((resolve) => {
    chrome.runtime.sendMessage({ type: 'remote-settings-saved' }, () => resolve());
});

export const useRemoteSettings = () => {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<RemoteSettings>(emptySettings);

    useEffect(() => {
        readRemoteSettings().then((next) => {
            setSettings(next);
            setMessage('');
        }).catch((error) => {
            setSettings((current) => ({ ...current, instanceId: crypto.randomUUID(), serverUrl: current.serverUrl || 'http://127.0.0.1:4017' }));
            setMessage(error instanceof Error ? error.message : 'Could not load remote settings.');
        }).finally(() => {
            setLoading(false);
        });
    }, []);

    const update = (name: keyof RemoteSettings, value: string | boolean) => {
        setSettings((current) => ({ ...current, [name]: value }));
    };

    const save = async () => {
        setSaving(true);
        try {
            const next = await saveRemoteSettings(settings);
            setSettings(next);
            await notifyBackground();
            setMessage('Settings saved.');
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Could not save remote settings.');
        } finally {
            setSaving(false);
        }
    };

    return { loading, message, save, saving, settings, update };
};
