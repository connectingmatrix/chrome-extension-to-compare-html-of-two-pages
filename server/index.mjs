import express from 'express';
import http from 'node:http';
import apiRoutes from './api-routes.mjs';
import { attachSocketServer } from './socket-server.mjs';

const app = express();
const port = Number(process.env.PORT) || 4017;
const server = http.createServer(app);

app.use(express.json({ limit: '10mb' }));
app.use((request, response, next) => {
    response.header('access-control-allow-origin', '*');
    response.header('access-control-allow-headers', 'content-type');
    response.header('access-control-allow-methods', 'GET,POST,OPTIONS');
    if (request.method === 'OPTIONS') return response.sendStatus(204);
    next();
});
app.use('/api', apiRoutes);
attachSocketServer(server);
server.listen(port, () => console.log(`HTML-Inspect server listening on ${port}`));
