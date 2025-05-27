// scripts/middleware/auth-guard.js
import Swal from 'sweetalert2';

export function authGuard(allowedRoutes = []) {
    const token = localStorage.getItem('token');
    const currentRoute = location.hash;

    // Jika route butuh auth dan belum login
    if (!token && allowedRoutes.includes(currentRoute)) {
        Swal.fire({
            icon: 'warning',
            title: 'Akses Ditolak',
            text: 'Silakan login terlebih dahulu.',
        }).then(() => {
            location.hash = '#/login';
        });
        return false;
    }

    return true;
}
