export class FoodStall {
    constructor(image) {
        this.image = image; // Bild des Imbissstands
    }

    getImage() {
        return this.image;
    }
}

export const foodStalls = [
    new FoodStall('./img/foodstalls/imbiss_eisladen.png'),
    new FoodStall('./img/foodstalls/imbiss_lustig.png'),
    new FoodStall('./img/foodstalls/imbiss_rostig.png'),
]