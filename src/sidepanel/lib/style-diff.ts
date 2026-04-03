import { DiffRow, NodeDetail } from '@/src/sidepanel/types';

const readTone = (value: string, other: string): DiffRow['tone'] => {
    if (value === other) return 'base';
    if (value) return 'warn';
    return 'danger';
};
const readRank = (tone: DiffRow['tone']): number => tone === 'base' ? 1 : 0;
const sortRows = (rows: DiffRow[]): DiffRow[] => rows.sort((left, right) => readRank(left.tone) - readRank(right.tone) || left.name.localeCompare(right.name));

export const readClassRows = (detail: NodeDetail, other: NodeDetail): DiffRow[] => {
    const names = [...detail.classes, ...other.classes.filter((name) => !detail.classes.includes(name))];
    return sortRows(names.map((name) => ({ name, value: detail.classes.includes(name) ? name : '[CLASS N/A]', tone: readTone(detail.classes.includes(name) ? name : '', other.classes.includes(name) ? name : '') })));
};

export const readStyleRows = (detail: NodeDetail, other: NodeDetail): DiffRow[] =>
    sortRows(
        [...Object.keys(detail.styles), ...Object.keys(other.styles).filter((name) => !detail.styles[name])]
            .map((name) => ({ name, value: detail.styles[name] || '', tone: readTone(detail.styles[name] || '', other.styles[name] || '') }))
            .filter((row) => row.value || other.styles[row.name] || '')
    );
