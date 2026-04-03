export const readSelectTarget = (selector: string, value: string, index: number) => {
    const items = document.querySelectorAll(selector || '');
    const node = items[index || 0] as HTMLSelectElement | null;
    if (!node) throw new Error(`No element matches ${selector || ''}`);
    const options = Array.from(node.options);
    const nextIndex = options.findIndex((item) => item.value === value);
    if (nextIndex < 0) throw new Error(`No option matches ${value}`);
    const box = node.getBoundingClientRect();
    return { steps: nextIndex - node.selectedIndex, x: box.left + box.width / 2, y: box.top + box.height / 2 };
};
