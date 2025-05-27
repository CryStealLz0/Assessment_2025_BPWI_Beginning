import { getToken } from '../../utils/auth.js';
import { showFormattedDate } from '../../utils/index.js';

export class DetailPage {
    async render() {
        return `
      <section class="container">
        <a href="#/" class="skip-link">← Kembali ke Beranda</a>
        <div id="story-detail">Memuat detail cerita...</div>
      </section>
    `;
    }

    async afterRender() {
        const url = window.location.hash.split('/')[2]; // ambil ID dari hash
        const token = getToken();

        try {
            const response = await fetch(
                `https://story-api.dicoding.dev/v1/stories/${url}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            const result = await response.json();

            if (!response.ok || result.error) {
                throw new Error(result.message || 'Gagal memuat detail');
            }

            const story = result.story;
            document.getElementById('story-detail').innerHTML = `
        <img src="${story.photoUrl}" alt="Foto oleh ${
                story.name
            }" style="max-width:100%; border-radius:8px;" />
        <h2>${story.name}</h2>
        <p><strong>Deskripsi:</strong> ${story.description}</p>
        <p><strong>Tanggal:</strong> ${showFormattedDate(story.createdAt)}</p>
      `;
        } catch (err) {
            document.getElementById(
                'story-detail',
            ).innerHTML = `<p style="color:red">${err.message}</p>`;
        }
    }
}
