import { getAccountsWithBalance, getTransactionHistory, getUser } from '../api.js';
import { showToast } from '../components/toast.js';
import { renderNavbar } from '../components/navbar.js';

export function render() {
    const user = getUser();
    return `
    ${renderNavbar('dashboard')}
    <div class="app-layout">
        <main class="main-content">
            <div class="page-header">
                <div>
                    <h1 class="page-title">Good ${getGreeting()}, <span class="gradient-text">${user?.name || 'User'}</span> 👋</h1>
                    <p class="page-subtitle">Here's your financial overview</p>
                </div>
            </div>

            <!-- Stats Cards -->
            <div class="stats-grid" id="stats-grid">
                <div class="stat-card stat-card-balance">
                    <div class="stat-icon">💰</div>
                    <div class="stat-info">
                        <span class="stat-label">Total Balance</span>
                        <span class="stat-value" id="total-balance">
                            <div class="skeleton skeleton-text"></div>
                        </span>
                    </div>
                </div>
                <div class="stat-card stat-card-accounts">
                    <div class="stat-icon">🏦</div>
                    <div class="stat-info">
                        <span class="stat-label">Active Accounts</span>
                        <span class="stat-value" id="total-accounts">
                            <div class="skeleton skeleton-text"></div>
                        </span>
                    </div>
                </div>
                <div class="stat-card stat-card-transactions">
                    <div class="stat-icon">💸</div>
                    <div class="stat-info">
                        <span class="stat-label">Transactions</span>
                        <span class="stat-value" id="total-transactions">
                            <div class="skeleton skeleton-text"></div>
                        </span>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="quick-actions">
                <a href="#/transfer" class="action-card">
                    <div class="action-icon">↗️</div>
                    <span>Send Money</span>
                </a>
                <a href="#/accounts" class="action-card">
                    <div class="action-icon">➕</div>
                    <span>New Account</span>
                </a>
                <a href="#/accounts" class="action-card">
                    <div class="action-icon">📊</div>
                    <span>View Accounts</span>
                </a>
            </div>

            <!-- Recent Transactions -->
            <div class="section-card">
                <div class="section-header">
                    <h2>Recent Transactions</h2>
                    <a href="#/transfer" class="btn btn-sm btn-outline">New Transfer</a>
                </div>
                <div id="transactions-list" class="transactions-list">
                    <div class="skeleton-row"><div class="skeleton skeleton-line"></div></div>
                    <div class="skeleton-row"><div class="skeleton skeleton-line"></div></div>
                    <div class="skeleton-row"><div class="skeleton skeleton-line"></div></div>
                </div>
            </div>
        </main>
    </div>`;
}

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Morning';
    if (h < 17) return 'Afternoon';
    return 'Evening';
}

export async function init() {
    try {
        // Fetch data in parallel
        const [accountsRes, txnRes] = await Promise.all([
            getAccountsWithBalance(),
            getTransactionHistory()
        ]);

        const accounts = accountsRes.accounts || [];
        const transactions = txnRes.transactions || [];

        // Update stats
        const totalBalance = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);
        document.getElementById('total-balance').textContent = `₹${totalBalance.toLocaleString('en-IN')}`;
        document.getElementById('total-accounts').textContent = accounts.length;
        document.getElementById('total-transactions').textContent = transactions.length;

        // Render transactions
        const txnContainer = document.getElementById('transactions-list');
        if (transactions.length === 0) {
            txnContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📭</div>
                    <p>No transactions yet</p>
                    <a href="#/transfer" class="btn btn-sm btn-primary">Make your first transfer</a>
                </div>`;
        } else {
            txnContainer.innerHTML = transactions.slice(0, 10).map(txn => `
                <div class="transaction-item">
                    <div class="txn-icon ${txn.direction === 'SENT' ? 'txn-sent' : 'txn-received'}">
                        ${txn.direction === 'SENT' ? '↗' : '↙'}
                    </div>
                    <div class="txn-details">
                        <span class="txn-direction">${txn.direction === 'SENT' ? 'Sent' : 'Received'}</span>
                        <span class="txn-meta">${new Date(txn.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div class="txn-amount ${txn.direction === 'SENT' ? 'amount-negative' : 'amount-positive'}">
                        ${txn.direction === 'SENT' ? '-' : '+'}₹${txn.amount.toLocaleString('en-IN')}
                    </div>
                    <div class="txn-status">
                        <span class="badge badge-${txn.status.toLowerCase()}">${txn.status}</span>
                    </div>
                </div>
            `).join('');
        }

    } catch (err) {
        showToast('Failed to load dashboard data', 'error');
        console.error(err);
    }
}
