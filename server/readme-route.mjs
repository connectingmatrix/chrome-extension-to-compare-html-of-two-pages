import { readFile } from 'node:fs/promises';

const fileUrl = new URL('../README.md', import.meta.url);

export const sendReadme = async (_request, response) => {
    const text = await readFile(fileUrl, 'utf8');
    response.type('text/markdown');
    response.send(text);
};
