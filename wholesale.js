import { Categories, Attributes, Rating, items, Units } from './constants.js';
import { InvoiceGenerator } from './invoice_generator.js';
import { Helper } from './helper.js';

export class Wholesale {
    constructor() {
        this.stock = new Map(); // Lagerbestand des Großhändlers
        this.supplierName = this.getUniqueSupplierName(); // Eindeutiger Händlername
        this.address = `${this.supplierName}, Händlerstraße 1, 12345 Handelsstadt`; // Beispiel-Adresse
        this.initializeStock(); // Initialisiert den Lagerbestand einmalig
    }

    // Initialisiert den Lagerbestand aus der items-Map
    initializeStock() {
        items.forEach((itemData, itemName) => {
            const newItem = this.createItem({
                name: itemName,
                emoji: itemData.emoji,
            });
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

        return {
            id: Helper.generateUUID(), // UUID durch Helper
            name,
            categoryId: randomCategory,
            attributeIds: randomAttributes,
            emoji,
            stock: Math.floor(Math.random() * 100) + 10, // Zufälliger Anfangsbestand
            sellPrice: parseFloat((Math.random() * 10 + 1).toFixed(2)), // Zufälliger Preis zwischen 1 und 10
            quality: randomQuality,
            taste: randomTaste,
            unit: this.getRandomUnit(), // Einheit zufällig auswählen
        };
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

        return InvoiceGenerator.generateInvoice(preparedList, {
            name: this.supplierName,
            address: this.address,
        }, customerInfo);
    }

    // Generiert eine zufällige Einheit aus den verfügbaren Units
    getRandomUnit() {
        const units = Object.values(Units); // Mögliche Einheiten aus constants.js
        return units[Math.floor(Math.random() * units.length)];
    }

    // Generiert einen eindeutigen Namen für den Lieferanten
    getUniqueSupplierName() {
        const baseName = 'Supplier';
        const uuid = Helper.generateUUID(); // UUID durch Helper
        return `${baseName}-${uuid}`;
    }

    // Gibt die Liste aller Produkte im Lager zurück
    listAvailableItems() {
        return Array.from(this.stock.values());
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
