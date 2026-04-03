import { DomNode } from '@/src/sidepanel/types';

export const readStructureMarks = (left: DomNode | null, right: DomNode | null) => {
    const leftMarks: Record<string, boolean> = {};
    const rightMarks: Record<string, boolean> = {};
    const walk = (leftNode: DomNode | null, rightNode: DomNode | null) => {
        if (!leftNode && !rightNode) return;
        const leftCount = leftNode ? leftNode.items.length : 0;
        const rightCount = rightNode ? rightNode.items.length : 0;
        const mismatch = !leftNode || !rightNode || leftNode.tag !== rightNode.tag || leftCount !== rightCount;
        if (mismatch && leftNode) leftMarks[leftNode.path] = true;
        if (mismatch && rightNode) rightMarks[rightNode.path] = true;
        for (let index = 0; index < Math.max(leftCount, rightCount); index += 1) {
            walk(leftNode ? leftNode.items[index] || null : null, rightNode ? rightNode.items[index] || null : null);
        }
    };
    walk(left, right);
    return { leftMarks, rightMarks };
};
