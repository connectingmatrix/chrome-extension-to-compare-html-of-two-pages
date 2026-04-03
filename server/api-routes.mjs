import express from 'express';
import { createJob, listInstances } from './store.mjs';

const router = express.Router();

const runJob = async (response, kind, payload, instanceId, timeoutMs) => {
    try {
        const result = await createJob(kind, payload, instanceId, timeoutMs);
        response.json({ ok: true, ...result });
    } catch (error) {
        response.status(409).json({ error: error.message, ok: false });
    }
};

router.get('/health', (_request, response) => response.json({ ok: true }));
router.get('/instances', (_request, response) => response.json({ items: listInstances(), ok: true }));
router.post('/compare/pages', (request, response) => runJob(response, 'compare-pages', { leftUrl: request.body.leftUrl, path: request.body.path || 'root', rightUrl: request.body.rightUrl, selector: request.body.selector || 'body', sizes: request.body.sizes }, request.body.instanceId || '', Number(request.body.timeoutMs) || 45000));
router.post('/compare/selector', (request, response) => runJob(response, 'compare-selector', { leftUrl: request.body.leftUrl, rightUrl: request.body.rightUrl, selector: request.body.selector, sizes: request.body.sizes }, request.body.instanceId || '', Number(request.body.timeoutMs) || 45000));
router.post('/inspect/selector', (request, response) => runJob(response, 'inspect-selector', { path: request.body.path || 'root', selector: request.body.selector, url: request.body.url }, request.body.instanceId || '', Number(request.body.timeoutMs) || 45000));

export default router;
