import { useDeferredValue, useEffect, useRef, useState } from 'react';
import { DomNode } from '@/src/sidepanel/types';
import { DomTreeItem } from '@/src/sidepanel/components/DomTreeItem';
import { readVisibleTree } from '@/src/sidepanel/lib/tree-nav';
import { readTreeSearch } from '@/src/sidepanel/lib/tree-search';

interface TreePaneProps {
    title: string;
    root: DomNode | null;
    marks: Record<string, boolean>;
    selectedPath: string;
    onSelect: (path: string) => void;
}

export const TreePane = ({ title, root, marks, selectedPath, onSelect }: TreePaneProps) => {
    const [expanded, setExpanded] = useState<Record<string, boolean>>({ root: true });
    const [search, setSearch] = useState('');
    const deferredSearch = useDeferredValue(search);
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const path = selectedPath || 'root';
    const result = readTreeSearch(root, deferredSearch);
    const visibleRoot = result.root;
    const visibleItems = readVisibleTree(visibleRoot, expanded);
    const scrollToPath = (nextPath: string) => window.requestAnimationFrame(() => {
        const row = scrollRef.current ? scrollRef.current.querySelector(`[data-path="${nextPath}"]`) as HTMLDivElement | null : null;
        if (row) row.scrollIntoView({ block: 'nearest' });
    });
    useEffect(() => { setExpanded({ root: true }); setSearch(''); }, [root ? root.path : '']);
    useEffect(() => {
        const selected = path.split('.').reduce<Record<string, boolean>>((next, _, index, parts) => ({ ...next, [parts.slice(0, index + 1).join('.')]: true }), { root: true });
        setExpanded((current) => ({ ...current, ...selected, ...result.expanded }));
    }, [deferredSearch, path, root ? root.path : '']);
    useEffect(() => {
        const row = scrollRef.current ? scrollRef.current.querySelector('.tree-row.is-selected') as HTMLDivElement | null : null;
        if (row) row.scrollIntoView({ block: 'nearest' });
    }, [path, deferredSearch, root ? root.path : '']);
    const handleKeyDown = async (event: React.KeyboardEvent<HTMLElement>) => {
        if ((event.target as HTMLElement).tagName === 'INPUT') return;
        const currentIndex = visibleItems.findIndex((item) => item.path === path);
        const current = visibleItems[currentIndex < 0 ? 0 : currentIndex];
        if (!current) return;
        if (event.key === 'ArrowDown') {
            const next = visibleItems[Math.min(currentIndex < 0 ? 0 : currentIndex + 1, visibleItems.length - 1)];
            if (next) {
                onSelect(next.path);
                scrollToPath(next.path);
            }
        }
        if (event.key === 'ArrowUp') {
            const next = visibleItems[Math.max(currentIndex - 1, 0)];
            if (next) {
                onSelect(next.path);
                scrollToPath(next.path);
            }
        }
        if (event.key === 'ArrowLeft' && current.hasChildren && current.open) setExpanded((state) => ({ ...state, [current.path]: false }));
        if (event.key === 'ArrowRight' && current.hasChildren && !current.open) setExpanded((state) => ({ ...state, [current.path]: true }));
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') event.preventDefault();
    };
    if (!root) return <section className="panel tree-pane"><div className="panel-head"><strong>{title}</strong></div><div className="empty">Load a selector from both tabs to render the tree.</div></section>;
    return (
        <section className="panel tree-pane" tabIndex={0} onKeyDown={handleKeyDown}>
            <div className="panel-head"><strong>{title}</strong><span>{root.label}</span></div>
            <input className="field tree-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search nodes, tags, classes" />
            <div ref={scrollRef} className="tree-scroll">
                {visibleRoot
                    ? <ul className="tree-list"><DomTreeItem depth={0} expanded={expanded} found={result.found} item={visibleRoot} isLast={true} lineage={[]} marks={marks} selectedPath={selectedPath} onSelect={onSelect} onToggle={(itemPath) => setExpanded((current) => ({ ...current, [itemPath]: !current[itemPath] }))} /></ul>
                    : <div className="empty">No tree nodes match this search.</div>}
            </div>
        </section>
    );
};
