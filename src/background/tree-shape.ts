import { DomNode } from '@/src/sidepanel/types';

const readStyleMap = (items) => {
    const result = {};
    for (const item of items || []) result[item.name] = item.value;
    return result;
};

export const readTreeSnapshot = (node: DomNode | null) => {
    if (!node) return {};
    const childeren = {};
    for (const child of node.items) {
        const next = readTreeSnapshot(child);
        for (const name in next) childeren[name] = next[name];
    }
    return { [node.label]: { childeren, styles: readStyleMap(node.styles) } };
};

const readNodeDiff = (current: DomNode | null, other: DomNode | null) => {
    if (!current) return {};
    const childeren = {};
    for (let index = 0; index < current.items.length || index < (other ? other.items.length : 0); index += 1) {
        const next = readNodeDiff(current.items[index] || null, other ? other.items[index] || null : null);
        for (const name in next) childeren[name] = next[name];
    }
    const otherStyles = readStyleMap(other ? other.styles : []);
    const styles = {};
    for (const item of current.styles) if (otherStyles[item.name] !== item.value) styles[item.name] = item.value;
    if (!other || current.label !== other.label || Object.keys(styles).length || Object.keys(childeren).length) return { [current.label]: { childeren, styles } };
    return {};
};

export const readTreeDiff = (left: DomNode | null, right: DomNode | null) => ({ left: readNodeDiff(left, right), right: readNodeDiff(right, left) });
