import L from 'leaflet';
import Swal from 'sweetalert2';
import 'leaflet/dist/leaflet.css';

import { StoryRepository } from '../../data/story-repository';
import { FormPresenter } from '../../presenters/form-presenter';
import { requireAuth } from '../../middleware/auth-guard';

export class FormPage {
    constructor() {
        this.selectedLatLng = null;
        this.presenter = null;
        this.capturedImage = null;
        this.cameraStream = null;
    }

    render() {
        return `
      <section>
        <h2>Tambah Cerita Baru</h2>
        <form id="story-form">
          <label for="description">Deskripsi</label><br>
          <textarea id="description" rows="3" required></textarea><br><br>

          <label for="photo">Pilih Gambar dari File:</label><br>
          <input id="photo" type="file" accept="image/*" /><br><br>

          <p>Atau ambil foto langsung:</p>
          <button type="button" id="camera-start">📷 Aktifkan Kamera</button>
          <button type="button" id="camera-stop" style="display:none;">❌ Matikan Kamera</button><br><br>

          <video id="camera-video" autoplay style="max-width:100%; height:auto; display:none;"></video><br>
          <button type="button" id="camera-capture" style="display:none;">📸 Ambil Foto</button>

          <canvas id="camera-canvas" style="display:none;"></canvas><br>

          <div id="photo-preview" class="preview-container" style="margin-top:1rem;"></div>

          <label for="map">Klik lokasi pada peta:</label>
          <div id="map" style="height: 300px; margin-bottom: 1rem;"></div>

          <button type="submit">Kirim Cerita</button>
        </form>
      </section>
    `;
    }

    async afterRender() {
        try {
            requireAuth();
        } catch {
            return;
        }

        this.presenter = new FormPresenter(new StoryRepository(), this);
        this.initMap();
        this.initPreviewHandler();
        this.initCameraHandlers();

        document
            .getElementById('story-form')
            .addEventListener('submit', async (e) => {
                e.preventDefault();

                const description =
                    document.getElementById('description').value;
                const fileInput = document.getElementById('photo');
                const fileFromInput = fileInput.files[0];

                if (fileFromInput && this.capturedImage) {
                    Swal.fire(
                        'Pilih hanya satu sumber gambar',
                        'Gunakan file ATAU kamera',
                        'warning',
                    );
                    return;
                }

                let photoFile;
                if (fileFromInput) {
                    photoFile = fileFromInput;
                } else if (this.capturedImage) {
                    const blob = await (await fetch(this.capturedImage)).blob();
                    photoFile = new File([blob], 'captured.png', {
                        type: 'image/png',
                    });
                } else {
                    Swal.fire('Pilih gambar terlebih dahulu', '', 'info');
                    return;
                }

                if (!this.selectedLatLng) {
                    Swal.fire('Pilih lokasi pada peta', '', 'info');
                    return;
                }

                await this.presenter.submitStory(
                    description,
                    photoFile,
                    this.selectedLatLng,
                );
            });
    }

    initPreviewHandler() {
        const photoInput = document.getElementById('photo');
        const previewContainer = document.getElementById('photo-preview');

        photoInput.addEventListener('change', (e) => {
            this.capturedImage = null; // reset hasil kamera jika user pilih file
            this.stopCamera(); // otomatis matikan kamera

            const file = e.target.files[0];
            if (!file) return;

            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.style.maxWidth = '100%';
            img.style.borderRadius = '8px';

            previewContainer.innerHTML = '';
            previewContainer.appendChild(img);
        });
    }

    initCameraHandlers() {
        const video = document.getElementById('camera-video');
        const canvas = document.getElementById('camera-canvas');
        const captureBtn = document.getElementById('camera-capture');
        const stopBtn = document.getElementById('camera-stop');
        const previewContainer = document.getElementById('photo-preview');
        const startBtn = document.getElementById('camera-start');
        const fileInput = document.getElementById('photo');

        startBtn.addEventListener('click', async () => {
            try {
                fileInput.value = ''; // reset input file
                this.capturedImage = null;

                this.cameraStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                });
                video.srcObject = this.cameraStream;

                video.style.display = 'block';
                captureBtn.style.display = 'inline-block';
                stopBtn.style.display = 'inline-block';
                startBtn.style.display = 'none';
            } catch (err) {
                Swal.fire('Gagal mengakses kamera', err.message, 'error');
            }
        });

        captureBtn.addEventListener('click', () => {
            const context = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            this.capturedImage = canvas.toDataURL('image/png');

            const img = document.createElement('img');
            img.src = this.capturedImage;
            img.style.maxWidth = '100%';
            img.style.borderRadius = '8px';

            previewContainer.innerHTML = '';
            previewContainer.appendChild(img);
        });

        stopBtn.addEventListener('click', () => {
            this.stopCamera();
        });
    }

    stopCamera() {
        const video = document.getElementById('camera-video');
        const startBtn = document.getElementById('camera-start');
        const captureBtn = document.getElementById('camera-capture');
        const stopBtn = document.getElementById('camera-stop');

        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach((track) => track.stop());
            this.cameraStream = null;
        }

        video.srcObject = null;
        video.style.display = 'none';
        captureBtn.style.display = 'none';
        stopBtn.style.display = 'none';
        startBtn.style.display = 'inline-block';
    }

    showLoading() {
        Swal.fire({
            title: 'Mengirim cerita...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });
    }

    showSuccess() {
        Swal.fire('Berhasil', 'Cerita berhasil ditambahkan!', 'success');
        window.location.hash = '#/';
    }

    showError(message) {
        Swal.fire('Gagal', message, 'error');
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
