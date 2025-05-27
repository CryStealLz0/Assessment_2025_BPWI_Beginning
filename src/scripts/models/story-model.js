export class StoryModel {
    constructor({ id, name, description, photoUrl, createdAt, lat, lon }) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.photoUrl = photoUrl;
        this.createdAt = new Date(createdAt); // optional: parse date
        this.lat = lat;
        this.lon = lon;
    }

    static fromJson(json) {
        return new StoryModel(json);
    }
}
