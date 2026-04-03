export const submitPageTarget = (selector: string, index: number) => {
    const items = document.querySelectorAll(selector || '');
    const node = items[index || 0] as HTMLElement | null;
    if (!node) throw new Error(`No element matches ${selector || ''}`);
    const form = node.tagName.toLowerCase() === 'form' ? node as HTMLFormElement : node.closest('form') as HTMLFormElement | null;
    if (!form) throw new Error('No form is available for submit.');
    if (form.requestSubmit) form.requestSubmit();
    else form.submit();
    return true;
};
