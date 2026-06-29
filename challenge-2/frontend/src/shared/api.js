const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const message =
      data?.error ||
      (Array.isArray(data?.errors) ? data.errors.join(', ') : null) ||
      `Request failed with status ${res.status}`;
    const error = new Error(message);
    error.status = res.status;
    error.details = data;
    throw error;
  }

  return data;
}

export const api = {
  list(params = {}) {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
    ).toString();
    return request(`/todos${qs ? `?${qs}` : ''}`);
  },
  get(id) {
    return request(`/todos/${id}`);
  },
  create(payload) {
    return request('/todos', { method: 'POST', body: JSON.stringify(payload) });
  },
  update(id, payload) {
    return request(`/todos/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  },
  patch(id, payload) {
    return request(`/todos/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
  },
  remove(id) {
    return request(`/todos/${id}`, { method: 'DELETE' });
  },
};
