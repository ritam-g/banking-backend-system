/**
 * Simple hash-based SPA router
 * Routes are defined as { path, render, init, requiresAuth }
 */
import { isLoggedIn } from './api.js';

const routes = [];
let currentCleanup = null;

export function addRoute(path, { render, init, requiresAuth = false }) {
    routes.push({ path, render, init, requiresAuth });
}

export function navigate(path) {
    window.location.hash = path;
}

export async function handleRoute() {
    const hash = window.location.hash.slice(1) || '/';
    const app = document.getElementById('app');

    // Cleanup previous page
    if (currentCleanup && typeof currentCleanup === 'function') {
        currentCleanup();
        currentCleanup = null;
    }

    const route = routes.find(r => r.path === hash);

    if (!route) {
        navigate('/');
        return;
    }

    // Auth guard
    if (route.requiresAuth && !isLoggedIn()) {
        navigate('/login');
        return;
    }

    // Redirect logged-in users away from auth pages
    if ((hash === '/login' || hash === '/register') && isLoggedIn()) {
        navigate('/');
        return;
    }

    // Render page
    app.innerHTML = '';
    app.classList.add('page-enter');

    const content = route.render();
    if (typeof content === 'string') {
        app.innerHTML = content;
    } else if (content instanceof HTMLElement) {
        app.appendChild(content);
    }

    // Init page logic
    if (route.init) {
        currentCleanup = await route.init();
    }

    // Trigger enter animation
    requestAnimationFrame(() => {
        app.classList.remove('page-enter');
    });
}

export function startRouter() {
    window.addEventListener('hashchange', handleRoute);
    handleRoute();
}
