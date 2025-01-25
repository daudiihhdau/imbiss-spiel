import { POS } from './POS.js';

export class FoodStall {
    constructor(image) {
        this.posSystem = POS.getInstance();
        this.image = image; // Bild des Imbissstands
    }

    getImage() {
        return this.image;
    }

    orderAndPay() {
        // bestellung annehmen
        // ist alles verfügbar? was nicht?
        // bezahlen, was verfügbar ist
        // Rechnung austellen
        // Kunde bekommte die Produkte()
        // Warenstand aktualisieren
    }



}

export const foodStalls = [
    new FoodStall('./img/foodstalls/imbiss_eisladen.png'),
    new FoodStall('./img/foodstalls/imbiss_lustig.png'),
    new FoodStall('./img/foodstalls/imbiss_rostig.png'),
]