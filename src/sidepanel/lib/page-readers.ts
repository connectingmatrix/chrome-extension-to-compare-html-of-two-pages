export const readDomSnapshot = (selector: string) => {
    const readRoot = () => {
        const readNodes = () => {
            const items = [];
            const walker = document.createTreeWalker(document.body || document.documentElement, NodeFilter.SHOW_ELEMENT);
            for (let node = walker.currentNode as Element | null; node; node = walker.nextNode() as Element | null) items.push(node);
            return items;
        };
        const readText = (element: Element) => (element.textContent || '').replace(/\s+/g, ' ').trim();
        const readName = (element: Element) => {
            const value = element.getAttribute('aria-label') || element.getAttribute('title') || element.getAttribute('placeholder') || (element as HTMLInputElement).value || '';
            if (value) return value.trim();
            const id = element.getAttribute('aria-labelledby') || element.id || '';
            const label = id ? document.getElementById(id) : null;
            return label ? readText(label) : readText(element);
        };
        if (!selector.startsWith('::-p-') || !selector.endsWith(')')) return document.querySelector(selector);
        const items = readNodes().filter((element) => selector.startsWith('::-p-text(') ? readText(element).includes(selector.slice(selector.indexOf('(') + 1, -1).trim()) : readName(element).includes(selector.slice(selector.indexOf('(') + 1, -1).trim()));
        return items[0] || null;
    };
    const readStyles = (element: Element) => {
        const computed = getComputedStyle(element);
        const styles = [];
        for (let index = 0; index < computed.length; index += 1) {
            const name = computed.item(index);
            styles.push({ name, value: computed.getPropertyValue(name).trim() });
        }
        styles.sort((left, right) => left.name.localeCompare(right.name));
        return styles;
    };
    const readLabel = (element: Element) => {
        const tag = element.tagName.toLowerCase();
        const tagLabel = `< ${tag} >`;
        const idName = element.id ? `#${element.id}` : '';
        const classes = Array.from(element.classList).slice(0, 3).map((name) => `.${name}`).join('');
        return `${tagLabel}${idName}${classes}`;
    };
    const readChildren = (element: Element) => Array.from(element.children).filter((child) => child.tagName.toLowerCase() !== 'script');
    const readNode = (element: Element, path: string): unknown => ({
        path,
        label: readLabel(element),
        styles: readStyles(element),
        tag: element.tagName.toLowerCase(),
        classes: Array.from(element.classList),
        items: readChildren(element).map((child, index) => readNode(child, `${path}.${index}`))
    });
    const root = readRoot();
    if (!root) return { selector, rootLabel: '', html: '', style: [], tree: null, error: `No element matches ${selector}` };
    if (root.tagName.toLowerCase() === 'script') return { selector, rootLabel: '', html: '', style: [], tree: null, error: 'Script nodes are hidden from the tree.' };
    return { selector, rootLabel: readLabel(root), html: root.outerHTML, style: readStyles(root), tree: readNode(root, 'root'), error: '' };
};

export const readNodeDetail = (selector: string, path: string) => {
    const readRoot = () => {
        const readNodes = () => {
            const items = [];
            const walker = document.createTreeWalker(document.body || document.documentElement, NodeFilter.SHOW_ELEMENT);
            for (let node = walker.currentNode as Element | null; node; node = walker.nextNode() as Element | null) items.push(node);
            return items;
        };
        const readText = (element: Element) => (element.textContent || '').replace(/\s+/g, ' ').trim();
        const readName = (element: Element) => {
            const value = element.getAttribute('aria-label') || element.getAttribute('title') || element.getAttribute('placeholder') || (element as HTMLInputElement).value || '';
            if (value) return value.trim();
            const id = element.getAttribute('aria-labelledby') || element.id || '';
            const label = id ? document.getElementById(id) : null;
            return label ? readText(label) : readText(element);
        };
        if (!selector.startsWith('::-p-') || !selector.endsWith(')')) return document.querySelector(selector);
        const items = readNodes().filter((element) => selector.startsWith('::-p-text(') ? readText(element).includes(selector.slice(selector.indexOf('(') + 1, -1).trim()) : readName(element).includes(selector.slice(selector.indexOf('(') + 1, -1).trim()));
        return items[0] || null;
    };
    const readLabel = (element: Element) => {
        const tag = element.tagName.toLowerCase();
        const tagLabel = `< ${tag} >`;
        const idName = element.id ? `#${element.id}` : '';
        const classes = Array.from(element.classList).slice(0, 3).map((name) => `.${name}`).join('');
        return `${tagLabel}${idName}${classes}`;
    };
    const readChildren = (element: Element) => Array.from(element.children).filter((child) => child.tagName.toLowerCase() !== 'script');
    const readStyles = (element: Element) => {
        const computed = getComputedStyle(element);
        return Array.from({ length: computed.length }, (_, index) => computed.item(index))
            .sort()
            .reduce<Record<string, string>>((result, name) => ({ ...result, [name]: computed.getPropertyValue(name).trim() }), {});
    };
    const readBox = (element: Element) => {
        const box = element.getBoundingClientRect();
        return { x: box.x, y: box.y, width: box.width, height: box.height, top: box.top, left: box.left, right: box.right, bottom: box.bottom };
    };
    let target = readRoot();
    if (!target) return { path, label: '', classes: [], styles: {}, html: '', box: null, error: `No element matches ${selector}` };
    for (const part of path.split('.').slice(1)) {
        const child = readChildren(target)[Number(part)];
        if (!child) return { path, label: '', classes: [], styles: {}, html: '', box: null, error: 'No matching node at this path.' };
        target = child;
    }
    return { path, label: readLabel(target), classes: Array.from(target.classList), styles: readStyles(target), html: target.outerHTML, box: readBox(target), error: '' };
};
