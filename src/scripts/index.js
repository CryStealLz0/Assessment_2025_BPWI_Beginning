// scripts/index.js
import '../styles/styles.css';
import App from './pages/app';
import Swal from 'sweetalert2';
import { isLoggedIn, logout as clearSession } from './utils/auth.js';

function handleLogout() {
    clearSession(); // hanya clear session, tidak ada UI

    Swal.fire({
        icon: 'success',
        title: 'Berhasil logout!',
        showConfirmButton: false,
        timer: 1000,
    });

    updateAuthUI();
    window.location.hash = '#/login';
}

function updateAuthUI() {
    const loginLink = document.getElementById('loginLink');
    const logoutButton = document.getElementById('logoutButton');

    if (!loginLink || !logoutButton) return;

    if (isLoggedIn()) {
        loginLink.style.display = 'none';
        logoutButton.style.display = 'inline-block';
    } else {
        loginLink.style.display = 'inline-block';
        logoutButton.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const app = new App({
        content: document.querySelector('#main-content'),
        drawerButton: document.querySelector('#drawer-button'),
        navigationDrawer: document.querySelector('#navigation-drawer'),
    });

    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }

    updateAuthUI(); // saat pertama kali
    await app.renderPage();

    window.addEventListener('hashchange', async () => {
        await app.renderPage();
        updateAuthUI(); // saat berpindah halaman
    });
});
