import { WebSocket } from 'ws';
import { readBaseUrl } from './http.mjs';

const readSocketUrl = (baseUrl) => {
    const url = new URL('/api/live', readBaseUrl(baseUrl));
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${url}`;
};

export class LiveSocket {
    constructor(baseUrl = '') {
        this.baseUrl = readBaseUrl(baseUrl);
        this.listeners = [];
        this.socket = null;
        this.sessionId = '';
    }
    listen(type, handler) {
        this.listeners.push({ handler, type });
        return () => { this.listeners = this.listeners.filter((item) => item.handler !== handler || item.type !== type); };
    }
    emit(type, data) {
        for (const item of this.listeners) if (!item.type || item.type === type) item.handler(data);
    }
    open(sessionId = '') {
        if (this.socket) this.socket.close();
        this.sessionId = sessionId || '';
        this.socket = new WebSocket(readSocketUrl(this.baseUrl));
        this.socket.onmessage = (event) => {
            const message = JSON.parse(`${event.data}`);
            if (message.type === 'event') this.emit(message.name || 'event', { ...(message.data || {}), name: message.name || 'event' });
            if (message.type === 'pages.active') this.emit('pages.active', message.items || []);
        };
        this.socket.onopen = () => {
            this.socket.send(JSON.stringify({ sessionId: this.sessionId, type: 'subscribe' }));
            this.emit('open', { sessionId: this.sessionId });
        };
        this.socket.onclose = () => this.emit('close', {});
    }
    close() {
        if (this.socket) this.socket.close();
        this.socket = null;
    }
}
