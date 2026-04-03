import { readClassRows, readStyleRows } from '@/src/sidepanel/lib/style-diff';
import { readStructureMarks } from '@/src/sidepanel/lib/structure-diff';
import { readPageData } from '@/src/background/tab-work';
import { readSizes } from '@/src/shared/size-work';
import { ComparePagesPayload, CompareSelectorPayload, InspectSelectorPayload, RemoteJob } from '@/src/shared/remote-types';

const readCompareResult = (left: Awaited<ReturnType<typeof readPageData>>, right: Awaited<ReturnType<typeof readPageData>>) => ({
    left,
    right,
    structureMarks: readStructureMarks(left.snapshot.tree, right.snapshot.tree),
    classRows: readClassRows(left.detail, right.detail),
    styleRows: readStyleRows(left.detail, right.detail)
});

const readSizedResults = async (payload: ComparePagesPayload | CompareSelectorPayload, path: string) => {
    const sizes = readSizes(payload.sizes);
    const runs = [];
    for (const size of sizes) {
        const left = await readPageData(payload.leftUrl, payload.selector || 'body', path, size);
        const right = await readPageData(payload.rightUrl, payload.selector || 'body', path, size);
        runs.push({ size, ...readCompareResult(left, right) });
    }
    return { runs };
};

const readComparePages = async (payload: ComparePagesPayload) => {
    if (payload.sizes) return readSizedResults(payload, payload.path || 'root');
    const left = await readPageData(payload.leftUrl, payload.selector || 'body', payload.path || 'root');
    const right = await readPageData(payload.rightUrl, payload.selector || 'body', payload.path || 'root');
    return readCompareResult(left, right);
};

const readCompareSelector = async (payload: CompareSelectorPayload) => {
    if (payload.sizes) return readSizedResults(payload, 'root');
    const left = await readPageData(payload.leftUrl, payload.selector, 'root');
    const right = await readPageData(payload.rightUrl, payload.selector, 'root');
    return readCompareResult(left, right);
};

const readInspectSelector = async (payload: InspectSelectorPayload) => readPageData(payload.url, payload.selector, payload.path || 'root');

export const runRemoteJob = async (job: RemoteJob) => {
    if (job.kind === 'compare-pages') return readComparePages(job.payload as ComparePagesPayload);
    if (job.kind === 'compare-selector') return readCompareSelector(job.payload as CompareSelectorPayload);
    return readInspectSelector(job.payload as InspectSelectorPayload);
};
