import { presetSizes, ScreenSize, ScreenSizeInput } from '@/src/shared/remote-types';

const readValid = (item: Partial<ScreenSize>) => item && Number(item.width) > 0 && Number(item.height) > 0;

export const readSizes = (input?: ScreenSizeInput): ScreenSize[] => {
    if (!input) return [];
    if (input === 'all') return presetSizes;
    return input
        .filter(readValid)
        .map((item, index) => ({ name: item.name || `size-${index + 1}`, width: Number(item.width), height: Number(item.height) }));
};
