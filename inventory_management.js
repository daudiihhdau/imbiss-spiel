class EventDispatcher {
    constructor() {
        this.listeners = {};
    }

    subscribe(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach((callback) => callback(data));
        }
    }
}

export class ImbissSoftware {
    static instance = null;

    constructor() {
        if (ImbissSoftware.instance) {
            return ImbissSoftware.instance;
        }

        this.logging = []; // Einheitliches Log für Verkäufe, Einkäufe und Preisänderungen
        this.dispatcher = new EventDispatcher();

        ImbissSoftware.instance = this;
    }

    static getInstance() {
        if (!ImbissSoftware.instance) {
            ImbissSoftware.instance = new ImbissSoftware();
        }
        return ImbissSoftware.instance;
    }

    validateInput(itemName, quantity) {
        if (!itemName || typeof itemName !== 'string') {
            throw new Error('Ungültiger Produktname. Der Name muss eine nicht-leere Zeichenkette sein.');
        }

        if (typeof quantity !== 'number' || quantity <= 0 || !Number.isFinite(quantity)) {
            throw new Error(`Ungültige Menge: ${quantity}. Die Menge muss eine positive Zahl sein.`);
        }

        const item = ImbissSoftware.items.get(itemName);
        if (!item) {
            throw new Error(`Produkt '${itemName}' nicht gefunden.`);
        }

        return item;
    }

    getCurrentDate(date) {
        return date || new Date();
    }

    logEntry(entry) {
        this.logging.push({ ...entry, date: this.getCurrentDate(entry.date) });
    }

    processOrder(wishlist, date) {
        const processedItems = [];
        let totalRevenue = 0;
        const currentDate = this.getCurrentDate(date);

        wishlist.forEach(({ name }) => {
            try {
                const item = this.validateInput(name, 1);

                if (item.stock >= 1) {
                    item.stock -= 1;
                    processedItems.push({
                        itemName: name,
                        quantity: 1,
                        sellPrice: item.sellPrice,
                        totalCost: item.sellPrice * 1,
                    });
                    totalRevenue += item.sellPrice * 1;

                    if (item.stock < 3) {
                        this.dispatcher.emit('lowStock', { name, stock: item.stock });
                    }
                } else {
                    console.warn(`Produkt '${name}' nicht in ausreichender Menge verfügbar.`);
                }
            } catch (error) {
                console.error(`Fehler bei der Verarbeitung von '${name}': ${error.message}`);
            }
        });

        if (processedItems.length > 0) {
            const saleEntry = {
                items: processedItems,
                totalRevenue,
                type: 'sale',
                date: currentDate,
            };

            this.logEntry(saleEntry);
            return saleEntry;
        } else {
            console.log("Keine Artikel aus der Wunschliste konnten verarbeitet werden.");
            return null;
        }
    }

    addPurchase(itemName, quantity, purchasePrice, date) {
        const item = this.validateInput(itemName, quantity);
        item.stock += quantity;

        const purchaseEntry = {
            itemName,
            quantity,
            purchasePrice,
            totalCost: purchasePrice * quantity,
            type: 'purchase',
            date: this.getCurrentDate(date),
        };

        this.logEntry(purchaseEntry);
    }

    updateSellPrice(itemName, newPrice, date) {
        if (newPrice <= 0) throw new Error(`Ungültiger Preis: ${newPrice}`);

        const item = this.validateInput(itemName, 1);

        // Überprüfen, ob der neue Preis sich vom aktuellen Preis unterscheidet
        if (item.sellPrice === newPrice) {
            console.log(`Der Preis für '${itemName}' bleibt unverändert (${newPrice} €).`);
            return; // Keine Änderung notwendig
        }

        // Preis aktualisieren
        item.sellPrice = newPrice;

        // Änderung loggen
        const priceUpdateEntry = {
            itemName,
            price: newPrice,
            type: 'priceUpdate',
            date: this.getCurrentDate(date),
        };

        this.logEntry(priceUpdateEntry);
        console.log(`Der Preis für '${itemName}' wurde erfolgreich auf ${newPrice} € geändert.`);
    }

    getCurrentStock() {
        return Array.from(ImbissSoftware.items.entries()).map(([name, data]) => ({
            name,
            emoji: data.emoji,
            stock: data.stock,
            sellPrice: data.sellPrice,
            needsRestock: data.stock < 3,
        }));
    }

    getPriceLogAnalysis() {
        return this.logging.filter((entry) => entry.type === 'priceUpdate').map((entry) => ({
            itemName: entry.itemName,
            price: entry.price,
            type: entry.type,
            date: entry.date.toISOString(),
        }));
    }

    filterLastDay() {
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        return this.logging.filter((entry) => new Date(entry.date) > oneDayAgo);
    }

    getStatistics() {
        const lastDayLogs = this.filterLastDay();

        const salesStats = lastDayLogs.filter((entry) => entry.type === 'sale').reduce((acc, sale) => {
            acc.totalRevenue += sale.totalRevenue;
            acc.totalItemsSold += sale.items.reduce((sum, item) => sum + item.quantity, 0);
            return acc;
        }, { totalRevenue: 0, totalItemsSold: 0 });

        const purchaseStats = lastDayLogs.filter((entry) => entry.type === 'purchase').reduce((acc, purchase) => {
            acc.totalCost += purchase.totalCost;
            acc.totalItemsBought += purchase.quantity;
            return acc;
        }, { totalCost: 0, totalItemsBought: 0 });

        return { salesStats, purchaseStats };
    }

    calculateProfit() {
        const stats = this.getStatistics();
        return stats.salesStats.totalRevenue - stats.purchaseStats.totalCost;
    }

    static items = new Map([
        ['Pommes', { emoji: '🍟', stock: 3, sellPrice: 2.5 }],
        ['Currywurst', { emoji: '🌭', stock: 3, sellPrice: 3.0 }],
        ['Hamburger', { emoji: '🍔', stock: 3, sellPrice: 4.0 }],
        ['Kaffee', { emoji: '☕', stock: 3, sellPrice: 1.5 }],
        ['Bonbon', { emoji: '🍬', stock: 3, sellPrice: 0.5 }],
        ['Lutscher', { emoji: '🍭', stock: 3, sellPrice: 0.8 }],
        ['Kartoffelsuppe', { emoji: '🥣', stock: 3, sellPrice: 3.5 }],
        ['Bratwurst', { emoji: '🥖', stock: 3, sellPrice: 3.2 }],
    ]);
}
