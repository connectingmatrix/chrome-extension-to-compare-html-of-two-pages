import { spawn } from 'node:child_process';
import { readBaseUrl } from './http.mjs';

export class LocalServer {
    constructor(baseUrl = '') {
        this.baseUrl = readBaseUrl(baseUrl);
        this.process = null;
    }
    async start() {
        if (this.process) return this.process;
        try {
            const response = await fetch(`${this.baseUrl}/api/health`);
            if (response.ok) return null;
        } catch {}
        const port = `${new URL(this.baseUrl).port || '4017'}`;
        this.process = spawn('node', ['server/index.mjs'], { cwd: new URL('..', import.meta.url), env: { ...process.env, PORT: port }, stdio: 'inherit' });
        return this.process;
    }
    stop() {
        if (!this.process) return;
        this.process.kill();
        this.process = null;
    }
}

export const server = new LocalServer();
