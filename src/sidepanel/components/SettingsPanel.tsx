import { RemoteSettings } from '@/src/shared/remote-types';

interface SettingsPanelProps {
    instanceId: string;
    loading: boolean;
    message: string;
    onChange: (name: keyof RemoteSettings, value: string | boolean) => void;
    onSave: () => void;
    saving: boolean;
    settings: RemoteSettings;
}

export const SettingsPanel = ({ instanceId, loading, message, onChange, onSave, saving, settings }: SettingsPanelProps) => (
    <section className="panel settings-panel">
        <div className="panel-head">
            <strong>Remote Settings</strong>
            <span>{instanceId}</span>
        </div>
        <div className="settings-note">{message || ' '}</div>
        <label className="control"><span>Server URL</span><input className="field" disabled={saving} value={settings.serverUrl} onChange={(event) => onChange('serverUrl', event.target.value)} placeholder="http://127.0.0.1:4017" /></label>
        <label className="panel-option">
            <input checked={settings.remoteEnabled} disabled={saving} type="checkbox" onChange={(event) => onChange('remoteEnabled', event.target.checked)} />
            <span>Activate remote control</span>
        </label>
        <label className="panel-option">
            <input checked={settings.debugForeground} disabled={saving} type="checkbox" onChange={(event) => onChange('debugForeground', event.target.checked)} />
            <span>Open capture tabs in foreground</span>
        </label>
        <button className="btn" disabled={saving || loading} type="button" onClick={() => void onSave()}>{saving ? 'Saving...' : 'Save settings'}</button>
    </section>
);
