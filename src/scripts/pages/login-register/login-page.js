import { AuthModel } from '../../data/auth-model.js';
import { LoginPresenter } from '../../presenters/login-presenter.js';
import Swal from 'sweetalert2';

export class LoginPage {
    constructor() {
        this.presenter = null;
    }

    render() {
        return `
      <section class="login-section">
        <h2>Login ke Aplikasi</h2>
        <form id="login-form" class="form">
          <label for="email">Email</label>
          <input id="email" type="email" placeholder="Email" required />
          
          <label for="password">Password</label>
          <input id="password" type="password" placeholder="Password" required />
          
          <button type="submit">Login</button>
          <p>Belum punya akun? <a href="#/register">Daftar di sini</a></p>
        </form>
      </section>
    `;
    }

    async afterRender() {
        const model = new AuthModel();
        this.presenter = new LoginPresenter(model, this);

        const loginForm = document.getElementById('login-form');
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            await this.presenter.loginUser(email, password);
        });
    }

    showLoading() {
        Swal.fire({
            title: 'Mohon tunggu...',
            didOpen: () => Swal.showLoading(),
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
        });
    }

    showSuccessMessage(userName) {
        Swal.fire({
            icon: 'success',
            title: `Halo, ${userName}!`,
            text: 'Login berhasil.',
            timer: 1500,
            showConfirmButton: false,
        }).then(() => {
            window.location.hash = '#/';
        });
    }

    showErrorMessage(message) {
        Swal.fire({
            icon: 'error',
            title: 'Login gagal!',
            text: message,
        });
    }
}
