import { logout, getUser } from '../api.js';
import { navigate } from '../router.js';

export function renderNavbar(activePage = '') {
    const user = getUser();
    return `
    <nav class="navbar">
        <div class="navbar-inner">
            <a href="#/" class="navbar-brand">
                <span class="brand-icon">🏦</span>
                <span class="brand-text">Backend Ledger</span>
            </a>
            <div class="navbar-links">
                <a href="#/" class="nav-link ${activePage === 'dashboard' ? 'active' : ''}">
                    <span class="nav-icon">📊</span>
                    <span>Dashboard</span>
                </a>
                <a href="#/accounts" class="nav-link ${activePage === 'accounts' ? 'active' : ''}">
                    <span class="nav-icon">🏦</span>
                    <span>Accounts</span>
                </a>
                <a href="#/transfer" class="nav-link ${activePage === 'transfer' ? 'active' : ''}">
                    <span class="nav-icon">💸</span>
                    <span>Transfer</span>
                </a>
            </div>
            <div class="navbar-user">
                <div class="user-avatar">${(user?.name || 'U').charAt(0).toUpperCase()}</div>
                <div class="user-info">
                    <span class="user-name">${user?.name || 'User'}</span>
                    <span class="user-email">${user?.email || ''}</span>
                </div>
                <button class="btn-logout" id="btn-logout" title="Sign out">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                </button>
            </div>
            <button class="navbar-mobile-toggle" id="mobile-toggle">
                <span></span><span></span><span></span>
            </button>
        </div>
    </nav>`;
}

// Attach logout listener (called after page render in main.js)
export function initNavbar() {
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await logout();
            navigate('/login');
        });
    }

    const mobileToggle = document.getElementById('mobile-toggle');
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            document.querySelector('.navbar-links').classList.toggle('open');
        });
    }
}
