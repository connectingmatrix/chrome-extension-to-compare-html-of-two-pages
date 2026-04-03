export const waitForPageRoot = async (selector: string, timeoutMs: number, settleMs: number, pollMs: number) => {
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
        if (!selector.startsWith('::-p-') || !selector.endsWith(')')) return document.querySelector(selector || 'body');
        const items = readNodes().filter((node) => selector.startsWith('::-p-text(') ? readText(node).includes(selector.slice(selector.indexOf('(') + 1, -1).trim()) : readName(node).includes(selector.slice(selector.indexOf('(') + 1, -1).trim()));
        return items[0] || null;
    };
    const readLoading = () => document.querySelector('.spinner-wrap, .spinner, [aria-busy="true"], [data-loading="true"]');
    const readVisible = (node: Element) => {
        const style = getComputedStyle(node);
        return !node.hasAttribute('hidden') && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
    };
    const readTextSize = (node: Element) => node.textContent ? node.textContent.length : 0;
    const readSignature = (node: Element) => {
        const box = node.getBoundingClientRect();
        return [location.href, node.childElementCount, node.className, node.innerHTML.length, readTextSize(node), box.width, box.height].join('|');
    };
    let last = '';
    let stableAt = 0;
    const startedAt = Date.now();
    while (Date.now() - startedAt < timeoutMs) {
        const node = readTarget();
        const loading = readLoading();
        if (document.readyState === 'complete' && node && readVisible(node) && !loading) {
            const next = readSignature(node);
            if (next === last) {
                if (!stableAt) stableAt = Date.now();
                if (Date.now() - stableAt >= settleMs) return { found: true, loading: false, title: document.title, url: location.href };
            }
            if (next !== last) {
                last = next;
                stableAt = Date.now();
            }
        }
        if (document.readyState !== 'complete' || !node || !readVisible(node) || loading) {
            last = '';
            stableAt = 0;
        }
        await new Promise((resolve) => window.setTimeout(resolve, pollMs));
    }
    return { found: false, loading: Boolean(readLoading()), title: document.title, url: location.href };
};
