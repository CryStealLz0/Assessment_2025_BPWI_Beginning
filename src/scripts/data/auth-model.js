const BASE_URL = 'https://story-api.dicoding.dev/v1';

export class AuthModel {
    async login(email, password) {
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const result = await response.json();

        if (!response.ok || result.error) {
            throw new Error(result.message || 'Gagal login');
        }

        // Simpan token ke localStorage
        localStorage.setItem('token', result.loginResult.token);
        localStorage.setItem('userName', result.loginResult.name);
        localStorage.setItem('userId', result.loginResult.userId);

        return result.loginResult;
    }

    async register(name, email, password) {
        const response = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
        });

        const result = await response.json();

        if (!response.ok || result.error) {
            throw new Error(result.message || 'Gagal registrasi');
        }

        return result.message;
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        localStorage.removeItem('userId');
    }

    getToken() {
        return localStorage.getItem('token');
    }

    isLoggedIn() {
        return !!this.getToken();
    }
}
