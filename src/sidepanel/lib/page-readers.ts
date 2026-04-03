export const readDomSnapshot = (selector: string) => {
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
    const root = document.querySelector(selector);
    if (!root) return { selector, rootLabel: '', html: '', style: [], tree: null, error: `No element matches ${selector}` };
    if (root.tagName.toLowerCase() === 'script') return { selector, rootLabel: '', html: '', style: [], tree: null, error: 'Script nodes are hidden from the tree.' };
    return { selector, rootLabel: readLabel(root), html: root.outerHTML, style: readStyles(root), tree: readNode(root, 'root'), error: '' };
};

export const readNodeDetail = (selector: string, path: string) => {
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
    let target = document.querySelector(selector);
    if (!target) return { path, label: '', classes: [], styles: {}, html: '', box: null, error: `No element matches ${selector}` };
    for (const part of path.split('.').slice(1)) {
        const child = readChildren(target)[Number(part)];
        if (!child) return { path, label: '', classes: [], styles: {}, html: '', box: null, error: 'No matching node at this path.' };
        target = child;
    }
    return { path, label: readLabel(target), classes: Array.from(target.classList), styles: readStyles(target), html: target.outerHTML, box: readBox(target), error: '' };
};
