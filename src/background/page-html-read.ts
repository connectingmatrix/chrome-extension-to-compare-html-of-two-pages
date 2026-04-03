export const readPageHtmlTarget = (selector: string, index: number) => {
    const readNodes = () => {
        const items = [];
        const walker = document.createTreeWalker(document.body || document.documentElement, NodeFilter.SHOW_ELEMENT);
        for (let node = walker.currentNode as Element | null; node; node = walker.nextNode() as Element | null) items.push(node);
        return items;
    };
    const readText = (node: Element) => (node.textContent || '').replace(/\s+/g, ' ').trim();
    const readName = (node: Element) => {
        const value = node.getAttribute('aria-label') || node.getAttribute('title') || node.getAttribute('placeholder') || (node as HTMLInputElement).value || '';
        if (value) return value.trim();
        const id = node.getAttribute('aria-labelledby') || node.id || '';
        const label = id ? document.getElementById(id) : null;
        return label ? readText(label) : readText(node);
    };
    const items = !selector || !selector.startsWith('::-p-') || !selector.endsWith(')')
        ? Array.from(document.querySelectorAll(selector || 'html'))
        : readNodes().filter((node) => selector.startsWith('::-p-text(') ? readText(node).includes(selector.slice(selector.indexOf('(') + 1, -1).trim()) : readName(node).includes(selector.slice(selector.indexOf('(') + 1, -1).trim()));
    const node = items[index || 0] || null;
    if (!node) throw new Error(`No element matches ${selector || 'html'}`);
    return node.outerHTML;
};
