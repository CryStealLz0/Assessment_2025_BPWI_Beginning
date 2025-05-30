// scripts/index.js
import '../styles/styles.css';
import App from './pages/app';
import Swal from 'sweetalert2';
import { isLoggedIn, logout as clearSession } from './utils/auth.js';
import { NotificationToggle } from './components/notification-toggle.js';
// import { AvatarProfile } from './components/avatar-profile.js';

// document.addEventListener('DOMContentLoaded', () => {
//     const userName = localStorage.getItem('userName') || 'Guest';
//     const avatar = new AvatarProfile('avatar-container', userName);
//     avatar.generate();

//     const nameText = document.getElementById('username-text');
//     if (nameText) nameText.textContent = userName;
// });

document.addEventListener('DOMContentLoaded', async () => {
    const toggle = new NotificationToggle(
        'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk',
    );
    await toggle.afterRender();
});

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
