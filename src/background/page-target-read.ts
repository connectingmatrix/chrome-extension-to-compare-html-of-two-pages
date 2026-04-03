export const readPageTarget = (selector: string, index: number, visible: boolean) => {
    const readNodes = () => {
        const items = [];
        const walker = document.createTreeWalker(document.body || document.documentElement, NodeFilter.SHOW_ELEMENT);
        for (let node = walker.currentNode as Element | null; node; node = walker.nextNode() as Element | null) items.push(node);
        return items;
    };
    const readVisible = (node: Element) => {
        const style = getComputedStyle(node);
        const box = node.getBoundingClientRect();
        return !node.hasAttribute('hidden') && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0' && box.width > 0 && box.height > 0;
    };
    const readText = (node: Element) => (node.textContent || '').replace(/\s+/g, ' ').trim();
    const readName = (node: Element) => {
        const labelled = node.getAttribute('aria-label') || node.getAttribute('title') || node.getAttribute('placeholder') || (node as HTMLInputElement).value || '';
        if (labelled) return labelled.trim();
        const id = node.getAttribute('aria-labelledby') || node.id || '';
        const ref = id ? document.getElementById(id) : null;
        return ref ? readText(ref) : readText(node);
    };
    const readList = () => {
        if (!selector.startsWith('::-p-') || !selector.endsWith(')')) return Array.from(document.querySelectorAll(selector || 'body'));
        const value = selector.slice(selector.indexOf('(') + 1, -1).trim();
        const items = readNodes().filter((node) => selector.startsWith('::-p-text(') ? readText(node).includes(value) : readName(node).includes(value));
        return items;
    };
    const readOffset = (node: Element) => {
        const box = node.getBoundingClientRect();
        let left = box.left;
        let top = box.top;
        try {
            for (let view = window; view !== view.top && view.frameElement; view = view.parent) {
                const frameBox = view.frameElement.getBoundingClientRect();
                left += frameBox.left;
                top += frameBox.top;
            }
        } catch {}
        return { bottom: top + box.height, height: box.height, left, right: left + box.width, top, width: box.width, x: left, y: top };
    };
    const items = readList().filter((node) => !visible || readVisible(node));
    const node = items[index || 0] || null;
    if (!node) return { found: false, selector };
    const box = readOffset(node);
    return {
        box,
        found: true,
        html: node.outerHTML,
        multiple: (node as HTMLSelectElement).multiple || false,
        selector,
        tag: node.tagName.toLowerCase(),
        text: readText(node),
        type: (node as HTMLInputElement).type || '',
        value: (node as HTMLInputElement).value || '',
        x: box.left + box.width / 2,
        y: box.top + box.height / 2
    };
};
