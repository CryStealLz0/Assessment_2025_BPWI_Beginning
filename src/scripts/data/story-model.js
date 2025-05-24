import Swal from 'sweetalert2';

export class StoryModel {
    #BASE_URL = 'https://story-api.dicoding.dev/v1';

    async getStoriesWithLocation() {
        const token = localStorage.getItem('token');
        console.log('DEBUG TOKEN:', token);

        if (!token) {
            Swal.fire({
                icon: 'error',
                title: 'Belum Login',
                text: 'Silakan login kembali',
            });
            location.hash = '#/login';
            return Promise.reject('Tidak ada token');
        }

        const response = await fetch(`${this.#BASE_URL}/stories?location=1`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const result = await response.json();

        if (!response.ok || result.error) {
            console.warn('ERROR FROM API:', result);
            throw new Error(result.message || 'Gagal mengambil data');
        }

        return result.listStory;
    }
}
