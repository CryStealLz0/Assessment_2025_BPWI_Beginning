import { StoryRepository } from '../../data/story-repository.js';
import { HomePresenter } from '../../presenters/home-presenter.js';
import { requireAuth } from '../../middleware/auth-middleware.js';
import { showFormattedDate } from '../../utils/index.js';
import { AvatarProfile } from '../../components/avatar-profile.js';
import '../templates/my-profile.js';

export class HomePage {
    constructor() {
        this.presenter = null;
        this._map = null;
    }

    render() {
        return `
      <section class="home">
        <h2 class="home__title">Beranda - Daftar Cerita</h2>
        <my-profile></my-profile>
        <div id="map" class="home__map"></div>
        <div class="home__story-list ">Memuat cerita...</div> <!-- ubah dari id ke class -->
      </section>
    `;
    }

    async afterRender() {
        try {
            requireAuth();
        } catch {
            return;
        }

        this.presenter = new HomePresenter(new StoryRepository(), this);
        await this.presenter.loadStories();
    }

    showLoading() {
        const container = document.querySelector('.home__story-list');
        if (container) container.innerHTML = 'Memuat cerita...';
    }

    renderStories(stories) {
        const container = document.querySelector('.home__story-list');
        container.innerHTML = '';

        stories.forEach((story, index) => {
            const item = document.createElement('div');
            item.className = 'story-card';
            const avatarId = `story-avatar-${index}`;
            item.innerHTML = `
            <div class="story-card__header" >
              <div id="${avatarId}" class="story-card__avatar"></div>
              <h3 class="story-card__name">${story.name}</h3>
            </div>
            <img src="${story.photoUrl}" alt="Cerita oleh ${
                story.name
            }" class="story-card__image" loading="lazy" />
            <p class="story-card__description">${story.description}</p>
            <p class="story-card__location"> ${
                story.location || 'Lokasi tidak tersedia'
            }</p>
            <small class="story-card__date"><strong>Tanggal:</strong> ${showFormattedDate(
                story.createdAt,
                'id-ID',
            )}</small>
            <a href="#/detail/${
                story.id
            }" class="story-card__link">Lihat Detail</a>
          `;

            container.appendChild(item);

            // Inisialisasi avatar
            const avatar = new AvatarProfile(avatarId, story.name);
            avatar.generate(40); // Ukuran kecil
        });

        this.#initMap(stories);
    }

    renderError(message) {
        const container = document.querySelector('.home__story-list');
        if (container)
            container.innerHTML = `<p style="color:red">${message}</p>`;
    }

    #initMap(stories) {
        const mapContainer = document.getElementById('map');

        if (!mapContainer) {
            console.warn('⚠️ Map container tidak ditemukan.');
            return;
        }

        if (this._map) {
            this._map.remove(); // clear existing map
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
