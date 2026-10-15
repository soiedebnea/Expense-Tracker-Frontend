const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const api = {
  categories: () => request('/categories'),
  addCategory: (body) => request('/categories', { method: 'POST', body }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: 'DELETE' }),
  transactions: (month) => request(`/transactions?month=${month}`),
  addTransaction: (body) => request('/transactions', { method: 'POST', body }),
  deleteTransaction: (id) => request(`/transactions/${id}`, { method: 'DELETE' }),
  monthly: (month) => request(`/reports/monthly?month=${month}`),
  yearly: (year) => request(`/reports/yearly?year=${year}`),
};