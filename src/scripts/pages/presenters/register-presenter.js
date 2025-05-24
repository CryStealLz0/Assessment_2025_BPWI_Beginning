export class RegisterPresenter {
    constructor(model, view) {
        this.model = model;
        this.view = view;
    }

    async registerUser(name, email, password) {
        try {
            this.view.showLoading();
            await this.model.register(name, email, password);
            this.view.showSuccessMessage();
        } catch (error) {
            this.view.showErrorMessage(error.message);
        }
    }
}
