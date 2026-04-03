export const runPageScript = async (script: string, args: unknown[]) => {
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
    const execute = new AsyncFunction('args', script || '');
    return execute(args || []);
};
