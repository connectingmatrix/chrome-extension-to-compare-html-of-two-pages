export interface RemoteSettings {
    instanceId: string;
    remoteEnabled: boolean;
    serverUrl: string;
}

export type RemoteJobKind = 'compare-pages' | 'compare-selector' | 'inspect-selector';
export interface ScreenSize {
    height: number;
    name: string;
    width: number;
}

export type ScreenSizeInput = 'all' | ScreenSize[];

export interface ComparePagesPayload {
    leftUrl: string;
    path: string;
    rightUrl: string;
    selector: string;
    sizes?: ScreenSizeInput;
}

export interface CompareSelectorPayload {
    leftUrl: string;
    rightUrl: string;
    selector: string;
    sizes?: ScreenSizeInput;
}

export interface InspectSelectorPayload {
    path: string;
    selector: string;
    url: string;
}

export interface RemoteJob {
    id: string;
    kind: RemoteJobKind;
    payload: Record<string, unknown>;
}

export const remoteSettingsKey = 'remote-settings';
export const remoteServerUrl = 'http://127.0.0.1:4017';
export const presetSizes: ScreenSize[] = [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'tablet', width: 1024, height: 1366 },
    { name: 'mobile', width: 390, height: 844 }
];
