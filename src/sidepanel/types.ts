export interface BrowserTab {
    id: number;
    title: string;
    url: string;
}

export interface DomNode {
    path: string;
    label: string;
    tag: string;
    classes: string[];
    items: DomNode[];
}

export interface Snapshot {
    selector: string;
    rootLabel: string;
    html: string;
    tree: DomNode | null;
    error: string;
}

export interface NodeBox {
    x: number;
    y: number;
    width: number;
    height: number;
    top: number;
    left: number;
    right: number;
    bottom: number;
}

export interface NodeDetail {
    path: string;
    label: string;
    classes: string[];
    styles: Record<string, string>;
    html: string;
    box: NodeBox | null;
    error: string;
}

export interface DiffRow {
    name: string;
    value: string;
    tone: 'base' | 'warn' | 'danger';
}
