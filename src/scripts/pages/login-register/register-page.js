import { AuthModel } from '../../data/auth-model.js';
import { RegisterPresenter } from '../presenters/register-presenter.js';
import Swal from 'sweetalert2';

export class RegisterPage {
    constructor() {
        this.presenter = null;
    }

    render() {
        return `
      <section class="register-section">
        <h2>Daftar Akun</h2>
        <form id="register-form" class="form">
          <label for="name">Nama</label>
          <input id="name" type="text" placeholder="Nama Lengkap" required />
          
          <label for="email">Email</label>
          <input id="email" type="email" placeholder="Email" required />
          
          <label for="password">Password</label>
          <input id="password" type="password" placeholder="Password (min. 8 karakter)" required />
          
          <button type="submit">Daftar</button>
        </form>
      </section>
    `;
    }

    async afterRender() {
        const model = new AuthModel();
        this.presenter = new RegisterPresenter(model, this);

        const form = document.getElementById('register-form');
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            await this.presenter.registerUser(name, email, password);
        });
    }

    showLoading() {
        Swal.fire({
            title: 'Mendaftarkan...',
            didOpen: () => Swal.showLoading(),
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
        });
    }

    showSuccessMessage() {
        Swal.fire({
            icon: 'success',
            title: 'Pendaftaran berhasil!',
            text: 'Silakan login dengan akun Anda.',
            timer: 2000,
            showConfirmButton: false,
        }).then(() => {
            window.location.hash = '#/login';
        });
    }

    showErrorMessage(message) {
        Swal.fire({
            icon: 'error',
            title: 'Pendaftaran gagal!',
            text: message,
        });
    }
}
