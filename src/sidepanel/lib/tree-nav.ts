import { DomNode } from '@/src/sidepanel/types';

export interface VisibleTreeItem {
    childPath: string;
    hasChildren: boolean;
    open: boolean;
    parentPath: string;
    path: string;
}

export const readVisibleTree = (root: DomNode | null, expanded: Record<string, boolean>): VisibleTreeItem[] => {
    const items: VisibleTreeItem[] = [];
    const walk = (item: DomNode, parentPath: string) => {
        const hasChildren = Boolean(item.items.length);
        const open = Boolean(expanded[item.path]);
        items.push({ childPath: hasChildren ? item.items[0].path : '', hasChildren, open, parentPath, path: item.path });
        if (!hasChildren || !open) return;
        for (const child of item.items) walk(child, item.path);
    };
    if (root) walk(root, '');
    return items;
};
