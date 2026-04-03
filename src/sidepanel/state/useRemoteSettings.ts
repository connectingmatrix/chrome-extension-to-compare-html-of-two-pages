import { useEffect, useState } from 'react';
import { readRemoteSettings, saveRemoteSettings } from '@/src/shared/remote-store';
import { RemoteSettings } from '@/src/shared/remote-types';

const emptySettings: RemoteSettings = { debugForeground: false, remoteEnabled: true, serverUrl: '', updatedAt: 0 };

export const useRemoteSettings = () => {
    const [message, setMessage] = useState('');
    const [messageTone, setMessageTone] = useState<'base' | 'danger'>('base');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<RemoteSettings>(emptySettings);
    const [activeSettings, setActiveSettings] = useState<RemoteSettings>(emptySettings);

    useEffect(() => {
        readRemoteSettings().then((next) => {
            setSettings(next);
            setActiveSettings(next);
            setMessage('');
            setMessageTone('base');
        }).catch((error) => {
            setSettings((current) => ({ ...current, serverUrl: current.serverUrl || 'http://127.0.0.1:4017' }));
            setActiveSettings((current) => ({ ...current, serverUrl: current.serverUrl || 'http://127.0.0.1:4017' }));
            setMessage(error instanceof Error ? error.message : 'Could not load remote settings.');
            setMessageTone('danger');
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
            setActiveSettings(next);
            setMessage('Settings saved. Reconnecting socket.');
            setMessageTone('base');
            return true;
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Could not save remote settings.');
            setMessageTone('danger');
            return false;
        } finally {
            setSaving(false);
        }
    };

    return { activeSettings, loading, message, messageTone, save, saving, settings, update };
};
