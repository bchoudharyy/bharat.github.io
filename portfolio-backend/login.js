const loginForm = document.getElementById('loginForm');
const secretInput = document.getElementById('secretInput');
const loginStatus = document.getElementById('loginStatus');
const API_BASE = '/api';

function setStatus(message, type = 'info') {
    loginStatus.textContent = message;
    loginStatus.className = type === 'success' ? 'text-sm text-emerald-400' : type === 'error' ? 'text-sm text-rose-400' : 'text-sm text-slate-400';
}

async function login(secret) {
    const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ secret })
    });
    return response.ok;
}

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const secret = secretInput.value.trim();

    if (!secret) {
        setStatus('Enter your admin passcode.', 'error');
        return;
    }

    setStatus('Checking passcode...', 'info');

    try {
        const authorized = await login(secret);
        if (!authorized) {
            setStatus('Invalid passcode. Try again.', 'error');
            return;
        }

        setStatus('Passcode accepted. Redirecting...', 'success');
        window.location.href = '/admin/dashboard';
    } catch (error) {
        console.error(error);
        setStatus('Server error while verifying the passcode.', 'error');
    }
});
