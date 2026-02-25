const API_BASE = '/api';

function getToken() {
    return localStorage.getItem('bl_token');
}

function setToken(token) {
    localStorage.setItem('bl_token', token);
}

function removeToken() {
    localStorage.removeItem('bl_token');
}

function getUser() {
    const data = localStorage.getItem('bl_user');
    return data ? JSON.parse(data) : null;
}

function setUser(user) {
    localStorage.setItem('bl_user', JSON.stringify(user));
}

function removeUser() {
    localStorage.removeItem('bl_user');
}

async function request(endpoint, options = {}) {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include'
    });

    const data = await res.json();

    if (!res.ok) {
        throw { status: res.status, message: data.message || 'Something went wrong' };
    }

    return data;
}

// ---------- Auth ----------
export async function register(name, email, password) {
    const data = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
    });
    setToken(data.token);
    setUser(data.user);
    return data;
}

export async function login(email, password) {
    const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
    setToken(data.token);
    setUser(data.user);
    return data;
}

export async function getMe() {
    return await request('/auth/me');
}

export async function logout() {
    try { await request('/auth/logout', { method: 'POST' }); } catch (e) { /* ignore */ }
    removeToken();
    removeUser();
}

// ---------- Accounts ----------
export async function getAccountsWithBalance() {
    return await request('/accounts/with-balance');
}

export async function getAllAccounts() {
    return await request('/accounts');
}

export async function getAccountBalance(accountId) {
    return await request(`/accounts/${accountId}`);
}

export async function createAccount() {
    return await request('/accounts/create', { method: 'POST' });
}

// ---------- Transactions ----------
export async function createTransaction(fromAccount, toAccount, amount) {
    const idempotencyKey = `txn_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    return await request('/transaction', {
        method: 'POST',
        body: JSON.stringify({ fromAccount, toAccount, amount, idempotencyKey })
    });
}

export async function getTransactionHistory() {
    return await request('/transaction/history');
}

// ---------- Auth State ----------
export function isLoggedIn() {
    return !!getToken();
}

export { getToken, setToken, removeToken, getUser, setUser, removeUser };
