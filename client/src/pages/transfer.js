import { getAccountsWithBalance, createTransaction } from '../api.js';
import { showToast } from '../components/toast.js';
import { renderNavbar } from '../components/navbar.js';

export function render() {
    return `
    ${renderNavbar('transfer')}
    <div class="app-layout">
        <main class="main-content">
            <div class="page-header">
                <div>
                    <h1 class="page-title">Send <span class="gradient-text">Money</span></h1>
                    <p class="page-subtitle">Transfer funds securely between accounts</p>
                </div>
            </div>

            <div class="transfer-container">
                <div class="transfer-card">
                    <form id="transfer-form" class="transfer-form">
                        <div class="form-section">
                            <h3 class="form-section-title">From Account</h3>
                            <div class="input-group">
                                <select id="from-account" required>
                                    <option value="">Loading accounts...</option>
                                </select>
                                <label for="from-account">Select Source Account</label>
                            </div>
                            <div class="account-balance-preview" id="from-balance">
                                <span class="balance-preview-label">Available Balance:</span>
                                <span class="balance-preview-value">—</span>
                            </div>
                        </div>

                        <div class="transfer-arrow">
                            <div class="arrow-circle">↓</div>
                        </div>

                        <div class="form-section">
                            <h3 class="form-section-title">To Account</h3>
                            <div class="input-group">
                                <input type="text" id="to-account" required placeholder=" " />
                                <label for="to-account">Destination Account ID</label>
                                <div class="input-glow"></div>
                            </div>
                        </div>

                        <div class="form-section">
                            <h3 class="form-section-title">Amount</h3>
                            <div class="input-group input-amount">
                                <span class="currency-symbol">₹</span>
                                <input type="number" id="transfer-amount" required placeholder=" " min="0.01" step="0.01" />
                                <label for="transfer-amount">Enter Amount</label>
                                <div class="input-glow"></div>
                            </div>
                        </div>

                        <button type="submit" class="btn btn-primary btn-full btn-transfer" id="transfer-submit">
                            <span class="btn-text">Send Money ↗</span>
                            <span class="btn-loader" style="display:none;">
                                <span class="spinner"></span> Processing...
                            </span>
                        </button>
                    </form>
                </div>

                <!-- Transfer Result -->
                <div id="transfer-result" class="transfer-result" style="display:none;"></div>
            </div>
        </main>
    </div>`;
}

let accountsData = [];

export async function init() {
    try {
        const data = await getAccountsWithBalance();
        accountsData = data.accounts || [];

        const select = document.getElementById('from-account');
        if (accountsData.length === 0) {
            select.innerHTML = '<option value="">No accounts — create one first</option>';
        } else {
            select.innerHTML = '<option value="">Choose an account</option>' +
                accountsData.map(a =>
                    `<option value="${a._id}">...${a._id.slice(-8)} — ₹${(a.balance || 0).toLocaleString('en-IN')} (${a.currency})</option>`
                ).join('');
        }

        // Show balance on account select
        select.addEventListener('change', () => {
            const acc = accountsData.find(a => a._id === select.value);
            const preview = document.getElementById('from-balance');
            if (acc) {
                preview.querySelector('.balance-preview-value').textContent = `₹${(acc.balance || 0).toLocaleString('en-IN')}`;
                preview.classList.add('visible');
            } else {
                preview.classList.remove('visible');
            }
        });

    } catch (err) {
        showToast('Failed to load accounts', 'error');
    }

    // Form submit
    const form = document.getElementById('transfer-form');
    const submitBtn = document.getElementById('transfer-submit');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const fromAccount = document.getElementById('from-account').value;
        const toAccount = document.getElementById('to-account').value.trim();
        const amount = parseFloat(document.getElementById('transfer-amount').value);

        if (!fromAccount) {
            showToast('Please select a source account', 'warning');
            return;
        }

        if (fromAccount === toAccount) {
            showToast('Cannot transfer to the same account', 'warning');
            return;
        }

        submitBtn.querySelector('.btn-text').style.display = 'none';
        submitBtn.querySelector('.btn-loader').style.display = 'inline-flex';
        submitBtn.disabled = true;

        try {
            const result = await createTransaction(fromAccount, toAccount, amount);
            showToast('Transfer completed successfully!', 'success');

            // Show success result
            const resultDiv = document.getElementById('transfer-result');
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = `
                <div class="result-card result-success">
                    <div class="result-icon">✓</div>
                    <h3>Transfer Successful!</h3>
                    <div class="result-amount">₹${amount.toLocaleString('en-IN')}</div>
                    <div class="result-details">
                        <div class="result-row">
                            <span>Status</span>
                            <span class="badge badge-completed">${result.transaction.status}</span>
                        </div>
                        <div class="result-row">
                            <span>Transaction ID</span>
                            <span class="mono">${result.transaction._id}</span>
                        </div>
                        <div class="result-row">
                            <span>Time</span>
                            <span>${new Date(result.transaction.createdAt).toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                    <a href="#/" class="btn btn-outline" style="margin-top: 20px;">Back to Dashboard</a>
                </div>`;

            form.reset();

            // Refresh account balances
            const data = await getAccountsWithBalance();
            accountsData = data.accounts || [];
            const select = document.getElementById('from-account');
            select.innerHTML = '<option value="">Choose an account</option>' +
                accountsData.map(a =>
                    `<option value="${a._id}">...${a._id.slice(-8)} — ₹${(a.balance || 0).toLocaleString('en-IN')} (${a.currency})</option>`
                ).join('');

        } catch (err) {
            showToast(err.message || 'Transfer failed', 'error');
        } finally {
            submitBtn.querySelector('.btn-text').style.display = 'inline';
            submitBtn.querySelector('.btn-loader').style.display = 'none';
            submitBtn.disabled = false;
        }
    });
}
