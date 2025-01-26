import { Categories, Attributes, Rating, Products, Units } from './constants.js';
import { POS } from './POS.js';
import { Product } from './Product.js';

export class Wholesale {
    constructor() {
        this.pos = new POS();
        this.initializeStock(); // Initialisiert den Lagerbestand einmalig
    }

    // Initialisiert den Lagerbestand aus der items-Map
    initializeStock() {
        Products.forEach((productData, productName) => {
            const newProduct = this.createProduct({ name: productName, emoji: productData.emoji });
            const randomStock = Math.floor(Math.random() * 100) + 10;
            const randomPurchasePrice = parseFloat((Math.random() * 5 + 1).toFixed(2));
            this.pos.addProductToInventory(newProduct, randomStock, randomPurchasePrice);
        });
    }

    // Erstellt ein neues Produkt
    createProduct({ name, emoji }) {
        const randomCategory = this.getRandomCategory();
        const randomAttributes = this.getRandomAttributes();
        const randomQuality = this.getRandomRating();
        const randomTaste = this.getRandomRating();
        const randomUnit = this.getRandomUnit();
        return new Product(name, randomCategory, randomAttributes, emoji, randomQuality, randomTaste, randomUnit, '2030-01-01');
    }

    // Liefert ein Produkt in der gewünschten Menge
    addToCart(itemId, quantity, context = {}) {
        try {
            this.pos.addToCart(itemId, quantity, context);
        } catch (error) {
            console.warn(`Fehler beim Hinzufügen zum Warenkorb: ${error.message}`);
            return null;
        }
    }

    // Entfernt ein Produkt aus dem Warenkorb
    removeFromCart(itemId, quantity) {
        try {
            this.pos.removeFromCart(itemId, quantity);
        } catch (error) {
            console.warn(`Fehler beim Entfernen aus dem Warenkorb: ${error.message}`);
            return null;
        }
    }

    generateInvoice(customerInfo, context = {}) {
        const total = this.pos.calculateTotal();
        const margin = this.pos.calculateMargin();
        const invoice = this.pos.checkout('Wholesale', customerInfo, 'Wholesale Sale');
        console.log('Rechnung generiert:', invoice);
        console.log('Gesamtsumme:', total, '€');
        console.log('Marge:', margin);
        return invoice;
    }

    // Generiert eine zufällige Einheit aus den verfügbaren Units
    getRandomUnit() {
        const units = Object.values(Units); // Mögliche Einheiten aus constants.js
        return units[Math.floor(Math.random() * units.length)];
    }

    // Wählt eine zufällige Kategorie
    getRandomCategory() {
        const categories = Object.values(Categories);
        return categories[Math.floor(Math.random() * categories.length)];
    }

    // Wählt zufällige Attribute
    getRandomAttributes() {
        const attributes = Object.values(Attributes);
        const numAttributes = Math.floor(Math.random() * (attributes.length + 1)); // 0 bis max. Anzahl
        return Array.from({ length: numAttributes }, () => attributes[Math.floor(Math.random() * attributes.length)]);
    }

    // Wählt eine zufällige Bewertung
    getRandomRating() {
        const ratings = Object.values(Rating);
        return ratings[Math.floor(Math.random() * ratings.length)];
    }
}
