import { register } from '../api.js';
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
                <h1>Create Account</h1>
                <p>Join Backend Ledger — start banking securely</p>
            </div>
            <form id="register-form" class="auth-form">
                <div class="input-group">
                    <input type="text" id="reg-name" required autocomplete="name" placeholder=" " minlength="2" />
                    <label for="reg-name">Full Name</label>
                    <div class="input-glow"></div>
                </div>
                <div class="input-group">
                    <input type="email" id="reg-email" required autocomplete="email" placeholder=" " />
                    <label for="reg-email">Email Address</label>
                    <div class="input-glow"></div>
                </div>
                <div class="input-group">
                    <input type="password" id="reg-password" required autocomplete="new-password" placeholder=" " minlength="6" />
                    <label for="reg-password">Password (min. 6 chars)</label>
                    <div class="input-glow"></div>
                </div>
                <button type="submit" class="btn btn-primary btn-full" id="register-submit">
                    <span class="btn-text">Create Account</span>
                    <span class="btn-loader" style="display:none;">
                        <span class="spinner"></span>
                    </span>
                </button>
            </form>
            <div class="auth-footer">
                <p>Already have an account? <a href="#/login" class="link-accent">Sign in</a></p>
            </div>
        </div>
    </div>`;
}

export function init() {
    const form = document.getElementById('register-form');
    const submitBtn = document.getElementById('register-submit');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value;

        submitBtn.querySelector('.btn-text').style.display = 'none';
        submitBtn.querySelector('.btn-loader').style.display = 'inline-flex';
        submitBtn.disabled = true;

        try {
            await register(name, email, password);
            showToast('Account created! Welcome to Backend Ledger.', 'success');
            navigate('/');
        } catch (err) {
            showToast(err.message || 'Registration failed', 'error');
        } finally {
            submitBtn.querySelector('.btn-text').style.display = 'inline';
            submitBtn.querySelector('.btn-loader').style.display = 'none';
            submitBtn.disabled = false;
        }
    });
}
