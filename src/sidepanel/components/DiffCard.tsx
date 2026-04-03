import { useDeferredValue, useState } from 'react';
import { DiffRow } from '@/src/sidepanel/types';

interface DiffCardProps {
    emptyText: string;
    rows: DiffRow[];
    subtitle: string;
    title: string;
}

export const DiffCard = ({ emptyText, rows, subtitle, title }: DiffCardProps) => (
    <DiffCardBody emptyText={emptyText} rows={rows} subtitle={subtitle} title={title} />
);

const DiffCardBody = ({ emptyText, rows, subtitle, title }: DiffCardProps) => {
    const [hideSame, setHideSame] = useState(true);
    const [search, setSearch] = useState('');
    const query = useDeferredValue(search).trim().toLowerCase();
    const visible = hideSame ? rows.filter((row) => row.tone !== 'base') : rows;
    const filtered = query ? visible.filter((row) => `${row.name} ${row.value}`.toLowerCase().includes(query)) : visible;
    return (
        <section className="panel">
            <div className="panel-head">
                <strong>{title}</strong>
                <span>{subtitle}</span>
            </div>
            <label className="panel-option">
                <input checked={hideSame} type="checkbox" onChange={(event) => setHideSame(event.target.checked)} />
                <span>Hide same values</span>
            </label>
            <input className="field panel-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search values" />
            <div className="diff-grid panel-scroll">
                {filtered.length
                    ? filtered.map((row) => (
                          <div key={row.name} className={`diff-row ${row.tone}`}>
                              <strong>{row.name}</strong>
                              <span>{row.value || 'unset'}</span>
                          </div>
                      ))
                    : <div className="empty">{visible.length ? 'No values match this search.' : emptyText}</div>}
            </div>
        </section>
    );
};
