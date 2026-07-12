const BASE_URL = 'http://127.0.0.1:5000/api';

// ─── Token helpers ────────────────────────────────────────────────────────────

export const getToken = (): string | null => localStorage.getItem('token');

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

// ─── Generic fetchers ─────────────────────────────────────────────────────────

async function get(path: string) {
  const res = await fetch(`${BASE_URL}${path}`, { headers: authHeaders() });
  if (!res.ok) throw new Error((await res.json()).error || 'Request failed');
  return res.json();
}

async function post(path: string, body: object) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

async function put(path: string, body: object) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const apiLogin = (email: string, password: string) =>
  fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }).then(async res => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  });

export const apiRegister = (name: string, email: string, password: string) =>
  fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  }).then(async res => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return data;
  });

export const apiGetMe = () => get('/auth/me');

export const apiForgotPassword = (email: string) =>
  fetch(`${BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  }).then(async res => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  });

export const apiResetPassword = (password: string, token: string) =>
  fetch(`${BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify({ new_password: password }),
  }).then(async res => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Reset failed');
    return data;
  });


// ─── Dashboard ────────────────────────────────────────────────────────────────

export const apiGetDashboardStats = () => get('/dashboard/stats');
export const apiGetHrStats        = () => get('/hr/stats');

// ─── Employees ────────────────────────────────────────────────────────────────

export const apiGetEmployees  = ()          => get('/employees');
export const apiAddEmployee   = (data: object) => post('/employees', data);
export const apiUpdateEmployee = (id: number, data: object) => put(`/employees/${id}`, data);

// ─── Leaves ───────────────────────────────────────────────────────────────────

export const apiGetLeaves    = ()          => get('/leaves');
export const apiApplyLeave   = (data: object) => post('/leaves', data);
export const apiLeaveAction  = (id: number, action: string) =>
  put(`/leaves/${id}/action`, { action });

// ─── Expenses ─────────────────────────────────────────────────────────────────

export const apiGetExpenses   = ()          => get('/expenses');
export const apiAddExpense    = (data: object) => post('/expenses', data);
export const apiExpenseAction = (id: number, action: string) =>
  put(`/expenses/${id}/action`, { action });

// ─── Payslips ─────────────────────────────────────────────────────────────────

export const apiGetPayslips = () => get('/payslips');
