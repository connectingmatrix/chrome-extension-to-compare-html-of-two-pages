import { presetSizes, ScreenSize, ScreenSizeInput } from '@/src/shared/remote-types';

const readValid = (item: Partial<ScreenSize>) => item && Number(item.width) > 0 && Number(item.height) > 0;

export const readSizes = (input?: ScreenSizeInput): ScreenSize[] => {
    if (!input) return [];
    if (input === 'all') return presetSizes;
    const items: ScreenSize[] = [];
    for (let index = 0; index < input.length; index += 1) {
        const item = input[index];
        if (!readValid(item)) continue;
        items.push({ height: Number(item.height), name: item.name || `size-${index + 1}`, width: Number(item.width) });
    }
    return items;
};
