import { login } from '../api.js';
import { navigate } from '../router.js';
import { showToast } from '../components/toast.js';

export function render() {
    return `
    <div class="auth-page">
        <div class="auth-bg-shapes">
            <div class="shape shape-1"></div>
            <div class="shape shape-2"></div>
            <div class="shape shape-3"></div>
        </div>
        <div class="auth-card">
            <div class="auth-header">
                <div class="auth-logo">🏦</div>
                <h1>Welcome Back</h1>
                <p>Sign in to your Backend Ledger account</p>
            </div>
            <form id="login-form" class="auth-form">
                <div class="input-group">
                    <input type="email" id="login-email" required autocomplete="email" placeholder=" " />
                    <label for="login-email">Email Address</label>
                    <div class="input-glow"></div>
                </div>
                <div class="input-group">
                    <input type="password" id="login-password" required autocomplete="current-password" placeholder=" " minlength="6" />
                    <label for="login-password">Password</label>
                    <div class="input-glow"></div>
                </div>
                <button type="submit" class="btn btn-primary btn-full" id="login-submit">
                    <span class="btn-text">Sign In</span>
                    <span class="btn-loader" style="display:none;">
                        <span class="spinner"></span>
                    </span>
                </button>
            </form>
            <div class="auth-footer">
                <p>Don't have an account? <a href="#/register" class="link-accent">Create one</a></p>
            </div>
        </div>
    </div>`;
}

export function init() {
    const form = document.getElementById('login-form');
    const submitBtn = document.getElementById('login-submit');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        submitBtn.querySelector('.btn-text').style.display = 'none';
        submitBtn.querySelector('.btn-loader').style.display = 'inline-flex';
        submitBtn.disabled = true;

        try {
            await login(email, password);
            showToast('Login successful! Welcome back.', 'success');
            navigate('/');
        } catch (err) {
            showToast(err.message || 'Login failed', 'error');
        } finally {
            submitBtn.querySelector('.btn-text').style.display = 'inline';
            submitBtn.querySelector('.btn-loader').style.display = 'none';
            submitBtn.disabled = false;
        }
    });
}
