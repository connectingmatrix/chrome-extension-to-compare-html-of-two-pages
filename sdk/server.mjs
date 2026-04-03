import { spawn } from 'node:child_process';
import { browser } from './browser.mjs';
import { readBaseUrl } from './http.mjs';

export class LocalServer {
    constructor(baseUrl = '') {
        this.baseUrl = readBaseUrl(baseUrl);
        this.process = null;
    }
    async start(options = {}) {
        const port = `${options.port || new URL(this.baseUrl).port || '4017'}`;
        const baseUrl = `http://127.0.0.1:${port}`;
        if (this.baseUrl !== baseUrl && this.process) this.stop();
        this.baseUrl = baseUrl;
        browser.setBaseUrl(baseUrl);
        globalThis.browser = null;
        if (this.process) {
            const response = await fetch(`${this.baseUrl}/api/instances`);
            const data = await response.json();
            if (data.items && data.items.length) {
                globalThis.browser = browser;
                return browser;
            }
            return null;
        }
        try {
            const response = await fetch(`${this.baseUrl}/api/health`);
            if (response.ok) {
                const endsAt = Date.now() + 5000;
                while (Date.now() < endsAt) {
                    try {
                        const ready = await fetch(`${this.baseUrl}/api/instances`);
                        const data = await ready.json();
                        if (data.items && data.items.length) {
                            globalThis.browser = browser;
                            return browser;
                        }
                    } catch {}
                    await new Promise((resolve) => setTimeout(resolve, 200));
                }
                return null;
            }
        } catch {}
        this.process = spawn('node', ['server/index.mjs'], { cwd: new URL('..', import.meta.url), env: { ...process.env, PORT: port }, stdio: 'inherit' });
        const endsAt = Date.now() + 15000;
        while (Date.now() < endsAt) {
            try {
                const response = await fetch(`${this.baseUrl}/api/health`);
                if (response.ok) {
                    const readyAt = Date.now() + 5000;
                    while (Date.now() < readyAt) {
                        try {
                            const ready = await fetch(`${this.baseUrl}/api/instances`);
                            const data = await ready.json();
                            if (data.items && data.items.length) {
                                globalThis.browser = browser;
                                return browser;
                            }
                        } catch {}
                        await new Promise((resolve) => setTimeout(resolve, 200));
                    }
                    return null;
                }
            } catch {}
            await new Promise((resolve) => setTimeout(resolve, 200));
        }
        throw new Error(`Timed out waiting for ${this.baseUrl} to start.`);
    }
    stop() {
        delete globalThis.browser;
        if (!this.process) return;
        this.process.kill();
        this.process = null;
    }
}

export const server = new LocalServer();
