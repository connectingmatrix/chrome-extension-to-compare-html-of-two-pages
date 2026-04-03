export const readKeyData = (key: string) => {
    const upper = key.length === 1 ? key.toUpperCase() : key;
    if (key === 'Enter') return { code: 'Enter', text: '\r', value: 13 };
    if (key === 'Tab') return { code: 'Tab', text: '', value: 9 };
    if (key === 'Escape') return { code: 'Escape', text: '', value: 27 };
    if (key === 'Backspace') return { code: 'Backspace', text: '', value: 8 };
    if (key === 'ArrowDown') return { code: 'ArrowDown', text: '', value: 40 };
    if (key === 'ArrowUp') return { code: 'ArrowUp', text: '', value: 38 };
    if (key === 'ArrowLeft') return { code: 'ArrowLeft', text: '', value: 37 };
    if (key === 'ArrowRight') return { code: 'ArrowRight', text: '', value: 39 };
    return { code: `Key${upper}`, text: key, value: upper.charCodeAt(0) || 0 };
};
