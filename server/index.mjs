import express from 'express';
import apiRoutes from './api-routes.mjs';
import extensionRoutes from './extension-routes.mjs';

const app = express();
const port = Number(process.env.PORT) || 4017;

app.use(express.json({ limit: '10mb' }));
app.use((request, response, next) => {
    response.header('access-control-allow-origin', '*');
    response.header('access-control-allow-headers', 'content-type');
    response.header('access-control-allow-methods', 'GET,POST,OPTIONS');
    if (request.method === 'OPTIONS') return response.sendStatus(204);
    next();
});
app.use('/api', apiRoutes);
app.use('/api', extensionRoutes);
app.listen(port, () => console.log(`HTML-DIFF server listening on ${port}`));
