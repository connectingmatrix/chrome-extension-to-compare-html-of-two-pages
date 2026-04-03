import { sendDebug } from '@/src/background/debugger-work';

const readExpression = (selector: string, index: number) => `(() => {
    const items = document.querySelectorAll(${JSON.stringify(selector || '')});
    return items[${index || 0}] || null;
})()`;

export const uploadFiles = async (tabId: number, selector: string, index: number, files: string[]) => {
    const remote = await sendDebug(tabId, 'Runtime.evaluate', {
        awaitPromise: true,
        expression: readExpression(selector, index),
        includeCommandLineAPI: false
    });
    if (!remote || !remote.result || !remote.result.objectId) throw new Error(`No element matches ${selector || ''}`);
    const node = await sendDebug(tabId, 'DOM.requestNode', { objectId: remote.result.objectId });
    if (!node || !node.nodeId) throw new Error(`No file input matches ${selector || ''}`);
    await sendDebug(tabId, 'DOM.setFileInputFiles', { files, nodeId: node.nodeId });
    return { files: [...files], selector };
};
