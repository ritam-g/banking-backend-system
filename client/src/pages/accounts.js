import { getAccountsWithBalance, createAccount } from '../api.js';
import { showToast } from '../components/toast.js';
import { renderNavbar } from '../components/navbar.js';

export function render() {
    return `
    ${renderNavbar('accounts')}
    <div class="app-layout">
        <main class="main-content">
            <div class="page-header">
                <div>
                    <h1 class="page-title">Your <span class="gradient-text">Accounts</span></h1>
                    <p class="page-subtitle">Manage your bank accounts</p>
                </div>
                <button class="btn btn-primary" id="btn-create-account">
                    <span>+ New Account</span>
                </button>
            </div>

            <div id="accounts-grid" class="accounts-grid">
                <div class="skeleton-card"></div>
                <div class="skeleton-card"></div>
            </div>
        </main>
    </div>`;
}

export async function init() {
    const createBtn = document.getElementById('btn-create-account');

    createBtn.addEventListener('click', async () => {
        createBtn.disabled = true;
        createBtn.textContent = 'Creating...';
        try {
            await createAccount();
            showToast('New account created successfully!', 'success');
            await loadAccounts();
        } catch (err) {
            showToast(err.message || 'Failed to create account', 'error');
        } finally {
            createBtn.disabled = false;
            createBtn.innerHTML = '<span>+ New Account</span>';
        }
    });

    await loadAccounts();
}

async function loadAccounts() {
    const grid = document.getElementById('accounts-grid');
    try {
        const data = await getAccountsWithBalance();
        const accounts = data.accounts || [];

        if (accounts.length === 0) {
            grid.innerHTML = `
                <div class="empty-state full-width">
                    <div class="empty-icon">🏦</div>
                    <h3>No accounts yet</h3>
                    <p>Create your first bank account to get started</p>
                </div>`;
            return;
        }

        grid.innerHTML = accounts.map((acc, i) => `
            <div class="account-card" style="animation-delay: ${i * 0.1}s">
                <div class="account-card-header">
                    <div class="account-card-badge">
                        <span class="badge badge-${acc.status.toLowerCase()}">${acc.status}</span>
                    </div>
                    <div class="account-currency">${acc.currency || 'INR'}</div>
                </div>
                <div class="account-balance">
                    <span class="balance-label">Balance</span>
                    <span class="balance-value">₹${(acc.balance || 0).toLocaleString('en-IN')}</span>
                </div>
                <div class="account-id">
                    <span class="id-label">Account ID</span>
                    <span class="id-value" title="${acc._id}">${acc._id}</span>
                    <button class="btn-copy" data-copy="${acc._id}" title="Copy ID">📋</button>
                </div>
                <div class="account-meta">
                    Created ${new Date(acc.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
            </div>
        `).join('');

        // Copy buttons
        grid.querySelectorAll('.btn-copy').forEach(btn => {
            btn.addEventListener('click', () => {
                navigator.clipboard.writeText(btn.dataset.copy);
                showToast('Account ID copied!', 'info', 2000);
            });
        });

    } catch (err) {
        grid.innerHTML = '<div class="error-state">Failed to load accounts</div>';
        showToast('Failed to load accounts', 'error');
    }
}
