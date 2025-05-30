import { getToken } from '../../utils/auth.js';
import { showFormattedDate } from '../../utils/index.js';
import { AvatarProfile } from '../../components/avatar-profile.js';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export class DetailPage {
    render() {
        return `
        <section class="detail">
          
          <div class="detail__user">
            <div id="detail-avatar" class="detail__avatar"></div>
            <h2 id="detail-name" class="detail__name">Nama</h2>
          </div>
          <div id="story-detail" class="detail__content">Memuat detail cerita...</div>
          <div id="map" class="detail__map"></div>
          <a href="#/" class="detail__back-link">Kembali ke Beranda</a>
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

            // Tampilkan avatar dan nama
            document.getElementById('detail-name').textContent = story.name;
            const avatar = new AvatarProfile('detail-avatar', story.name);
            avatar.generate(48);

            // Tampilkan detail cerita
            document.getElementById('story-detail').innerHTML = `
              <img src="${story.photoUrl}" alt="Foto oleh ${story.name}" />
              <p><strong>Deskripsi:</strong> ${story.description}</p>
              <p><strong>Tanggal:</strong> ${showFormattedDate(
                  story.createdAt,
              )}</p>
              ${
                  story.lat && story.lon
                      ? `<p><strong>Lokasi:</strong> Lat ${story.lat}, Lon ${story.lon}</p>`
                      : '<p><em>Tidak ada data lokasi.</em></p>'
              }
            `;

            // Tampilkan peta jika ada lokasi
            if (story.lat && story.lon) {
                const key = 'Z8CPHGSs8sjj4jpKnxkM';
                const map = L.map('map').setView([story.lat, story.lon], 13);

                const osm = L.tileLayer(
                    'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                    {
                        attribution: '&copy; OpenStreetMap contributors',
                    },
                );

                const maptilerBasic = L.tileLayer(
                    `https://api.maptiler.com/maps/basic-v2/{z}/{x}/{y}.png?key=${key}`,
                    {
                        tileSize: 512,
                        zoomOffset: -1,
                        attribution: '&copy; MapTiler & contributors',
                    },
                );

                const maptilerStreets = L.tileLayer(
                    `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${key}`,
                    {
                        tileSize: 512,
                        zoomOffset: -1,
                        attribution: '&copy; MapTiler & contributors',
                    },
                );

                const maptilerSatellite = L.tileLayer(
                    `https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=${key}`,
                    {
                        tileSize: 512,
                        zoomOffset: -1,
                        attribution: '&copy; MapTiler & contributors',
                    },
                );

                const maptilerTopo = L.tileLayer(
                    `https://api.maptiler.com/maps/topo-v2/{z}/{x}/{y}.png?key=${key}`,
                    {
                        tileSize: 512,
                        zoomOffset: -1,
                        attribution: '&copy; MapTiler & contributors',
                    },
                );

                const maptilerDark = L.tileLayer(
                    `https://api.maptiler.com/maps/dataviz-darkmatter/{z}/{x}/{y}.png?key=${key}`,
                    {
                        tileSize: 512,
                        zoomOffset: -1,
                        attribution: '&copy; MapTiler & contributors',
                    },
                );

                // Set default
                osm.addTo(map);

                const baseLayers = {
                    OpenStreetMap: osm,
                    'MapTiler Basic': maptilerBasic,
                    'MapTiler Streets': maptilerStreets,
                    'MapTiler Satellite': maptilerSatellite,
                    'MapTiler Topo': maptilerTopo,
                    'MapTiler Dark': maptilerDark,
                };

                L.control.layers(baseLayers).addTo(map);

                // Reverse Geocoding
                fetch(
                    `https://api.maptiler.com/geocoding/${story.lon},${story.lat}.json?key=${key}`,
                )
                    .then((res) => res.json())
                    .then((data) => {
                        const placeName =
                            data?.features?.[0]?.place_name || 'Lokasi Cerita';
                        L.marker([story.lat, story.lon])
                            .addTo(map)
                            .bindPopup(placeName)
                            .openPopup();
                    })
                    .catch(() => {
                        L.marker([story.lat, story.lon])
                            .addTo(map)
                            .bindPopup('Lokasi Cerita')
                            .openPopup();
                    });
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
