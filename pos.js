import { InventoryManagement } from './InventoryManagement.js';
import { InvoiceGenerator } from './InvoiceGenerator.js';

export class POS {
    constructor() {
        this.inventory = new InventoryManagement();
        this.cart = [];
        this.logbook = []; // Logbuch für Ein- und Ausgänge
        this.prices = new Map(); // Map zur Speicherung der Einkaufspreise und Verkaufspreise
    }

    // Produkte hinzufügen
    addProductToInventory(product, quantity, purchasePrice) {
        this.inventory.addProduct(product, quantity);
        this.prices.set(product.id, { purchasePrice, sellPrice: purchasePrice }); // Einkaufspreis und initialer Verkaufspreis speichern
        this.logbook.push({
            action: 'added',
            product: product.name,
            quantity,
            purchasePrice,
            date: new Date().toISOString()
        });
    }

    // Dynamische Preisberechnung
    calculatePrice(product, context) {
        const priceData = this.prices.get(product.id) || { purchasePrice: 0, sellPrice: 0 };
        const basePrice = context.basePrice || priceData.sellPrice; // Verwende Basispreis oder Verkaufspreis
        const discount = context.discount || 0;
        const taxRate = context.taxRate || 0;

        // Berechne Rabatt
        const discountedPrice = basePrice - (basePrice * discount);

        // Berechne Steuer
        const finalPrice = discountedPrice + (discountedPrice * taxRate);

        return parseFloat(finalPrice.toFixed(2));
    }

    // Produkt in den Warenkorb legen
    addToCart(productId, quantity, context = {}) {
        const product = this.inventory.products.find(p => p.id === productId);

        if (!product) {
            throw new Error('Produkt nicht gefunden.');
        }

        if (quantity > this.inventory.getStock(productId)) {
            throw new Error('Nicht genügend Lagerbestand.');
        }

        const price = this.calculatePrice(product, context);

        const cartItem = this.cart.find(item => item.product.id === productId);
        if (cartItem) {
            cartItem.quantity += quantity;
            cartItem.price = price; // Update den Preis, falls er sich geändert hat
        } else {
            // Produkt unter dem Key "product" speichern
            this.cart.push({ product, quantity, price });
        }

        this.inventory.updateStock(productId, quantity);
    }

    // Produkt aus dem Warenkorb entfernen
    removeFromCart(productId, quantity) {
        const cartItemIndex = this.cart.findIndex(item => item.product.id === productId);

        if (cartItemIndex === -1) {
            throw new Error('Produkt nicht im Warenkorb.');
        }

        const cartItem = this.cart[cartItemIndex];

        if (quantity >= cartItem.quantity) {
            // Wenn die Menge gleich oder größer ist, das Produkt komplett aus dem Warenkorb entfernen
            this.cart.splice(cartItemIndex, 1);
        } else {
            // Ansonsten nur die angegebene Menge reduzieren
            cartItem.quantity -= quantity;
        }

        // Bestand im Lager aktualisieren
        this.inventory.updateStock(productId, quantity);
    }

    // Warenkorb anzeigen
    listCart() {
        return this.cart.map(item => ({
            id: item.product.id,
            name: item.product.name,
            quantity: item.quantity,
            unitPrice: item.price,
            totalPrice: item.price * item.quantity
        }));
    }

    // Gesamtsumme berechnen
    calculateTotal() {
        return this.cart.reduce((total, item) => {
            return total + item.price * item.quantity;
        }, 0).toFixed(2);
    }

    // Marge berechnen
    calculateMargin() {
        const margins = this.cart.map(item => {
            const priceData = this.prices.get(item.product.id) || { purchasePrice: 0 };
            const totalPurchasePrice = priceData.purchasePrice * item.quantity;
            const totalSalePrice = item.price * item.quantity;
            return {
                name: item.product.name,
                totalPurchasePrice: totalPurchasePrice.toFixed(2),
                totalSalePrice: totalSalePrice.toFixed(2),
                margin: (totalSalePrice - totalPurchasePrice).toFixed(2)
            };
        });

        return margins;
    }

    // Verkaufspreis aktualisieren
    updateSellPrice(productId, newPrice) {
        const product = this.inventory.products.find(p => p.id === productId);
        if (!product) {
            throw new Error('Produkt nicht gefunden.');
        }
        const priceData = this.prices.get(productId);
        if (priceData) {
            priceData.sellPrice = newPrice;
            this.prices.set(productId, priceData);
            console.log(`Verkaufspreis für Produkt ${productId} auf ${newPrice.toFixed(2)} € aktualisiert.`);
        }
    }

    // Rechnung erstellen
    checkout(supplier, customer, category) {
        if (this.cart.length === 0) {
            throw new Error('Warenkorb ist leer.');
        }

        const invoice = InvoiceGenerator.generateInvoice(
            this.cart.map(item => ({ item: item.product, quantity: item.quantity })),
            supplier,
            customer,
            category
        );

        this.cart.forEach(item => {
            const priceData = this.prices.get(item.product.id) || { purchasePrice: 0 };
            this.logbook.push({
                action: 'sold',
                product: item.product.name,
                quantity: item.quantity,
                purchasePrice: priceData.purchasePrice,
                salePrice: item.price,
                date: new Date().toISOString()
            });
        });

        const items = this.cart;

        // Warenkorb leeren
        this.cart = [];

        return { invoice, items };
    }

    // Lagerbestand anzeigen
    listInventory() {
        return this.inventory.listAllProducts().map(product => {
            const priceData = this.prices.get(product.id) || { purchasePrice: 0, sellPrice: 0 };
            return {
                ...product,
                purchasePrice: priceData.purchasePrice.toFixed(2),
                sellPrice: priceData.sellPrice.toFixed(2)
            };
        });
    }

    // Logbuch anzeigen
    getLogbook() {
        return this.logbook;
    }
}
