import { useEffect, useState } from 'react';
import { inspectNode, inspectTree, listTabs } from '@/src/sidepanel/lib/inspect';
import { BrowserTab, NodeDetail, Snapshot } from '@/src/sidepanel/types';

const emptyDetail: NodeDetail = { path: '', label: '', classes: [], styles: {}, html: '', box: null, error: '' };
const emptySnapshot: Snapshot = { selector: '', rootLabel: '', html: '', style: [], tree: null, error: '' };

export const useDomCompare = () => {
    const [tabs, setTabs] = useState<BrowserTab[]>([]);
    const [leftTabId, setLeftTabId] = useState(0);
    const [rightTabId, setRightTabId] = useState(0);
    const [selector, setSelector] = useState('body');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [leftSnapshot, setLeftSnapshot] = useState<Snapshot>(emptySnapshot);
    const [rightSnapshot, setRightSnapshot] = useState<Snapshot>(emptySnapshot);
    const [selectedPath, setSelectedPath] = useState('root');
    const [leftDetail, setLeftDetail] = useState<NodeDetail>(emptyDetail);
    const [rightDetail, setRightDetail] = useState<NodeDetail>(emptyDetail);

    const refreshTabs = async () => {
        try {
            const nextTabs = await listTabs();
            setTabs(nextTabs);
            if (!leftTabId && nextTabs[0]) setLeftTabId(nextTabs[0].id);
            if (!rightTabId && nextTabs[1]) setRightTabId(nextTabs[1].id);
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : 'Could not read Chrome tabs.');
        }
    };

    const readDetails = async (path: string, nextSelector: string, nextLeftTabId: number, nextRightTabId: number) => {
        const [leftNode, rightNode] = await Promise.all([inspectNode(nextLeftTabId, nextSelector, path), inspectNode(nextRightTabId, nextSelector, path)]);
        setLeftDetail(leftNode);
        setRightDetail(rightNode);
    };

    useEffect(() => {
        void refreshTabs();
    }, []);

    const inspect = async () => {
        if (!leftTabId || !rightTabId || !selector.trim()) {
            setError('Select two tabs and enter a root selector.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const query = selector.trim();
            const [leftTree, rightTree] = await Promise.all([inspectTree(leftTabId, query), inspectTree(rightTabId, query)]);
            setLeftSnapshot(leftTree);
            setRightSnapshot(rightTree);
            if (leftTree.error || rightTree.error) setError(leftTree.error || rightTree.error);
            setSelectedPath('root');
            await readDetails('root', query, leftTabId, rightTabId);
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : 'Could not inspect the selected tabs.');
        } finally {
            setLoading(false);
        }
    };

    const selectPath = async (path: string) => {
        if (!leftTabId || !rightTabId) return;
        setSelectedPath(path);
        await readDetails(path, selector.trim(), leftTabId, rightTabId);
    };

    return {
        error, inspect, leftDetail, leftSnapshot, leftTabId, loading, refreshTabs,
        rightDetail, rightSnapshot, rightTabId, selectPath, selectedPath,
        selector, setLeftTabId, setRightTabId, setSelector, tabs
    };
};
