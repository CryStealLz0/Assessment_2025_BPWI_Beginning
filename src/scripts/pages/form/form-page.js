import Swal from 'sweetalert2';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export class FormPage {
    constructor() {
        this.selectedLatLng = null;
    }

    render() {
        return `
      <section>
        <h2>Tambah Cerita Baru</h2>
        <form id="story-form">
          <label for="description">Deskripsi</label><br>
          <textarea id="description" rows="3" required></textarea><br><br>

          <label for="photo">Foto (kamera):</label><br>
          <input id="photo" type="file" accept="image/*" capture="environment" required /><br><br>

          <label for="map">Klik lokasi pada peta:</label>
          <div id="map" style="height: 300px; margin-bottom: 1rem;"></div>

          <button type="submit">Kirim Cerita</button>
        </form>
      </section>
    `;
    }

    async afterRender() {
        this.initMap();

        document
            .getElementById('story-form')
            .addEventListener('submit', async (e) => {
                e.preventDefault();

                const token = localStorage.getItem('token');
                if (!token) {
                    Swal.fire('Error', 'Anda belum login', 'error');
                    return;
                }

                const description =
                    document.getElementById('description').value;
                const photoFile = document.getElementById('photo').files[0];

                if (!this.selectedLatLng) {
                    Swal.fire(
                        'Pilih lokasi',
                        'Klik peta untuk memilih lokasi cerita',
                        'info',
                    );
                    return;
                }

                const formData = new FormData();
                formData.append('description', description);
                formData.append('photo', photoFile);
                formData.append('lat', this.selectedLatLng.lat);
                formData.append('lon', this.selectedLatLng.lng);

                try {
                    const response = await fetch(
                        'https://story-api.dicoding.dev/v1/stories',
                        {
                            method: 'POST',
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                            body: formData,
                        },
                    );

                    const result = await response.json();
                    if (!response.ok) throw new Error(result.message);

                    Swal.fire(
                        'Sukses',
                        'Cerita berhasil ditambahkan!',
                        'success',
                    );
                    window.location.hash = '#/';
                } catch (err) {
                    Swal.fire('Gagal', err.message, 'error');
                }
            });
    }

    initMap() {
        const map = L.map('map').setView([-2.5, 118], 4);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        let marker = null;

        map.on('click', (e) => {
            this.selectedLatLng = e.latlng;

            if (marker) map.removeLayer(marker);
            marker = L.marker(e.latlng).addTo(map);
            marker.bindPopup('Lokasi dipilih').openPopup();
        });
    }
}
