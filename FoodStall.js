import { POS } from './POS.js';

export class FoodStall {
    constructor(image) {
        this.posSystem = new POS();
        this.image = image; // Bild des Imbissstands
    }

    getImage() {
        return this.image;
    }

    // Produkte hinzufügen
    addProductToInventory(product, quantity, purchasePrice) {
        this.posSystem.addProductToInventory(product, quantity, purchasePrice);
    }

    // Produkt in den Warenkorb legen
    addToCart(productId, quantity, context = {}) {
        try {
            this.posSystem.addToCart(productId, quantity, context);
        } catch (error) {
            console.warn(`Fehler beim Hinzufügen zum Warenkorb: ${error.message}`);
        }
    }

    // Produkt aus dem Warenkorb entfernen
    removeFromCart(productId, quantity) {
        try {
            this.posSystem.removeFromCart(productId, quantity);
        } catch (error) {
            console.warn(`Fehler beim Entfernen aus dem Warenkorb: ${error.message}`);
        }
    }

    // Rechnung erstellen
    generateInvoice(customerInfo, context = {}) {
        const total = this.posSystem.calculateTotal();
        const margin = this.posSystem.calculateMargin();
        const invoice = this.posSystem.checkout('FoodStall', customerInfo, 'Retail Sale');
        console.log('Rechnung generiert:', invoice);
        console.log('Gesamtsumme:', total, '€');
        console.log('Marge:', margin);
        return invoice;
    }

    // Warenkorb anzeigen
    listCart() {
        return this.posSystem.listCart();
    }

    // Logbuch anzeigen
    getLogbook() {
        return this.posSystem.getLogbook();
    }
}


export const foodStalls = [
    new FoodStall('./img/foodstalls/imbiss_eisladen.png'),
    new FoodStall('./img/foodstalls/imbiss_lustig.png'),
    new FoodStall('./img/foodstalls/imbiss_rostig.png'),
]