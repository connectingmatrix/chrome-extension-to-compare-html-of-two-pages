const base = process.env.CTM_PUPPET_SERVER_URL || 'http://127.0.0.1:4017';

export const readBaseUrl = (value = '') => value || base;

export const requestJson = async (baseUrl, path, method = 'GET', body = null) => {
    const init = { headers: { 'content-type': 'application/json' }, method };
    if (body) init.body = JSON.stringify(body);
    const response = await fetch(`${readBaseUrl(baseUrl)}${path}`, init);
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    if (!response.ok || data.ok === false) throw new Error(data.error || `Request failed for ${path}`);
    return data;
};
