import { Categories, Attributes, Rating, items, Units } from './constants.js';
import { InvoiceGenerator } from './invoice_generator.js';
import { Product } from './product.js';

export class Wholesale {
    constructor() {
        this.stock = new Map(); // Lagerbestand des Großhändlers
        this.initializeStock(); // Initialisiert den Lagerbestand einmalig
    }

    // Initialisiert den Lagerbestand aus der items-Map
    initializeStock() {
        items.forEach((itemData, itemName) => {
            const newItem = this.createItem({ name: itemName, emoji: itemData.emoji });
            this.stock.set(newItem.id, newItem); // Produkt zum Lager hinzufügen
        });

        console.log('Initialer Lagerbestand:', this.listAvailableItems());
    }

    // Erstellt ein neues Produkt
    createItem({ name, emoji }) {
        const randomCategory = this.getRandomCategory();
        const randomAttributes = this.getRandomAttributes();
        const randomQuality = this.getRandomRating();
        const randomTaste = this.getRandomRating();
        const randomUnit = this.getRandomUnit();
        // const randomStock = Math.floor(Math.random() * 100) + 10;
        // const randomPurchasePrice = parseFloat((Math.random() * 10 + 1).toFixed(2));

        return new Product(name, randomCategory, randomAttributes, emoji, randomQuality, randomTaste, randomUnit, '2030-01-01', 'TestCharge', 2)
    }

    // Liefert ein Produkt in der gewünschten Menge
    deliverItem(itemId, quantity) {
        const item = this.stock.get(itemId);

        if (!item) {
            console.warn(`Produkt mit ID ${itemId} nicht gefunden.`);
            return null;
        }

        if (item.stock < quantity) {
            console.warn(`Nicht genügend Bestand für '${item.name}'.`);
            return null;
        }

        item.stock -= quantity; // Bestand reduzieren

        return { ...item, stock: quantity }; // Nur die angeforderte Menge liefern
    }

    // Erstellt eine Rechnung für einen Einkauf
    generateInvoice(purchaseList, customerInfo) {
        const preparedList = purchaseList.map(({ itemId, quantity }) => {
            const item = this.deliverItem(itemId, quantity);
            if (!item) {
                console.warn(`Produkt mit ID ${itemId} konnte nicht geliefert werden.`);
                return null;
            }
            return { item, quantity };
        }).filter(entry => entry !== null);

        return InvoiceGenerator.generateInvoice(preparedList, "Wholesale", "FoodStall", "WholesaleSale");
    }

    // Gibt die Liste aller Produkte im Lager zurück
    listAvailableItems() {
        return Array.from(this.stock.values());
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
