export const readSelectTarget = (selector: string, value: string, index: number) => {
    const items = document.querySelectorAll(selector || '');
    const node = items[index || 0] as HTMLSelectElement | null;
    if (!node) throw new Error(`No element matches ${selector || ''}`);
    const options = Array.from(node.options);
    const option = options.find((item) => item.value === value);
    if (!option) throw new Error(`No option matches ${value}`);
    node.value = value;
    option.selected = true;
    node.dispatchEvent(new Event('input', { bubbles: true }));
    node.dispatchEvent(new Event('change', { bubbles: true }));
    const box = node.getBoundingClientRect();
    return { value, x: box.left + box.width / 2, y: box.top + box.height / 2 };
};
