let emit = (_name: string, _data: Record<string, unknown>, _sessionId = '') => {};

export const setLiveEmitter = (next: typeof emit) => {
    emit = next;
};

export const emitLive = (name: string, data: Record<string, unknown>, sessionId = '') => {
    emit(name, data, sessionId);
};
