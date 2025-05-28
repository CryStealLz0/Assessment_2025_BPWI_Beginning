import { getToken } from '../../utils/auth.js';
import { showFormattedDate } from '../../utils/index.js';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export class DetailPage {
    async render() {
        return `
      <section class="container">
        <a href="#/" class="skip-link">← Kembali ke Beranda</a>
        <div id="story-detail">Memuat detail cerita...</div>
        <div id="map" style="height: 300px; margin-top: 1rem;"></div>
      </section>
    `;
    }

    async afterRender() {
        const id = window.location.hash.split('/')[2];
        const token = getToken();

        try {
            const response = await fetch(
                `https://story-api.dicoding.dev/v1/stories/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            const result = await response.json();
            if (!response.ok || result.error) throw new Error(result.message);

            const story = result.story;

            // Tampilkan detail
            document.getElementById('story-detail').innerHTML = `
        <img src="${story.photoUrl}" alt="Foto oleh ${
                story.name
            }" style="max-width:100%; border-radius:8px;" />
        <h2>${story.name}</h2>
        <p><strong>Deskripsi:</strong> ${story.description}</p>
        <p><strong>Tanggal:</strong> ${showFormattedDate(story.createdAt)}</p>
        ${
            story.lat && story.lon
                ? `<p><strong>Lokasi:</strong> Lat ${story.lat}, Lon ${story.lon}</p>`
                : '<p><em>Tidak ada data lokasi.</em></p>'
        }
      `;

            // Jika ada lokasi, tampilkan peta
            if (story.lat && story.lon) {
                const map = L.map('map').setView([story.lat, story.lon], 13);
                L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; OpenStreetMap contributors',
                }).addTo(map);

                L.marker([story.lat, story.lon])
                    .addTo(map)
                    .bindPopup('Lokasi Cerita')
                    .openPopup();
            } else {
                document.getElementById('map').style.display = 'none';
            }
        } catch (err) {
            document.getElementById(
                'story-detail',
            ).innerHTML = `<p style="color:red">${err.message}</p>`;
            document.getElementById('map').style.display = 'none';
        }
    }
}
