import { PageAction } from '@/src/shared/page-action';

const readNode = (action: PageAction) => {
    const items = action.index || action.index === 0 ? document.querySelectorAll(action.selector || '') : [];
    const target = items.length ? items[action.index || 0] : document.querySelector(action.selector || '');
    if (!target) throw new Error(`No element matches ${action.selector || ''}`);
    return target as HTMLElement;
};

const readVisible = (element: Element) => {
    const style = getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
    return !(element as HTMLElement).hidden;
};

export const runPageDomAction = async (action: PageAction) => {
    if (action.type === 'click') return readNode(action).click();
    if (action.type === 'type_text') {
        const input = readNode(action) as HTMLInputElement;
        if (action.clearFirst) input.value = '';
        input.focus();
        input.value = `${input.value}${action.value || ''}`;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        return;
    }
    if (action.type === 'send_key') return (action.selector ? readNode(action) : document.body).dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: action.key || '' }));
    if (action.type === 'select_option') {
        const select = readNode(action) as HTMLSelectElement;
        select.value = action.value || '';
        select.dispatchEvent(new Event('input', { bubbles: true }));
        select.dispatchEvent(new Event('change', { bubbles: true }));
        return;
    }
    if (action.type === 'drag_drop') {
        const source = readNode({ ...action, selector: action.sourceSelector });
        const target = readNode({ ...action, selector: action.targetSelector });
        const data = new DataTransfer();
        source.dispatchEvent(new DragEvent('dragstart', { bubbles: true, dataTransfer: data }));
        target.dispatchEvent(new DragEvent('drop', { bubbles: true, dataTransfer: data }));
        source.dispatchEvent(new DragEvent('dragend', { bubbles: true, dataTransfer: data }));
        return;
    }
    if (action.type === 'scroll') {
        const target = action.selector ? readNode(action) : document.scrollingElement || document.documentElement;
        target.scrollTo({ behavior: action.behavior || 'auto', left: action.x || action.deltaX || 0, top: action.y || action.deltaY || 0 });
        return;
    }
    if (action.type === 'submit') return ((readNode(action) as HTMLFormElement).requestSubmit ? (readNode(action) as HTMLFormElement).requestSubmit() : (readNode(action) as HTMLFormElement).submit());
    if (action.type === 'wait_for_selector') return new Promise((resolve, reject) => {
        const end = Date.now() + (action.timeoutMs || 30000);
        const tick = () => {
            const node = document.querySelector(action.selector || '');
            if (node && (!action.visible || readVisible(node))) return resolve(true);
            if (Date.now() >= end) return reject(new Error(`Timed out waiting for ${action.selector || ''}`));
            window.setTimeout(tick, 200);
        };
        tick();
    });
    if (action.type === 'get_page_html') return action.selector ? readNode(action).outerHTML : document.documentElement.outerHTML;
    if (action.type === 'execute_script') return new Function('args', action.script || '')(action.args || []);
};
