// food_stall.js - Food Stall

export class FoodStall {
    constructor(image) {
        this.image = image; // Bild des Imbissstands
    }

    getImage() {
        return this.image;
    }
}

// Beispiel-Instanzen
export const foodStalls = [
    new FoodStall('imbiss_rostig.png'),
    new FoodStall('imbiss_lustig.png'),
    new FoodStall('imbiss_eisladen.png')
];
