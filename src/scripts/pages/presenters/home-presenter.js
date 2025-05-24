export class HomePresenter {
    constructor(model, view) {
        this.model = model;
        this.view = view;
    }

    async loadStories() {
        try {
            this.view.showLoading();
            const stories = await this.model.getStoriesWithLocation();
            this.view.renderStories(stories);
        } catch (error) {
            if (
                error.message.includes('Unauthorized') ||
                error.message.includes('Token')
            ) {
                localStorage.removeItem('token');
                window.location.hash = '#/login';
                return;
            }
            console.error('Presenter Error:', error.message);
            this.view.renderError(error.message || 'Gagal memuat cerita');
        }
    }
}
