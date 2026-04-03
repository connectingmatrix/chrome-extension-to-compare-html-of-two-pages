import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

export const saveBase64 = async (path, data) => {
    if (!path) return;
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, Buffer.from(data || '', 'base64'));
};
