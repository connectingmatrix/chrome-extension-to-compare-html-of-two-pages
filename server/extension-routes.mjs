import express from 'express';
import { claimJob, completeJob } from './store.mjs';

const router = express.Router();

router.post('/extensions/poll', (request, response) => {
    const job = claimJob(request.body.instanceId || '', request.body.extensionId || '', request.body.extensionUrl || '');
    response.json({ job: job || null, ok: true });
});

router.post('/jobs/:id/complete', (request, response) => {
    const ok = completeJob(request.params.id, Boolean(request.body.success), request.body.result || { error: 'Unknown extension failure.' });
    response.status(ok ? 200 : 404).json({ ok });
});

export default router;
