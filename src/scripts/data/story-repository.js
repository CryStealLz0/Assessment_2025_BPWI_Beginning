import { StoryModel } from '../models/story-model.js';

export class StoryRepository {
    #BASE_URL = 'https://story-api.dicoding.dev/v1';

    async getStoriesWithLocation() {
        const token = localStorage.getItem('token');

        if (!token) {
            location.hash = '#/login';
            return Promise.reject(new Error('Tidak ada token'));
        }

        const response = await fetch(`${this.#BASE_URL}/stories?location=1`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const result = await response.json();
        if (!response.ok || result.error) {
            throw new Error(result.message || 'Gagal mengambil data');
        }

        // ✅ gunakan model untuk memastikan data terstruktur
        return result.listStory.map(StoryModel.fromJson);
    }
}
