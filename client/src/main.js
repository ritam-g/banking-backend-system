import './style.css';
import { addRoute, startRouter } from './router.js';
import { initNavbar } from './components/navbar.js';

// Import pages
import * as loginPage from './pages/login.js';
import * as registerPage from './pages/register.js';
import * as dashboardPage from './pages/dashboard.js';
import * as accountsPage from './pages/accounts.js';
import * as transferPage from './pages/transfer.js';

// Register routes
addRoute('/login', { render: loginPage.render, init: loginPage.init, requiresAuth: false });
addRoute('/register', { render: registerPage.render, init: registerPage.init, requiresAuth: false });
addRoute('/', {
    render: dashboardPage.render,
    init: async () => { await dashboardPage.init(); initNavbar(); },
    requiresAuth: true
});
addRoute('/accounts', {
    render: accountsPage.render,
    init: async () => { await accountsPage.init(); initNavbar(); },
    requiresAuth: true
});
addRoute('/transfer', {
    render: transferPage.render,
    init: async () => { await transferPage.init(); initNavbar(); },
    requiresAuth: true
});

// Start the router
startRouter();
