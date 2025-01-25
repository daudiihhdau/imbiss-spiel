import { InventoryManagement } from './InventoryManagement.js';
import { InvoiceGenerator } from './InvoiceGenerator.js';

export class POS {
    constructor() {
        this.inventory = new InventoryManagement();
        this.cart = [];
        this.logbook = []; // Logbuch für Ein- und Ausgänge
    }

    // Produkte hinzufügen
    addProductToInventory(product, quantity, purchasePrice) {
        this.inventory.addProduct(product, quantity);
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
        const basePrice = context.basePrice || 0;
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

        const cartItem = this.cart.find(item => item.id === productId);
        if (cartItem) {
            cartItem.quantity += quantity;
            cartItem.price = price; // Update den Preis, falls er sich geändert hat
        } else {
            this.cart.push({ ...product, quantity, price });
        }

        this.inventory.updateStock(productId, -quantity);
    }

    // Warenkorb anzeigen
    listCart() {
        return this.cart.map(item => ({
            name: item.name,
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
            const totalPurchasePrice = item.purchasePrice * item.quantity;
            const totalSalePrice = item.price * item.quantity;
            return {
                name: item.name,
                totalPurchasePrice: totalPurchasePrice.toFixed(2),
                totalSalePrice: totalSalePrice.toFixed(2),
                margin: (totalSalePrice - totalPurchasePrice).toFixed(2)
            };
        });

        return margins;
    }

    // Rechnung erstellen
    checkout(supplier, customer, category) {
        if (this.cart.length === 0) {
            throw new Error('Warenkorb ist leer.');
        }

        const invoice = InvoiceGenerator.generateInvoice(
            this.cart.map(item => ({ item, quantity: item.quantity })),
            supplier,
            customer,
            category
        );

        this.cart.forEach(item => {
            this.logbook.push({
                action: 'sold',
                product: item.name,
                quantity: item.quantity,
                purchasePrice: item.purchasePrice,
                salePrice: item.price,
                date: new Date().toISOString()
            });
        });

        // Warenkorb leeren
        this.cart = [];

        return invoice;
    }

    // Lagerbestand anzeigen
    listInventory() {
        return this.inventory.listAllProducts();
    }

    // Logbuch anzeigen
    getLogbook() {
        return this.logbook;
    }
}
