const instances = new Map();
const jobs = new Map();

const readNow = () => Date.now();
const readFresh = (entry) => entry && readNow() - entry.lastSeen < 120000;

const readTargetInstance = (instanceId = '') => {
    if (instanceId && readFresh(instances.get(instanceId))) return instanceId;
    for (const [id, entry] of instances.entries()) if (readFresh(entry)) return id;
    return '';
};

export const listInstances = () => [...instances.entries()].map(([id, entry]) => ({ extensionId: entry.extensionId, extensionUrl: entry.extensionUrl, id, lastSeen: entry.lastSeen }));

export const createJob = (kind, payload, instanceId = '', timeoutMs = 45000) => {
    const target = readTargetInstance(instanceId);
    if (!target) throw new Error('No active extension instance is connected.');
    const id = crypto.randomUUID();
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            jobs.delete(id);
            reject(new Error('Timed out waiting for the extension response.'));
        }, timeoutMs);
        jobs.set(id, { id, instanceId: target, kind, payload, resolve, reject, timer });
    });
};

export const claimJob = (instanceId, extensionId, extensionUrl) => {
    instances.set(instanceId, { extensionId, extensionUrl, lastSeen: readNow() });
    for (const job of jobs.values()) {
        if (job.instanceId === instanceId && !job.claimedAt) {
            job.claimedAt = readNow();
            return { id: job.id, kind: job.kind, payload: job.payload };
        }
    }
    return null;
};

export const completeJob = (jobId, success, result) => {
    const job = jobs.get(jobId);
    if (!job) return false;
    clearTimeout(job.timer);
    jobs.delete(jobId);
    if (success) job.resolve({ instanceId: job.instanceId, jobId, result });
    if (!success) job.reject(new Error(result.error || 'The extension reported an error.'));
    return true;
};
