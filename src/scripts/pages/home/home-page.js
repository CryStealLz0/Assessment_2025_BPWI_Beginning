import { StoryModel } from '../../data/story-model.js';
import { HomePresenter } from '../presenters/home-presenter.js';

export class HomePage {
    constructor() {
        this.presenter = null;
        this._map = null; // ⬅️ untuk menyimpan instance Leaflet map
    }

    render() {
        return `
      <section class="home-section">
        <a href="#main-content" class="skip-link">Lewati ke konten</a>
        <h2>Beranda - Daftar Cerita</h2>
        <div id="map" style="height: 300px; margin-bottom: 1rem;"></div>
        <div id="main-content" class="story-list">Memuat cerita...</div>
      </section>
    `;
    }

    async afterRender() {
        const { StoryModel } = await import('../../data/story-model.js');
        const { HomePresenter } = await import(
            '../presenters/home-presenter.js'
        );
        this.presenter = new HomePresenter(new StoryModel(), this);
        await this.presenter.loadStories();
    }

    showLoading() {
        document.getElementById('main-content').innerHTML = 'Memuat cerita...';
    }

    renderStories(stories) {
        const container = document.getElementById('main-content');
        container.innerHTML = '';

        stories.forEach((story) => {
            const item = document.createElement('div');
            item.className = 'story-item';
            item.innerHTML = `
        <img src="${story.photoUrl}" alt="Cerita oleh ${story.name}" loading="lazy" />
        <h3>${story.name}</h3>
        <p>${story.description}</p>
        <a href="#/detail/${story.id}">Lihat Detail</a>
      `;
            container.appendChild(item);
        });

        this.#initMap(stories);
    }

    renderError(message) {
        document.getElementById(
            'main-content',
        ).innerHTML = `<p style="color:red">${message}</p>`;
    }

    #initMap(stories) {
        const mapContainer = document.getElementById('map');

        if (!mapContainer) {
            console.warn('⚠️ Map container tidak ditemukan.');
            return;
        }

        if (this._map) {
            this._map.remove(); // hapus peta sebelumnya jika ada
        }

        this._map = L.map(mapContainer).setView([-2.5, 118], 4);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(this._map);

        stories.forEach((story) => {
            if (story.lat && story.lon) {
                const marker = L.marker([story.lat, story.lon]).addTo(
                    this._map,
                );
                marker.bindPopup(
                    `<b>${story.name}</b><br>${story.description}`,
                );
            }
        });
    }
}
