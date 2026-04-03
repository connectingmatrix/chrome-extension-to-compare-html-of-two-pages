export const waitForPageTarget = async (selector: string, index: number, visible: boolean, timeoutMs: number, pollMs: number) => {
    const readTarget = () => {
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
        const readVisible = (node: Element) => {
            const style = getComputedStyle(node);
            const box = node.getBoundingClientRect();
            return !node.hasAttribute('hidden') && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0' && box.width > 0 && box.height > 0;
        };
        const items = !selector.startsWith('::-p-') || !selector.endsWith(')')
            ? Array.from(document.querySelectorAll(selector || 'body'))
            : readNodes().filter((node) => selector.startsWith('::-p-text(') ? readText(node).includes(selector.slice(selector.indexOf('(') + 1, -1).trim()) : readName(node).includes(selector.slice(selector.indexOf('(') + 1, -1).trim()));
        const node = items[index || 0] || null;
        return node && (!visible || readVisible(node));
    };
    const endsAt = Date.now() + timeoutMs;
    while (Date.now() < endsAt) {
        if (readTarget()) return { found: true, title: document.title, url: location.href };
        await new Promise((resolve) => window.setTimeout(resolve, pollMs));
    }
    return { found: false, title: document.title, url: location.href };
};
